'use strict';

// T-202 — tradeNameWriter: turns a per-ROM trade→naming map (keyed by INGAME_TRADE_*) into the C table
// rows spliced between the anchors in src/trade_nicknames.c. Names sanitized (≤12); keys must be
// INGAME_TRADE_* tokens; empty-name entries are dropped (the mon keeps its vanilla nickname).
//
// T-237 (deliberate spec change): the table is fixed-capacity and exported so the injector can overwrite
// it in place, so rows store the name INLINE with `_("…")` instead of a COMPOUND_STRING pointer, and the
// sentinel row is replaced by a writer-filled count (gTradeNicknameCount) — trade id 0 is a real trade,
// so trailing zero-filled rows cannot be told apart from data without it.

const { buildTradeRows, applyTradeNames } = require('../../tradeNameWriter');
const { TRADE_NICKNAME_CAPACITY } = require('../../layout');

describe('buildTradeRows', () => {
    test('emits one sorted row per named trade with the trade constant + inline name', () => {
        const rows = buildTradeRows({
            INGAME_TRADE_RUSTBORO: { nickname: 'Percy', gender: null },
            INGAME_TRADE_SLATEPORT: { nickname: 'Ann', gender: 'F' },
        });
        expect(rows).toContain('{ INGAME_TRADE_RUSTBORO, _("Percy") },');
        expect(rows).toContain('{ INGAME_TRADE_SLATEPORT, _("Ann") },');
        // sorted by key, not by insertion order: RUSTBORO before SLATEPORT
        expect(rows.indexOf('INGAME_TRADE_RUSTBORO')).toBeLessThan(rows.indexOf('INGAME_TRADE_SLATEPORT'));
        expect(rows).not.toContain('COMPOUND_STRING');
    });

    test('dirty nicknames are sanitized to [A-Za-z0-9 ]; no injection survives', () => {
        const rows = buildTradeRows({ INGAME_TRADE_MAUVILLE: { nickname: '"),evil//', gender: null } });
        expect(rows).toContain('_("evil")');
        expect(rows).not.toContain('//');
    });

    test('null / empty-name entries are dropped (kept vanilla), not emitted as blank rows', () => {
        const rows = buildTradeRows({
            INGAME_TRADE_RUSTBORO: { nickname: null, gender: null },
            INGAME_TRADE_SLATEPORT: { nickname: '   ', gender: null },
        });
        expect(rows).toBe('');
    });

    test('unsafe keys are dropped', () => {
        const rows = buildTradeRows({ INGAME_TRADE_RUSTBORO: { nickname: 'X' }, 'bad key;': { nickname: 'Y' } });
        expect(rows).toContain('INGAME_TRADE_RUSTBORO');
        expect(rows).not.toContain('bad key');
    });

    test('empty naming → no rows (the array is sized by its capacity, not its contents)', () => {
        expect(buildTradeRows({})).toBe('');
    });
});

describe('applyTradeNames', () => {
    const sample = [
        'const u8 gTradeNicknameCount =',
        '    // @TRADE_NICKNAMES_COUNT_START',
        '    0',
        '    // @TRADE_NICKNAMES_COUNT_END',
        '    ;',
        '',
        'const struct TradeNickname gTradeNicknames[TRADE_NICKNAME_CAPACITY] =',
        '{',
        '    // @TRADE_NICKNAMES_START',
        '    // @TRADE_NICKNAMES_END',
        '};',
    ].join('\n');

    test('replaces the anchored block with generated rows, keeping the anchors, idempotently', () => {
        const out = applyTradeNames(sample, { INGAME_TRADE_RUSTBORO: { nickname: 'Percy' } });
        expect(out).toContain('// @TRADE_NICKNAMES_START');
        expect(out).toContain('// @TRADE_NICKNAMES_END');
        expect(out).toContain('_("Percy")');
        const out2 = applyTradeNames(out, { INGAME_TRADE_SLATEPORT: { nickname: 'Lee' } });
        expect(out2).toContain('_("Lee")');
        expect(out2).not.toContain('_("Percy")');
    });

    test('writes the row count alongside the rows so the two can never disagree', () => {
        const out = applyTradeNames(sample, {
            INGAME_TRADE_RUSTBORO: { nickname: 'Percy' },
            INGAME_TRADE_SLATEPORT: { nickname: 'Lee' },
            INGAME_TRADE_MAUVILLE: { nickname: '' },       // dropped → not counted
        });
        expect(out).toMatch(/@TRADE_NICKNAMES_COUNT_START\n\s*2\n\s*\/\/ @TRADE_NICKNAMES_COUNT_END/);
        expect(applyTradeNames(out, {})).toMatch(/@TRADE_NICKNAMES_COUNT_START\n\s*0\n/);
    });

    test('throws rather than overflowing the fixed capacity', () => {
        const naming = {};
        for (let i = 0; i <= TRADE_NICKNAME_CAPACITY; i++) naming[`INGAME_TRADE_FILLER${i}`] = { nickname: 'X' };
        expect(() => applyTradeNames(sample, naming)).toThrow(/TRADE_NICKNAME_CAPACITY/);
    });
});
