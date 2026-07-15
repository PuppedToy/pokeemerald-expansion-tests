'use strict';

// T-107 (107a) — feature detectors: pure (mon, ctx) -> boolean role tags that the teambuilding
// engine reads for emergent crystallization (entry conditions) and structure fit. Thresholds are
// provisional/tunable (grounded in existing rating signals), not a meta claim.

const { DETECTORS, detectFeatures, THRESHOLDS } = require('../../modules/featureDetectors');
const { loadArchetypeModel, FORMATS } = require('../../archetypes');
const { supportTierDoubles } = require('../../rating');

// Minimal move map (only the metadata the detectors read: category/target/priority).
const SPREAD = 'MOVE_TARGET_BOTH';
const moves = {
    MOVE_ROCK_SLIDE:   { category: 'DAMAGE_CATEGORY_PHYSICAL', target: SPREAD, priority: 0 },
    MOVE_HEAT_WAVE:    { category: 'DAMAGE_CATEGORY_SPECIAL',  target: 'MOVE_TARGET_BOTH_FOES', priority: 0 },
    MOVE_AQUA_JET:     { category: 'DAMAGE_CATEGORY_PHYSICAL', target: 'MOVE_TARGET_SELECTED', priority: 1 },
    MOVE_TACKLE:       { category: 'DAMAGE_CATEGORY_PHYSICAL', target: 'MOVE_TARGET_SELECTED', priority: 0 },
    MOVE_PROTECT:      { category: 'DAMAGE_CATEGORY_STATUS',   target: 'MOVE_TARGET_USER', priority: 4 },
    MOVE_SURF:         { category: 'DAMAGE_CATEGORY_SPECIAL',  target: 'MOVE_TARGET_FOES_AND_ALLY', priority: 0 },
};
const ctx = { moves };

// Build a synthetic mon; sensible mediocre defaults, override per test.
function mon(overrides = {}) {
    return {
        id: 'SPECIES_TEST',
        parsedTypes: ['NORMAL'],
        parsedAbilities: [],
        baseHP: 70, baseAttack: 70, baseDefense: 70, baseSpeed: 70, baseSpAttack: 70, baseSpDefense: 70,
        learnset: [],
        teachables: [],
        evolutionData: { isMega: false },
        ...overrides,
    };
}
const withMoves = (...ids) => ({ learnset: ids.map(m => ({ level: '1', move: m })), teachables: [] });
const teaches = (...ids) => ({ learnset: [], teachables: ids });

describe('ability-based detectors (T-107 107a)', () => {
    test('intimidateUser', () => {
        expect(DETECTORS.intimidateUser(mon({ parsedAbilities: ['INTIMIDATE'] }), ctx)).toBe(true);
        expect(DETECTORS.intimidateUser(mon({ parsedAbilities: ['GUTS'] }), ctx)).toBe(false);
    });
    test('weatherSetter — by ABILITY only (T-118); a Rain Dance learner is NOT a weather setter', () => {
        expect(DETECTORS.weatherSetter(mon({ parsedAbilities: ['DRIZZLE'] }), ctx)).toBe(true);
        expect(DETECTORS.weatherSetter(mon({ parsedAbilities: ['SNOW_WARNING'] }), ctx)).toBe(true);
        expect(DETECTORS.weatherSetter(mon(withMoves('MOVE_RAIN_DANCE')), ctx)).toBe(false); // move ≠ identity
        expect(DETECTORS.weatherSetter(mon(), ctx)).toBe(false);
    });
    test('weatherAbuser — Swift Swim / Chlorophyll / Sand Rush / Slush Rush', () => {
        expect(DETECTORS.weatherAbuser(mon({ parsedAbilities: ['SWIFT_SWIM'] }), ctx)).toBe(true);
        expect(DETECTORS.weatherAbuser(mon({ parsedAbilities: ['CHLOROPHYLL'] }), ctx)).toBe(true);
        expect(DETECTORS.weatherAbuser(mon({ parsedAbilities: ['INTIMIDATE'] }), ctx)).toBe(false);
    });
    test('redirector — Follow Me/Rage Powder move OR Lightning Rod/Storm Drain', () => {
        expect(DETECTORS.redirector(mon(withMoves('MOVE_FOLLOW_ME')), ctx)).toBe(true);
        expect(DETECTORS.redirector(mon({ parsedAbilities: ['LIGHTNING_ROD'] }), ctx)).toBe(true);
        expect(DETECTORS.redirector(mon(), ctx)).toBe(false);
    });
    test('trapper — Shadow Tag / Arena Trap / Magnet Pull', () => {
        expect(DETECTORS.trapper(mon({ parsedAbilities: ['SHADOW_TAG'] }), ctx)).toBe(true);
        expect(DETECTORS.trapper(mon({ parsedAbilities: ['ARENA_TRAP'] }), ctx)).toBe(true);
        expect(DETECTORS.trapper(mon(), ctx)).toBe(false);
    });
    test('unawareWall — Unaware / Magic Bounce', () => {
        expect(DETECTORS.unawareWall(mon({ parsedAbilities: ['UNAWARE'] }), ctx)).toBe(true);
        expect(DETECTORS.unawareWall(mon({ parsedAbilities: ['MAGIC_BOUNCE'] }), ctx)).toBe(true);
        expect(DETECTORS.unawareWall(mon(), ctx)).toBe(false);
    });
});

