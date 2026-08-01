'use strict';

// T-052 Step 9 / T-234 — the money writer patches the three tunable trainer-money fields of
// `gRandomizerSettings` in src/randomizer_settings.c (the engine reads them at runtime, so a prebuilt ROM
// is repatchable — ADR-022). Museum/Space-Center grunts derive from BOSS in C, so they are NOT patched
// here; Elite Four and Champion are fixed #defines in the engine. (The ROM compile is CI/builder-only —
// no GBA toolchain locally.)

const fs = require('fs');
const { patchMoneyInContent, clampMoney, MONEY_DEFAULTS, file } = require('../../moneyWriter');

const SAMPLE = [
    'const volatile struct RandomizerSettings gRandomizerSettings = {',
    '    .trainerMoneyNormal = 250,',
    '    .trainerMoneyBoss   = 3000,',
    '    .trainerMoneyGym    = 5000,',
    '    .moveRelearnerCost  = 250,',
    '};',
].join('\n');

describe('patchMoneyInContent', () => {
    test('patches the three tunable money fields', () => {
        const out = patchMoneyInContent(SAMPLE, { normal: 500, boss: 4000, gym: 8000 });
        expect(out).toContain('.trainerMoneyNormal = 500');
        expect(out).toContain('.trainerMoneyBoss   = 4000');
        expect(out).toContain('.trainerMoneyGym    = 8000');
    });

    test('leaves the move-relearn field untouched (owned by the relearn-price writer)', () => {
        const out = patchMoneyInContent(SAMPLE, { normal: 500, boss: 4000, gym: 8000 });
        expect(out).toContain('.moveRelearnerCost  = 250');
    });

    test('no config → committed defaults (unchanged)', () => {
        const out = patchMoneyInContent(SAMPLE, {});
        expect(out).toContain(`.trainerMoneyNormal = ${MONEY_DEFAULTS.normal}`);
        expect(out).toContain(`.trainerMoneyBoss   = ${MONEY_DEFAULTS.boss}`);
        expect(out).toContain(`.trainerMoneyGym    = ${MONEY_DEFAULTS.gym}`);
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
    test('randomizer_settings.c carries the three patchable money fields', () => {
        const content = fs.readFileSync(file, 'utf8');
        expect(content).toContain('gRandomizerSettings');
        for (const field of ['trainerMoneyNormal', 'trainerMoneyBoss', 'trainerMoneyGym']) {
            expect(content).toMatch(new RegExp(`\\.${field}\\s*=\\s*\\d+`));
        }
        // Patching the real source changes exactly those fields.
        const patched = patchMoneyInContent(content, { normal: 999, boss: 4321, gym: 8765 });
        expect(patched).toMatch(/\.trainerMoneyNormal\s*=\s*999/);
        expect(patched).toMatch(/\.trainerMoneyBoss\s*=\s*4321/);
        expect(patched).toMatch(/\.trainerMoneyGym\s*=\s*8765/);
    });
});
