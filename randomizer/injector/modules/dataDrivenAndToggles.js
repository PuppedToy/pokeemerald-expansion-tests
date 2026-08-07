'use strict';

/**
 * Inject the Phase-2 data-driven tables and the Group-D toggles — `data-driven-and-toggles` (T-243),
 * the last module of the migration.
 *
 * Five of these six outputs are easy *because Phase 2 made them so*: T-234 turned the tunable settings
 * into a struct read through an `noipa` accessor, T-235 turned the gym rewards and static encounters
 * into tables read by runtime index, T-236 did the same for item placement and replaced the mega-trainer
 * object deletion with a flag byte. Each is now a plain `const` array at a fixed `.map` offset — exactly
 * what an injector wants, and nothing like the script rewriting they replaced.
 *
 * The sixth is the one new mechanism: the **Group-D toggles** live as a `setvar` immediate inside
 * compiled script bytecode, which has no symbol and no struct. `scriptPatch.js` finds the script by its
 * *local* label in the `.sym` (map-script labels never reach the `.map`) and scans it for the opcode
 * with the right var id, refusing an ambiguous match rather than picking one.
 *
 * As in T-241/T-242, nothing is re-derived that a writer already decides: the module runs
 * `patchMoneyInContent`, `genItemPicksSection`, `patchRunAndBunInContent` and friends over the base
 * sources and parses their C back into bytes. The one exception is `gMegaTrainerHidden`, whose rule
 * lives inline in writer.js's mega-assignment loop — mirrored here, deterministically, and noted as the
 * only re-implementation in the module.
 *
 * Every table is byte-matched against the **committed** initializers before anything is written.
 */

const {
    RANDOMIZER_SETTINGS, GYM_REWARD, STATIC_ENCOUNTER, ITEM_PICK,
} = require('../structLayout');
const { BASE_SOURCE_FILES } = require('../sources');
const { buildInjectionContext } = require('../context');
const { patchSetvar, findSetvarOperand } = require('../scriptPatch');
const moneyWriter = require('../../moneyWriter');
const moveRelearnerPriceWriter = require('../../moveRelearnerPriceWriter');
const leagueRulesWriter = require('../../leagueRulesWriter');
const itemRandomizer = require('../../itemRandomizer');
const megaHiddenWriter = require('../../megaHiddenWriter');
const runAndBunWriter = require('../../runAndBunWriter');
const stevenTagWriter = require('../../stevenTagWriter');
const { MEGA_TRAINERS } = require('../../constants');
const { resolveRewardMegaStone } = require('../../modules/wildModule');
const { injectMegaMapItems, megaAssignment } = require('./megaMapItems');

const TAG = 'dataDrivenAndToggles';

// The reward table's order — the same list writer.js builds, and the enum in randomizer_rewards.h.
const GYM_REWARD_KEYS = [
    'gym1', 'gym2', 'gym3', 'gym4', 'gym5', 'gym6', 'gym7', 'gym8',
    'slateportGrunts', 'shellyReward', 'wallyLilycove',
];
const MEGA_STONE_REWARDS = new Set([2, 8, 9]);      // Mauville, the Slateport grunts, Shelly

// The static encounters, in enum order, with the levels writer.js hard-codes per encounter.
const STATIC_ENCOUNTERS = [
    { key: 'regirock', fallback: 'SPECIES_REGIROCK', level: 36 },
    { key: 'regice', fallback: 'SPECIES_REGICE', level: 39 },
    { key: 'registeel', fallback: 'SPECIES_REGISTEEL', level: 46 },
    { key: 'mew', fallback: 'SPECIES_MEW', level: 39 },
    { key: 'legend1', fallback: 'SPECIES_NONE', level: 61 },
    { key: 'legend2', fallback: 'SPECIES_NONE', level: 61 },
    { key: 'legend3', fallback: 'SPECIES_NONE', level: 61 },
];

