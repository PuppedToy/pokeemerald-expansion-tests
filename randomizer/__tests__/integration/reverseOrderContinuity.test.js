'use strict';

// T-106 — reverse-order continuity regression (Steven + Wally). The LATEST appearance is now
// AUTHORITATIVE (it picks the strong endgame roster); the earlier appearances must ECHO it devolved.
// This asserts the invariant survives the full pipeline: every continuity ace shown at an earlier
// appearance belongs to the SAME FAMILY as an authoritative-appearance ace (same identity, a
// level-appropriate stage). Runs the real generator (~40s) so it is gated behind RUN_DETERMINISM.

jest.mock('fs', () => {
    const real = jest.requireActual('fs');
    const noopCb = (...args) => { const cb = args[args.length - 1]; if (typeof cb === 'function') cb(null); };
    return {
        ...real,
        writeFile: noopCb, writeFileSync: () => {}, appendFile: noopCb, appendFileSync: () => {},
        promises: { ...real.promises, writeFile: async () => {}, appendFile: async () => {} },
    };
});

const fs = require('fs');
const path = require('path');
const { runGeneration } = require('../../generate');
const { getFamilyGroup } = require('../../modules/utils');

const BASE_DATA_PATH = path.resolve(__dirname, '../../../frontend/data/base-data.json');
const describeSlow = process.env.RUN_DETERMINISM === '1' ? describe : describe.skip;