describe('move-based detectors (T-107 107a)', () => {
    test('fakeOutUser / tailwindSetter / trickRoomSetter / perishSongUser', () => {
        expect(DETECTORS.fakeOutUser(mon(withMoves('MOVE_FAKE_OUT')), ctx)).toBe(true);
        expect(DETECTORS.tailwindSetter(mon(withMoves('MOVE_TAILWIND')), ctx)).toBe(true);
        expect(DETECTORS.trickRoomSetter(mon(teaches('MOVE_TRICK_ROOM')), ctx)).toBe(true);
        expect(DETECTORS.perishSongUser(mon(withMoves('MOVE_PERISH_SONG')), ctx)).toBe(true);
        expect(DETECTORS.fakeOutUser(mon(), ctx)).toBe(false);
    });
    test('hazardSetter / hazardRemover', () => {
        expect(DETECTORS.hazardSetter(mon(withMoves('MOVE_STEALTH_ROCK')), ctx)).toBe(true);
        expect(DETECTORS.hazardSetter(mon(withMoves('MOVE_SPIKES')), ctx)).toBe(true);
        expect(DETECTORS.hazardRemover(mon(withMoves('MOVE_DEFOG')), ctx)).toBe(true);
        expect(DETECTORS.hazardRemover(mon(withMoves('MOVE_RAPID_SPIN')), ctx)).toBe(true);
        expect(DETECTORS.hazardSetter(mon(), ctx)).toBe(false);
    });
    test('screenSetter — utility profile only (T-118): a screen move + non-attacker', () => {
        expect(DETECTORS.screenSetter(mon(withMoves('MOVE_AURORA_VEIL')), ctx)).toBe(true);      // 70 off ≤ 95
        expect(DETECTORS.screenSetter(mon({ baseAttack: 130, ...withMoves('MOVE_REFLECT') }), ctx)).toBe(false); // attacker ≠ screen setter
    });
    test('cleric — bulky low-offense support only (T-118), not any Wish learner', () => {
        expect(DETECTORS.cleric(mon({ baseHP: 110, baseDefense: 110, baseSpDefense: 110, ...teaches('MOVE_WISH') }), ctx)).toBe(true);
        expect(DETECTORS.cleric(mon(teaches('MOVE_WISH')), ctx)).toBe(false);                    // mediocre bulk → not a cleric
        expect(DETECTORS.cleric(mon({ baseHP: 110, baseDefense: 110, baseSpDefense: 110, baseAttack: 130, ...teaches('MOVE_WISH') }), ctx)).toBe(false); // attacker
    });
    test('pivotUser (learnset OR teachables)', () => {
        expect(DETECTORS.pivotUser(mon(withMoves('MOVE_U_TURN')), ctx)).toBe(true);
        expect(DETECTORS.pivotUser(mon(teaches('MOVE_VOLT_SWITCH')), ctx)).toBe(true);
    });
    test('spreadAttacker — via move target metadata (damaging + spread target)', () => {
        expect(DETECTORS.spreadAttacker(mon(withMoves('MOVE_ROCK_SLIDE')), ctx)).toBe(true);
        expect(DETECTORS.spreadAttacker(mon(withMoves('MOVE_HEAT_WAVE')), ctx)).toBe(true);
        expect(DETECTORS.spreadAttacker(mon(withMoves('MOVE_SURF')), ctx)).toBe(true);
        expect(DETECTORS.spreadAttacker(mon(withMoves('MOVE_TACKLE')), ctx)).toBe(false); // single-target
        expect(DETECTORS.spreadAttacker(mon(withMoves('MOVE_ROCK_SLIDE')), {})).toBe(false); // no moves map
    });
    test('priorityUser — via move priority metadata (damaging + priority>0)', () => {
        expect(DETECTORS.priorityUser(mon(withMoves('MOVE_AQUA_JET')), ctx)).toBe(true);
        expect(DETECTORS.priorityUser(mon(withMoves('MOVE_PROTECT')), ctx)).toBe(false); // status priority
        expect(DETECTORS.priorityUser(mon(withMoves('MOVE_TACKLE')), ctx)).toBe(false);
    });
});

