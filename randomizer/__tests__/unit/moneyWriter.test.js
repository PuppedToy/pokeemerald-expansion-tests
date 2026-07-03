'use strict';

// T-052 Step 9 — the money writer patches the three tunable trainer-money #defines in the C source.
// Museum/Space-Center grunts derive from BOSS in C, so they are NOT patched here; Elite Four and
// Champion are fixed. (The actual ROM compile is CI/builder-only — no GBA toolchain locally.)

const fs = require('fs');
const path = require('path');
const { patchMoneyInContent, clampMoney, MONEY_DEFAULTS, file } = require('../../moneyWriter');

const SAMPLE = [
    '#define NORMAL_TRAINER_MONEY 250',
    '#define BOSS_TRAINER_MONEY 3000',
    '#define GYM_LEADER_MONEY 5000',
    '#define ELITE_FOUR_MONEY 10000',
    '#define CHAMPION_MONEY 50000',
    '#define MUSEUM_SPACE_MONEY ((BOSS_TRAINER_MONEY * 2) / 3)',
    '#define MUSEUM_2_MONEY (MUSEUM_SPACE_MONEY + 50)',
].join('\n');

describe('patchMoneyInContent', () => {
    test('patches the three tunable defines', () => {
        const out = patchMoneyInContent(SAMPLE, { normal: 500, boss: 4000, gym: 8000 });
        expect(out).toContain('#define NORMAL_TRAINER_MONEY 500');
        expect(out).toContain('#define BOSS_TRAINER_MONEY 4000');
        expect(out).toContain('#define GYM_LEADER_MONEY 8000');
    });

    test('leaves Elite Four / Champion and the derived defines untouched', () => {
        const out = patchMoneyInContent(SAMPLE, { normal: 500, boss: 4000, gym: 8000 });
        expect(out).toContain('#define ELITE_FOUR_MONEY 10000');
        expect(out).toContain('#define CHAMPION_MONEY 50000');
        expect(out).toContain('#define MUSEUM_SPACE_MONEY ((BOSS_TRAINER_MONEY * 2) / 3)');
        expect(out).toContain('#define MUSEUM_2_MONEY (MUSEUM_SPACE_MONEY + 50)');
    });

    test('no config → committed defaults (unchanged)', () => {
        const out = patchMoneyInContent(SAMPLE, {});
        expect(out).toContain(`#define NORMAL_TRAINER_MONEY ${MONEY_DEFAULTS.normal}`);
        expect(out).toContain(`#define BOSS_TRAINER_MONEY ${MONEY_DEFAULTS.boss}`);
        expect(out).toContain(`#define GYM_LEADER_MONEY ${MONEY_DEFAULTS.gym}`);
    });

    test('derived museum/space values at default boss reproduce $2000 / $2050', () => {
        // Mirrors the C math so the doc/UX promise is guaranteed: round(boss*2/3) and +$50.
        const boss = MONEY_DEFAULTS.boss;
        expect(Math.floor((boss * 2) / 3)).toBe(2000);
        expect(Math.floor((boss * 2) / 3) + 50).toBe(2050);
    });

    test('clampMoney rejects negatives / NaN, rounds floats', () => {
        expect(clampMoney(-5, 250)).toBe(250);
        expect(clampMoney(NaN, 250)).toBe(250);
        expect(clampMoney(undefined, 250)).toBe(250);
        expect(clampMoney(3000.7, 250)).toBe(3001);
    });
});

describe('committed C source matches the writer', () => {
    test('battle_script_commands.c carries the three patchable #defines', () => {
        const content = fs.readFileSync(file, 'utf8');
        for (const name of ['NORMAL_TRAINER_MONEY', 'BOSS_TRAINER_MONEY', 'GYM_LEADER_MONEY']) {
            expect(content).toMatch(new RegExp(`#define ${name}\\s+\\d+`));
        }
        // Patching the real source changes exactly those defines.
        const patched = patchMoneyInContent(content, { normal: 999, boss: 4321, gym: 8765 });
        expect(patched).toContain('#define NORMAL_TRAINER_MONEY 999');
        expect(patched).toContain('#define BOSS_TRAINER_MONEY 4321');
        expect(patched).toContain('#define GYM_LEADER_MONEY 8765');
        expect(patched).toContain(path.basename(file) ? 'GetTrainerMoneyToGive' : '');
    });
});
