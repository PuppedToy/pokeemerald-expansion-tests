'use strict';

// T-194 — seed-driven town trades. selectTrades() chooses, for each of the 4 towns, an offered mon
// (STRICT: form tier at the gym cap === X AND family-peak tier === X, given at a cap-valid evo stage)
// and the accepted families (the route's representative grass/old-rod encounters, any evo stage).

const { selectTrades, TOWN_TRADES, __test } = require('../../trades');

// ── Fixture builders ──────────────────────────────────────────────────────────
// contextual: { [bucket]: tier }. evoTree is family-wide (same for every member).
function mkPoke(id, { family, bestEvoTier, bestEvo, contextual = {}, evoTree, evolutions, evoType = 'EVO_TYPE_SOLO', isFinal = true } = {}) {
    return {
        id,
        name: id.replace('SPECIES_', ''),
        family: family || `P_FAMILY_${id.replace('SPECIES_', '')}`,
        rating: { tier: bestEvoTier, bestEvo: bestEvo || id, bestEvoTier },
        contextualRatings: Object.fromEntries(Object.entries(contextual).map(([k, t]) => [k, { tier: t }])),
        evoTree: evoTree || [id],
        evolutions,
        evolutionData: { type: evoType, isLC: false, isFinal, megaBaseForm: undefined },
    };
}

// A single-stage mon that qualifies for (tier) at every relevant bucket.
const soloAt = (id, tier) => mkPoke(id, {
    bestEvoTier: tier,
    contextual: { 12: tier, 35: tier, 46: tier, 55: tier },
});

// Two-stage family BASE --lvl20--> FINAL (family peaks at `tier`).
function twoStage(baseId, finalId, tier, { baseTierAtBucket = {}, finalTierAtBucket = {} } = {}) {
    const evoTree = [baseId, [finalId]];
    const base = mkPoke(baseId, {
        family: `P_FAMILY_${baseId.replace('SPECIES_', '')}`,
        bestEvoTier: tier, bestEvo: finalId, contextual: baseTierAtBucket,
        evoTree, evolutions: [{ method: 'LEVEL', param: '20', pokemon: finalId }],
        evoType: 'EVO_TYPE_FIRST_OF_2', isFinal: false,
    });
    const fin = mkPoke(finalId, {
        family: `P_FAMILY_${baseId.replace('SPECIES_', '')}`,
        bestEvoTier: tier, bestEvo: finalId, contextual: finalTierAtBucket,
        evoTree, evolutions: undefined, evoType: 'EVO_TYPE_LAST_OF_2', isFinal: true,
    });
    return [base, fin];
}

// Representative wild-encounter family used as the "accepted" set for a route.
// RATTATA --lvl20--> RATICATE.
const [rattata, raticate] = twoStage('SPECIES_RATTATA', 'SPECIES_RATICATE', 'NU');

function buildList() {
    return [
        // RU-qualifying solo mon for Rustboro (cap 13, bucket 12).
        soloAt('SPECIES_RU_SOLO', 'RU'),
        // UU final that is UU at bucket 35 (Flannery cap 36); its base is not UU at 35.
        ...twoStage('SPECIES_UU_BASE', 'SPECIES_UU_FINAL', 'UU', { finalTierAtBucket: { 35: 'UU' }, baseTierAtBucket: { 35: 'PU' } }),
        // OU solo for Fortree (cap 46, bucket 46).
        soloAt('SPECIES_OU_SOLO', 'OU'),
        // UBERS solo for Mossdeep (cap 56, bucket 55).
        soloAt('SPECIES_UBERS_SOLO', 'UBERS'),
        // A distractor RU family whose cap-valid form is NOT RU at bucket 12 (must be excluded by strict rule).
        ...twoStage('SPECIES_RU_TRAP_BASE', 'SPECIES_RU_TRAP_FINAL', 'RU', { baseTierAtBucket: { 12: 'PU' }, finalTierAtBucket: { 12: 'RU' } }),
        // Accepted-family reps.
        rattata, raticate,
    ];
}

const WILD_MAPS = [
    { id: 'MAP_ROUTE101', land: 'SPECIES_ZIGZAGOON' },
    { id: 'MAP_ROUTE102', land: 'SPECIES_WURMPLE', old: 'SPECIES_WINGULL' },
    { id: 'MAP_ROUTE103', land: 'SPECIES_SMEARGLE', old: 'SPECIES_SURSKIT' },
    { id: 'MAP_ROUTE104', land: 'SPECIES_GEODUDE', old: 'SPECIES_WEEDLE' },
];

// Every route method template resolves (via the wild replacementLog) to the RATTATA family.
const REPLACEMENT_LOG = {
    SPECIES_ZIGZAGOON: 'SPECIES_RATTATA',
    SPECIES_WURMPLE: 'SPECIES_RATTATA', SPECIES_WINGULL: 'SPECIES_RATICATE',
    SPECIES_SMEARGLE: 'SPECIES_RATTATA', SPECIES_SURSKIT: 'SPECIES_RATTATA',
    SPECIES_GEODUDE: 'SPECIES_RATTATA', SPECIES_WEEDLE: 'SPECIES_RATTATA',
};

const CAP_LEVELS = { FLAG_BADGE01_GET: 13, FLAG_BADGE04_GET: 36, FLAG_BADGE06_GET: 46, FLAG_BADGE07_GET: 56 };

