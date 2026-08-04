'use strict';

/**
 * sources — the base's own source text, as one object the injector reads instead of the disk (T-249).
 *
 * The injector deliberately derives its writes from the base's sources at inject time: the writer's own
 * function runs over the base source and only the diff is injected, so a rule like "only patch prices
 * that are plain numbers" has exactly one home (see randomizer/docs/injection.md, *Deriving writes from
 * the compile path*). That is why 14 injector files called `readFileSync` — and why the injector could
 * not run anywhere the tree isn't, which is to say in a browser.
 *
 * This module is that seam. Every input is addressed by a **repo-relative POSIX path**, and a
 * `BaseSources` answers for it from either:
 *
 *   - the tree (`treeSources()`, lazy) — what Node does, unchanged behaviour;
 *   - a baked artifact (`BaseSources.fromJSON`) — what a browser gets, produced at base-build time by
 *     `buildOffsetMap.js --sources=…` next to `base-offsets.json`. Both are functions of the base build,
 *     so both are keyed by the same build id and cache together.
 *
 * **Why relative literals and not the writers' own path constants.** The modules resolve absolute paths
 * (`SPECIES_DIR`, `itemPriceWriter.file`) through `path.resolve(__dirname, …)`, which in a browser bundle
 * runs against the `path` shim and yields a path that matches nothing. An absolute key therefore cannot
 * survive bundling, so the keys here are literals — as `gameConstants.DEFAULT_HEADERS` already is. To
 * keep them honest, `__tests__/unit/injectorSources.test.js` asserts each literal resolves to the very
 * file the writer constant names, so moving one fails a test instead of quietly dropping a file from the
 * artifact.
 */

const fs = require('fs');
const path = require('path');
const { TOTAL_GENS, MEGA_TRAINERS } = require('../constants');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

/**
 * The headers that hold every id the migrated modules write — `gameConstants.DEFAULT_HEADERS`
 * re-exports this, so its callers are unchanged.
 */
const CONSTANT_HEADERS = [
    'include/constants/species.h',
    'include/constants/moves.h',
    'include/constants/items.h',
    'include/constants/abilities.h',
    'include/constants/pokemon.h',
    // T-241 — trainers: the TRAINER_*/PARTNER_* indices into gTrainers/gBattlePartners, the difficulty
    // row, and the party-entry constants trainerproc bakes in (TRAINER_MON_RANDOM_GENDER). `data.h` is
    // not a constants header, but it is where `enum TrainerBattleType` and MAX_TRAINER_ITEMS live, and
    // re-typing either here is exactly what ADR-012 says not to do.
    'include/constants/opponents.h',
    'include/constants/battle_partner.h',
    'include/constants/difficulty.h',
    'include/constants/trainers.h',
    'include/data.h',
    // T-242 — the nickname/trade tables: MAP_* (a `(num | (group << 8))` bit expression, which is why
    // the evaluator below understands `|` and `<<`), INGAME_TRADE_*, and MON_MALE/FEMALE/GENDERLESS.
    'include/constants/map_groups.h',
    'include/constants/trade.h',
    // POKEMON_NAME_LENGTH / TRAINER_NAME_LENGTH (the width of every inline name field) and MALE/FEMALE.
    'include/constants/global.h',
    // T-243 — the Phase-2 tables' own indices and sizes: PICK_* / PICK_COUNT / MAX_PICK_ITEMS /
    // MEGA_TRAINER_COUNT, GYM_REWARD_* and STATIC_ENCOUNTER_* (the last two are enums in a non-constants
    // header, which is where T-234/235/236 put them).
    'include/constants/randomizer_picks.h',
    'include/randomizer_rewards.h',
    // B-060 — the map object events the mega-stone balls live in: OBJ_EVENT_GFX_* to prove a map's
    // table against its own JSON before writing the stone into it.
    'include/constants/event_objects.h',
    'include/constants/flags.h',
];

/**
 * Every file the injector reads, by name. Pinned to the writers' own constants by a test (see header).
 */
const BASE_SOURCE_FILES = {
    // the game's text encoding — the names the randomizer bakes into the ROM (T-242)
    charmap: 'charmap.txt',
    characters: 'include/constants/characters.h',
    // the Group-D setvar toggles' var ids
    vars: 'include/constants/vars.h',
    // gSpeciesInfo + the evolution arrays (T-239)
    speciesInfo: (gen) => `src/data/pokemon/species_info/gen_${gen}_families.h`,
    // learnsets (T-240)
    levelUpLearnsets: 'src/data/pokemon/level_up_learnsets/gen_9.h',
    teachableLearnsets: 'src/data/pokemon/teachable_learnsets.h',
    // trainer parties + battle partners (T-241)
    trainers: 'src/data/trainers.party',
    battlePartners: 'src/data/battle_partners.party',
    // Group A's remaining sources
    wildEncounters: 'src/data/wild_encounters.json',
    items: 'src/data/items.h',
    // in-game trades (T-242)
    trade: 'src/data/trade.h',
    // the Phase-2 data-driven tables' committed initializers (T-243)
    randomizerSettings: 'src/randomizer_settings.c',
    randomizerRewards: 'src/randomizer_rewards.c',
    randomizerPicks: 'src/randomizer_picks.c',
    // map data: the mega-stone balls lying on the ground (B-060) and the toggle scripts
    mapJson: (map) => `data/maps/${map}/map.json`,
    mapScripts: (map) => `data/maps/${map}/scripts.inc`,
};

