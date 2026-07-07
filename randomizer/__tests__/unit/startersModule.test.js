'use strict';

// TDD: written BEFORE modules/startersModule.js was implemented.
// Run `npm test` — all tests in this file should fail until the module exists.

const rng = require('../../rng');
const { isSuperEffective } = require('../../rating');

function freshModule() {
    let mod;
    jest.isolateModules(() => { mod = require('../../modules/startersModule'); });
    return mod;
}

// Minimal pokemon shaped to pass the eligibility filter:
//   evolutionData.type === EVO_TYPE_LC_OF_3, isLC: true
//   rating.bestEvoTier === 'UU', rating.tier === 'PU' (isSubWeakTier)
function makePoke(id, family, types, overrides = {}) {
    return {
        id,
        family,
        parsedTypes: types,
        evolutionData: {
            type: 'EVO_TYPE_LC_OF_3',
            isLC: true,
            isMega: false,
            isFinal: false,
            megaEvos: [],
            ...overrides.evolutionData,
        },
        rating: {
            bestEvoTier: 'UU',
            tier: 'PU',
            ...overrides.rating,
        },
        evolutions: overrides.evolutions || [],
    };
}

// Classic fire/grass/water type triangle + 3 extras for sampling variety
const FIRE_MON   = makePoke('SPECIES_FIRE_MON',     'P_FAMILY_FIRE',     ['FIRE']);
const GRASS_MON  = makePoke('SPECIES_GRASS_MON',    'P_FAMILY_GRASS',    ['GRASS']);
const WATER_MON  = makePoke('SPECIES_WATER_MON',    'P_FAMILY_WATER',    ['WATER']);
// FIGHTING beats NORMAL beats nothing useful — adds volume
const FIGHTING_MON = makePoke('SPECIES_FIGHTING_MON', 'P_FAMILY_FIGHTING', ['FIGHTING']);
const BUG_MON      = makePoke('SPECIES_BUG_MON',      'P_FAMILY_BUG',      ['BUG']);
const PSYCHIC_MON  = makePoke('SPECIES_PSYCHIC_MON',  'P_FAMILY_PSYCHIC',  ['PSYCHIC']);

const starterPokes = [FIRE_MON, GRASS_MON, WATER_MON, FIGHTING_MON, BUG_MON, PSYCHIC_MON];

// All-NORMAL list — no type has SE coverage against NORMAL, so the main algorithm
// exhausts eligible candidates and the fallback path triggers.
const normalPokes = [
    makePoke('SPECIES_NOR1', 'P_FAMILY_NOR1', ['NORMAL']),
    makePoke('SPECIES_NOR2', 'P_FAMILY_NOR2', ['NORMAL']),
    makePoke('SPECIES_NOR3', 'P_FAMILY_NOR3', ['NORMAL']),
    makePoke('SPECIES_NOR4', 'P_FAMILY_NOR4', ['NORMAL']),
];

beforeEach(() => { rng.seed(42); });
afterEach(() => { rng.reset(); });

describe('runStartersModule — output shape', () => {
    test('returns an object with starters and alreadyChosenFamilies', () => {
        const { runStartersModule } = freshModule();
        const result = runStartersModule(starterPokes);
        expect(result).toHaveProperty('starters');
        expect(result).toHaveProperty('alreadyChosenFamilies');
    });

    test('starters is an array of exactly 3 string ids', () => {
        const { runStartersModule } = freshModule();
        const { starters } = runStartersModule(starterPokes);
        expect(Array.isArray(starters)).toBe(true);
        expect(starters).toHaveLength(3);
        starters.forEach(id => expect(typeof id).toBe('string'));
    });

    test('alreadyChosenFamilies is an array with no duplicates', () => {
        const { runStartersModule } = freshModule();
        const { alreadyChosenFamilies } = runStartersModule(starterPokes);
        expect(Array.isArray(alreadyChosenFamilies)).toBe(true);
        expect(alreadyChosenFamilies.length).toBe(new Set(alreadyChosenFamilies).size);
    });
});

