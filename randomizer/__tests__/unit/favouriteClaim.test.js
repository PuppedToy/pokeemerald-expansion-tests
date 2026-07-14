'use strict';

// T-128 (redesign) — favourite-claim: a favourite is EXCLUSIVELY a poke that CONSUMES a pool slot of its
// EXACT tier (or the {isMega} slot if it is a mega). It never predicts a tier and never downgrades — if
// its tier isn't available in the (difficulty-adjusted) budget pool it drops to the next fallback; the
// implicit final fallback is any eligible mon within the trainer's restrictions. Resolved FIRST (the
// claimed slots are moved to the front). Difficulty only touches the pool, which this consumes from.

const { resolveFavourites } = require('../../modules/favouriteClaim');

// minimal pokemonList: id → { rating.tier, contextualRatings, evolutionData }
function poke(id, tier, { mega = false, ctxTier = null, types = ['NORMAL'], megaBaseForm = null } = {}) {
    return {
        id, parsedTypes: types,
        rating: { tier },
        contextualRatings: ctxTier ? { 12: { tier: ctxTier }, 32: { tier: ctxTier } } : {},
        evolutionData: { isMega: mega, ...(megaBaseForm ? { megaBaseForm } : {}) },
    };
}
const LIST = [
    poke('SPECIES_NOSEPASS', 'NU', { types: ['ROCK'] }),
    poke('SPECIES_SOLROCK', 'RU', { types: ['ROCK', 'PSYCHIC'] }),
    poke('SPECIES_COSMOEM', 'UU', { types: ['PSYCHIC'] }),
    poke('SPECIES_SOLGALEO', 'LEGEND', { types: ['PSYCHIC', 'STEEL'] }),
    poke('SPECIES_MANECTRIC_MEGA', 'OU', { mega: true, types: ['ELECTRIC'] }),
    poke('SPECIES_TYPE_MON', 'PU', { types: ['ROCK'] }),
    // A strong-base mega (base OU) and a weak-base mega (base RU), for the base-form gate.
    poke('SPECIES_HEAVYBASE', 'OU', { types: ['ROCK'] }),
    poke('SPECIES_HEAVYBASE_MEGA', 'OU', { mega: true, types: ['ROCK'], megaBaseForm: 'SPECIES_HEAVYBASE' }),
    poke('SPECIES_LIGHTBASE', 'RU', { types: ['ROCK'] }),
    poke('SPECIES_LIGHTBASE_MEGA', 'OU', { mega: true, types: ['ROCK'], megaBaseForm: 'SPECIES_LIGHTBASE' }),
];
// A progression-gated mega slot (mega ≤OU, base ≤UU) — the shape presets.js `bossMega(TIER_OU)` produces.
const gatedMega = () => ({ isMega: true, absoluteTier: ['MAGIKARP', 'ZU', 'PU', 'NU', 'RU', 'UU', 'OU'], maxBaseTier: 'UU', checkValidEvo: true });
const absPool = (...tiers) => tiers.map(t => (t === 'MEGA' ? { isMega: true } : { absoluteTier: [t], checkValidEvo: true }));
const ctx = (level = 32, types = null) => ({ pokemonList: LIST, level, types });

const ids = team => team.map(s => s.specific || (s.isMega ? 'MEGA' : (s.absoluteTier ? s.absoluteTier[0] : '?')));

