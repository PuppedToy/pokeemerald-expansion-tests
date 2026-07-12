'use strict';

// T-107 (107b) + T-118 — archetype-fit scoring + emergent crystallisation by slot-recipe FIT.

const {
    teamFeatureCounts, matchesEntry, entryConfidence, recipeFit, crystallize,
    combinedStructure, structureFit, scoreCandidate,
} = require('../../modules/archetypeFit');
const { loadArchetypeModel } = require('../../archetypes');

const singles = loadArchetypeModel('singles');

function mon(overrides = {}) {
    return {
        id: 'SPECIES_TEST', parsedTypes: ['NORMAL'], parsedAbilities: [],
        baseHP: 70, baseAttack: 70, baseDefense: 70, baseSpeed: 70, baseSpAttack: 70, baseSpDefense: 70,
        learnset: [], teachables: [], evolutionData: { isMega: false }, ...overrides,
    };
}
const learn = (...mv) => ({ learnset: mv.map(m => ({ level: '1', move: m })) });
// Clean single-role exemplars:
const regenPivot = () => mon({ parsedAbilities: ['REGENERATOR'], baseHP: 100, baseDefense: 90, baseSpDefense: 90 });
const wallbreaker = () => mon({ baseAttack: 130 });
const revengeKiller = () => mon({ baseSpeed: 115, baseAttack: 115 }); // fast + offensive (no setup)
const sweeper = () => mon({ baseAttack: 120, ...learn('MOVE_DRAGON_DANCE') }); // setupSweeper + winCondition
const rocker = () => mon(learn('MOVE_STEALTH_ROCK'));  // hazardSetter
const defogger = () => mon(learn('MOVE_DEFOG'));       // hazardRemover
const pivot = () => mon(learn('MOVE_U_TURN'));         // pivotUser
const drizzleSetter = () => mon({ parsedAbilities: ['DRIZZLE'] });
const swiftSwim = () => mon({ parsedAbilities: ['SWIFT_SWIM'] });
const physWall = () => mon({ baseHP: 100, baseDefense: 130, baseAttack: 50, baseSpAttack: 50 });
const specWall = () => mon({ baseHP: 100, baseSpDefense: 130, baseAttack: 50, baseSpAttack: 50 });
const unaware = () => mon({ parsedAbilities: ['UNAWARE'] });
const cleric = () => mon({ baseHP: 110, baseDefense: 110, baseSpDefense: 110, baseAttack: 50, baseSpAttack: 50, teachables: ['MOVE_WISH'] });

describe('teamFeatureCounts', () => {
    test('aggregates feature tags across the team (a mon can contribute to several)', () => {
        const counts = teamFeatureCounts([regenPivot(), regenPivot(), wallbreaker()]);
        expect(counts.regeneratorPivot).toBe(2);
        expect(counts.wallbreaker).toBe(1);
        expect(counts.trapper).toBeUndefined();
    });
});

describe('recipeFit — required-role satisfaction (T-118)', () => {
    const struct = [
        { role: 'wallbreaker', min: 1, max: 3, weight: 1.0 },
        { role: 'choiceScarfRevengeKiller', min: 1, max: 1, weight: 0.8 },
        { role: 'hazardSetter', min: 0, max: 1, weight: 0.4 }, // optional
    ];
    test('is 0 with none of the required roles, 1 when they are all met', () => {
        expect(recipeFit({}, struct)).toBe(0);
        expect(recipeFit({ wallbreaker: 1, choiceScarfRevengeKiller: 1 }, struct)).toBeCloseTo(1);
    });
    test('optional (min 0) roles only add a small bonus, never dilute', () => {
        const withOpt = recipeFit({ wallbreaker: 1, choiceScarfRevengeKiller: 1, hazardSetter: 1 }, struct);
        expect(withOpt).toBeCloseTo(1); // capped at 1
        // partial required + optional present is still driven by the required roles
        expect(recipeFit({ wallbreaker: 1, hazardSetter: 1 }, struct)).toBeGreaterThan(recipeFit({ wallbreaker: 1 }, struct));
    });
});

