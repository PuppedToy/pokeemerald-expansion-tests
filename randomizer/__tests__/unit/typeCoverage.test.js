'use strict';

// T-193 — monotype defensive-coverage helpers (pure). Typing math is derived from the canonical
// `damageMultiplier` (rating.js SSOT); only the ability→type-immunity/resist tables are hardcoded.

const {
    TYPE_IMMUNITY_ABILITIES,
    TYPE_RESIST_ABILITIES,
    monotypeWeaknesses,
    providesImmunity,
    providesResist,
    coverageAbilityFor,
    uncoveredImmunities,
    uncoveredResists,
    autoIncludeProbability,
    selectByRoll,
    coverageReasonFor,
    candidateCoverageDetail,
    evaluateCoverage,
    pickCoverageMember,
} = require('../../modules/typeCoverage');
const { damageMultiplier } = require('../../rating');

const dmg = damageMultiplier;

// poke-like candidate; parsedAbilities index 2 is the HIDDEN ability (gated below level 12).
const mon = (types, abilities = []) => ({ parsedTypes: types, parsedAbilities: abilities });
// placed team member wrapper: { pokemon, ability } (single resolved ability).
const member = (types, ability = null) => ({ pokemon: { parsedTypes: types }, ability });

describe('ability tables', () => {
    test('immunity table maps threat type → the standard immunity abilities', () => {
        expect(TYPE_IMMUNITY_ABILITIES.GROUND).toEqual(expect.arrayContaining(['LEVITATE', 'EARTH_EATER']));
        expect(TYPE_IMMUNITY_ABILITIES.ELECTRIC).toEqual(expect.arrayContaining(['VOLT_ABSORB', 'LIGHTNING_ROD', 'MOTOR_DRIVE']));
        expect(TYPE_IMMUNITY_ABILITIES.WATER).toEqual(expect.arrayContaining(['WATER_ABSORB', 'STORM_DRAIN', 'DRY_SKIN']));
        expect(TYPE_IMMUNITY_ABILITIES.FIRE).toEqual(expect.arrayContaining(['FLASH_FIRE', 'WELL_BAKED_BODY']));
        expect(TYPE_IMMUNITY_ABILITIES.GRASS).toEqual(['SAP_SIPPER']);
    });

    test('resist table maps threat type → ×0.5 abilities only', () => {
        expect(TYPE_RESIST_ABILITIES.FIRE).toEqual(expect.arrayContaining(['THICK_FAT', 'HEATPROOF', 'WATER_BUBBLE']));
        expect(TYPE_RESIST_ABILITIES.ICE).toEqual(['THICK_FAT']);
        expect(TYPE_RESIST_ABILITIES.GHOST).toEqual(['PURIFYING_SALT']);
    });

    test('excluded abilities are absent (SE softeners / non-type / contact)', () => {
        const all = Object.values(TYPE_IMMUNITY_ABILITIES).concat(Object.values(TYPE_RESIST_ABILITIES)).flat();
        for (const excluded of ['FILTER', 'SOLID_ROCK', 'PRISM_ARMOR', 'MULTISCALE', 'FLUFFY', 'BULLETPROOF', 'WIND_RIDER', 'OVERCOAT', 'WONDER_GUARD']) {
            expect(all).not.toContain(excluded);
        }
    });
});

describe('monotypeWeaknesses', () => {
    test('ROCK is weak to Water/Grass/Fighting/Ground/Steel', () => {
        expect(monotypeWeaknesses('ROCK', dmg).sort()).toEqual(['FIGHTING', 'GRASS', 'GROUND', 'STEEL', 'WATER']);
    });
    test('NORMAL is weak only to Fighting; ELECTRIC only to Ground', () => {
        expect(monotypeWeaknesses('NORMAL', dmg)).toEqual(['FIGHTING']);
        expect(monotypeWeaknesses('ELECTRIC', dmg)).toEqual(['GROUND']);
    });
});

