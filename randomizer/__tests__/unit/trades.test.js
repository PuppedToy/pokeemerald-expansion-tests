'use strict';

// T-269 — the reworked town traders (this file replaces T-194's spec, which was four trades with a
// hardcoded tier per town; the specification changed with the owner's rework, see tasks/T-269).
//
// What selectTrades() must guarantee, per trader:
//   • it asks for a wild encounter reachable at its milestone, and no two traders ask for one family;
//   • it gives a mon whose FINAL quality equals the wanted family's final quality, at a stage that is
//     legal at the trader's level;
//   • it never gives a family the run already used (B-073) or another trader already gave;
//   • the gift knows the right number of learnable, reachable TMs and has the right number of 31 IVs;
//   • the whole thing is a pure function of the ROM seed.

const { selectTrades, TRADERS, BASE_IV, PERFECT_IV, __test } = require('../../trades');
const { mapsAvailableAt, methodsAvailableAt } = require('../../data/progression');
const { getFamilyGroup } = require('../../modules/utils');

// ── Fixtures ──────────────────────────────────────────────────────────────────
// A synthetic pokédex with one two-stage family per tier, plus enough spare families per tier that
// uniqueness has somewhere to go. Encounter maps are the real MAP_* ids so the real progression table
// drives the pools.

const TIERS = ['NU', 'RU', 'UU', 'OU', 'UBERS'];

function mkPoke(id, { family, bestEvoTier, bestEvo, evoTree, evolutions, isLC = false, teachables = [], learnset = [] }) {
    return {
        id,
        name: id.replace('SPECIES_', ''),
        family,
        rating: { tier: bestEvoTier, bestEvo, bestEvoTier },
        evoTree,
        evolutions,
        teachables,
        learnset,
        evolutionData: { type: isLC ? 'EVO_TYPE_LC' : 'EVO_TYPE_FINAL', isLC, isFinal: !isLC },
    };
}

// BASE --lvl 20--> FINAL. Both members carry the family's peak tier as bestEvoTier.
function family(name, tier, { teachables = [], learnset = [] } = {}) {
    const baseId = `SPECIES_${name}_BASE`;
    const finalId = `SPECIES_${name}_FINAL`;
    const fam = `P_FAMILY_${name}`;
    const evoTree = [baseId, [finalId]];
    const common = { family: fam, bestEvoTier: tier, bestEvo: finalId, evoTree, teachables, learnset };
    return [
        mkPoke(baseId, { ...common, evolutions: [{ method: 'LEVEL', param: '20', pokemon: finalId }], isLC: true }),
        mkPoke(finalId, { ...common }),
    ];
}

// Every TM in the fixtures is learnable by every mon, so TM counts are about the pool, not the mon.
const ALL_TMS = ['MOVE_TM_A', 'MOVE_TM_B', 'MOVE_TM_C', 'MOVE_TM_D', 'MOVE_TM_E', 'MOVE_TM_F'];

function mkPokedex({ teachables = ALL_TMS, learnset = [] } = {}) {
    const list = [];
    TIERS.forEach((tier, t) => {
        for (let i = 0; i < 8; i++) list.push(...family(`${tier}_${i}`, tier, { teachables, learnset }));
    });
    return list;
}

// One wild map per milestone-opened route we care about, keyed to a fixture family's BASE form so a
// wanted mon is always a catchable early stage.
const WILD_MAPS = [
    { id: 'MAP_ROUTE101', land: 'T_101_LAND' },
    { id: 'MAP_ROUTE102', land: 'T_102_LAND', old: 'T_102_OLD', good: 'T_102_GOOD', surf: 'T_102_SURF', super: 'T_102_SUPER' },
    { id: 'MAP_ROUTE116', land: 'T_116_LAND' },
    { id: 'MAP_ROUTE106', land: 'T_106_LAND' },
    { id: 'MAP_ROUTE109', land: 'T_109_LAND' },
    { id: 'MAP_ROUTE110', land: 'T_110_LAND' },
    { id: 'MAP_ROUTE117', land: 'T_117_LAND' },
    { id: 'MAP_ROUTE114', land: 'T_114_LAND' },
    { id: 'MAP_ROUTE120', land: 'T_120_LAND' },
    { id: 'MAP_ROUTE121', land: 'T_121_LAND' },
    { id: 'MAP_ROUTE124', land: 'T_124_LAND' },
    { id: 'MAP_ROUTE126', land: 'T_126_LAND' },
    { id: 'EVER_GRANDE_CITY', land: 'T_EG_LAND' },
    { id: 'MAP_VICTORY_ROAD_B1F', land: 'T_VR_LAND' },
];