describe('runStartersModule — eligibility', () => {
    test('all returned starters are valid pokemon ids from the list', () => {
        const { runStartersModule } = freshModule();
        const ids = starterPokes.map(p => p.id);
        const { starters } = runStartersModule(starterPokes);
        starters.forEach(id => expect(ids).toContain(id));
    });

    test('alreadyChosenFamilies contains all 3 starter families', () => {
        const { runStartersModule } = freshModule();
        const { starters, alreadyChosenFamilies } = runStartersModule(starterPokes);
        starters.forEach(starterId => {
            const poke = starterPokes.find(p => p.id === starterId);
            expect(alreadyChosenFamilies).toContain(poke.family);
        });
    });

    test('starters are 3 distinct pokemon', () => {
        const { runStartersModule } = freshModule();
        const { starters } = runStartersModule(starterPokes);
        expect(new Set(starters).size).toBe(3);
    });
});

describe('runStartersModule — type triangle', () => {
    // B-007: non-isolated require so the beforeEach `rng.seed(42)` controls the module's OWN rng
    // instance. With freshModule()/jest.isolateModules the module gets a SEPARATE, unseeded rng, so
    // the draw was uncontrolled — and ~14% of unseeded draws exhaust the candidate pool and hit the
    // no-triangle fallback, making this test flaky. Seed 42 deterministically forms FIRE>GRASS>WATER.
    test('the 3 starters form a type-triangle (A beats B, B beats C, C beats A)', () => {
        const { runStartersModule } = require('../../modules/startersModule');
        const { starters } = runStartersModule(starterPokes);
        const [s0, s1, s2] = starters.map(id => starterPokes.find(p => p.id === id));
        // s0 types are SE against s1
        expect(s0.parsedTypes.some(t => isSuperEffective(t, s1.parsedTypes))).toBe(true);
        // s1 types are SE against s2
        expect(s1.parsedTypes.some(t => isSuperEffective(t, s2.parsedTypes))).toBe(true);
        // s2 types are SE against s0
        expect(s2.parsedTypes.some(t => isSuperEffective(t, s0.parsedTypes))).toBe(true);
    });
});

describe('runStartersModule — determinism', () => {
    test('same seed produces identical starters', () => {
        // Use non-isolated require so rng.seed() affects the module's own rng instance.
        const { runStartersModule } = require('../../modules/startersModule');

        rng.seed(77);
        const r1 = runStartersModule([...starterPokes]);

        rng.seed(77);
        const r2 = runStartersModule([...starterPokes]);

        expect(r1.starters).toEqual(r2.starters);
        expect(r1.alreadyChosenFamilies).toEqual(r2.alreadyChosenFamilies);
    });
});

