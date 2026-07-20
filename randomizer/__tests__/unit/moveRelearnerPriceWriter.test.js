'use strict';

// T-167 — the move-relearn-price writer patches the single MOVE_RELEARNER_MOVE_COST #define in the
// C source (src/move_relearner.c), consumed by GetMoveRelearnerMoveCost. (The ROM compile is
// CI/builder-only — no GBA toolchain locally.)

const fs = require('fs');
const {
    patchMoveRelearnPriceInContent,
    clampPrice,
    MOVE_RELEARN_PRICE_DEFAULT,
    file,
} = require('../../moveRelearnerPriceWriter');

const SAMPLE = [
    '#define MOVE_RELEARNER_MOVE_COST 250',
    '',
    'u32 GetMoveRelearnerMoveCost(u16 move)',
    '{',
    '    return MOVE_RELEARNER_MOVE_COST;',
    '}',
].join('\n');

describe('patchMoveRelearnPriceInContent', () => {
    test('patches the price define', () => {
        const out = patchMoveRelearnPriceInContent(SAMPLE, 500);
        expect(out).toContain('#define MOVE_RELEARNER_MOVE_COST 500');
        expect(out).not.toContain('#define MOVE_RELEARNER_MOVE_COST 250');
    });

    test('a price of 0 makes every relearn free', () => {
        const out = patchMoveRelearnPriceInContent(SAMPLE, 0);
        expect(out).toContain('#define MOVE_RELEARNER_MOVE_COST 0');
    });

    test('no/invalid config → committed default (unchanged)', () => {
        expect(patchMoveRelearnPriceInContent(SAMPLE, undefined))
            .toContain(`#define MOVE_RELEARNER_MOVE_COST ${MOVE_RELEARN_PRICE_DEFAULT}`);
        expect(patchMoveRelearnPriceInContent(SAMPLE, -5))
            .toContain(`#define MOVE_RELEARNER_MOVE_COST ${MOVE_RELEARN_PRICE_DEFAULT}`);
    });

    test('does not touch the getter body / other text', () => {
        const out = patchMoveRelearnPriceInContent(SAMPLE, 999);
        expect(out).toContain('u32 GetMoveRelearnerMoveCost(u16 move)');
        expect(out).toContain('return MOVE_RELEARNER_MOVE_COST;');
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
    test('move_relearner.c carries the patchable #define', () => {
        const content = fs.readFileSync(file, 'utf8');
        expect(content).toMatch(/#define MOVE_RELEARNER_MOVE_COST\s+\d+/);
        const patched = patchMoveRelearnPriceInContent(content, 777);
        expect(patched).toContain('#define MOVE_RELEARNER_MOVE_COST 777');
        expect(patched).toContain('GetMoveRelearnerMoveCost');
    });
});
