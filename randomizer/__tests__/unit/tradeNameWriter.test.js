'use strict';

// T-202 — tradeNameWriter: turns a per-ROM trade→naming map (keyed by INGAME_TRADE_*) into the C table
// rows spliced between the anchors in src/trade_nicknames.c. Names sanitized (COMPOUND_STRING, ≤12); keys
// must be INGAME_TRADE_* tokens; empty-name entries are dropped (the mon keeps its vanilla nickname).

const { buildTradeRows, applyTradeNames } = require('../../tradeNameWriter');

describe('buildTradeRows', () => {
    test('emits one sorted row per named trade with the trade constant + COMPOUND_STRING', () => {
        const rows = buildTradeRows({
            INGAME_TRADE_SEEDOT: { nickname: 'Percy', gender: null },
            INGAME_TRADE_HORSEA: { nickname: 'Ann', gender: 'F' },
        });
        expect(rows).toContain('{ INGAME_TRADE_SEEDOT, COMPOUND_STRING("Percy") },');
        expect(rows).toContain('{ INGAME_TRADE_HORSEA, COMPOUND_STRING("Ann") },');
        // sorted: HORSEA before SEEDOT
        expect(rows.indexOf('INGAME_TRADE_HORSEA')).toBeLessThan(rows.indexOf('INGAME_TRADE_SEEDOT'));
    });

    test('dirty nicknames are sanitized to [A-Za-z0-9 ]; no injection survives', () => {
        const rows = buildTradeRows({ INGAME_TRADE_MEOWTH: { nickname: '"),evil//', gender: null } });
        expect(rows).toContain('COMPOUND_STRING("evil")');
        expect(rows).not.toContain('//');
    });

    test('null / empty-name entries are dropped (kept vanilla), not emitted as blank rows', () => {
        const rows = buildTradeRows({
            INGAME_TRADE_SEEDOT: { nickname: null, gender: null },
            INGAME_TRADE_HORSEA: { nickname: '   ', gender: null },
        });
        expect(rows).not.toContain('INGAME_TRADE_SEEDOT');
        expect(rows).not.toContain('INGAME_TRADE_HORSEA');
        expect(rows).toContain('{ 0xFF, COMPOUND_STRING("") },'); // → sentinel (all dropped)
    });

    test('unsafe keys are dropped', () => {
        const rows = buildTradeRows({ INGAME_TRADE_SEEDOT: { nickname: 'X' }, 'bad key;': { nickname: 'Y' } });
        expect(rows).toContain('INGAME_TRADE_SEEDOT');
        expect(rows).not.toContain('bad key');
    });

    test('empty naming → a single non-matching sentinel row (never a zero-length array)', () => {
        expect(buildTradeRows({})).toContain('{ 0xFF, COMPOUND_STRING("") },');
    });
});

describe('applyTradeNames', () => {
    const sample = [
        'static const struct TradeNickname sTradeNicknames[] =',
        '{',
        '    // @TRADE_NICKNAMES_START',
        '    { 0xFF, COMPOUND_STRING("") },',
        '    // @TRADE_NICKNAMES_END',
        '};',
    ].join('\n');

    test('replaces the anchored block with generated rows, keeping the anchors, idempotently', () => {
        const out = applyTradeNames(sample, { INGAME_TRADE_SEEDOT: { nickname: 'Percy' } });
        expect(out).toContain('// @TRADE_NICKNAMES_START');
        expect(out).toContain('// @TRADE_NICKNAMES_END');
        expect(out).toContain('COMPOUND_STRING("Percy")');
        expect(out).not.toMatch(/\{ 0xFF, COMPOUND_STRING\(""\) \},/); // sentinel replaced
        const out2 = applyTradeNames(out, { INGAME_TRADE_HORSEA: { nickname: 'Lee' } });
        expect(out2).toContain('COMPOUND_STRING("Lee")');
        expect(out2).not.toContain('COMPOUND_STRING("Percy")');
    });
});