/** `[NAME] = <value>,` rows of a block of C, in file order. Comment lines are skipped, nothing else. */
function parseRowLines(body, what) {
    const rows = [];
    for (const line of body.split('\n')) {
        const text = line.trim();
        if (!text || text.startsWith('//')) continue;
        // `[NAME]` for the enum-indexed tables, `[0]` for gMegaTrainerHidden's numeric rows.
        const row = text.match(/^\[(\w+)\]\s*=\s*(.+?),?$/);
        if (!row) throw new Error(`injector/${TAG}: '${text}' is not a ${what} row`);
        rows.push({ name: row[1], value: row[2].trim() });
    }
    return rows;
}

/** The rows a writer owns — the ones between its anchors. */
function parseRows(text, startAnchor, endAnchor, what) {
    const block = text.match(new RegExp(`${startAnchor}[^\\n]*\\n([\\s\\S]*?)\\n[ \\t]*${endAnchor}`));
    if (!block) throw new Error(`injector/${TAG}: the ${what} anchors are not in the base source`);
    return parseRowLines(block[1], what);
}

/**
 * EVERY row of an array's initializer, anchors or not.
 *
 * gItemPicks needs this: 24 of its 53 entries are the **static TM picks**, declared after the
 * `@ITEM_PICKS_END` anchor and never touched by the randomizer. GATE-3 caught the assumption that the
 * writer regenerates the whole table — it regenerates only the anchored region, so those 24 entries must
 * survive injection untouched, and the base check has to expect them.
 */
function parseArrayRows(text, symbol, what) {
    const block = text.match(new RegExp(`\\b${symbol}\\[[^\\]]*\\]\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`));
    if (!block) throw new Error(`injector/${TAG}: ${symbol}'s initializer is not in the base source`);
    return parseRowLines(block[1], what);
}

/** `{ A, B }` / `{{ A, B }}` / `TRUE` → the tokens inside. */
const tokens = (value) => String(value).replace(/^\{+|\}+$/g, '').split(',').map(t => t.trim()).filter(Boolean);

function idOf(ctx, token, what) {
    if (/^-?\d+$/.test(token)) return Number(token);
    if (token === 'TRUE') return 1;
    if (token === 'FALSE') return 0;
    const value = ctx.constants.get(token);
    if (value === undefined) throw new Error(`injector/${TAG}: ${what} '${token}' is not defined by the base`);
    return value;
}

/**
 * Write one table, having first proved the base holds what its committed source says.
 *
 * @param {Function} encode  rows → Buffer for the whole table
 */
function writeTable(ctx, { symbol, baseRows, newRows, encode, tag }) {
    const expected = encode(baseRows);
    const at = ctx.offsetMap.offsetOf(symbol);
    const actual = ctx.rom.readBytes(at, expected.length);
    if (!actual.equals(expected)) {
        throw new Error(
            `injector/${TAG}: ${symbol} does not hold what its committed initializer says (first of ` +
            `${expected.length} B differs). The base ROM and these sources are not the same build.`);
    }
    if (!newRows) return 0;
    ctx.rom.writeBytes(at, encode(newRows), tag);
    return newRows.length;
}

// ── gRandomizerSettings (T-234) ───────────────────────────────────────────────

const SETTINGS_U32_FIELDS = ['trainerMoneyNormal', 'trainerMoneyBoss', 'trainerMoneyGym', 'moveRelearnerCost'];
// T-257 — the three bool8 league/heal rules that follow the u32s, written as TRUE/FALSE in the C.
const SETTINGS_BOOL_FIELDS = leagueRulesWriter.LEAGUE_RULE_FIELDS;

/** The seven values a settings source declares, in struct order (booleans as 0/1). */
function parseSettings(text) {
    const values = SETTINGS_U32_FIELDS.map((field) => {
        const match = text.match(new RegExp(`\\.${field}\\s*=\\s*(\\d+)`));
        if (!match) throw new Error(`injector/${TAG}: .${field} is not in src/randomizer_settings.c`);
        return Number(match[1]);
    });

    for (const field of SETTINGS_BOOL_FIELDS) {
        const match = text.match(new RegExp(`\\.${field}\\s*=\\s*(TRUE|FALSE)`));
        if (!match) throw new Error(`injector/${TAG}: .${field} is not in src/randomizer_settings.c`);
        values.push(match[1] === 'TRUE' ? 1 : 0);
    }

    return values;
}

