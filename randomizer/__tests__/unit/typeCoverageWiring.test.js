'use strict';

// T-193 — proves the coverage logic is actually wired into the archetype picker: a monotype context
// (context.monoType set) + injected damageMultiplier makes pickCandidate prefer a coverage member and
// stash the forced ability; a non-monotype context leaves it completely inert (byte-identical path).

const rng = require('../../rng');
const { makeArchetypePicker } = require('../../modules/archetypePicker');
const { damageMultiplier } = require('../../rating');

// Minimal model: truthy (so the picker doesn't degrade to plain sample) but with no archetypes, so no
// identity emerges → the coverage block's archetype filter is a no-op (fitOk always true).
const model = { format: 'singles', baseArchetypes: [], gimmicks: [] };
const poke = (id, types, abilities = []) => ({ id, parsedTypes: types, parsedAbilities: abilities, evolutionData: { isMega: false } });

const baseContext = (over = {}) => ({
    team: [], sophistication: 1, archetypeSeed: null,
    weatherPicks: [], supportPicks: [], coveragePick: null, coveragePicks: [],
    monoType: null, trainerLevel: 50, ...over,
});

beforeEach(() => rng.seed(12345));

describe('monotype coverage is wired into the picker', () => {
    test('prefers a typing immunity (Rock/Ghost vs Fighting) on a Rock monotype team', () => {
        const context = baseContext({ monoType: 'ROCK', currentSlotIndex: 2 });
        const pick = makeArchetypePicker({ model, context, ctx: {}, damageMultiplier })([
            poke('GHOSTMON', ['ROCK', 'GHOST']),
            poke('PLAINMON', ['ROCK']),
        ]);
        expect(pick.id).toBe('GHOSTMON');
        expect(context.coveragePick).toBeNull();            // typing patch → no forced ability
        // exhaustive trace: one entry for this slot, immunity round picked GHOSTMON via typing.
        const entry = context.coveragePicks[0];
        expect(entry).toMatchObject({ slot: 2, monoType: 'ROCK', outcome: 'immunity:GHOSTMON' });
        const imm = entry.rounds.find(r => r.kind === 'immunity');
        expect(imm.picked).toBe('GHOSTMON');
        expect(imm.pool).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'GHOSTMON', threats: ['FIGHTING'], via: 'typing' })]));
        expect(entry.rounds.find(r => r.kind === 'resist').reached).toBe(false); // immunity picked → resist not rolled
    });

    test('picks an ability immunity (Water Absorb) and stashes the forced ability', () => {
        const context = baseContext({ monoType: 'ROCK' });
        const pick = makeArchetypePicker({ model, context, ctx: {}, damageMultiplier })([
            poke('ABSORBER', ['ROCK'], ['ROCK_HEAD', 'NONE', 'WATER_ABSORB']),
            poke('PLAINMON', ['ROCK']),  // ≥2 candidates so the picker doesn't short-circuit to sample()
        ]);
        expect(pick.id).toBe('ABSORBER');
        expect(context.coveragePick).toEqual({ pokeId: 'ABSORBER', ability: 'WATER_ABSORB' });
        expect(context.coveragePicks[0].outcome).toBe('immunity:ABSORBER');
        const imm = context.coveragePicks[0].rounds.find(r => r.kind === 'immunity');
        expect(imm.pool).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ABSORBER', via: 'ability', ability: 'WATER_ABSORB' })]));
    });

    test('coverage still evaluates + logs BELOW the steering threshold (soph gate must not skip it)', () => {
        // Roxanne-like: soph 0.07 < BIAS_MIN_SOPH. Coverage must still run (probability scales with soph)
        // and MUST appear in the log — the whole point of the owner fix.
        const context = baseContext({ monoType: 'ROCK', sophistication: 0.07, currentSlotIndex: 0 });
        makeArchetypePicker({ model, context, ctx: {}, damageMultiplier })([
            poke('GHOSTMON', ['ROCK', 'GHOST']),
            poke('PLAINMON', ['ROCK']),
        ]);
        expect(context.coveragePicks).toHaveLength(1);      // logged despite low soph
        const imm = context.coveragePicks[0].rounds.find(r => r.kind === 'immunity');
        expect(imm.prob).toBeCloseTo(0.11, 2);              // 1.5 × 0.07, not capped
        expect(imm.pool).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'GHOSTMON', threats: ['FIGHTING'] })]));
    });

    test('a non-monotype context is inert (no coverage consulted, no ability forced)', () => {
        const context = baseContext({ monoType: null });
        const pick = makeArchetypePicker({ model, context, ctx: {}, damageMultiplier })([
            poke('GHOSTMON', ['ROCK', 'GHOST']),
            poke('PLAINMON', ['ROCK']),
        ]);
        expect(['GHOSTMON', 'PLAINMON']).toContain(pick.id);
        expect(context.coveragePicks).toEqual([]);
        expect(context.coveragePick).toBeNull();
    });

    test('without an injected damageMultiplier the coverage block is skipped', () => {
        const context = baseContext({ monoType: 'ROCK' });
        makeArchetypePicker({ model, context, ctx: {} })([  // no damageMultiplier
            poke('GHOSTMON', ['ROCK', 'GHOST']),
            poke('PLAINMON', ['ROCK']),
        ]);
        expect(context.coveragePicks).toEqual([]);
    });
});
