'use strict';

/**
 * injector — write a randomizer bundle's data straight into the prebuilt base ROM (Phase 3,
 * docs/base-plus-injection-strategy.md). No `make`, no source mutation: seconds instead of minutes.
 *
 * This file is the orchestrator + the **module registry**, which doubles as the migration's progress
 * board: one entry per Phase-3 task, `pending` until that task migrates its output. While anything is
 * pending, an injected ROM would carry BASE data for the un-migrated outputs — a "randomized" ROM that
 * isn't randomized — so `injectRom()` refuses to produce one unless the caller explicitly asks for a
 * partial run (`allowPending`, used by the parity harness and by a migration in progress).
 *
 * Everything the modules need lives next door: `rom.js` (write primitives), `symbolMap.js` (offsets
 * from the base `.map`), `freeSpace.js` (B2 repointing), `parity.js` (INV-BYTES diagnostics),
 * `mode.js` (the compile-vs-inject switch).
 */

const { Rom } = require('./rom');
const { loadOffsetMap, OffsetMap, toRomOffset, toGbaPointer } = require('./symbolMap');
const { FreeSpaceArena, findFreeRuns, repoint } = require('./freeSpace');
const { diffRegions, attributeDiff, formatDiff } = require('./parity');
const { BUILD_MODES, resolveBuildMode, isInjectMode } = require('./mode');
const { BaseSources, collectBaseSources, treeSources, baseSourcePaths } = require('./sources');

/**
 * The Phase-3 migration board. `apply({ rom, offsetMap, data, log })` writes that module's outputs into
 * the ROM; it stays null until its task lands.
 */