describe('stat-threshold detectors (T-107 107a, provisional thresholds)', () => {
    test('wallbreaker — high offense', () => {
        expect(DETECTORS.wallbreaker(mon({ baseAttack: THRESHOLDS.WALLBREAKER_OFFENSE }), ctx)).toBe(true);
        expect(DETECTORS.wallbreaker(mon({ baseSpAttack: THRESHOLDS.WALLBREAKER_OFFENSE + 20 }), ctx)).toBe(true);
        expect(DETECTORS.wallbreaker(mon({ baseAttack: 80, baseSpAttack: 80 }), ctx)).toBe(false);
    });
    test('setupSweeper — setup move AND real offense', () => {
        expect(DETECTORS.setupSweeper(mon({ baseAttack: 120, ...withMoves('MOVE_DRAGON_DANCE') }), ctx)).toBe(true);
        // setup move but no offense → not a sweeper
        expect(DETECTORS.setupSweeper(mon({ baseAttack: 50, baseSpAttack: 50, ...withMoves('MOVE_BULK_UP') }), ctx)).toBe(false);
        // offense but no setup move → not a sweeper
        expect(DETECTORS.setupSweeper(mon({ baseAttack: 130 }), ctx)).toBe(false);
    });
    test('trickRoomAbuser — slow AND high offense', () => {
        expect(DETECTORS.trickRoomAbuser(mon({ baseSpeed: 30, baseAttack: 130 }), ctx)).toBe(true);
        expect(DETECTORS.trickRoomAbuser(mon({ baseSpeed: 120, baseAttack: 130 }), ctx)).toBe(false); // fast
        expect(DETECTORS.trickRoomAbuser(mon({ baseSpeed: 30, baseAttack: 60, baseSpAttack: 60 }), ctx)).toBe(false); // weak
    });
    test('physicalWall / specialWall — bulk without offense', () => {
        expect(DETECTORS.physicalWall(mon({ baseHP: 100, baseDefense: 130, baseAttack: 50, baseSpAttack: 50 }), ctx)).toBe(true);
        expect(DETECTORS.specialWall(mon({ baseHP: 100, baseSpDefense: 130, baseAttack: 50, baseSpAttack: 50 }), ctx)).toBe(true);
        expect(DETECTORS.physicalWall(mon({ baseHP: 70, baseDefense: 70 }), ctx)).toBe(false);
    });
    test('choiceScarfRevengeKiller — fast AND offensive', () => {
        expect(DETECTORS.choiceScarfRevengeKiller(mon({ baseSpeed: 110, baseAttack: 110 }), ctx)).toBe(true);
        expect(DETECTORS.choiceScarfRevengeKiller(mon({ baseSpeed: 40, baseAttack: 130 }), ctx)).toBe(false);
    });
    test('regeneratorPivot — Regenerator + bulk, OR bulky recovery pivot', () => {
        expect(DETECTORS.regeneratorPivot(mon({ parsedAbilities: ['REGENERATOR'], baseHP: 100, baseDefense: 100 }), ctx)).toBe(true);
        expect(DETECTORS.regeneratorPivot(
            mon({ baseHP: 100, baseDefense: 110, baseSpDefense: 100, ...{ learnset: [{ level: '1', move: 'MOVE_ROOST' }, { level: '1', move: 'MOVE_U_TURN' }] } }), ctx)).toBe(true);
        expect(DETECTORS.regeneratorPivot(mon({ parsedAbilities: ['REGENERATOR'], baseHP: 50, baseDefense: 50, baseSpDefense: 50 }), ctx)).toBe(false); // frail
    });
    test('winCondition — a genuine closer (setup sweeper), not any wallbreaker (T-118)', () => {
        expect(DETECTORS.winCondition(mon({ baseAttack: 120, ...withMoves('MOVE_SWORDS_DANCE') }), ctx)).toBe(true);
        expect(DETECTORS.winCondition(mon({ baseAttack: 130 }), ctx)).toBe(false);   // strong attacker, no setup → not a closer
        expect(DETECTORS.winCondition(mon({ baseAttack: 110, ...withMoves('MOVE_SWORDS_DANCE') }), ctx)).toBe(false); // 110 < 115
    });
});