// Spread the fixture families across those slots: each template resolves to a distinct family's base.
function mkWildArtifact({ alreadyChosenFamilies = [] } = {}) {
    const templates = WILD_MAPS.flatMap(m => ['land', 'old', 'good', 'surf', 'super'].filter(k => m[k]).map(k => m[k]));
    const replacementLog = {};
    templates.forEach((tpl, i) => {
        const tier = TIERS[i % TIERS.length];
        const slot = Math.floor(i / TIERS.length) % 8;
        replacementLog[tpl] = `SPECIES_${tier}_${slot}_BASE`;
    });
    return { replacementLog, wildPlan: {}, alreadyChosenFamilies };
}

const CAP_LEVELS = {
    FLAG_BADGE01_GET: 13, FLAG_BADGE02_GET: 20, FLAG_DELIVERED_DEVON_GOODS: 25,
    FLAG_DEFEATED_WALLY_MAUVILLE: 29, FLAG_BADGE03_GET: 30, FLAG_BADGE04_GET: 36,
    FLAG_BADGE05_GET: 39, FLAG_BADGE06_GET: 46, FLAG_MET_RIVAL_LILYCOVE: 49,
    FLAG_BADGE07_GET: 56, FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN: 61, FLAG_BADGE08_GET: 64,
    FLAG_DEFEATED_WALLY_VICTORY_ROAD: 67, FLAG_IS_CHAMPION: 78,
};

// A move database where every TM is reachable from the very first milestone unless stated otherwise.
function mkMoves(locations = {}) {
    const moves = {};
    ALL_TMS.forEach((id, i) => {
        moves[id] = { tm: i + 1, tmLocation: locations[id] || 'Scripted — Rival Route 103 (defeat reward)' };
    });
    return moves;
}

const run = (over = {}) => selectTrades({
    pokemonList: mkPokedex(),
    wildArtifact: mkWildArtifact(),
    wildMaps: WILD_MAPS,
    capLevels: CAP_LEVELS,
    moves: mkMoves(),
    seed: 12345,
    ...over,
});

// ── The trader table ──────────────────────────────────────────────────────────

describe('the trader table', () => {
    test('has 15 traders, each in its own healing building, with unique trade ids', () => {
        expect(TRADERS).toHaveLength(15);
        expect(new Set(TRADERS.map(t => t.ingameTradeId)).size).toBe(15);
        expect(new Set(TRADERS.map(t => t.mapId)).size).toBe(15);
        expect(TRADERS.every(t => /^MAP_.*(POKEMON_CENTER_1F|POKEMON_LEAGUE_1F)$/.test(t.mapId))).toBe(true);
    });

    test("carries the owner's TM / perfect-IV table", () => {
        expect(TRADERS.map(t => t.tms)).toEqual([1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3]);
        expect(TRADERS.map(t => t.perfectIvs)).toEqual([1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4]);
    });

    test('fits the ROM tables it feeds', () => {
        // Every trader can be auto-nicknamed, so the nickname table must have a row for each of them.
        const { TRADE_NICKNAME_CAPACITY } = require('../../layout');
        expect(TRADERS.length).toBeLessThanOrEqual(TRADE_NICKNAME_CAPACITY);
    });

    test('is ordered along the progression, and Lavaridge and Fallarbor share Flannery', () => {
        const levels = TRADERS.map(t => CAP_LEVELS[t.flag]);
        expect(levels.every(l => Number.isFinite(l))).toBe(true);
        for (let i = 1; i < levels.length; i++) expect(levels[i]).toBeGreaterThanOrEqual(levels[i - 1]);
        const flannery = TRADERS.filter(t => t.flag === 'FLAG_BADGE04_GET').map(t => t.town);
        expect(flannery).toEqual(['LAVARIDGE', 'FALLARBOR']);
    });
});

