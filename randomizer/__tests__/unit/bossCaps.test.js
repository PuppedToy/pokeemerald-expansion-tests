'use strict';

// TDD (T-007): bossCaps.js parses the level-cap SSOT from src/caps.c and joins it with the
// boss↔flag trainer mapping, asserting the relation is 1-to-1 so it can never silently drift.

const fs = require('fs');
const path = require('path');
const { parseLevelCaps, buildBossCaps, BOSS_CAP_TRAINERS } = require('../../bossCaps');

const FIXTURE = `
u32 GetCurrentLevelCap(void)
{
    static const u32 sLevelCapFlagMap[][2] =
    {
        {FLAG_DEFEATED_RIVAL_ROUTE103, 7}, // Boss
        {FLAG_DEFEATED_AQUA_WOODS, 10}, // Minor boss
        // Get good rod
        {FLAG_BADGE01_GET, 12}, // Gym boss Roxanne
    };
    return MAX_LEVEL;
}
// a later, unrelated array that must NOT be parsed:
static const u16 sEvCapFlagMap[][2] = { {FLAG_BADGE01_GET, 999} };
`;

describe('parseLevelCaps', () => {
    test('extracts ordered {flag, level} pairs from sLevelCapFlagMap', () => {
        expect(parseLevelCaps(FIXTURE)).toEqual([
            { flag: 'FLAG_DEFEATED_RIVAL_ROUTE103', level: 7 },
            { flag: 'FLAG_DEFEATED_AQUA_WOODS', level: 10 },
            { flag: 'FLAG_BADGE01_GET', level: 12 },
        ]);
    });
    test('ignores comment-only lines and other arrays (sEvCapFlagMap)', () => {
        const out = parseLevelCaps(FIXTURE);
        expect(out).toHaveLength(3);
        expect(out.some((e) => e.level === 999)).toBe(false);
    });
});

describe('buildBossCaps (join + 1-to-1 assertion)', () => {
    test('joins caps with the trainer/label map, in order with order index', () => {
        const map = {
            FLAG_DEFEATED_RIVAL_ROUTE103: { trainers: ['TRAINER_MAY_ROUTE_103_TREECKO'], label: 'Rival – Route 103' },
            FLAG_DEFEATED_AQUA_WOODS: { trainers: ['TRAINER_GRUNT_PETALBURG_WOODS'], label: 'Aqua Grunt' },
            FLAG_BADGE01_GET: { trainers: ['TRAINER_ROXANNE_1'], label: 'Roxanne' },
        };
        const out = buildBossCaps(FIXTURE, map);
        expect(out[0]).toEqual({ order: 0, flag: 'FLAG_DEFEATED_RIVAL_ROUTE103', level: 7, trainers: ['TRAINER_MAY_ROUTE_103_TREECKO'], label: 'Rival – Route 103' });
        expect(out[2]).toEqual({ order: 2, flag: 'FLAG_BADGE01_GET', level: 12, trainers: ['TRAINER_ROXANNE_1'], label: 'Roxanne' });
    });
    test('throws when a caps.c flag has no mapping entry', () => {
        const map = { FLAG_DEFEATED_RIVAL_ROUTE103: { trainers: ['T'], label: 'x' } };
        expect(() => buildBossCaps(FIXTURE, map)).toThrow(/FLAG_DEFEATED_AQUA_WOODS/);
    });
    test('throws when the mapping has an extra flag not in caps.c', () => {
        const map = {
            FLAG_DEFEATED_RIVAL_ROUTE103: { trainers: ['T'], label: 'x' },
            FLAG_DEFEATED_AQUA_WOODS: { trainers: ['T'], label: 'x' },
            FLAG_BADGE01_GET: { trainers: ['T'], label: 'x' },
            FLAG_NONEXISTENT_EXTRA: { trainers: ['T'], label: 'x' },
        };
        expect(() => buildBossCaps(FIXTURE, map)).toThrow(/FLAG_NONEXISTENT_EXTRA/);
    });
});

describe('SSOT integrity against the real src/caps.c', () => {
    const capsC = fs.readFileSync(path.resolve(__dirname, '../../../src/caps.c'), 'utf8');

    test('every real cap flag is mapped and vice-versa (buildBossCaps does not throw)', () => {
        const out = buildBossCaps(capsC, BOSS_CAP_TRAINERS);
        expect(out.length).toBeGreaterThanOrEqual(30);
        // spot-check known anchors
        const byFlag = Object.fromEntries(out.map((e) => [e.flag, e]));
        expect(byFlag['FLAG_BADGE01_GET'].trainers).toContain('TRAINER_ROXANNE_1');
        expect(byFlag['FLAG_BADGE01_GET'].level).toBe(12);
        expect(byFlag['FLAG_DEFEATED_AQUA_WOODS'].trainers).toContain('TRAINER_GRUNT_PETALBURG_WOODS');
        expect(byFlag['FLAG_IS_CHAMPION'].trainers).toContain('TRAINER_CHAMPION_STEVEN');
    });
    test('every mapping entry has a non-empty trainers array and a label', () => {
        for (const [flag, v] of Object.entries(BOSS_CAP_TRAINERS)) {
            expect(Array.isArray(v.trainers) && v.trainers.length > 0).toBe(true);
            expect(typeof v.label === 'string' && v.label.length > 0).toBe(true);
        }
    });
});

describe('T-148: Maxie – Mt Chimney is no longer a level-cap boss', () => {
    const capsC = fs.readFileSync(path.resolve(__dirname, '../../../src/caps.c'), 'utf8');

    // The Mt Chimney Maxie fight was dropped as a cap checkpoint. The flag itself lives on
    // as a story-only flag (still setflag'd by the map script), so it must NOT reappear in
    // either cap SSOT — caps.c's sLevelCapFlagMap or bossCaps' BOSS_CAP_TRAINERS.
    test('FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY is absent from caps.c sLevelCapFlagMap', () => {
        const flags = parseLevelCaps(capsC).map((c) => c.flag);
        expect(flags).not.toContain('FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY');
    });

    test('BOSS_CAP_TRAINERS has no Maxie – Mt Chimney entry', () => {
        expect(BOSS_CAP_TRAINERS.FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY).toBeUndefined();
        const allTrainers = Object.values(BOSS_CAP_TRAINERS).flatMap((v) => v.trainers);
        expect(allTrainers).not.toContain('TRAINER_MAXIE_MT_CHIMNEY');
    });
});
