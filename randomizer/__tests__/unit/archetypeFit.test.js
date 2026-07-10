'use strict';

// T-107 (107b) — archetype-fit scoring + emergent crystallization. Pure: reads the 107a feature
// detectors + the archetype JSONs; used by 107c (weighted fill / crystallization) but wires no output.

const {
    teamFeatureCounts, matchesEntry, entryConfidence, crystallize,
    combinedStructure, structureFit, scoreCandidate,
} = require('../../modules/archetypeFit');
const { loadArchetypeModel } = require('../../archetypes');

const singles = loadArchetypeModel('singles');

function mon(overrides = {}) {
    return {
        id: 'SPECIES_TEST',
        parsedTypes: ['NORMAL'],
        parsedAbilities: [],
        baseHP: 70, baseAttack: 70, baseDefense: 70, baseSpeed: 70, baseSpAttack: 70, baseSpDefense: 70,
        learnset: [], teachables: [],
        evolutionData: { isMega: false },
        ...overrides,
    };
}
// Clean single-feature exemplars (mediocre stats so no unintended stat-detector fires):
const regenPivot = () => mon({ parsedAbilities: ['REGENERATOR'], baseHP: 100, baseDefense: 90, baseSpDefense: 90 });
const wallbreaker = () => mon({ baseAttack: 130 });
const revengeKiller = () => mon({ baseSpeed: 115, baseAttack: 115 }); // fast + offensive
const drizzleSetter = () => mon({ parsedAbilities: ['DRIZZLE'] });

describe('teamFeatureCounts', () => {
    test('aggregates feature tags across the team (a mon can contribute to several)', () => {
        const counts = teamFeatureCounts([regenPivot(), regenPivot(), wallbreaker()]);
        expect(counts.regeneratorPivot).toBe(2);
        expect(counts.wallbreaker).toBe(1);
        expect(counts.trapper).toBeUndefined();
    });
});

describe('entry matching + confidence', () => {
    const balanceEntry = [{ feature: 'regeneratorPivot', min: 2 }];
    test('matchesEntry is AND across clauses at/above min', () => {
        expect(matchesEntry({ regeneratorPivot: 2 }, balanceEntry)).toBe(true);
        expect(matchesEntry({ regeneratorPivot: 1 }, balanceEntry)).toBe(false);
        const boEntry = [{ feature: 'wallbreaker', min: 1 }, { feature: 'choiceScarfRevengeKiller', min: 1 }];
        expect(matchesEntry({ wallbreaker: 2, choiceScarfRevengeKiller: 1 }, boEntry)).toBe(true);
        expect(matchesEntry({ wallbreaker: 2 }, boEntry)).toBe(false); // missing revenge killer
    });
    test('entryConfidence is fractional progress toward the entry, capped at 1', () => {
        expect(entryConfidence({ regeneratorPivot: 2 }, balanceEntry)).toBeCloseTo(1);
        expect(entryConfidence({ regeneratorPivot: 1 }, balanceEntry)).toBeCloseTo(0.5);
        expect(entryConfidence({}, balanceEntry)).toBeCloseTo(0);
        expect(entryConfidence({ regeneratorPivot: 5 }, balanceEntry)).toBeCloseTo(1); // capped
    });
});

describe('crystallize — emergent archetype/gimmick detection', () => {
    test('a 2-Regenerator-pivot team falls into Balance (matched, top-ranked)', () => {
        const c = crystallize([regenPivot(), regenPivot()], singles);
        expect(c.base[0].id).toBe('balance');
        expect(c.base[0].matched).toBe(true);
        expect(c.base[0].confidence).toBeCloseTo(1);
    });
    test('a wallbreaker + Choice-Scarf revenge killer falls into Bulky Offense', () => {
        const c = crystallize([wallbreaker(), revengeKiller()], singles);
        const bo = c.base.find(a => a.id === 'bulky_offense');
        expect(bo.matched).toBe(true);
    });
    test('a Drizzle setter crystallizes the weather gimmick', () => {
        const c = crystallize([drizzleSetter()], singles);
        const weather = c.gimmicks.find(g => g.id === 'weather');
        expect(weather.matched).toBe(true);
        expect(weather.confidence).toBeCloseTo(1);
    });
    test('an incoherent pile matches no base archetype', () => {
        const c = crystallize([mon(), mon()], singles);
        expect(c.base.every(a => !a.matched)).toBe(true);
    });
});

describe('combinedStructure — merge base + gimmick structures by role', () => {
    test('merges duplicate roles taking the strongest min/max/weight', () => {
        const s = combinedStructure(singles, 'balance', ['weather']);
        const roles = s.map(r => r.role);
        expect(roles).toContain('regeneratorPivot'); // from balance
        expect(roles).toContain('weatherSetter');     // from weather gimmick
        // winCondition appears in both balance and weather → single merged entry
        expect(roles.filter(r => r === 'winCondition').length).toBe(1);
    });
});

describe('structureFit + scoreCandidate', () => {
    const structure = [
        { role: 'regeneratorPivot', min: 2, max: 3, weight: 1.0 },
        { role: 'wallbreaker', min: 1, max: 2, weight: 1.0 },
        { role: 'hazardSetter', min: 0, max: 1, weight: 0.5 }, // optional
    ];
    test('structureFit rises as required roles fill; optional (min 0) roles never penalise', () => {
        expect(structureFit({}, structure)).toBeLessThan(structureFit({ regeneratorPivot: 2 }, structure));
        expect(structureFit({ regeneratorPivot: 2, wallbreaker: 1 }, structure)).toBeCloseTo(1);
    });
    test('scoreCandidate rewards filling an UNMET required role most', () => {
        const teamCounts = { regeneratorPivot: 1 }; // still needs 1 more regen pivot + a wallbreaker
        const fillsRegen = scoreCandidate(regenPivot(), teamCounts, structure);
        const fillsBreaker = scoreCandidate(wallbreaker(), teamCounts, structure);
        const fillsNothing = scoreCandidate(mon(), teamCounts, structure);
        expect(fillsRegen).toBeGreaterThan(0);
        expect(fillsBreaker).toBeGreaterThan(0);
        expect(fillsNothing).toBe(0);
    });
    test('scoreCandidate gives less for depth (within range) than for an unmet role', () => {
        const structure2 = [{ role: 'wallbreaker', min: 1, max: 3, weight: 1.0 }];
        const unmet = scoreCandidate(wallbreaker(), {}, structure2);            // count 0 < min 1
        const depth = scoreCandidate(wallbreaker(), { wallbreaker: 1 }, structure2); // count 1, room to max
        expect(unmet).toBeGreaterThan(depth);
        expect(depth).toBeGreaterThan(0);
    });
});