const baseArgs = () => ({
    pokemonList: buildList(),
    wildArtifact: { replacementLog: REPLACEMENT_LOG },
    wildMaps: WILD_MAPS,
    capLevels: CAP_LEVELS,
    seed: 12345,
});

describe('selectTrades — structure', () => {
    test('returns the 4 towns with the correct tier / cap level / route', () => {
        const trades = selectTrades(baseArgs());
        expect(trades.map(t => t.town)).toEqual(['RUSTBORO', 'LAVARIDGE', 'FORTREE', 'MOSSDEEP']);
        expect(trades.map(t => t.tier)).toEqual(['RU', 'UU', 'OU', 'UBERS']);
        expect(trades.map(t => t.level)).toEqual([13, 36, 46, 56]);
        expect(trades.map(t => t.routeMapId)).toEqual(['MAP_ROUTE101', 'MAP_ROUTE102', 'MAP_ROUTE103', 'MAP_ROUTE104']);
        // Each keeps the sIngameTrades slot its town map script selects.
        expect(trades.map(t => t.ingameTradeId)).toEqual([
            'INGAME_TRADE_SEEDOT', 'INGAME_TRADE_HORSEA', 'INGAME_TRADE_PLUSLE', 'INGAME_TRADE_MEOWTH',
        ]);
    });
});

describe('selectTrades — offered mon (strict tier rule)', () => {
    test('picks a mon whose family peak is the tier AND whose cap-valid form is that tier at the cap', () => {
        const trades = selectTrades(baseArgs());
        expect(trades[0].offeredSpecies).toBe('SPECIES_RU_SOLO');   // Rustboro RU@13
        expect(trades[1].offeredSpecies).toBe('SPECIES_UU_FINAL');  // Lavaridge UU@36 (final is UU at 35)
        expect(trades[2].offeredSpecies).toBe('SPECIES_OU_SOLO');   // Fortree OU@46
        expect(trades[3].offeredSpecies).toBe('SPECIES_UBERS_SOLO');// Mossdeep UBERS@56
    });

    test('excludes an RU family whose cap-valid form is NOT RU at the cap (the trap family)', () => {
        const trades = selectTrades(baseArgs());
        expect(trades[0].offeredSpecies).not.toBe('SPECIES_RU_TRAP_BASE');
        expect(trades[0].offeredSpecies).not.toBe('SPECIES_RU_TRAP_FINAL');
    });

    test('the offered form is a valid evolution stage at the cap (UU final needs lvl 20 ≤ 36)', () => {
        const trades = selectTrades(baseArgs());
        expect(trades[1].offeredSpecies).toBe('SPECIES_UU_FINAL');
    });
});

describe('selectTrades — accepted families (representative encounters)', () => {
    test('accepts the full evolution family of each route representative, listing base forms in the message', () => {
        const trades = selectTrades(baseArgs());
        // Route 101 grass rep → RATTATA family.
        expect(new Set(trades[0].acceptedSpecies)).toEqual(new Set(['SPECIES_RATTATA', 'SPECIES_RATICATE']));
        expect(trades[0].acceptedBaseForms).toEqual(['SPECIES_RATTATA']);
    });

    test('grass ∪ old rod both feed the accepted set (deduped) for routes with a rod', () => {
        const trades = selectTrades(baseArgs());
        // Route 102 land+old both resolve into the RATTATA family → deduped.
        expect(new Set(trades[1].acceptedSpecies)).toEqual(new Set(['SPECIES_RATTATA', 'SPECIES_RATICATE']));
        expect(trades[1].acceptedBaseForms).toEqual(['SPECIES_RATTATA']);
    });
});

describe('selectTrades — determinism', () => {
    test('same seed ⇒ identical offered mons', () => {
        const a = selectTrades(baseArgs());
        const b = selectTrades(baseArgs());
        expect(a.map(t => t.offeredSpecies)).toEqual(b.map(t => t.offeredSpecies));
    });

    test('a different seed can change the pick when the pool has >1 candidate', () => {
        // Give the RU pool several qualifying solos so the seed actually chooses among them.
        const list = buildList().concat([soloAt('SPECIES_RU_SOLO2', 'RU'), soloAt('SPECIES_RU_SOLO3', 'RU'), soloAt('SPECIES_RU_SOLO4', 'RU')]);
        const pickFor = (seed) => selectTrades({ ...baseArgs(), pokemonList: list, seed })[0].offeredSpecies;
        const seen = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(pickFor));
        expect(seen.size).toBeGreaterThan(1);
    });
});

describe('selectTrades — fallback when strict pool empty', () => {
    test('falls back to family-peak-tier candidates (dropping the contextual-at-cap check) and warns', () => {
        // A family that peaks at RU but is never RU at bucket 12 → strict pool empty.
        const list = [
            ...twoStage('SPECIES_ONLYFAM_BASE', 'SPECIES_ONLYFAM_FINAL', 'RU', { baseTierAtBucket: { 12: 'PU' }, finalTierAtBucket: { 12: 'NU' } }),
            soloAt('SPECIES_UU_ONLY', 'UU'), soloAt('SPECIES_OU_ONLY', 'OU'), soloAt('SPECIES_UBERS_ONLY', 'UBERS'),
            rattata, raticate,
        ];
        const warn = jest.fn();
        const trades = selectTrades({ ...baseArgs(), pokemonList: list, diagnostics: { warn } });
        expect(['SPECIES_ONLYFAM_BASE', 'SPECIES_ONLYFAM_FINAL']).toContain(trades[0].offeredSpecies);
        expect(warn).toHaveBeenCalled();
    });
});
