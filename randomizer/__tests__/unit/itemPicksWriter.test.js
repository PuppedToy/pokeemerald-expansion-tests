// T-236 — data-driven item placement: itemRandomizer no longer regenerates scripts.inc /
// script_menu.h; it regenerates the gItemPicks[] initializer block in src/randomizer_picks.c
// between the // @ITEM_PICKS_START / // @ITEM_PICKS_END anchors.
const fs = require('fs');
const {
    genItemPicksSection,
    writeItemFilesFromBundle,
    PICK_TABLE,
} = require('../../itemRandomizer');

// A complete raw-constant assignment set (what buildAssignments produces).
function fakeRawAssignments() {
    return {
        petalburgPlates:          ['ITEM_MEADOW_PLATE', 'ITEM_FLAME_PLATE', 'ITEM_SPLASH_PLATE', 'ITEM_ZAP_PLATE'],
        route117Plates:           ['ITEM_EARTH_PLATE', 'ITEM_ICICLE_PLATE', 'ITEM_INSECT_PLATE', 'ITEM_IRON_PLATE'],
        route104Gems:             ['ITEM_FIRE_GEM', 'ITEM_WATER_GEM', 'ITEM_GRASS_GEM', 'ITEM_ELECTRIC_GEM'],
        route116Gems:             ['ITEM_ICE_GEM', 'ITEM_FIGHTING_GEM', 'ITEM_POISON_GEM', 'ITEM_GROUND_GEM'],
        route117Gems:             ['ITEM_FLYING_GEM', 'ITEM_PSYCHIC_GEM', 'ITEM_BUG_GEM', 'ITEM_ROCK_GEM'],
        route104Berries:          ['ITEM_OCCA_BERRY', 'ITEM_PASSHO_BERRY', 'ITEM_WACAN_BERRY', 'ITEM_RINDO_BERRY'],
        route116Berries:          ['ITEM_YACHE_BERRY', 'ITEM_CHOPLE_BERRY', 'ITEM_KEBIA_BERRY', 'ITEM_SHUCA_BERRY'],
        route111Berries:          ['ITEM_COBA_BERRY', 'ITEM_PAYAPA_BERRY', 'ITEM_TANGA_BERRY', 'ITEM_CHARTI_BERRY'],
        route117Berries:          ['ITEM_KASIB_BERRY', 'ITEM_HABAN_BERRY', 'ITEM_COLBUR_BERRY', 'ITEM_BABIRI_BERRY'],
        route111Items:            ['ITEM_FLOAT_STONE', 'ITEM_IRON_BALL', 'ITEM_ABSORB_BULB'],
        route121Items:            ['ITEM_CLEAR_AMULET', 'ITEM_COVERT_CLOAK', 'ITEM_MENTAL_HERB'],
        route106GoodItem:         'ITEM_LIFE_ORB',
        route109GoodItem:         'ITEM_BLACK_SLUDGE',
        route110GoodItem:         'ITEM_ASSAULT_VEST',
        route110LumGoodItem:      'ITEM_WEAKNESS_POLICY',
        route117GoodItem:         'ITEM_AIR_BALLOON',
        route116XSpecial:         'ITEM_LOADED_DICE',
        route111HpUpGoodItem:     'ITEM_SITRUS_BERRY',
        route118BarnyGoodItem:    'ITEM_SHELL_BELL',
        route120AngelicaGoodItem: 'ITEM_ROCKY_HELMET',
        route114WyattGoodItem:    'ITEM_BOOSTER_ENERGY',
        route106Ball:             ['ITEM_EJECT_PACK', 'ITEM_RED_CARD', 'ITEM_EXPERT_BELT'],
        route102Ball:             ['ITEM_FLOAT_STONE', 'ITEM_ABSORB_BULB', 'ITEM_HEAVY_DUTY_BOOTS'],
        route110ExtenderBall:     ['ITEM_TERRAIN_EXTENDER', 'ITEM_SHED_SHELL', 'ITEM_POWER_HERB'],
        route111BallA:            ['ITEM_SAFETY_GOGGLES', 'ITEM_WHITE_HERB', 'ITEM_WIDE_LENS'],
        route111BallC:            ['ITEM_ZOOM_LENS', 'ITEM_PUNCHING_GLOVE', 'ITEM_BIG_ROOT'],
        route115Ball:             ['ITEM_ROOM_SERVICE', 'ITEM_IRON_BALL', 'ITEM_SNOWBALL'],
        route116Ball:             ['ITEM_QUICK_CLAW', 'ITEM_MUSCLE_BAND', 'ITEM_WISE_GLASSES'],
        route118Items:            ['ITEM_METRONOME', 'ITEM_GRIP_CLAW', 'ITEM_BINDING_BAND', 'ITEM_PROTECTIVE_PADS'],
    };
}