function encodeSettings(values) {
    const buffer = Buffer.alloc(RANDOMIZER_SETTINGS.stride, 0);
    SETTINGS_U32_FIELDS.forEach((field, i) => buffer.writeUInt32LE(values[i] >>> 0, RANDOMIZER_SETTINGS[field]));
    // The tail byte after the three bools is struct padding: the compiler zeroes it and Buffer.alloc keeps
    // it zero, so the base check compares it too and would catch a struct that grew behind our back.
    SETTINGS_BOOL_FIELDS.forEach((field, i) =>
        buffer.writeUInt8(values[SETTINGS_U32_FIELDS.length + i] ? 1 : 0, RANDOMIZER_SETTINGS[field]));
    return buffer;
}

function injectSettings(ctx, { settingsSource = null } = {}) {
    const source = settingsSource ?? ctx.baseSources.read(BASE_SOURCE_FILES.randomizerSettings);
    const config = ctx.data.config || {};
    // The writers own the clamping and the defaults (an absent/invalid value must land on the same
    // number the compile path would have written), so they produce the text and this reads it back.
    // (the exact config keys make.js passes to the writers, in the same order)
    const patched = leagueRulesWriter.patchLeagueRulesInContent(
        moveRelearnerPriceWriter.patchMoveRelearnPriceInContent(
            moneyWriter.patchMoneyInContent(source, config.money),
            config.moveRelearnPrice),
        config);   // T-257 — the three league rules are top-level config keys

    const at = ctx.offsetMap.offsetOf('gRandomizerSettings');
    const expected = encodeSettings(parseSettings(source));
    if (!ctx.rom.readBytes(at, expected.length).equals(expected)) {
        throw new Error(
            `injector/${TAG}: gRandomizerSettings does not hold the committed defaults ` +
            `(${parseSettings(source).join('/')}). The base ROM and this source are not the same build.`);
    }
    ctx.rom.writeBytes(at, encodeSettings(parseSettings(patched)), `${TAG}:settings`);
    ctx.log(`settings: ${parseSettings(patched).join(' / ')}`);
    return { settings: parseSettings(patched) };
}

// ── gGymRewards + gStaticEncounters (T-235) ───────────────────────────────────

