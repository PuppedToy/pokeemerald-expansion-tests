'use strict';

// B-062 (root cause) — the level a found mega evolution is filed under.
//
// `foundMegaEvos[].level` decides which mega trainer hands out which stone (see megaAssignment.js).
// It used to be `Math.max(levelFound, Number(evolution.param))`, which silently produced **NaN** for
// every mega whose base form evolves by ITEM rather than by level — Scyther → Scizor (a stone),
// Kirlia → Gallade (Dawn Stone) — because `param` is then an item constant, not a number.
//
// A NaN level poisons the whole queue: it does not survive JSON (it serialises as null), so the
// browser's docs and the ROM builder end up sorting different values. The amplifier is covered in
// megaAssignment.test.js; this file pins the cause — the level is always a finite number.
const { megaBaseFormLevel } = require('../../modules/wildModule');

describe('megaBaseFormLevel', () => {
    test('a LEVEL evolution files the mega under that level', () => {
        expect(megaBaseFormLevel(0, { method: 'LEVEL', param: '24' })).toBe(24);
        expect(megaBaseFormLevel(0, { method: 'LEVEL', param: 18 })).toBe(18);
    });

    test('the level the base form was found at wins when it is higher', () => {
        expect(megaBaseFormLevel(40, { method: 'LEVEL', param: '24' })).toBe(40);
    });

    test('no pre-evolution at all means the level found is the answer', () => {
        expect(megaBaseFormLevel(0, null)).toBe(0);
        expect(megaBaseFormLevel(31, null)).toBe(31);
    });

    // The bug. `param` is an item constant, so the old `Number(param)` was NaN — and Math.max with a
    // NaN is NaN. An ITEM evolution carries the level it becomes reachable at in `minLevel`.
    test('an ITEM evolution uses its minLevel, never NaN', () => {
        const scizor = { method: 'ITEM', param: 'ITEM_THUNDER_STONE', minLevel: '52' };
        const gallade = { method: 'ITEM', param: 'ITEM_DAWN_STONE', minLevel: '25' };
        expect(megaBaseFormLevel(0, scizor)).toBe(52);
        expect(megaBaseFormLevel(0, gallade)).toBe(25);
    });

    test('a non-numeric param with no minLevel falls back to the default evolution level', () => {
        expect(megaBaseFormLevel(0, { method: 'ITEM', param: 'ITEM_METAL_COAT' })).toBe(25);
        expect(megaBaseFormLevel(0, { method: 'FRIENDSHIP', param: 'EVO_FRIENDSHIP' })).toBe(25);
    });

    test('never returns a non-finite level, whatever the evolution looks like', () => {
        const shapes = [
            null,
            {},
            { method: 'ITEM', param: 'ITEM_DAWN_STONE' },
            { method: 'ITEM', param: 'ITEM_DAWN_STONE', minLevel: 'nonsense' },
            { method: 'LEVEL', param: 'nonsense' },
            { method: 'LEVEL', param: undefined },
        ];
        for (const evolution of shapes) {
            expect(Number.isFinite(megaBaseFormLevel(0, evolution))).toBe(true);
        }
    });
});