describe('detectFeatures aggregator', () => {
    test('returns the set of all matching feature tags for a mon', () => {
        const incineroarLike = mon({
            parsedAbilities: ['INTIMIDATE'],
            baseHP: 95, baseAttack: 115, baseDefense: 90, baseSpeed: 60, baseSpAttack: 80, baseSpDefense: 90,
            learnset: [{ level: '1', move: 'MOVE_FAKE_OUT' }, { level: '1', move: 'MOVE_U_TURN' }],
        });
        const feats = detectFeatures(incineroarLike, ctx);
        expect(feats.has('intimidateUser')).toBe(true);
        expect(feats.has('fakeOutUser')).toBe(true);
        expect(feats.has('pivotUser')).toBe(true);
        expect(feats.has('wallbreaker')).toBe(true); // 115 atk
        expect(feats.has('trapper')).toBe(false);
        expect(feats).toBeInstanceOf(Set);
    });

    test('is pure — does not mutate the mon or ctx', () => {
        const m = mon({ parsedAbilities: ['DRIZZLE'], ...withMoves('MOVE_STEALTH_ROCK') });
        const snapshot = JSON.stringify(m);
        detectFeatures(m, ctx);
        expect(JSON.stringify(m)).toBe(snapshot);
    });
});

describe('dedicatedSupport detector (T-141 r4, quality-tier rating)', () => {
    // Owner's rule (r4): support quality, not breadth. Tools are scored elite 8 / good 5 / filler 2, and the
    // RU support bar is 11 — so one elite tool (8) is a half-support ATTACKER, TWO elite (16) clear it, and a
    // pile of merely-GOOD/filler tools does NOT (Calyrex). Offense enters via the mon's ratingDoubles tier.
    test('ONE elite tool is NOT dedicated support, regardless of offense (half-support attacker)', () => {
        expect(DETECTORS.dedicatedSupport(mon({ baseAttack: 60, baseSpAttack: 65, ...withMoves('MOVE_RAGE_POWDER') }), ctx)).toBe(false); // redirection only (8)
        expect(DETECTORS.dedicatedSupport(mon({ baseAttack: 130, baseSpAttack: 60, ...withMoves('MOVE_TAILWIND') }), ctx)).toBe(false);  // tailwind only (8)
        expect(DETECTORS.dedicatedSupport(mon({ baseAttack: 60, baseSpAttack: 60, parsedAbilities: ['INTIMIDATE'] }), ctx)).toBe(false); // Intimidate only (8)
    });
    test('TWO ELITE tools = dedicated support; but two merely-GOOD tools fall short of the RU bar', () => {
        expect(DETECTORS.dedicatedSupport(mon({ baseAttack: 60, baseSpAttack: 60, parsedAbilities: ['INTIMIDATE'], ...withMoves('MOVE_FAKE_OUT') }), ctx)).toBe(true);   // Intimidate 8 + Fake Out 8 = 16
        expect(DETECTORS.dedicatedSupport(mon({ baseAttack: 60, baseSpAttack: 121, parsedAbilities: ['HOSPITALITY'], ...withMoves('MOVE_RAGE_POWDER') }), ctx)).toBe(true);  // Sinistcha: Hospitality 8 + Rage Powder 8 = 16
        expect(DETECTORS.dedicatedSupport(mon({ baseAttack: 120, baseSpAttack: 120, parsedAbilities: ['LIGHTNING_ROD'], ...withMoves('MOVE_HELPING_HAND') }), ctx)).toBe(false); // Lightning Rod 5 + Helping Hand 5 = 10 < 11
    });
    test('a pile of GOOD/filler tools (no elite) is NOT a dedicated support (breadth ≠ support — Calyrex)', () => {
        // Helping Hand 5 + Heal Pulse 2 + Light Screen 2 + Life Dew 2 + Reflect 2 = 13 → RU at most, never OU.
        const calyrexLike = mon({ baseAttack: 80, baseSpAttack: 80, ...withMoves('MOVE_HELPING_HAND', 'MOVE_HEAL_PULSE', 'MOVE_LIGHT_SCREEN', 'MOVE_LIFE_DEW', 'MOVE_REFLECT') });
        expect(supportTierDoubles(calyrexLike)).not.toBe('OU');
    });
    test('THREE elite/good tools (Whimsicott: Prankster + Tailwind + Encore) is dedicated support', () => {
        expect(DETECTORS.dedicatedSupport(mon({ parsedAbilities: ['PRANKSTER'], ...withMoves('MOVE_TAILWIND', 'MOVE_ENCORE') }), ctx)).toBe(true); // 8 + 8 + 5 = 21
    });
});

describe('archetype-model integrity — every referenced feature has a detector', () => {
    // The engine (107b+) reads entry/structure roles by feature tag; a feature in the JSON with no
    // detector would silently never fire. Lock the invariant so JSON edits can't drift from the code.
    test.each(FORMATS)('%s: all featureDefinitions have a detector', (format) => {
        const model = loadArchetypeModel(format);
        const missing = Object.keys(model.featureDefinitions).filter(f => !(f in DETECTORS));
        expect(missing).toEqual([]);
    });
});