/** `src\data\x.h`, `./src/data/x.h` and `src/data/x.h` are the same key. */
const normalise = (rel) => String(rel).replace(/\\/g, '/').replace(/^\.\//, '');

/**
 * The base's source text, keyed by repo-relative path.
 *
 * @param {object} [opts]
 * @param {Object<string,string>} [opts.files]  baked content
 * @param {string} [opts.buildId]   what these sources belong to (the base ROM's sha256) — the key that
 *                                  invalidates a cached base/artifact pair when a new base is deployed
 * @param {string} [opts.root]      read misses from this tree (Node); omit for artifact-only (browser)
 */
class BaseSources {
    constructor({ files = {}, buildId = null, root = null } = {}) {
        this.files = new Map(Object.entries(files).map(([rel, text]) => [normalise(rel), text]));
        this.buildId = buildId;
        this.root = root;
    }

    has(rel) { return this.files.has(normalise(rel)); }

    paths() { return [...this.files.keys()]; }

    get totalBytes() {
        let total = 0;
        for (const text of this.files.values()) total += Buffer.byteLength(text, 'utf8');
        return total;
    }

    /** The text, or null when this path is neither baked nor on disk. */
    tryRead(rel) {
        const key = normalise(rel);
        if (this.files.has(key)) return this.files.get(key);
        if (!this.root) return null;
        const full = path.resolve(this.root, key);
        if (!fs.existsSync(full)) return null;
        const text = fs.readFileSync(full, 'utf8');
        this.files.set(key, text);                      // one read per file per process, as before
        return text;
    }

    /**
     * The text, or a throw. Never an empty string: a parser handed "" reports zero entries, and the
     * injector's build-mismatch guards would then blame the ROM for a missing file.
     */
    read(rel) {
        const text = this.tryRead(rel);
        if (text === null) {
            throw new Error(
                `injector/sources: '${normalise(rel)}' is not in the base sources` +
                `${this.root ? ` and does not exist under ${this.root}` : ' (artifact-only, no tree to fall back to)'}. ` +
                `Add it to BASE_SOURCE_FILES/baseSourcePaths() and rebuild the base-sources artifact ` +
                `(buildOffsetMap.js --sources=…).`);
        }
        return text;
    }

    toJSON() {
        return { buildId: this.buildId, files: Object.fromEntries(this.files) };
    }

    static fromJSON(json) {
        if (!json || typeof json !== 'object' || !json.files) {
            throw new Error('injector/sources: not a base-sources artifact (expected { buildId, files })');
        }
        return new BaseSources({ files: json.files, buildId: json.buildId || null });
    }
}

/** A provider that reads this tree on demand — the Node default, i.e. today's behaviour. */
function treeSources({ root = REPO_ROOT } = {}) {
    return new BaseSources({ root });
}

/**
 * Every path the migrated injector modules read, in a stable order.
 *
 * The two derived lists (mega-stone maps, toggle scripts) come from the modules that own them rather
 * than being re-typed here — `dataDrivenAndToggles` is required lazily because it requires this file.
 */
function baseSourcePaths() {
    const F = BASE_SOURCE_FILES;
    const paths = [
        ...CONSTANT_HEADERS,
        F.charmap, F.characters, F.vars,
        ...Array.from({ length: TOTAL_GENS }, (_, i) => F.speciesInfo(i + 1)),
        F.levelUpLearnsets, F.teachableLearnsets,
        F.trainers, F.battlePartners,
        F.wildEncounters, F.items, F.trade,
        F.randomizerSettings, F.randomizerRewards, F.randomizerPicks,
        ...[...new Set(MEGA_TRAINERS.map(m => m.map))].map(F.mapJson),
        ...require('./modules/dataDrivenAndToggles').TOGGLE_SCRIPTS.map(s => s.file),
    ];
    return [...new Set(paths.map(normalise))];
}

/**
 * Read the manifest out of a tree — the artifact a base build ships (Node only).
 *
 * @param {object} [opts]
 * @param {string} [opts.root]     tree the base was built from
 * @param {string[]} [opts.paths]
 * @param {string} [opts.buildId]  the base ROM's sha256
 */
function collectBaseSources({ root = REPO_ROOT, paths: wanted = baseSourcePaths(), buildId = null } = {}) {
    const files = {};
    const missing = [];
    for (const rel of wanted) {
        const full = path.resolve(root, normalise(rel));
        if (!fs.existsSync(full)) { missing.push(rel); continue; }
        files[normalise(rel)] = fs.readFileSync(full, 'utf8');
    }
    if (missing.length) {
        throw new Error(
            `injector/sources: ${missing.length} base source(s) missing from ${root} — ${missing.join(', ')}. ` +
            `The artifact must carry every input, so this is refused rather than shipped incomplete.`);
    }
    return new BaseSources({ files, buildId });
}

module.exports = {
    BaseSources,
    BASE_SOURCE_FILES,
    CONSTANT_HEADERS,
    baseSourcePaths,
    collectBaseSources,
    treeSources,
    REPO_ROOT,
};