const INJECTION_MODULES = [
    {
        id: 'group-a-fixed',
        task: 'T-239',
        status: 'migrated',
        // Required lazily: the wild-encounter writer reuses writer.js (one home for the sweep plan), and
        // dragging that whole import graph into every `require('injector')` — the mode switch, the
        // offset-map CLI — would be pointless for the callers that never inject.
        apply: (args) => require('./modules/groupAFixed').applyGroupAFixed(args),
        description: 'Group A — fixed-size overwrites: species info, move data, evolutions, wild slots, TM→move, item prices',
        symbols: ['gSpeciesInfo', 'gMovesInfo', 'gItemsInfo', 'gTMHMItemMoveIds', 'gWildMonHeaders'],
        // The wild slot arrays the encounter generator emits per map (`gRoute101_LandMons`, with an
        // optional time-of-day infix) — they are what actually gets written, gWildMonHeaders only points
        // at them. Evolution arrays are reached through gSpeciesInfo.evolutions and have no symbol.
        symbolPatterns: [/_(Land|Water|RockSmash|Fishing)Mons$/],
    },
    {
        id: 'learnsets',
        task: 'T-240',
        status: 'migrated',
        // Lazy for the same reason as group-a-fixed: the module pulls in the writers' constants and the
        // banned-species list, which no caller of the mode switch or the offset-map CLI needs.
        apply: (args) => require('./modules/learnsets').applyLearnsets(args),
        description: 'Level-up learnsets + teachable/TM compat (fixed capacity since T-237; located by array name in the .map)',
        symbols: [],
        // 1104 + 1101 arrays, each keeping its own name — the map is queried by pattern, never listed.
        // Anchored on the `s` prefix: an unanchored pattern also matches the ACCESSOR FUNCTIONS
        // GetSpeciesLevelUpLearnset / GetSpeciesTeachableLearnset (caught on the real base, T-238),
        // and writing learnset data over executable code is not a mistake worth risking.
        symbolPatterns: [/^s\w*LevelUpLearnset$/, /^s\w*TeachableLearnset$/],
    },
    {
        id: 'trainer-parties',
        task: 'T-241',
        status: 'migrated',
        // Lazy, like the entries above: this one pulls in writer.js itself (the team-from-docs and
        // battle-format rules have one home) and the whole import graph behind it.
        apply: (args) => require('./modules/trainerParties').applyTrainerParties(args),
        description: 'Trainer parties + battle partners, through the .party pointers in gTrainers (216 B fixed stride since T-237)',
        symbols: ['gTrainers', 'gBattlePartners'],
        symbolPatterns: [],
    },
    {
        id: 'trades-starters-nicknames',
        task: 'T-242',
        status: 'migrated',
        // Lazy like the rest: this one pulls in the four writers whose rules it mirrors.
        apply: (args) => require('./modules/tradesStartersNicknames').applyTradesStartersNicknames(args),
        description: 'In-game trades, the starter trio + extra starters, and the location/trade nickname tables with their counts',
        symbols: [
            'gIngameTrades',
            'gStarterMon', 'gStarterNickname', 'gStarterGender',
            'gStarterExtraMon', 'gStarterExtraCount', 'gStarterExtraNicknames', 'gStarterExtraGenders',
            'gLocationNicknames', 'gLocationNicknameCount',
            'gTradeNicknames', 'gTradeNicknameCount',
        ],
        symbolPatterns: [],
    },
    {
        id: 'data-driven-and-toggles',
        task: 'T-243',
        status: 'migrated',
        // The last entry to flip — with it, injectRom() can finally emit a ROM without `allowPending`.
        apply: (args) => require('./modules/dataDrivenAndToggles').applyDataDrivenAndToggles(args),
        description: 'Phase-2 data-driven tables (settings, gym rewards, static encounters, item picks, hidden megas) + the Group-D setvar toggles',
        symbols: ['gRandomizerSettings', 'gGymRewards', 'gStaticEncounters', 'gItemPicks', 'gMegaTrainerHidden'],
        // The Group-D setvar sites are LOCAL script labels: they come from the .sym, and the operand
        // inside the script is found by scanning (see scriptPatch.js), not by symbol name.
        // The `<Map>_ObjectEvents` tables carry the mega stones lying on the ground (B-060) — map data
        // rather than a Phase-2 table, which is exactly why no module claimed it until a play-test did.
        symbolPatterns: [/_ObjectEvents$/],
        // Not `symbols`: these are LOCAL labels, absent from any linker map, so claiming them as exports
        // would make every `.map`-only readiness report cry MISSING. They still have to survive the
        // browser's symbol filter (T-249), which is what this list is for.
        localLabels: () => require('./modules/dataDrivenAndToggles').TOGGLE_SCRIPTS.map(s => s.label),
    },
];

const pendingModules  = (modules = INJECTION_MODULES) => modules.filter(m => m.status !== 'migrated');
const migratedModules = (modules = INJECTION_MODULES) => modules.filter(m => m.status === 'migrated');

/**
 * Per-module readiness against a real base: which claimed symbols the base exports, and which are
 * missing (not exported, renamed, or garbage-collected by LTO — the T-234/T-237 trap). This is the
 * report the `.map` extraction CLI prints on the build box.
 */
function checkReadiness(offsetMap, modules = INJECTION_MODULES) {
    return modules.map(m => {
        const found = [];
        const missing = [];
        for (const name of m.symbols || []) (offsetMap.has(name) ? found : missing).push(name);
        let matched = 0;
        for (const pattern of m.symbolPatterns || []) {
            const hits = offsetMap.findAll(pattern);
            if (hits.length === 0) missing.push(String(pattern));
            matched += hits.length;
        }
        return { id: m.id, task: m.task, status: m.status, found, matched, missing, ready: missing.length === 0 };
    });
}

/**
 * Every symbol an injection can address: what the registry names, what its patterns match, and the local
 * script labels a module resolves by name (the Group-D setvar sites, which live only in the `.sym`).
 *
 * @returns {Set<string>}
 */