// ── The trades ────────────────────────────────────────────────────────────────

describe('selectTrades — one trade per trader', () => {
    const trades = run();

    test('produces a full, filled trade for every trader', () => {
        expect(trades).toHaveLength(15);
        expect(trades.map(t => t.town)).toEqual(TRADERS.map(t => t.town));
        for (const t of trades) {
            expect(t.offeredSpecies).toBeTruthy();
            expect(t.wantedSpecies).toBeTruthy();
            expect(t.acceptedSpecies.length).toBeGreaterThan(0);
            expect(t.acceptedBaseForms.length).toBeGreaterThan(0);
        }
    });

    test('hands the gift over at its milestone level', () => {
        trades.forEach((t, i) => expect(t.level).toBe(CAP_LEVELS[TRADERS[i].flag]));
    });

    test('accepts the whole family of the mon it asks for', () => {
        for (const t of trades) {
            expect(t.acceptedSpecies).toContain(t.wantedSpecies);
            expect(t.acceptedSpecies.length).toBe(2);   // the fixtures are two-stage families
        }
    });
});

describe('the quality rule — final quality, both sides', () => {
    test('the offered family peaks at exactly the tier the wanted family peaks at', () => {
        const pokes = mkPokedex();
        const byId = new Map(pokes.map(p => [p.id, p]));
        for (const t of run({ pokemonList: pokes })) {
            const offered = byId.get(t.offeredSpecies);
            const wanted = byId.get(t.wantedSpecies);
            expect(offered.rating.bestEvoTier).toBe(wanted.rating.bestEvoTier);
            expect(t.tier).toBe(wanted.rating.bestEvoTier);
        }
    });

    test('a family that only reaches the tier through a MEGA is not offered for it', () => {
        // Found by the pipeline dump (2026-08-11): reading the tier off the FAMILY offered an RU Slowbro
        // for a UU request, because the family's ceiling was Mega Slowbro. What changes hands must carry
        // the tier itself.
        const pokes = mkPokedex();
        // A family whose base/final are RU but whose mega is UU. Nothing else is UU-capable, so a UU
        // request must fall back to a repeat rather than hand this family over as "UU".
        const megaFam = 'P_FAMILY_MEGAONLY';
        pokes.push(
            mkPoke('SPECIES_MEGAONLY', {
                family: megaFam, bestEvoTier: 'RU', bestEvo: 'SPECIES_MEGAONLY',
                evoTree: ['SPECIES_MEGAONLY'], evolutions: [], teachables: ALL_TMS,
            }),
        );
        pokes.push({
            id: 'SPECIES_MEGAONLY_MEGA', name: 'Megaonly Mega', family: megaFam,
            rating: { tier: 'UU', bestEvo: 'SPECIES_MEGAONLY_MEGA', bestEvoTier: 'UU' },
            evoTree: ['SPECIES_MEGAONLY'], evolutions: [], teachables: ALL_TMS, learnset: [],
            evolutionData: { type: 'EVO_TYPE_FINAL', isLC: false, isFinal: true, megaBaseForm: 'SPECIES_MEGAONLY' },
        });
        const offers = __test.offeredCandidates(pokes, 'UU', 40, new Set());
        expect(offers.map(p => p.id)).not.toContain('SPECIES_MEGAONLY');
        expect(offers.map(p => p.id)).not.toContain('SPECIES_MEGAONLY_MEGA');
        for (const p of offers) expect(p.rating.bestEvoTier).toBe('UU');
    });

    test('the stage handed over is legal at the trade level (an early trade gives a base form)', () => {
        // The fixture families evolve at level 20, so Rustboro (13) must hand over the base stage and
        // a late trader the evolved one — the current stage is free, only the ceiling is fixed.
        const trades = run();
        expect(trades[0].offeredSpecies).toMatch(/_BASE$/);
        expect(trades[trades.length - 1].offeredSpecies).toMatch(/_FINAL$/);
    });
});