describe('providesImmunity', () => {
    test('typing: Rock/Ghost is immune to Fighting; Rock/Flying to Ground', () => {
        expect(providesImmunity(mon(['ROCK', 'GHOST']), 'FIGHTING', dmg, 50)).toBe(true);
        expect(providesImmunity(mon(['ROCK', 'FLYING']), 'GROUND', dmg, 50)).toBe(true);
    });
    test('typing: pure Rock is NOT immune to Water (no type grants water immunity)', () => {
        expect(providesImmunity(mon(['ROCK']), 'WATER', dmg, 50)).toBe(false);
    });
    test('ability: Rock + Water Absorb is immune to Water at strategic level', () => {
        expect(providesImmunity(mon(['ROCK'], ['ROCK_HEAD', 'NONE', 'WATER_ABSORB']), 'WATER', dmg, 30)).toBe(true);
    });
    test('ability: a HIDDEN immunity ability does NOT count below the strategic level (lvl<12)', () => {
        expect(providesImmunity(mon(['ROCK'], ['ROCK_HEAD', 'NONE', 'WATER_ABSORB']), 'WATER', dmg, 5)).toBe(false);
    });
    test('ability: Levitate in a NON-hidden slot counts even at low level', () => {
        expect(providesImmunity(mon(['ROCK'], ['LEVITATE', 'NONE']), 'GROUND', dmg, 5)).toBe(true);
    });
});

describe('providesResist', () => {
    test('typing: Rock/Water is neutral (≤1×) to Steel; Rock/Steel is neutral to Grass', () => {
        expect(providesResist(mon(['ROCK', 'WATER']), 'STEEL', dmg, 50)).toBe(true);
        expect(providesResist(mon(['ROCK', 'STEEL']), 'GRASS', dmg, 50)).toBe(true);
    });
    test('ability: Ice + Thick Fat brings Fire (2×) down to neutral', () => {
        expect(providesResist(mon(['ICE'], ['THICK_FAT']), 'FIRE', dmg, 50)).toBe(true);
    });
    test('a still-2× weakness with no cover does not count', () => {
        expect(providesResist(mon(['ROCK']), 'STEEL', dmg, 50)).toBe(false);
    });
});

describe('coverageAbilityFor', () => {
    test('returns the specific ability that grants the coverage', () => {
        expect(coverageAbilityFor(mon(['ROCK'], ['ROCK_HEAD', 'NONE', 'WATER_ABSORB']), 'WATER', 30, 'immunity')).toBe('WATER_ABSORB');
        expect(coverageAbilityFor(mon(['ICE'], ['THICK_FAT']), 'FIRE', 50, 'resist')).toBe('THICK_FAT');
    });
    test('returns null when the only granting ability is hidden and level is below strategic', () => {
        expect(coverageAbilityFor(mon(['ROCK'], ['ROCK_HEAD', 'NONE', 'WATER_ABSORB']), 'WATER', 5, 'immunity')).toBeNull();
    });
    test('returns null when no ability grants the coverage', () => {
        expect(coverageAbilityFor(mon(['ROCK'], ['STURDY']), 'WATER', 50, 'immunity')).toBeNull();
    });
});

describe('uncoveredImmunities / uncoveredResists', () => {
    test('a Rock team with no coverage leaves every immunable weakness uncovered', () => {
        const team = [member(['ROCK']), member(['ROCK'])];
        // Rock weaknesses with a possible immunity: Fighting (Ghost), Ground (Flying), Water/Grass (abilities).
        expect(uncoveredImmunities('ROCK', team, dmg)).toEqual(expect.arrayContaining(['FIGHTING', 'GROUND', 'WATER', 'GRASS']));
        // Steel has no immunity provider, so it is not an "immunity" gap.
        expect(uncoveredImmunities('ROCK', team, dmg)).not.toContain('STEEL');
    });
    test('adding a Rock/Ghost member closes the Fighting immunity gap', () => {
        const team = [member(['ROCK']), member(['ROCK', 'GHOST'])];
        expect(uncoveredImmunities('ROCK', team, dmg)).not.toContain('FIGHTING');
    });
    test('an assigned Water Absorb member closes the Water gap', () => {
        const team = [member(['ROCK'], 'WATER_ABSORB')];
        expect(uncoveredImmunities('ROCK', team, dmg)).not.toContain('WATER');
    });
    test('a Rock/Water member closes the Steel resist gap', () => {
        const team = [member(['ROCK', 'WATER'])];
        expect(uncoveredResists('ROCK', team, dmg)).not.toContain('STEEL');
    });
});