// The retained pure entry helpers (no longer used by crystallize, kept for reference/back-compat).
describe('matchesEntry / entryConfidence (retained helpers)', () => {
    const e = [{ feature: 'regeneratorPivot', min: 2 }];
    test('matchesEntry is AND across clauses at/above min', () => {
        expect(matchesEntry({ regeneratorPivot: 2 }, e)).toBe(true);
        expect(matchesEntry({ regeneratorPivot: 1 }, e)).toBe(false);
    });
    test('entryConfidence is fractional progress, capped at 1', () => {
        expect(entryConfidence({ regeneratorPivot: 1 }, e)).toBeCloseTo(0.5);
        expect(entryConfidence({ regeneratorPivot: 5 }, e)).toBeCloseTo(1);
    });
});

describe('crystallize — best-fitting recipe (T-118)', () => {
    test('a full balance team fits Balance best', () => {
        const c = crystallize([regenPivot(), wallbreaker(), sweeper(), rocker(), defogger()], singles);
        expect(c.base[0].id).toBe('balance');
        expect(c.base[0].fit).toBeGreaterThan(0.7);
    });
    test('wallbreakers + scarf + pivot + rocks fit Bulky Offense', () => {
        const c = crystallize([wallbreaker(), wallbreaker(), revengeKiller(), pivot(), rocker()], singles);
        expect(c.base[0].id).toBe('bulky_offense');
    });
    test('2+ setup sweepers + a hazard lead fit Hyper Offense', () => {
        const c = crystallize([sweeper(), sweeper(), rocker()], singles);
        expect(c.base[0].id).toBe('hyper_offense');
    });
    test('a wall stack + Unaware + cleric fits Full Stall', () => {
        const c = crystallize([physWall(), specWall(), unaware(), cleric()], singles);
        expect(c.base[0].id).toBe('full_stall');
    });
    test('a Drizzle setter + Swift Swim abuser crystallises the weather gimmick', () => {
        const c = crystallize([drizzleSetter(), swiftSwim()], singles);
        const weather = c.gimmicks.find(g => g.id === 'weather');
        expect(weather.fit).toBeGreaterThan(0.6);
    });
    test('an incoherent pile fits no base archetype well', () => {
        const c = crystallize([mon(), mon()], singles);
        expect(c.base[0].fit).toBeLessThan(0.3);
    });
});

describe('combinedStructure — merge base + gimmick structures by role', () => {
    test('merges duplicate roles taking the strongest min/max/weight', () => {
        const s = combinedStructure(singles, 'balance', ['weather']);
        const roles = s.map(r => r.role);
        expect(roles).toContain('regeneratorPivot'); // from balance
        expect(roles).toContain('weatherSetter');     // from weather gimmick
        expect(roles.filter(r => r === 'winCondition').length).toBe(1); // both have it → merged once
    });
});

describe('structureFit + scoreCandidate', () => {
    const structure = [
        { role: 'regeneratorPivot', min: 2, max: 3, weight: 1.0 },
        { role: 'wallbreaker', min: 1, max: 2, weight: 1.0 },
        { role: 'hazardSetter', min: 0, max: 1, weight: 0.5 },
    ];
    test('structureFit rises as required roles fill; optional (min 0) roles never penalise', () => {
        expect(structureFit({}, structure)).toBeLessThan(structureFit({ regeneratorPivot: 2 }, structure));
        expect(structureFit({ regeneratorPivot: 2, wallbreaker: 1 }, structure)).toBeCloseTo(1);
    });
    test('scoreCandidate rewards filling an UNMET required role most', () => {
        const teamCounts = { regeneratorPivot: 1 };
        expect(scoreCandidate(regenPivot(), teamCounts, structure)).toBeGreaterThan(0);
        expect(scoreCandidate(wallbreaker(), teamCounts, structure)).toBeGreaterThan(0);
        expect(scoreCandidate(mon(), teamCounts, structure)).toBe(0);
    });
    test('scoreCandidate gives less for depth (within range) than for an unmet role', () => {
        const s2 = [{ role: 'wallbreaker', min: 1, max: 3, weight: 1.0 }];
        expect(scoreCandidate(wallbreaker(), {}, s2)).toBeGreaterThan(scoreCandidate(wallbreaker(), { wallbreaker: 1 }, s2));
        expect(scoreCandidate(wallbreaker(), { wallbreaker: 1 }, s2)).toBeGreaterThan(0);
    });
});
