'use strict';

// T-106 — reverse-order continuity regression. Champion Steven is now the AUTHORITATIVE appearance; his
// earlier appearances (Granite Cave lvl 22, Mossdeep partner lvl 59) must ECHO his roster devolved. This
// asserts the invariant survives the full pipeline: every continuity ace shown at an earlier appearance
// belongs to the SAME FAMILY as a Champion ace (same identity, level-appropriate stage). Runs the real
// generator (~70s) so it is gated behind RUN_DETERMINISM like the cross-ROM determinism gate.

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

describeSlow('Steven reverse-order continuity (T-106)', () => {
    let champTeam, partnerTeam, graniteTeam, familyOf;

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
        const bundle = await runGeneration(cfg, mcfg, 'steven-continuity-test', { baseData });
        const docs = bundle.roms[0].docs.trainersResultsSimplified;
        champTeam = docs['TRAINER_CHAMPION_STEVEN'].team;
        partnerTeam = docs['PARTNER_STEVEN'].team;
        graniteTeam = docs['TRAINER_STEVEN'].team;
        const bySpecies = Object.fromEntries(baseData.allPokes.map(p => [p.id, p]));
        familyOf = id => getFamilyGroup((bySpecies[id] || {}).family || id);
    }, 120000);

    const isPerfect = m => m.ivs && Object.values(m.ivs).every(v => v === 31);
    const families = team => new Set(team.map(m => familyOf(m.pokemon)));

    test('all three Steven appearances resolved with a non-empty team', () => {
        expect(champTeam.length).toBeGreaterThanOrEqual(5);
        expect(partnerTeam.length).toBeGreaterThanOrEqual(3);
        expect(graniteTeam.length).toBeGreaterThanOrEqual(5);
    });

    test("Granite Cave's continuity aces (perfect-breed) share a family with a Champion ace", () => {
        const champFamilies = families(champTeam);
        const graniteAces = graniteTeam.filter(isPerfect); // the devolveToLevel echoes carry breed=perfect
        expect(graniteAces.length).toBeGreaterThanOrEqual(2);
        for (const ace of graniteAces) {
            expect(champFamilies.has(familyOf(ace.pokemon))).toBe(true);
        }
    });

    test("the Mossdeep partner's aces all share a family with a Champion ace", () => {
        const champFamilies = families(champTeam);
        for (const m of partnerTeam) {
            expect(champFamilies.has(familyOf(m.pokemon))).toBe(true);
        }
    });
});