describe('resolveFavourites (T-128 pool consumption)', () => {
    test('a favourite consumes the pool slot of its EXACT tier and is placed first', () => {
        const team = absPool('NU', 'PU', 'PU'); // Roxanne-ish pool
        const out = resolveFavourites(team, [['SPECIES_NOSEPASS']], ctx());
        expect(out[0].specific).toBe('SPECIES_NOSEPASS'); // Nosepass (NU) claimed the NU slot, first
        expect(out[0].__favourite).toBe(true);
        expect(out.length).toBe(3);                        // size preserved (claimed, not added)
        expect(ids(out.slice(1)).sort()).toEqual(['PU', 'PU']); // remaining pool
    });

    test('a favourite too strong for the whole budget drops to the next fallback', () => {
        const team = absPool('PU', 'PU', 'PU'); // difficulty-eased Roxanne
        // Nosepass (NU) exceeds a PU-only budget → drop → the implicit "any Rock mon" fallback claims a slot
        const out = resolveFavourites(team, [['SPECIES_NOSEPASS']], ctx(32, ['ROCK']));
        expect(out[0].__favourite).toBe(true);
        expect(out[0].specific).toBeUndefined(); // not the signature — a restriction-bounded fallback slot
        expect(out.length).toBe(3);
    });

    test('a mega favourite consumes the {isMega} slot', () => {
        const team = absPool('OU', 'UU', 'MEGA');
        const out = resolveFavourites(team, [['SPECIES_MANECTRIC_MEGA']], ctx());
        expect(out[0].specific).toBe('SPECIES_MANECTRIC_MEGA');
        // the mega slot is consumed; the OU/UU tiers remain
        expect(ids(out.slice(1)).sort()).toEqual(['OU', 'UU']);
    });

    test('Tate & Liza dual: Solgaleo(Legend) drops to Solrock(RU); Lunala drops to Cosmoem(UU)', () => {
        const team = absPool('UBERS', 'UBERS', 'OU', 'UU', 'RU', 'MEGA');
        const out = resolveFavourites(team, [
            ['SPECIES_SOLGALEO', 'SPECIES_SOLROCK', 'SPECIES_COSMOEM'],
            ['SPECIES_LUNALA_MISSING', 'SPECIES_LUNATONE_MISSING', 'SPECIES_COSMOEM'],
        ], ctx());
        const claimed = out.filter(s => s.__favourite).map(s => s.specific);
        expect(claimed).toContain('SPECIES_SOLROCK');  // Solgaleo(Legend) not in pool → Solrock(RU)
        expect(claimed).toContain('SPECIES_COSMOEM');  // fav2 → Cosmoem(UU) (RU already consumed)
        expect(out.length).toBe(6);
    });

    test('respects the trainer type restriction (favourite must have a trainer type)', () => {
        const team = absPool('OU', 'UU');
        // Manectric mega is Electric; a Rock-restricted trainer cannot field it → drop → fallback
        const out = resolveFavourites(team, [['SPECIES_MANECTRIC_MEGA']], ctx(32, ['ROCK']));
        expect(out.find(s => s.specific === 'SPECIES_MANECTRIC_MEGA')).toBeUndefined();
    });

    test('a mega favourite claims a gated slot only if its BASE form is within maxBaseTier', () => {
        // gate: mega ≤OU, base ≤UU. Light-base mega (base RU) passes; heavy-base mega (base OU) fails.
        const team = [{ absoluteTier: ['OU'], checkValidEvo: true }, gatedMega()];
        const light = resolveFavourites(team, [['SPECIES_LIGHTBASE_MEGA']], ctx(32, ['ROCK']));
        expect(light[0].specific).toBe('SPECIES_LIGHTBASE_MEGA'); // base RU ≤ UU → claims the mega slot

        const heavy = resolveFavourites(team, [['SPECIES_HEAVYBASE_MEGA']], ctx(32, ['ROCK']));
        // base OU > UU → the signature drops; the implicit fallback claims a slot, but NOT as HEAVYBASE_MEGA
        expect(heavy.find(s => s.specific === 'SPECIES_HEAVYBASE_MEGA')).toBeUndefined();
    });

    test('no favourites → team returned unchanged', () => {
        const team = absPool('OU', 'UU');
        expect(resolveFavourites(team, null, ctx())).toEqual(team);
    });

    // T-132 (owner) — a "liked" favourite: same claim, but goodBreed instead of perfectBreed (the mascot
    // Groudon/Kyogre shouldn't get perfect IVs). Expressed as { chain, goodBreed:true } (clone-safe object).
    test('a { chain, goodBreed } favourite claims with breedTier "good", not "perfect"', () => {
        const team = absPool('LEGEND', 'PU');
        const out = resolveFavourites(team, [{ chain: ['SPECIES_SOLGALEO'], goodBreed: true }], ctx());
        expect(out[0].specific).toBe('SPECIES_SOLGALEO');
        expect(out[0].__favourite).toBe(true);
        expect(out[0].breedTier).toBe('good');
    });

    test('a bare-array favourite still defaults to breedTier "perfect"', () => {
        const team = absPool('LEGEND', 'PU');
        const out = resolveFavourites(team, [['SPECIES_SOLGALEO']], ctx());
        expect(out[0].breedTier).toBe('perfect');
    });
});