describe('autoIncludeProbability', () => {
    test('immunity = 1.5×soph capped at 1; resist = 0.9×soph', () => {
        expect(autoIncludeProbability('immunity', 0.4)).toBeCloseTo(0.6);
        expect(autoIncludeProbability('immunity', 0.8)).toBe(1);      // 1.2 → capped
        expect(autoIncludeProbability('resist', 0.6)).toBeCloseTo(0.54);
        expect(autoIncludeProbability('immunity', 0)).toBe(0);
    });
});

describe('selectByRoll', () => {
    const stubRng = (seq) => { let i = 0; return () => seq[i++ % seq.length]; };
    test('prob 1 always yields a candidate (the first after the seeded shuffle)', () => {
        const picked = selectByRoll(['a', 'b', 'c'], 1, stubRng([0, 0, 0, 0, 0, 0]));
        expect(['a', 'b', 'c']).toContain(picked);
    });
    test('prob 0 never yields', () => {
        expect(selectByRoll(['a', 'b', 'c'], 0, stubRng([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]))).toBeNull();
    });
    test('empty pool yields null', () => {
        expect(selectByRoll([], 0.9, stubRng([0]))).toBeNull();
    });
    test('deterministic for a given rng stream', () => {
        const a = selectByRoll(['x', 'y', 'z'], 0.5, stubRng([0.3, 0.7, 0.1, 0.9, 0.2, 0.4]));
        const b = selectByRoll(['x', 'y', 'z'], 0.5, stubRng([0.3, 0.7, 0.1, 0.9, 0.2, 0.4]));
        expect(a).toBe(b);
    });
});

describe('coverageReasonFor', () => {
    test('typing-covered threat forces no ability (ability: null)', () => {
        const r = coverageReasonFor(mon(['ROCK', 'GHOST']), ['FIGHTING'], dmg, 50, 'immunity');
        expect(r).toEqual({ threat: 'FIGHTING', ability: null });
    });
    test('ability-covered threat reports the forcing ability', () => {
        const r = coverageReasonFor(mon(['ROCK'], ['ROCK_HEAD', 'NONE', 'WATER_ABSORB']), ['WATER'], dmg, 30, 'immunity');
        expect(r).toEqual({ threat: 'WATER', ability: 'WATER_ABSORB' });
    });
    test('prefers a typing patch over an ability patch when both are available', () => {
        // Rock/Flying with Levitate covers GROUND by BOTH; typing wins → no forced ability.
        const r = coverageReasonFor(mon(['ROCK', 'FLYING'], ['LEVITATE']), ['GROUND'], dmg, 50, 'immunity');
        expect(r.ability).toBeNull();
    });
});

