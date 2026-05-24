'use strict';

const { ratePokemon } = require('../../rating');
const moves = require('../fixtures/miniMoves');
const abilities = require('../fixtures/miniAbilities');

// ── Fix 3 — HAZARD+RECOVERY bulk guard ───────────────────────────────────────
//
// HAZARD+RECOVERY +0.40 should only fire when the pokemon is bulky enough to
// actually sustain a hazard-setter role. An OFFENSIVE glass cannon with hazards
// via TM is not a real hazard setter.
//
// Guard condition: role !== 'OFFENSIVE' || defensePower >= 5.5
// (the guard blocks the combo only for OFFENSIVE pokemon with defensePower < 5.5)

function makeBase(overrides) {
    return {
        id: 'SPECIES_TEST',
        family: 'P_FAMILY_TEST',
        form: null,
        parsedTypes: ['NORMAL'],
        parsedAbilities: ['INNER_FOCUS'],
        baseBST: 500,
        evolutions: [],
        evolutionData: { type: 'EVO_TYPE_SOLO', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
        teachables: [],
        newTeachables: [],
        oldTeachables: [],
        ...overrides,
    };
}

// OFFENSIVE pokemon with defensePower < 5.5 after flex.
// HP=70, Atk=130, Def=50, SpA=100, SpD=50, Spe=130
//   offensePower = 130/160*10 = 8.125
//   speedPower = 130/160*10 = 8.125
//   defensePower = (70 + 50*0.6 + 50*0.4)/320*10 = 3.75 → flex: +0.3125 → 4.0625 < 5.5
//   role: |off-def|=4.0625≥1.0, off>def, |off-spd|=0<1.0 → OFFENSIVE
const offensiveGlassCannon = makeBase({
    baseHP: 70,
    baseAttack: 130,
    baseDefense: 50,
    baseSpAttack: 100,
    baseSpDefense: 50,
    baseSpeed: 130,
    baseBST: 530,
    learnset: [
        { level: '1', move: 'MOVE_STEALTH_ROCK' },
        { level: '1', move: 'MOVE_DRAIN_PUNCH' },
    ],
});

// OFFENSIVE pokemon with defensePower ≥ 5.5 after flex.
// HP=90, Atk=130, Def=90, SpA=90, SpD=90, Spe=120
//   defensePower = (90 + 90*0.6 + 90*0.4)/320*10 = 5.625 → flex (|Def-SpD|=0): +0.5625 → 6.1875 ≥ 5.5
//   speedPower = 120/160*10 = 7.5 > defensePower(5.625) → OFFENSIVE
const bulkierOffensive = makeBase({
    baseHP: 90,
    baseAttack: 130,
    baseDefense: 90,
    baseSpAttack: 90,
    baseSpDefense: 90,
    baseSpeed: 120,
    baseBST: 520,
    learnset: [
        { level: '1', move: 'MOVE_STEALTH_ROCK' },
        { level: '1', move: 'MOVE_DRAIN_PUNCH' },
    ],
});

// TANK pokemon: defensePower > offensePower → role=TANK, always gets HAZARD+RECOVERY.
// HP=100, Atk=60, Def=130, SpA=60, SpD=130, Spe=60
const tankWithHazard = makeBase({
    baseHP: 100,
    baseAttack: 60,
    baseDefense: 130,
    baseSpAttack: 60,
    baseSpDefense: 130,
    baseSpeed: 60,
    baseBST: 540,
    learnset: [
        { level: '1', move: 'MOVE_STEALTH_ROCK' },
        { level: '1', move: 'MOVE_ROOST' },
    ],
});

describe('Fix 3 — HAZARD+RECOVERY bulk guard', () => {
    test('OFFENSIVE pokemon with defensePower < 5.5: HAZARD+RECOVERY combo does NOT fire', () => {
        const result = ratePokemon(offensiveGlassCannon, moves, abilities, new Set());
        expect(result.role).toBe('OFFENSIVE');
        // comboBonus must be 0 — HAZARD+RECOVERY blocked, no other combos present
        expect(result.comboBonus).toBe(0);
    });

    test('OFFENSIVE pokemon with defensePower >= 5.5: HAZARD+RECOVERY combo fires normally', () => {
        const result = ratePokemon(bulkierOffensive, moves, abilities, new Set());
        expect(result.role).toBe('OFFENSIVE');
        // comboBonus must include HAZARD+RECOVERY (+0.4)
        expect(result.comboBonus).toBeCloseTo(0.4, 5);
    });

    test('TANK pokemon: HAZARD+RECOVERY fires regardless of defensePower', () => {
        const result = ratePokemon(tankWithHazard, moves, abilities, new Set());
        expect(result.role).toBe('TANK');
        // comboBonus must include HAZARD+RECOVERY (+0.4)
        expect(result.comboBonus).toBeCloseTo(0.4, 5);
    });
});