function injectRewards(ctx, { rewardsSource = null } = {}) {
    const source = rewardsSource ?? ctx.baseSources.read(BASE_SOURCE_FILES.randomizerRewards);
    const { data } = ctx;
    const gymRewards = (data.wild && data.wild.gymRewards) || null;
    const staticRewards = (data.wild && data.wild.staticRewards) || null;
    const pokes = (data.pokedex && data.pokedex.pokes) || [];

    const encodeRewards = (rows) => {
        const buffer = Buffer.alloc(rows.length * GYM_REWARD.stride, 0);
        rows.forEach((row, i) => {
            const [species, item] = row.pair || tokens(row.value);
            buffer.writeUInt16LE(idOf(ctx, species, 'reward species'), i * GYM_REWARD.stride + GYM_REWARD.species);
            buffer.writeUInt16LE(idOf(ctx, item, 'reward item'), i * GYM_REWARD.stride + GYM_REWARD.item);
        });
        return buffer;
    };
    const encodeStatics = (rows) => {
        const buffer = Buffer.alloc(rows.length * STATIC_ENCOUNTER.stride, 0);
        rows.forEach((row, i) => {
            const [species, level] = row.pair || tokens(row.value);
            buffer.writeUInt16LE(idOf(ctx, species, 'static species'), i * STATIC_ENCOUNTER.stride + STATIC_ENCOUNTER.species);
            buffer.writeUInt16LE(idOf(ctx, level, 'static level'), i * STATIC_ENCOUNTER.stride + STATIC_ENCOUNTER.level);
        });
        return buffer;
    };

    // The reward's mega stone: the bundle's own choice first, the writer's fallback resolution second —
    // the same two lines writer.js runs, in the same order.
    const rewardRows = gymRewards && GYM_REWARD_KEYS.map((key, i) => {
        const reward = gymRewards[key];
        if (!reward) throw new Error(`injector/${TAG}: the wild artifact has no gymRewards.${key}`);
        const item = MEGA_STONE_REWARDS.has(i)
            ? (reward.megaStone || resolveRewardMegaStone(reward, pokes) || 'ITEM_NONE')
            : 'ITEM_NONE';
        return { name: key, pair: [reward.id, item] };
    });
    const staticRows = staticRewards && STATIC_ENCOUNTERS.map(({ key, fallback, level }) => ({
        name: key,
        pair: [(staticRewards[key] && staticRewards[key].id) || fallback, String(level)],
    }));

    const rewards = writeTable(ctx, {
        symbol: 'gGymRewards',
        baseRows: parseRows(source, '// @GYM_REWARDS_START', '// @GYM_REWARDS_END', 'gym reward'),
        newRows: rewardRows,
        encode: encodeRewards,
        tag: `${TAG}:gymRewards`,
    });
    const statics = writeTable(ctx, {
        symbol: 'gStaticEncounters',
        baseRows: parseRows(source, '// @STATIC_ENCOUNTERS_START', '// @STATIC_ENCOUNTERS_END', 'static encounter'),
        newRows: staticRows,
        encode: encodeStatics,
        tag: `${TAG}:staticEncounters`,
    });
    ctx.log(`rewards: ${rewards} gym, ${statics} static encounter(s)`);
    return { rewards, statics };
}

// ── gItemPicks + gMegaTrainerHidden (T-236) ───────────────────────────────────

/**
 * Which mega trainers end up hidden. The rule lives inline in writer.js: walk MEGA_TRAINERS in order,
 * taking from the level-sorted `foundMegaEvos` queue, and hide a trainer when the next available mega
 * needs a higher level than that trainer has (or the queue has run out). No RNG — but this is the one
 * decision in the module that is re-implemented rather than called, so it is spelled out here.
 */
/**
 * Which mega trainers end up hidden. The assignment rule itself lives in `modules/megaMapItems.js` —
 * the same walk decides which trainer gets which stone (B-060), and the flag table and the ball
 * contents must never be able to disagree.
 */
function hiddenMegaIndices(data) {
    return [...megaAssignment(data)].filter(([, v]) => v.hidden).map(([id]) => Number(id) - 1);
}