describe('runStartersModule — exhaustive triangle search (T-032)', () => {
  // non-isolated require so rng.seed() per iteration controls the module's own rng
  const { runStartersModule } = require('../../modules/startersModule');
  const formsTriangle = (starters) => {
    const [s0, s1, s2] = starters.map(id => starterPokes.find(p => p.id === id));
    if (!s0 || !s1 || !s2) return false;
    return s0.parsedTypes.some(t => isSuperEffective(t, s1.parsedTypes))
      && s1.parsedTypes.some(t => isSuperEffective(t, s2.parsedTypes))
      && s2.parsedTypes.some(t => isSuperEffective(t, s0.parsedTypes));
  };

  // The whole point of T-032: a triangle exists in this pool (FIRE>GRASS>WATER>FIRE), so the module
  // must return one for EVERY seed — never the no-constraint fallback. The greedy version fell back on
  // ~14% of seeds, so this sweep fails before the fix and passes after.
  test('returns a real triangle for every seed when one exists (0 fallbacks)', () => {
    for (let seed = 0; seed < 300; seed++) {
      rng.seed(seed);
      const { starters } = runStartersModule([...starterPokes]);
      expect(new Set(starters).size).toBe(3);
      expect(formsTriangle(starters)).toBe(true);
    }
  });

  test('selection is randomized among valid triangles, not fixed to one ordering', () => {
    const seen = new Set();
    for (let seed = 0; seed < 60; seed++) {
      rng.seed(seed);
      seen.add(runStartersModule([...starterPokes]).starters.join('>'));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  test('fallback triggers ONLY when the pool admits no triangle', () => {
    for (let seed = 0; seed < 30; seed++) {
      rng.seed(seed);
      const { starters } = runStartersModule([...normalPokes]); // all-NORMAL → no triangle possible
      expect(starters).toHaveLength(3);
      expect(formsTriangle(starters)).toBe(false);
    }
  });
});

describe('runStartersModule — configurable quality tier (T-072)', () => {
    // non-isolated require so rng.seed() controls the module's own rng instance
    const { runStartersModule } = require('../../modules/startersModule');

    // OU-tier eligible mons: still LC-of-3 lines with a sub-weak base, but the family's
    // best evolution rates OU instead of UU. Their own type triangle (FIRE>GRASS>WATER).
    const ouPokes = [
        makePoke('SPECIES_OU_FIRE',  'P_FAMILY_OU_FIRE',  ['FIRE'],  { rating: { bestEvoTier: 'OU', tier: 'PU' } }),
        makePoke('SPECIES_OU_GRASS', 'P_FAMILY_OU_GRASS', ['GRASS'], { rating: { bestEvoTier: 'OU', tier: 'PU' } }),
        makePoke('SPECIES_OU_WATER', 'P_FAMILY_OU_WATER', ['WATER'], { rating: { bestEvoTier: 'OU', tier: 'PU' } }),
    ];
    // Mixed pool: a UU triangle (starterPokes) + an OU triangle. Quality selects which one is eligible.
    const mixed = [...starterPokes, ...ouPokes];
    const tierOf = (list, id) => list.find(p => p.id === id).rating.bestEvoTier;

    test('quality "OU" only picks starters whose family bestEvoTier === OU', () => {
        rng.seed(3);
        const { starters } = runStartersModule([...mixed], { quality: 'OU' });
        expect(starters).toHaveLength(3);
        starters.forEach(id => expect(tierOf(mixed, id)).toBe('OU'));
    });

    test('default call (no opts) reproduces today\'s UU behaviour', () => {
        rng.seed(3);
        const { starters } = runStartersModule([...mixed]);
        expect(starters).toHaveLength(3);
        starters.forEach(id => expect(tierOf(mixed, id)).toBe('UU'));
    });

    test('invalid / absent quality falls back to UU', () => {
        rng.seed(3);
        const bogus = runStartersModule([...mixed], { quality: 'NONSENSE' }).starters;
        bogus.forEach(id => expect(tierOf(mixed, id)).toBe('UU'));
    });

    test('explicit quality "UU" is byte-identical to the default call for a seed', () => {
        rng.seed(9);
        const a = runStartersModule([...mixed]);
        rng.seed(9);
        const b = runStartersModule([...mixed], { quality: 'UU' });
        expect(b.starters).toEqual(a.starters);
        expect(b.alreadyChosenFamilies).toEqual(a.alreadyChosenFamilies);
    });
});

describe('runStartersModule — fallback path', () => {
    test('fallback: still returns 3 starters when no type triangle is possible', () => {
        const { runStartersModule } = freshModule();
        const { starters } = runStartersModule(normalPokes);
        expect(starters).toHaveLength(3);
        starters.forEach(id => expect(typeof id).toBe('string'));
    });

    test('fallback: alreadyChosenFamilies has at least 3 entries', () => {
        const { runStartersModule } = freshModule();
        const { alreadyChosenFamilies } = runStartersModule(normalPokes);
        expect(alreadyChosenFamilies.length).toBeGreaterThanOrEqual(3);
    });
});
