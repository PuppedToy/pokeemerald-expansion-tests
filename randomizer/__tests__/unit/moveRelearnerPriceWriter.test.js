'use strict';

// T-167 / T-234 — the move-relearn-price writer patches the `moveRelearnerCost` field of
// `gRandomizerSettings` in src/randomizer_settings.c, consumed at runtime by GetMoveRelearnerMoveCost
// (so a prebuilt ROM is repatchable — ADR-022). (The ROM compile is CI/builder-only — no GBA toolchain
// locally.)

const fs = require('fs');
const {
    patchMoveRelearnPriceInContent,
    clampPrice,
    MOVE_RELEARN_PRICE_DEFAULT,
    file,
} = require('../../moveRelearnerPriceWriter');

const SAMPLE = [
    'const volatile struct RandomizerSettings gRandomizerSettings = {',
    '    .trainerMoneyNormal = 250,',
    '    .trainerMoneyBoss   = 3000,',
    '    .trainerMoneyGym    = 5000,',
    '    .moveRelearnerCost  = 250,',
    '};',
].join('\n');

describe('patchMoveRelearnPriceInContent', () => {
    test('patches the relearn-cost field', () => {
        const out = patchMoveRelearnPriceInContent(SAMPLE, 500);
        expect(out).toContain('.moveRelearnerCost  = 500');
        expect(out).not.toMatch(/\.moveRelearnerCost\s*=\s*250/);
    });

    test('a price of 0 makes every relearn free', () => {
        const out = patchMoveRelearnPriceInContent(SAMPLE, 0);
        expect(out).toMatch(/\.moveRelearnerCost\s*=\s*0\b/);
    });

    test('no/invalid config → committed default (unchanged)', () => {
        expect(patchMoveRelearnPriceInContent(SAMPLE, undefined))
            .toMatch(new RegExp(`\\.moveRelearnerCost\\s*=\\s*${MOVE_RELEARN_PRICE_DEFAULT}`));
        expect(patchMoveRelearnPriceInContent(SAMPLE, -5))
            .toMatch(new RegExp(`\\.moveRelearnerCost\\s*=\\s*${MOVE_RELEARN_PRICE_DEFAULT}`));
    });

    test('does not touch the money fields (owned by the money writer)', () => {
        const out = patchMoveRelearnPriceInContent(SAMPLE, 999);
        expect(out).toContain('.trainerMoneyNormal = 250');
        expect(out).toContain('.trainerMoneyBoss   = 3000');
        expect(out).toContain('.trainerMoneyGym    = 5000');
    });

    test('clampPrice rejects negatives / NaN, rounds floats', () => {
        expect(clampPrice(-5)).toBe(MOVE_RELEARN_PRICE_DEFAULT);
        expect(clampPrice(NaN)).toBe(MOVE_RELEARN_PRICE_DEFAULT);
        expect(clampPrice(undefined)).toBe(MOVE_RELEARN_PRICE_DEFAULT);
        expect(clampPrice(300.7)).toBe(301);
        expect(clampPrice(0)).toBe(0);
    });
});

describe('committed C source matches the writer', () => {
    test('randomizer_settings.c carries the patchable relearn-cost field', () => {
        const content = fs.readFileSync(file, 'utf8');
        expect(content).toContain('gRandomizerSettings');
        expect(content).toMatch(/\.moveRelearnerCost\s*=\s*\d+/);
        const patched = patchMoveRelearnPriceInContent(content, 777);
        expect(patched).toMatch(/\.moveRelearnerCost\s*=\s*777/);
    });
});