describe('the request pool — what the player could have caught', () => {
    test('a trader only asks for encounters reachable at its milestone', () => {
        const artifact = mkWildArtifact();
        const trades = run({ wildArtifact: artifact });
        trades.forEach((t, i) => {
            const flag = TRADERS[i].flag;
            const reachable = new Set(mapsAvailableAt(flag));
            const methods = new Set(methodsAvailableAt(flag));
            expect(reachable.has(t.wantedMapId)).toBe(true);
            expect(methods.has(t.wantedMethod)).toBe(true);
        });
    });

    test('Rustboro cannot ask for a Route 116 encounter, Dewford can', () => {
        const trades = run();
        expect(trades[0].wantedMapId).not.toBe('MAP_ROUTE116');
        const pool = mapsAvailableAt(TRADERS[1].flag);
        expect(pool).toContain('MAP_ROUTE116');
    });

    test('a rod-only encounter never reaches a trader that has no rod yet', () => {
        // T_102_GOOD is a good-rod slot: unreachable before Flannery, reachable from Lavaridge on.
        const trades = run();
        const beforeGoodRod = trades.slice(0, 5);   // Rustboro … Verdanturf
        expect(beforeGoodRod.every(t => t.wantedMethod === 'land' || t.wantedMethod === 'old')).toBe(true);
    });

    test('no two traders ask for the same family', () => {
        const pokes = mkPokedex();
        const byId = new Map(pokes.map(p => [p.id, p]));
        const families = run({ pokemonList: pokes }).map(t => getFamilyGroup(byId.get(t.wantedSpecies).family));
        expect(new Set(families).size).toBe(families.length);
    });
});

describe('B-073 — a trade never hands over a family the run already used', () => {
    test('no offered family repeats a family the wild module already claimed', () => {
        const pokes = mkPokedex();
        const byId = new Map(pokes.map(p => [p.id, p]));
        // Pretend the run's starters/extra starters/rewards already took two whole tiers' worth.
        const claimed = pokes
            .filter(p => p.rating.bestEvoTier === 'OU' || p.rating.bestEvoTier === 'UBERS')
            .map(p => p.family)
            .slice(0, 6);
        const trades = run({ pokemonList: pokes, wildArtifact: mkWildArtifact({ alreadyChosenFamilies: claimed }) });
        const claimedGroups = new Set(claimed.map(getFamilyGroup));
        for (const t of trades) {
            expect(claimedGroups.has(getFamilyGroup(byId.get(t.offeredSpecies).family))).toBe(false);
        }
    });

    test('no two trades hand over the same family', () => {
        const pokes = mkPokedex();
        const byId = new Map(pokes.map(p => [p.id, p]));
        const families = run({ pokemonList: pokes }).map(t => getFamilyGroup(byId.get(t.offeredSpecies).family));
        expect(new Set(families).size).toBe(families.length);
    });

    test('a trade never gives back a member of the family it asks for', () => {
        const pokes = mkPokedex();
        const byId = new Map(pokes.map(p => [p.id, p]));
        for (const t of run({ pokemonList: pokes })) {
            expect(getFamilyGroup(byId.get(t.offeredSpecies).family))
                .not.toBe(getFamilyGroup(byId.get(t.wantedSpecies).family));
        }
    });

    test('an exhausted tier warns and repeats rather than dropping the trade', () => {
        const warn = jest.fn();
        // Only one family exists at each tier, so the very first trader spends its tier's only family.
        const pokes = TIERS.flatMap(tier => family(`${tier}_ONLY`, tier, { teachables: ALL_TMS }));
        const artifact = mkWildArtifact();
        Object.keys(artifact.replacementLog).forEach((tpl, i) => {
            artifact.replacementLog[tpl] = `SPECIES_${TIERS[i % TIERS.length]}_ONLY_BASE`;
        });
        const trades = run({ pokemonList: pokes, wildArtifact: artifact, diagnostics: { warn } });
        expect(trades.every(t => t.offeredSpecies)).toBe(true);
        expect(warn.mock.calls.some(c => c[0] === 'TRADE_OFFER_POOL_EMPTY')).toBe(true);
        expect(warn.mock.calls.some(c => c[0] === 'TRADE_WANTED_POOL_EMPTY')).toBe(true);
    });
});

