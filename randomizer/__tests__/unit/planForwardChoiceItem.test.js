'use strict';

// T-133 — forward (dependent) Choice-item claim. A mon that fills an offensive role the team wants gets a
// Choice item BEFORE its moveset (so the set builds all-attacking), but ONLY if a Choice item is actually in
// the bag (dependent). The item is matched to the mon's stats; falls back to whatever Choice the bag holds.

const { planForwardChoiceItem } = require('../../modules/archetypeRefine');
const { getArchetypeModel } = require('../../archetypes');

const singles = getArchetypeModel('singles');
const ALL = ['Choice Band', 'Choice Specs', 'Choice Scarf'];

function mon(o = {}) {
    return {
        id: 'SPECIES_T', parsedTypes: ['NORMAL'], parsedAbilities: [],
        baseHP: 70, baseAttack: 70, baseDefense: 70, baseSpeed: 70, baseSpAttack: 70, baseSpDefense: 70,
        learnset: [], teachables: [], evolutionData: { isMega: false }, ...o,
    };
}
// bulky_offense seed → an identity whose recipe wants wallbreaker + choiceScarfRevengeKiller.
const plan = (species, available = ALL, extra = {}) => planForwardChoiceItem({
    species, team: [], model: singles, ctx: {}, sophistication: 1,
    seed: { base: 'bulky_offense' }, available, ...extra,
});

const physicalBreaker = mon({ baseAttack: 130, baseSpAttack: 60 });       // offense 130 → wallbreaker, physical
const specialBreaker = mon({ baseAttack: 60, baseSpAttack: 130 });        // offense 130 → wallbreaker, special
const revengeKiller = mon({ baseSpeed: 110, baseAttack: 100, baseSpAttack: 60 }); // fast → choiceScarfRevengeKiller
const wall = mon({ baseAttack: 60, baseSpAttack: 60, baseDefense: 120, baseHP: 100 }); // not offensive

describe('planForwardChoiceItem (T-133)', () => {
    test('a physical wallbreaker with a Choice Band available → Choice Band', () => {
        expect(plan(physicalBreaker)).toBe('Choice Band');
    });

    test('a special wallbreaker → Choice Specs', () => {
        expect(plan(specialBreaker)).toBe('Choice Specs');
    });

    test('a fast revenge killer → Choice Scarf', () => {
        expect(plan(revengeKiller)).toBe('Choice Scarf');
    });

    test('a defensive wall gets no Choice (not an attacker)', () => {
        expect(plan(wall)).toBe(null);
    });

    test('DEPENDENT: no Choice item in the bag → null (never forced)', () => {
        expect(plan(physicalBreaker, [])).toBe(null);
        expect(plan(physicalBreaker, ['Leftovers', 'Life Orb'])).toBe(null);
    });

    test('falls back to whatever Choice the bag actually holds (physical breaker, only Scarf left)', () => {
        expect(plan(physicalBreaker, ['Choice Scarf'])).toBe('Choice Scarf');
    });

    test('below the sophistication threshold → null', () => {
        expect(plan(physicalBreaker, ALL, { sophistication: 0.1 })).toBe(null);
    });

    test('no emerged identity and no seed → null', () => {
        expect(planForwardChoiceItem({ species: physicalBreaker, team: [], model: singles, ctx: {}, sophistication: 1, available: ALL })).toBe(null);
    });
});