function injectPicks(ctx, { picksSource = null } = {}) {
    const source = picksSource ?? ctx.baseSources.read(BASE_SOURCE_FILES.randomizerPicks);
    const { data } = ctx;
    const assignments = (data.trainers && data.trainers.itemAssignments) || null;

    const encodePicks = (rows) => {
        const count = ctx.constants.require('PICK_COUNT');
        const buffer = Buffer.alloc(count * ITEM_PICK.stride, 0);
        for (const row of rows) {
            const index = idOf(ctx, row.name, 'pick index');
            const items = tokens(row.value);
            if (items.length > ITEM_PICK.itemCount) {
                throw new Error(`injector/${TAG}: ${row.name} has ${items.length} items (max ${ITEM_PICK.itemCount})`);
            }
            items.forEach((item, slot) => buffer.writeUInt16LE(
                idOf(ctx, item, 'pick item'), index * ITEM_PICK.stride + ITEM_PICK.items + slot * 2));
        }
        return buffer;
    };
    const encodeHidden = (rows) => {
        const buffer = Buffer.alloc(megaHiddenWriter.MEGA_TRAINER_COUNT, 0);
        rows.forEach((row, i) => buffer.writeUInt8(idOf(ctx, tokens(row.value)[0], 'mega hidden flag'), i));
        return buffer;
    };

    // itemRandomizer owns the display-name→constant conversion and the PICK_TABLE order; running its
    // own emitter keeps both in one place (and inherits its "missing key" guard for free).
    const pickRows = assignments
        ? parseRows(
            `// @ITEM_PICKS_START\n${itemRandomizer.genItemPicksSection(
                Object.fromEntries(Object.entries(assignments).map(([k, v]) => [k,
                    Array.isArray(v) ? v.map(itemRandomizer.displayNameToItemConst) : itemRandomizer.displayNameToItemConst(v)])),
            )}\n// @ITEM_PICKS_END`,
            '// @ITEM_PICKS_START', '// @ITEM_PICKS_END', 'item pick')
        : null;

    // Only a run that actually assigned megas decides this table — computing it without the wild
    // artifact would throw looking for trainers that a picks-only bundle never carries.
    const hidden = (data.wild && data.wild.foundMegaEvos) ? new Set(hiddenMegaIndices(data)) : null;
    const hiddenRows = hidden
        ? Array.from({ length: megaHiddenWriter.MEGA_TRAINER_COUNT }, (_, i) => ({ name: `${i}`, value: hidden.has(i) ? 'TRUE' : 'FALSE' }))
        : null;

    // Verified against ALL 53 entries (the static TM picks included), but written PER ROW: the writer
    // only regenerates its anchored region, so the 24 static picks must come through untouched.
    const picksAt = ctx.offsetMap.offsetOf('gItemPicks');
    const expectedPicks = encodePicks(parseArrayRows(source, 'gItemPicks', 'item pick'));
    if (!ctx.rom.readBytes(picksAt, expectedPicks.length).equals(expectedPicks)) {
        throw new Error(
            `injector/${TAG}: gItemPicks does not hold what src/randomizer_picks.c declares — the base ` +
            `ROM and this source are not the same build.`);
    }
    let picks = 0;
    for (const row of pickRows || []) {
        const index = idOf(ctx, row.name, 'pick index');
        const entry = encodePicks([row]).subarray(index * ITEM_PICK.stride, (index + 1) * ITEM_PICK.stride);
        ctx.rom.writeBytes(picksAt + index * ITEM_PICK.stride, entry, `${TAG}:itemPicks`);
        picks += 1;
    }
    const megas = writeTable(ctx, {
        symbol: 'gMegaTrainerHidden',
        baseRows: parseRows(source, '// @MEGA_HIDDEN_START', '// @MEGA_HIDDEN_END', 'mega hidden'),
        newRows: hiddenRows,
        encode: encodeHidden,
        tag: `${TAG}:megaHidden`,
    });
    ctx.log(`picks: ${picks} location(s), ${hidden ? hidden.size : 0} mega trainer(s) hidden of ${megaHiddenWriter.MEGA_TRAINER_COUNT}`);
    return { picks, megas, hiddenMegas: hidden ? hidden.size : 0 };
}

// ── Group D: the setvar toggles ───────────────────────────────────────────────

/** Every `setvar VAR, n` a script source declares, in order. */
function parseSetvars(text) {
    const values = new Map();
    for (const match of text.matchAll(/setvar\s+(VAR_\w+),\s*(\d+)/g)) {
        if (!values.has(match[1])) values.set(match[1], Number(match[2]));   // the writers patch the FIRST
    }
    return values;
}

const TOGGLE_SCRIPTS = [
    {
        label: 'EverGrandeCity_SidneysRoom_EventScript_InitRunAndBun',
        file: BASE_SOURCE_FILES.mapScripts('EverGrandeCity_SidneysRoom'),
        vars: ['VAR_RUNANDBUN_MODE', 'VAR_RUNANDBUN_SINGLES_LEFT', 'VAR_RUNANDBUN_DOUBLES_LEFT'],
        patch: (text, config) => runAndBunWriter.patchRunAndBunInContent(text, config),
    },
    {
        label: 'MossdeepCity_SpaceCenter_2F_OnTransition',
        file: BASE_SOURCE_FILES.mapScripts('MossdeepCity_SpaceCenter_2F'),
        vars: ['VAR_DISABLE_STEVEN_TAG_BATTLE'],
        patch: (text, config) => stevenTagWriter.patchStevenTagInContent(text, config),
    },
];