describe('what the gift arrives with', () => {
    test('knows exactly as many TMs as its trader teaches', () => {
        run().forEach((t, i) => expect(t.offeredMoves).toHaveLength(TRADERS[i].tms));
    });

    test('only TMs the mon can learn', () => {
        const learnsOnlyTwo = mkPokedex({ teachables: ['MOVE_TM_A', 'MOVE_TM_B'] });
        for (const t of run({ pokemonList: learnsOnlyTwo })) {
            for (const move of t.offeredMoves) expect(['MOVE_TM_A', 'MOVE_TM_B']).toContain(move);
        }
    });

    test('only TMs reachable at its milestone', () => {
        // MOVE_TM_F is Juan's badge TM: nobody before Sootopolis may hand it over.
        const moves = mkMoves({ MOVE_TM_F: 'Gym reward — Wallace/Juan (badge 8)' });
        const trades = run({ moves });
        const sootopolis = trades.findIndex(t => t.town === 'SOOTOPOLIS');
        trades.slice(0, sootopolis).forEach(t => expect(t.offeredMoves).not.toContain('MOVE_TM_F'));
    });

    test('never a move the mon already knows by level-up at that level', () => {
        const knowsA = mkPokedex({ teachables: ALL_TMS, learnset: [{ move: 'MOVE_TM_A', level: 5 }] });
        for (const t of run({ pokemonList: knowsA })) expect(t.offeredMoves).not.toContain('MOVE_TM_A');
    });

    test('never the same TM twice', () => {
        for (const t of run()) expect(new Set(t.offeredMoves).size).toBe(t.offeredMoves.length);
    });

    test('warns (and stays short) when the mon cannot learn enough of them', () => {
        const warn = jest.fn();
        const oneTm = mkPokedex({ teachables: ['MOVE_TM_A'] });
        const trades = run({ pokemonList: oneTm, diagnostics: { warn } });
        expect(trades.find(t => t.town === 'SOOTOPOLIS').offeredMoves).toHaveLength(1);
        expect(warn.mock.calls.some(c => c[0] === 'TRADE_TMS_SHORT')).toBe(true);
    });

    test('has exactly as many perfect IVs as its trader promises, the rest at 15', () => {
        run().forEach((t, i) => {
            expect(t.ivs).toHaveLength(6);
            expect(t.ivs.filter(v => v === PERFECT_IV)).toHaveLength(TRADERS[i].perfectIvs);
            expect(t.ivs.filter(v => v === BASE_IV)).toHaveLength(6 - TRADERS[i].perfectIvs);
            expect(t.perfectIvs).toBe(TRADERS[i].perfectIvs);
        });
    });

    test('perfects different stats for different traders (not always HP)', () => {
        const perfected = run().map(t => t.ivs.findIndex(v => v === PERFECT_IV));
        expect(new Set(perfected).size).toBeGreaterThan(1);
    });
});

describe('determinism', () => {
    test('the same seed gives the same 15 trades', () => {
        expect(run({ seed: 777 })).toEqual(run({ seed: 777 }));
    });

    test('a different seed moves them', () => {
        expect(run({ seed: 777 })).not.toEqual(run({ seed: 778 }));
    });

    test('consumes no shared RNG (it is a pure function of its inputs)', () => {
        const rng = require('../../rng');
        rng.seed(42);
        run({ seed: 1 });
        const after = rng.random();
        rng.seed(42);
        expect(rng.random()).toBe(after);
    });
});

describe('helpers', () => {
    test('rollIvs perfects distinct stats only', () => {
        const rand = __test.makeRng(9);
        const ivs = __test.rollIvs(4, rand);
        expect(ivs.filter(v => v === PERFECT_IV)).toHaveLength(4);
    });

    test('rollIvs cannot ask for more stats than a mon has', () => {
        expect(__test.rollIvs(99, __test.makeRng(1)).filter(v => v === PERFECT_IV)).toHaveLength(6);
    });

    test('sampleDistinct returns at most what it was given', () => {
        expect(__test.sampleDistinct(['a', 'b'], 5, __test.makeRng(3)).sort()).toEqual(['a', 'b']);
    });
});