describe('genItemPicksSection (T-236)', () => {
    test('emits one initializer line per PICK_TABLE entry, in order', () => {
        const lines = genItemPicksSection(fakeRawAssignments()).split('\n');
        expect(lines).toHaveLength(PICK_TABLE.length);
        expect(PICK_TABLE).toHaveLength(29);
        PICK_TABLE.forEach(([pickConst], i) => {
            expect(lines[i]).toContain(`[${pickConst}]`);
        });
    });

    test('4-item picks fill all slots; 3-item picks pad with ITEM_NONE', () => {
        const section = genItemPicksSection(fakeRawAssignments());
        expect(section).toContain(
            '[PICK_PETALBURG_PLATES]        = {{ ITEM_MEADOW_PLATE, ITEM_FLAME_PLATE, ITEM_SPLASH_PLATE, ITEM_ZAP_PLATE }},');
        expect(section).toContain(
            '[PICK_ROUTE102_BALL]           = {{ ITEM_FLOAT_STONE, ITEM_ABSORB_BULB, ITEM_HEAVY_DUTY_BOOTS, ITEM_NONE }},');
    });

    test('single-item picks put the item in slot 0 and pad the rest', () => {
        const section = genItemPicksSection(fakeRawAssignments());
        expect(section).toContain(
            '[PICK_ROUTE110_LUM]            = {{ ITEM_WEAKNESS_POLICY, ITEM_NONE, ITEM_NONE, ITEM_NONE }},');
    });

    test('throws a clear error when an assignment key is missing', () => {
        const raw = fakeRawAssignments();
        delete raw.route115Ball;
        expect(() => genItemPicksSection(raw)).toThrow(/route115Ball/);
    });
});

describe('writeItemFilesFromBundle (T-236 — table sink)', () => {
    const PICKS_C = 'src/randomizer_picks.c';

    function withMockedFs(initialContent, fn) {
        const reads = [];
        const written = {};
        const origRead = fs.readFileSync;
        const origWrite = fs.writeFileSync;
        fs.readFileSync = (p) => { reads.push(String(p)); return initialContent; };
        fs.writeFileSync = (p, content) => { written[String(p)] = content; };
        try { fn(); } finally {
            fs.readFileSync = origRead;
            fs.writeFileSync = origWrite;
        }
        return { reads, written };
    }

    // Display-name assignments, as stored in bundles.
    function fakeDisplayAssignments() {
        const raw = fakeRawAssignments();
        const toDisplay = c => c.replace(/^ITEM_/, '').split('_')
            .map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
        const out = {};
        for (const [k, v] of Object.entries(raw))
            out[k] = Array.isArray(v) ? v.map(toDisplay) : toDisplay(v);
        return out;
    }

    const TABLE_FILE_CONTENT =
        'const struct ItemPick gItemPicks[PICK_COUNT] = {\n' +
        '    // @ITEM_PICKS_START (regenerated by itemRandomizer.js — do not hand-edit between the anchors)\n' +
        '    [PICK_PETALBURG_PLATES]        = {{ ITEM_NONE, ITEM_NONE, ITEM_NONE, ITEM_NONE }},\n' +
        '    // @ITEM_PICKS_END\n' +
        '};\n';

    test('regenerates the anchored gItemPicks block with ITEM_* constants', () => {
        const { written } = withMockedFs(TABLE_FILE_CONTENT, () => {
            writeItemFilesFromBundle(fakeDisplayAssignments());
        });
        const picksWrite = Object.entries(written).find(([p]) => p.includes('randomizer_picks.c'));
        expect(picksWrite).toBeDefined();
        const content = picksWrite[1];
        expect(content).toContain('@ITEM_PICKS_START');
        expect(content).toContain('@ITEM_PICKS_END');
        expect(content).toContain('[PICK_ROUTE102_BALL]           = {{ ITEM_FLOAT_STONE, ITEM_ABSORB_BULB, ITEM_HEAVY_DUTY_BOOTS, ITEM_NONE }},');
        // Display names never leak into the C table
        expect(content).not.toMatch(/\{\{ [A-Z][a-z]/);
    });

    test('touches only the picks table — no scripts.inc or script_menu.h writes', () => {
        const { written, reads } = withMockedFs(TABLE_FILE_CONTENT, () => {
            writeItemFilesFromBundle(fakeDisplayAssignments());
        });
        const touched = [...Object.keys(written), ...reads];
        expect(touched.some(p => p.includes('scripts.inc'))).toBe(false);
        expect(touched.some(p => p.includes('script_menu.h'))).toBe(false);
    });

    // T-262 — a bundle is immutable input. Bundles generated before Route 121 moved from the berry
    // pool to averageItemPool carry `route121Berries`; they must still build, reproducing their own
    // original ROM (2-berry menu included).
    test('a pre-T-262 bundle (route121Berries) still fills the Route 121 pick', () => {
        const legacy = fakeDisplayAssignments();
        legacy.route121Berries = ['Chilan Berry', 'Roseli Berry'];
        delete legacy.route121Items;

        const { written } = withMockedFs(TABLE_FILE_CONTENT, () => {
            writeItemFilesFromBundle(legacy);
        });
        const content = Object.entries(written).find(([p]) => p.includes('randomizer_picks.c'))[1];
        expect(content).toContain(
            '[PICK_ROUTE121_ITEMS]          = {{ ITEM_CHILAN_BERRY, ITEM_ROSELI_BERRY, ITEM_NONE, ITEM_NONE }},');
    });
});