describe('pickCoverageMember', () => {
    const always = () => 0; // rng that makes every roll succeed (0 < prob) and shuffle stable-ish
    test('immunity round wins over resist round when both have candidates', () => {
        const candidates = [mon(['ROCK', 'GHOST']) /* Fighting immunity */, mon(['ROCK', 'WATER']) /* Steel resist */];
        candidates[0].id = 'GHOSTMON'; candidates[1].id = 'WATERMON';
        const res = pickCoverageMember({ candidates, monoType: 'ROCK', team: [], dmg, level: 50, soph: 1, rngRandom: always });
        expect(res.kind).toBe('immunity');
        expect(res.poke.id).toBe('GHOSTMON');
    });
    test('falls through to resist round when no immunity candidate exists', () => {
        const candidates = [mon(['ROCK', 'WATER'])]; // only a Steel-resist option
        candidates[0].id = 'WATERMON';
        const res = pickCoverageMember({ candidates, monoType: 'ROCK', team: [], dmg, level: 50, soph: 1, rngRandom: always });
        expect(res.kind).toBe('resist');
    });
    test('returns null when every roll fails (→ caller does the normal pick)', () => {
        // soph 0.5 → immunity prob 0.75, resist prob 0.45; an rng of 0.99 fails both rounds.
        const candidates = [mon(['ROCK', 'GHOST'])];
        const res = pickCoverageMember({ candidates, monoType: 'ROCK', team: [], dmg, level: 50, soph: 0.5, rngRandom: () => 0.99 });
        expect(res).toBeNull();
    });
    test('archetype fitOk filter removes non-fitting candidates', () => {
        const candidates = [mon(['ROCK', 'GHOST'])];
        candidates[0].id = 'GHOSTMON';
        const res = pickCoverageMember({ candidates, monoType: 'ROCK', team: [], dmg, level: 50, soph: 1, fitOk: () => false, rngRandom: always });
        expect(res).toBeNull();
    });
    test('a threat already covered by the team is not re-sought', () => {
        // Team already immune to Fighting (a Ghost member) → a Ghost candidate no longer qualifies for it.
        const team = [member(['ROCK', 'GHOST'])];
        const candidates = [mon(['ROCK', 'GHOST'])]; // only covers Fighting, already covered
        const res = pickCoverageMember({ candidates, monoType: 'ROCK', team, dmg, level: 50, soph: 1, rngRandom: always });
        // It can still qualify for the RESIST round (Ghost/… vs other uncovered), but not for Fighting immunity.
        if (res) expect(res.threat).not.toBe('FIGHTING');
    });
});

describe('candidateCoverageDetail', () => {
    test('reports threats + via for a typing patch', () => {
        expect(candidateCoverageDetail(mon(['ROCK', 'GHOST']), ['FIGHTING', 'WATER'], dmg, 50, 'immunity'))
            .toEqual({ id: undefined, threats: ['FIGHTING'], via: 'typing', ability: null });
    });
    test('reports the forcing ability for an ability patch', () => {
        const c = mon(['ROCK'], ['ROCK_HEAD', 'NONE', 'WATER_ABSORB']); c.id = 'X';
        expect(candidateCoverageDetail(c, ['WATER'], dmg, 30, 'immunity')).toEqual({ id: 'X', threats: ['WATER'], via: 'ability', ability: 'WATER_ABSORB' });
    });
    test('null when the candidate patches nothing', () => {
        expect(candidateCoverageDetail(mon(['ROCK']), ['WATER'], dmg, 50, 'immunity')).toBeNull();
    });
});

describe('evaluateCoverage (exhaustive trace)', () => {
    const always = () => 0;
    test('always returns both rounds with their uncovered sets + pools, even after a pick', () => {
        const candidates = [mon(['ROCK', 'GHOST']), mon(['ROCK', 'WATER'])];
        candidates[0].id = 'GHOSTMON'; candidates[1].id = 'WATERMON';
        const t = evaluateCoverage({ candidates, monoType: 'ROCK', team: [], dmg, level: 50, soph: 1, rngRandom: always });
        expect(t.rounds.map(r => r.kind)).toEqual(['immunity', 'resist']);
        expect(t.result.kind).toBe('immunity');
        const imm = t.rounds[0], res = t.rounds[1];
        expect(imm.reached).toBe(true);
        expect(imm.picked).toBe('GHOSTMON');
        // resist round is still fully computed for the log, but NOT reached (immunity already picked).
        expect(res.reached).toBe(false);
        expect(res.uncovered.length).toBeGreaterThan(0);
        expect(res.pool.length).toBeGreaterThan(0); // WATERMON patches Steel etc. — shown even though unused
    });
    test('pool entries carry via/ability/threats for the log', () => {
        const c = mon(['ROCK'], ['ROCK_HEAD', 'NONE', 'WATER_ABSORB']); c.id = 'ABS';
        const t = evaluateCoverage({ candidates: [c, mon(['ROCK'])], monoType: 'ROCK', team: [], dmg, level: 30, soph: 1, rngRandom: always });
        const abs = t.rounds[0].pool.find(p => p.id === 'ABS');
        expect(abs).toMatchObject({ via: 'ability', ability: 'WATER_ABSORB' });
        expect(abs.threats).toContain('WATER');
    });
});