function injectionSymbolNames(offsetMap, modules = INJECTION_MODULES) {
    const names = new Set();
    for (const m of modules) {
        for (const name of m.symbols || []) if (offsetMap.has(name)) names.add(name);
        for (const pattern of m.symbolPatterns || []) for (const sym of offsetMap.findAll(pattern)) names.add(sym.name);
        for (const name of (typeof m.localLabels === 'function' ? m.localLabels() : [])) {
            if (offsetMap.has(name)) names.add(name);
        }
    }
    return names;
}

/**
 * The map an injection actually needs — the shippable one (T-249).
 *
 * A real base exports ~88,000 symbols (21 MB as JSON); the modules can reach a few thousand. The browser
 * downloads this instead, and parses it inside a Worker that is also holding a 32 MB ROM.
 *
 * Dropping a symbol a module needs would be **silent** — `learnsets` reads an absent array as "the base
 * does not export it" and leaves the base's data in place — so the filter is derived from the registry
 * itself, never hand-listed, and `__tests__/unit/injectorInjectionMap.test.js` demands that a bundle
 * injected through the filtered map come out byte-identical.
 */
function filterOffsetMapForInjection(offsetMap, modules = INJECTION_MODULES) {
    return offsetMap.pick(injectionSymbolNames(offsetMap, modules));
}

/** Load a base ROM together with the `.map` of that exact build — the two are a matched pair. */
function loadBase({ romPath, mapPath }) {
    const rom = Rom.load(romPath);
    const offsetMap = loadOffsetMap(mapPath);
    return { rom, offsetMap };
}

/**
 * Apply every migrated module to `rom`.
 *
 * @param {object} args
 * @param {import('./sources').BaseSources} [args.baseSources]  the base's own source text, which the
 *        modules derive their writes from (T-249). Omitted, they read the tree — the Node default.
 * @returns {{ rom: Rom, applied: string[], pending: object[], journal: object[] }}
 */
function injectRom({
    rom, offsetMap, data = {}, modules = INJECTION_MODULES, allowPending = false, log = () => {},
    baseSources = null,
}) {
    if (!(rom instanceof Rom)) throw new Error('injectRom needs a Rom (see injector/rom.js)');
    if (!offsetMap || typeof offsetMap.require !== 'function') throw new Error('injectRom needs an OffsetMap (see injector/symbolMap.js)');

    const pending = pendingModules(modules);
    if (pending.length && !allowPending) {
        throw new Error(
            `Injection is not complete: ${pending.length} module(s) still pending — ` +
            `${pending.map(m => `${m.id} (${m.task})`).join(', ')}. ` +
            `An injected ROM would ship BASE data for those outputs. Build with ROM_BUILD_MODE=compile, ` +
            `or pass allowPending for a parity/partial run.`);
    }

    const applied = [];
    for (const module of modules) {
        if (module.status !== 'migrated') continue;
        if (typeof module.apply !== 'function') throw new Error(`Module '${module.id}' (${module.task}) is marked migrated but has no apply()`);
        try {
            module.apply({ rom, offsetMap, data, log, baseSources });
        } catch (err) {
            throw new Error(`Injection module '${module.id}' (${module.task}) failed: ${err.message}`, { cause: err });
        }
        applied.push(module.id);
        log(`injected ${module.id} (${module.task})`);
    }

    return { rom, applied, pending, journal: rom.journal };
}

module.exports = {
    // orchestration
    injectRom,
    loadBase,
    INJECTION_MODULES,
    pendingModules,
    migratedModules,
    checkReadiness,
    injectionSymbolNames,
    filterOffsetMapForInjection,
    // primitives, re-exported so a module only ever imports 'injector'
    Rom,
    OffsetMap,
    loadOffsetMap,
    toRomOffset,
    toGbaPointer,
    FreeSpaceArena,
    findFreeRuns,
    repoint,
    diffRegions,
    attributeDiff,
    formatDiff,
    BaseSources,
    collectBaseSources,
    treeSources,
    baseSourcePaths,
    BUILD_MODES,
    resolveBuildMode,
    isInjectMode,
};
