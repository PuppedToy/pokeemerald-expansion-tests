'use strict';
const fs = require('fs');
const path = require('path');
const rng = require('./rng');
const items = require('./items.js');

const IS_NODE = typeof process !== 'undefined' && !!process.versions?.node;

const ROOT = path.resolve(__dirname, '..');
const PICKS_C_PATH = path.join(ROOT, 'src', 'randomizer_picks.c');

// --- Utilities ---

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// "Meadow Plate" → ITEM_MEADOW_PLATE
function displayNameToItemConst(name) {
    return 'ITEM_' + name.split(' ').map(w => w.toUpperCase()).join('_');
}

// ITEM_MEADOW_PLATE → "Meadow Plate"
function itemDisplayName(constant) {
    const ABBREVS = new Set(['PP', 'HP', 'TM', 'HM', 'EV']);
    return constant
        .replace(/^ITEM_/, '')
        .split('_')
        .map(w => ABBREVS.has(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

// --- Item assignment ---

function buildAssignments() {
    const platesPool   = shuffle([...new Set(Object.keys(items.plates))]);
    const gemsPool     = shuffle([...new Set(items.gems)]);
    const berriesPool  = shuffle([...new Set(Object.values(items.protectionBerries))]);
    const fullPool     = shuffle([...new Set(items.averageItemPool)]);
    const goodPool     = shuffle([...new Set(items.goodItemPool)]);

    let pI = 0, gI = 0, bI = 0, fI = 0, gpI = 0;
    const plate  = (n = 1) => platesPool.slice(pI, (pI += n));
    const gem    = (n = 1) => gemsPool.slice(gI, (gI += n));
    const berry  = (n = 1) => berriesPool.slice(bI, (bI += n));
    // Cycling pool: wraps around if we exceed the pool size
    const pool   = (n = 1) => Array.from({ length: n }, () => fullPool[fI++ % fullPool.length]);
    const good   = (n = 1) => Array.from({ length: n }, () => goodPool[gpI++ % goodPool.length]);

    return {
        petalburgPlates:  plate(4),
        route117Plates:   plate(4),
        route104Gems:     gem(4),
        route116Gems:     gem(4),
        route117Gems:     gem(4),
        route104Berries:  berry(4),
        route116Berries:  berry(4),
        route111Berries:  berry(4),
        route117Berries:  berry(4),
        // T-262 / B-065 — 18 resist berries, 4 per location: exactly 4 locations get a full pick
        // (2 berries go unused per run). Route 121 draws from averageItemPool instead — it used to be
        // the 5th berry location and always got the 2 leftovers.
        // averageItemPool locations
        route111Items:    pool(3),
        route121Items:    pool(3),
        // goodItemPool single-item locations
        route106GoodItem:  good(1)[0],
        route109GoodItem:  good(1)[0],
        route110GoodItem:  good(1)[0],
        route110LumGoodItem: good(1)[0],
        route117GoodItem:    good(1)[0],
        route116XSpecial:  good(1)[0],
        route111HpUpGoodItem: good(1)[0],

        route118BarnyGoodItem: good(1)[0],
        route118Items:    pool(4),
        route120AngelicaGoodItem: good(1)[0],
        // Item ball pick-3 locations
        route106Ball:  pool(3),
        route102Ball:  pool(3),
        route110ExtenderBall: pool(3),
        route111BallA: pool(3),
        route111BallC: pool(3),
        route114WyattGoodItem: good(1)[0],
        route115Ball:  pool(3),
        route116Ball:  pool(3),
    };
}

// --- gItemPicks[] table sink (T-236) ---
// The scripts.inc pick scripts are STATIC stubs now (setvar PICK_* + Common_EventScript_DoPickN /
// take-slot-0 — see data/scripts/randomizer_picks.inc); menu labels resolve at runtime
// (BufferItemPickName). The only per-run output is the gItemPicks[] initializer block in
// src/randomizer_picks.c, which the injector can also overwrite at its .map offset (ADR-022).

const MAX_PICK_ITEMS = 4;

// [PICK_* C constant, itemAssignments key] — order and indices MUST match
// include/constants/randomizer_picks.h (the scripts pass the raw numbers).
const PICK_TABLE = [
    ['PICK_PETALBURG_PLATES',       'petalburgPlates'],
    ['PICK_ROUTE104_GEMS',          'route104Gems'],
    ['PICK_ROUTE104_BERRIES',       'route104Berries'],
    ['PICK_ROUTE117_BERRIES',       'route117Berries'],
    ['PICK_ROUTE117_GEMS',          'route117Gems'],
    ['PICK_ROUTE111_BERRIES',       'route111Berries'],
    ['PICK_ROUTE121_ITEMS',         'route121Items'],
    ['PICK_ROUTE111_ITEMS',         'route111Items'],
    ['PICK_ROUTE116_GEM',           'route116Gems'],
    ['PICK_ROUTE116_BERRY',         'route116Berries'],
    ['PICK_ROUTE118_ITEMS',         'route118Items'],
    ['PICK_ROUTE106_BALL',          'route106Ball'],
    ['PICK_ROUTE102_BALL',          'route102Ball'],
    ['PICK_ROUTE117_PLATE',         'route117Plates'],
    ['PICK_ROUTE110_EXTENDER',      'route110ExtenderBall'],
    ['PICK_ROUTE111_BALL_A',        'route111BallA'],
    ['PICK_ROUTE111_BALL_C',        'route111BallC'],
    ['PICK_ROUTE115_BALL',          'route115Ball'],
    ['PICK_ROUTE116_BALL',          'route116Ball'],
    ['PICK_ROUTE106_GOOD_ITEM',     'route106GoodItem'],
    ['PICK_ROUTE116_X_SPECIAL',     'route116XSpecial'],
    ['PICK_ROUTE118_BARNY_GOOD',    'route118BarnyGoodItem'],
    ['PICK_ROUTE120_ANGELICA_GOOD', 'route120AngelicaGoodItem'],
    ['PICK_ROUTE109_GOOD_ITEM',     'route109GoodItem'],
    ['PICK_ROUTE110_GOOD_ITEM',     'route110GoodItem'],
    ['PICK_ROUTE110_LUM',           'route110LumGoodItem'],
    ['PICK_ROUTE117_EARTHQUAKE',    'route117GoodItem'],
    ['PICK_ROUTE111_HP_UP',         'route111HpUpGoodItem'],
    ['PICK_ROUTE114_WYATT_GOOD',    'route114WyattGoodItem'],
];

// raw = assignments with ITEM_* constants → the C initializer lines between the anchors.
function genItemPicksSection(raw) {
    const missing = PICK_TABLE.filter(([, key]) => raw[key] == null).map(([, key]) => key);
    if (missing.length)
        throw new Error(`genItemPicksSection: missing itemAssignments key(s): ${missing.join(', ')}`);

    return PICK_TABLE.map(([pickConst, key]) => {
        const value = raw[key];
        const list = Array.isArray(value) ? [...value] : [value];
        if (list.length > MAX_PICK_ITEMS)
            throw new Error(`genItemPicksSection: ${key} has ${list.length} items (max ${MAX_PICK_ITEMS})`);
        while (list.length < MAX_PICK_ITEMS) list.push('ITEM_NONE');
        return `    ${`[${pickConst}]`.padEnd(31)}= {{ ${list.join(', ')} }},`;
    }).join('\n');
}

function updateItemPicksTable(raw) {
    const section = genItemPicksSection(raw);
    let content = fs.readFileSync(PICKS_C_PATH, 'utf8');
    const regex = /(\/\/ @ITEM_PICKS_START[^\n]*\n)[\s\S]*?(\n[ \t]*\/\/ @ITEM_PICKS_END)/;
    if (!regex.test(content))
        throw new Error(`updateItemPicksTable: @ITEM_PICKS_START/END anchors not found in ${PICKS_C_PATH}`);
    content = content.replace(regex, `$1${section}$2`);
    fs.writeFileSync(PICKS_C_PATH, content);
    console.log('[Item Randomizer] Updated gItemPicks[] in src/randomizer_picks.c');
}

// --- Entry point ---

function randomizeItems() {
    const a = buildAssignments();
    if (IS_NODE) {
        updateItemPicksTable(a);
        console.log('[Item Randomizer] Done.');
    }

    // Return display-name assignments for use in trainer generation
    const dn = (key) => a[key].map(itemDisplayName);
    return {
        // Mint order for the route mail items, chosen ONCE here (bundle-creation time) and
        // stored so the ROM maker writes it deterministically with no RNG of its own.
        woodMailMints: shuffle(items.midMints).map(itemDisplayName),
        waveMailMints: shuffle(items.strongDefMints).map(itemDisplayName),
        mechMailMints: shuffle(items.strongAtkMints).map(itemDisplayName),

        route106GoodItem:  itemDisplayName(a.route106GoodItem),
        route109GoodItem:  itemDisplayName(a.route109GoodItem),
        route110GoodItem:     itemDisplayName(a.route110GoodItem),
        route110LumGoodItem:  itemDisplayName(a.route110LumGoodItem),
        route117GoodItem:     itemDisplayName(a.route117GoodItem),
        route116XSpecial:     itemDisplayName(a.route116XSpecial),
        route111HpUpGoodItem: itemDisplayName(a.route111HpUpGoodItem),
        route111BallC:        dn('route111BallC'),
        route116Gems:      dn('route116Gems'),
        route116Berries:   dn('route116Berries'),
        route106Ball:          dn('route106Ball'),
        route102Ball:          dn('route102Ball'),
        route110ExtenderBall:  dn('route110ExtenderBall'),
        petalburgPlates:   dn('petalburgPlates'),
        route117Plates:    dn('route117Plates'),
        route104Gems:      dn('route104Gems'),
        route104Berries:   dn('route104Berries'),
        route111Items:     dn('route111Items'),
        route111Berries:   dn('route111Berries'),

        route111BallA:      dn('route111BallA'),
        route116Ball:      dn('route116Ball'),
        route114WyattGoodItem: itemDisplayName(a.route114WyattGoodItem),
        route117Berries:   dn('route117Berries'),
        route117Gems:      dn('route117Gems'),
        route118BarnyGoodItem: itemDisplayName(a.route118BarnyGoodItem),
        route118Items:     dn('route118Items'),
        route120AngelicaGoodItem: itemDisplayName(a.route120AngelicaGoodItem),
        route121Items:     dn('route121Items'),
        route115Ball:      dn('route115Ball'),
    };
}

// T-262 — assignment keys renamed after bundles were already in the wild. A bundle is immutable
// input, so its old key still has to reach the same pick: `route121Berries` was the Route 121 ball
// before it moved from the berry pool to averageItemPool. Keep old bundles buildable.
const LEGACY_ASSIGNMENT_KEYS = {
    route121Berries: 'route121Items',
};

// Takes itemAssignments with display names (as stored in bundles) and writes the gItemPicks[] table.
function writeItemFilesFromBundle(itemAssignments) {
    const toConst = name => displayNameToItemConst(name);
    const raw = {};
    for (const [k, v] of Object.entries(itemAssignments)) {
        const key = LEGACY_ASSIGNMENT_KEYS[k] || k;
        // A bundle carrying the current key wins over a legacy alias for the same pick.
        if (key !== k && Object.prototype.hasOwnProperty.call(itemAssignments, key)) continue;
        raw[key] = Array.isArray(v) ? v.map(toConst) : toConst(v);
    }
    updateItemPicksTable(raw);
}

module.exports = {
    randomizeItems,
    buildAssignments,
    writeItemFilesFromBundle,
    displayNameToItemConst,
    genItemPicksSection,
    updateItemPicksTable,
    PICK_TABLE,
};