function injectToggles(ctx, { scriptSources = {} } = {}) {
    const { rom, offsetMap, data, log } = ctx;
    const config = data.config || {};
    let written = 0;

    for (const script of TOGGLE_SCRIPTS) {
        const source = scriptSources[script.label] ?? ctx.baseSources.read(script.file);
        const before = parseSetvars(source);
        const after = parseSetvars(script.patch(source, config));
        // The script label is LOCAL — it only exists in the `.sym`. A base whose map is `.map`-only
        // cannot be patched here, and saying so beats writing into the wrong script.
        if (!offsetMap.has(script.label)) {
            throw new Error(
                `injector/${TAG}: the base offset map has no '${script.label}'. Map-script labels are ` +
                `local, so the `+"`.sym`"+` (make syms) must be merged in — see make.js resolveBasePaths.`);
        }
        const at = offsetMap.offsetOf(script.label);
        for (const name of script.vars) {
            if (!before.has(name)) throw new Error(`injector/${TAG}: ${script.label} does not set ${name}`);
            // expectValue pins the base's own immediate, so a wrong label or a moved script throws
            // instead of overwriting whatever bytes happen to sit there.
            patchSetvar(rom, {
                at, var: name, sources: ctx.baseSources, limit: 512, expectValue: before.get(name),
                value: after.get(name), tag: `${TAG}:${name}`,
            });
            written += 1;
        }
    }
    log(`toggles: ${written} setvar immediate(s) patched`);
    return { toggles: written };
}

// ── The registry entry ────────────────────────────────────────────────────────

const SYMBOLS = ['gRandomizerSettings', 'gGymRewards', 'gStaticEncounters', 'gItemPicks', 'gMegaTrainerHidden'];

/**
 * @param {object} args  `{ rom, offsetMap, data, log }` as the registry calls it (injector/index.js)
 * @param {object} [args.sources]  `{ settingsSource, rewardsSource, picksSource, scriptSources }`
 */
function applyDataDrivenAndToggles({ rom, offsetMap, data = {}, log = () => {}, sources = {}, baseSources = null }) {
    const missing = SYMBOLS.filter(symbol => !offsetMap.has(symbol));
    if (missing.length) {
        const claims = data.wild || data.config || (data.trainers && data.trainers.itemAssignments);
        if (!claims) return { settings: null, rewards: 0, statics: 0, picks: 0, toggles: 0 };
        throw new Error(
            `injector/${TAG}: this run writes the Phase-2 tables but the base exports no ` +
            `${missing.join(', ')} — the base does not carry them (cf. T-234/T-237) or the offset map is ` +
            `from another build.`);
    }

    const ctx = buildInjectionContext({ rom, offsetMap, data, log, baseSources });
    return {
        ...injectSettings(ctx, sources),
        ...injectRewards(ctx, sources),
        ...injectPicks(ctx, sources),
        // B-060 — the mega stones on the ground. Found missing by the first play-test: it is map data,
        // not one of the Phase-2 tables, and no module had claimed it.
        megaStones: injectMegaMapItems(ctx, { maps: sources.maps || null }),
        ...injectToggles(ctx, sources),
    };
}

module.exports = {
    applyDataDrivenAndToggles,
    injectSettings,
    injectRewards,
    injectPicks,
    injectToggles,
    TOGGLE_SCRIPTS,
    hiddenMegaIndices,
    parseRows,
    parseArrayRows,
    parseRowLines,
    parseSettings,
    parseSetvars,
    GYM_REWARD_KEYS,
    STATIC_ENCOUNTERS,
    SYMBOLS,
    TAG,
};
