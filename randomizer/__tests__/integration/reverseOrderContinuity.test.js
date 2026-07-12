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
        test('every earlier-appearance mon shares a family with a Victory Road mon', () => {
            const vr = familiesOf('TRAINER_WALLY_VR_1');
            for (const id of ['TRAINER_WALLY_LILYCOVE', 'TRAINER_WALLY_MAUVILLE']) {
                for (const m of docs[id].team) expect(vr.has(familyOf(m.pokemon))).toBe(true);
            }
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

    describe('Tate & Liza dual favourite (T-128)', () => {
        // T-128 (redesign) — Tate & Liza have TWO species-only favourites (['SPECIES_SOLGALEO',
        // 'SPECIES_SOLROCK'] and ['SPECIES_LUNALA','SPECIES_LUNATONE']). The legends are above the
        // up-to-Uber pool, so each drops to its base counterpart, which CLAIMS a pool slot. The old
        // Trick Room / Light Clay / Room Service item gimmick was removed (owner-validated).
        test('fields six mons including a Solrock-line and a Lunatone-line ace', () => {
            const team = docs['TRAINER_TATE_AND_LIZA_1'].team;
            expect(team.length).toBe(6);
            const has = fams => team.some(m => fams.includes(m.pokemon));
            expect(has(['SPECIES_SOLROCK', 'SPECIES_SOLGALEO', 'SPECIES_COSMOEM'])).toBe(true);
            expect(has(['SPECIES_LUNATONE', 'SPECIES_LUNALA', 'SPECIES_COSMOEM'])).toBe(true);
        });
        test('both favourites drop to their base counterparts (Solrock + Lunatone), the legends being over budget', () => {
            const team = docs['TRAINER_TATE_AND_LIZA_1'].team.map(m => m.pokemon);
            expect(team).toContain('SPECIES_SOLROCK');
            expect(team).toContain('SPECIES_LUNATONE');
            // Solgaleo/Lunala are legends, above the up-to-Uber budget → they never claim a slot.
            expect(team).not.toContain('SPECIES_SOLGALEO');
            expect(team).not.toContain('SPECIES_LUNALA');
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