describeSlow('reverse-order continuity (T-106)', () => {
    let docs, familyOf;

    beforeAll(async () => {
        const seed = 1830319788;
        const cfg = {
            runType: 'soullink', seed, difficulty: 7, rebalance: true, balanceChance: 0.4,
            showExactPositions: true, numPlayers: 1, romsPerPlayer: 1,
            playerShared: { pokedex: true, trainers: true, starters: false },
            romShared: { pokedex: true, trainers: true, starters: true },
        };
        const mcfg = { seed, difficulty: 7, rebalance: true, balanceChance: 0.4, allTms: false, showExactPositions: true };
        const baseData = JSON.parse(fs.readFileSync(BASE_DATA_PATH, 'utf-8'));
        const bundle = await runGeneration(cfg, mcfg, 'continuity-test', { baseData });
        docs = bundle.roms[0].docs.trainersResultsSimplified;
        // T-163 regression guard: trainersResultsSimplified is ROM-authoritative (writer.js builds the
        // ROM's parties from it verbatim), so it must stay FULL even when a viewer copy is redacted —
        // e.g. IVs must survive here (the viewer's showIVs defaults off). A redacted viewerTrainers
        // exists alongside it. If these ever merge, the ROM would lose Pokémon/moves/items.
        expect(Object.values(docs).some(t => (t.team || []).some(m => m.ivs))).toBe(true);
        expect(bundle.roms[0].docs.viewerTrainers).toBeDefined();
        const bySpecies = Object.fromEntries(baseData.allPokes.map(p => [p.id, p]));
        // T-128 — the continuity check is about the same evolutionary LINE, not the dedup family group.
        // A devolved echo can legitimately cross a regional-form boundary when the regional final-evo
        // shares its LC base with the regular line (Goodra-Hisui → shared Goomy, `P_FAMILY_GOOMY` vs
        // `P_FAMILY_GOOMY_HISUI`). Collapse the regional suffix so "same line" is recognised. Echoes are
        // ID-locked to the ace's line, so this can never produce a false match.
        const REGIONAL_SUFFIXES = ['ALOLA', 'GALAR', 'HISUI', 'PALDEA'];
        const collapseRegional = fam => {
            for (const s of REGIONAL_SUFFIXES) if (fam.endsWith('_' + s)) return fam.slice(0, -(s.length + 1));
            return fam;
        };
        familyOf = id => collapseRegional(getFamilyGroup((bySpecies[id] || {}).family || id));
    }, 120000);

    const isPerfect = m => m.ivs && Object.values(m.ivs).every(v => v === 31);
    const familiesOf = id => new Set((docs[id].team || []).map(m => familyOf(m.pokemon)));

    describe('Steven (Champion authoritative → Granite Cave / Mossdeep echo)', () => {
        test('all three appearances resolved a full team', () => {
            expect(docs['TRAINER_CHAMPION_STEVEN'].team.length).toBeGreaterThanOrEqual(5);
            expect(docs['PARTNER_STEVEN'].team.length).toBeGreaterThanOrEqual(3);
            expect(docs['TRAINER_STEVEN'].team.length).toBeGreaterThanOrEqual(5);
        });
        test("Granite Cave's perfect-breed aces share a family with a Champion ace", () => {
            const champ = familiesOf('TRAINER_CHAMPION_STEVEN');
            const aces = docs['TRAINER_STEVEN'].team.filter(isPerfect);
            expect(aces.length).toBeGreaterThanOrEqual(2);
            for (const a of aces) expect(champ.has(familyOf(a.pokemon))).toBe(true);
        });
        test('every Mossdeep-partner ace shares a family with a Champion ace', () => {
            const champ = familiesOf('TRAINER_CHAMPION_STEVEN');
            for (const m of docs['PARTNER_STEVEN'].team) expect(champ.has(familyOf(m.pokemon))).toBe(true);
        });
    });

    describe('Wally (Victory Road authoritative → Mauville / Lilycove echo)', () => {
        test('all three appearances resolved a full team', () => {
            expect(docs['TRAINER_WALLY_VR_1'].team.length).toBe(6);
            expect(docs['TRAINER_WALLY_LILYCOVE'].team.length).toBe(6);
            expect(docs['TRAINER_WALLY_MAUVILLE'].team.length).toBe(6);
        });
        // B-033 — Wally's continuity is two-tiered: the four signature IDs (WALLY_1-4) are born at Victory
        // Road and echo devolved at Lilycove + Mauville, while the two UU IDs (WALLY_5-6) are born at
        // Lilycove and echo at Mauville. Victory Road ALSO fields two VR-only aces (a legend + an ubers)
        // that do NOT propagate. So NOT every earlier mon traces to VR (the two UU IDs trace to Lilycove).
        test('the four VR signatures echo at Lilycove + Mauville; the two UU IDs are born at Lilycove', () => {
            const vr = familiesOf('TRAINER_WALLY_VR_1');
            const lily = familiesOf('TRAINER_WALLY_LILYCOVE');
            // Lilycove carries all six of Wally's IDs, so every Mauville mon shares a family with a Lilycove one.
            for (const m of docs['TRAINER_WALLY_MAUVILLE'].team) expect(lily.has(familyOf(m.pokemon))).toBe(true);
            // Lilycove shares its four VR signatures with Victory Road (the 2 UU IDs are new to Lilycove).
            const shared = [...lily].filter(f => vr.has(f)).length;
            expect(shared).toBeGreaterThanOrEqual(4);
        });
        test('the Victory Road (authoritative) team has no repeated type (B-027 restriction)', () => {
            const bySpecies = Object.fromEntries(
                JSON.parse(fs.readFileSync(BASE_DATA_PATH, 'utf-8')).allPokes.map(p => [p.id, p]),
            );
            const seen = new Set();
            for (const m of docs['TRAINER_WALLY_VR_1'].team) {
                for (const t of (bySpecies[m.pokemon] || {}).parsedTypes || []) {
                    expect(seen.has(t)).toBe(false);
                    seen.add(t);
                }
            }
        });
    });

    // T-106 — the authoritative-first HOIST changes only the BUILD order; the docs must still list
    // trainers in the ORIGINAL story order (owner requirement: build back-to-front, SHOW canonically).
    describe('docs display order stays canonical, not the hoisted build order', () => {
        const idx = id => Object.keys(docs).indexOf(id);
        test('rival May: Route 103 → Rustboro → Route 119 → Ever Grande (each starter)', () => {
            for (const s of ['TREECKO', 'TORCHIC', 'MUDKIP']) {
                expect(idx(`TRAINER_MAY_ROUTE_103_${s}`)).toBeLessThan(idx(`TRAINER_MAY_RUSTBORO_${s}`));
                expect(idx(`TRAINER_MAY_RUSTBORO_${s}`)).toBeLessThan(idx(`TRAINER_MAY_ROUTE_119_${s}`));
                expect(idx(`TRAINER_MAY_ROUTE_119_${s}`)).toBeLessThan(idx(`TRAINER_MAY_EVERGRANDE_CITY_${s}`));
            }
        });
        test('Steven: Granite Cave + Mossdeep partner BEFORE the Champion', () => {
            expect(idx('TRAINER_STEVEN')).toBeLessThan(idx('TRAINER_CHAMPION_STEVEN'));
            expect(idx('PARTNER_STEVEN')).toBeLessThan(idx('TRAINER_CHAMPION_STEVEN'));
        });
        test('Wally: Mauville → Lilycove → Victory Road', () => {
            expect(idx('TRAINER_WALLY_MAUVILLE')).toBeLessThan(idx('TRAINER_WALLY_LILYCOVE'));
            expect(idx('TRAINER_WALLY_LILYCOVE')).toBeLessThan(idx('TRAINER_WALLY_VR_1'));
        });
    });

    describe('Rival May (Ever Grande authoritative → Route 103 / Rustboro / 110 / 119 echo)', () => {
        // Test the TREECKO variant (all three are generated regardless of the run's actual starter).
        const CHAIN = ['TRAINER_MAY_ROUTE_103_TREECKO', 'TRAINER_MAY_RUSTBORO_TREECKO',
            'TRAINER_MAY_ROUTE_110_TREECKO', 'TRAINER_MAY_ROUTE_119_TREECKO', 'TRAINER_MAY_EVERGRANDE_CITY_TREECKO'];
        const starterOf = id => (docs[id].team.find(isPerfect) || {}).pokemon; // the perfect-breed starter slot

        test('every appearance resolved a full team', () => {
            for (const id of CHAIN) expect(docs[id].team.length).toBe(6);
        });

        test('the perfect-breed starter is the SAME family (devolved) across all five appearances', () => {
            const fams = CHAIN.map(starterOf).filter(Boolean).map(familyOf);
            expect(fams.length).toBe(5);
            expect(new Set(fams).size).toBe(1); // one continuous starter line, shown at level-appropriate stages
        });

        test("Route 103's starter (earliest echo) traces to an Ever Grande family", () => {
            const eg = familiesOf('TRAINER_MAY_EVERGRANDE_CITY_TREECKO');
            expect(eg.has(familyOf(starterOf('TRAINER_MAY_ROUTE_103_TREECKO')))).toBe(true);
        });
    });

    describe('Tate & Liza dual favourite (T-128) — one twin fielded when both share a tier (T-169)', () => {
        // T-128 (redesign) — Tate & Liza have TWO species-only favourite chains (['SPECIES_SOLGALEO',
        // 'SPECIES_SOLROCK'] and ['SPECIES_LUNALA','SPECIES_LUNATONE']). The legends are above the
        // up-to-Uber pool, so each drops to its thematic base counterpart. But Solrock and Lunatone are
        // mirror-stat twins → they rate the SAME tier (RU for this seed), and the pool has only ONE RU
        // slot ([UBERS,UBERS,OU,UU,RU,mega]). The first chain (Solrock) claims it; the second twin
        // (Lunatone) finds no free exact-tier slot and is correctly DROPPED to the generic fallback.
        // Only ONE twin is guaranteed whenever they share a tier — owner-confirmed intended (T-169), not
        // a bug. (The old Trick Room / Light Clay / Room Service item gimmick was removed, owner-validated.)
        test('fields six mons and never a legendary (Solgaleo/Lunala are over the up-to-Uber budget)', () => {
            const team = docs['TRAINER_TATE_AND_LIZA_1'].team.map(m => m.pokemon);
            expect(team.length).toBe(6);
            expect(team).not.toContain('SPECIES_SOLGALEO');
            expect(team).not.toContain('SPECIES_LUNALA');
        });
        test('Solrock (chain 0) claims the sole RU slot; Lunatone (same tier) is correctly dropped', () => {
            const team = docs['TRAINER_TATE_AND_LIZA_1'].team.map(m => m.pokemon);
            expect(team).toContain('SPECIES_SOLROCK');
            expect(team).not.toContain('SPECIES_LUNATONE');
        });
        // B-034 / T-143 — Trick Room is NO LONGER force-seeded (Tate & Liza force nothing). A Psychic-
        // restricted boss can't field a genuinely slow team (almost no slow Psychic mons/megas at the boss
        // tiers), so forced TR produced fast "TR" teams; TR is now EMERGENT-only. The B-034 fix must still
        // let TR build when a team genuinely rolls a slow-offensive core → assert it builds SOMEWHERE.
        test('B-034/T-143 — Trick Room still builds emergently somewhere (never force-seeded)', () => {
            const anyTR = Object.values(docs).some(t => (t.team || []).some(m => (m.moves || []).includes('MOVE_TRICK_ROOM')));
            expect(anyTR).toBe(true);
        });
    });

    // B-044 — a villain grunt fields a MASCOT: its leader's signature mega DEVOLVED (Archie's Mega Sharpedo
    // → Carvanha, Maxie's Mega Camerupt → Numel). The mascot must be the SAME FAMILY as the leader's ace
    // but INDEPENDENTLY bred — it must NOT inherit the leader's perfect IVs (the leader shares its `pokeId`
    // IV-cache slot). Before the fix the mascot came out all-31 (186) like the leader; after, it rolls its own.
    describe('villain-grunt mascot is same family but not perfect breed (B-044)', () => {
        const PAIRS = [
            { grunt: 'TRAINER_GRUNT_PETALBURG_WOODS', leader: 'TRAINER_ARCHIE' },
            { grunt: 'TRAINER_GRUNT_RUSTURF_TUNNEL', leader: 'TRAINER_MAXIE_MAGMA_HIDEOUT' },
        ];
        test.each(PAIRS)('$grunt mascot shares $leader\'s ace family but has its own (non-perfect) IVs', ({ grunt, leader }) => {
            const aces = (docs[leader].team || []).filter(isPerfect);
            expect(aces.length).toBeGreaterThanOrEqual(1); // the leader keeps its perfect-breed mega favourite
            const aceFamilies = new Set(aces.map(m => familyOf(m.pokemon)));
            const mascot = (docs[grunt].team || []).find(m => aceFamilies.has(familyOf(m.pokemon)));
            expect(mascot).toBeDefined();          // the mascot IS a member of the leader's ace family
            expect(isPerfect(mascot)).toBe(false); // …but independently bred — no inherited perfect IVs
        });
    });

    describe('Gym leader favourites (T-128) — same mechanism as every favourite', () => {
        const GYMS = ['TRAINER_ROXANNE_1', 'TRAINER_WATTSON_1', 'TRAINER_FLANNERY_1',
            'TRAINER_NORMAN_1', 'TRAINER_WINONA_1', 'TRAINER_JUAN_1'];
        test('each gym fields a perfect-breed favourite ace', () => {
            for (const id of GYMS) {
                expect(docs[id].team.length).toBe(6);
                expect(docs[id].team.some(isPerfect)).toBe(true); // the prepended favourite
            }
        });
        test('Winona falls to BASE Altaria (Mega Altaria = Dragon/Fairy does not fit her Flying type)', () => {
            // For this seed Winona keeps Flying; Mega Altaria is dropped, base Altaria (Dragon/Flying) kept.
            expect(docs['TRAINER_WINONA_1'].team.some(m => m.pokemon === 'SPECIES_ALTARIA')).toBe(true);
        });
    });
});
