'use strict';

// T-194 — tradeWriter renders the per-ROM gIngameTrades[] block (offered species + gym-cap level +
// accepted set + base forms) and patches it into src/data/trade.h, leaving the rest of the file intact.
//
// T-237 (deliberate spec change): the table is exported and fixed-width. The accepted set and base forms
// were per-run `static const u16 sTradeAccepted_*/sTradeBase_*[]` arrays referenced by pointer — neither
// locatable in the base build's `.map` nor safe to resize; they are inline
// `u16 [TRADE_SPECIES_LIST_CAPACITY]` fields now, so the block is one flat, in-place-overwritable table.

const { renderTradeData, applyTradesToContent, renderEntry } = require('../../tradeWriter');
const { TRADE_SPECIES_LIST_CAPACITY } = require('../../layout');

const TRADES = [
    { town: 'RUSTBORO', ingameTradeId: 'INGAME_TRADE_RUSTBORO', tier: 'RU', level: 13,
      routeMapId: 'MAP_ROUTE101', offeredSpecies: 'SPECIES_PINCURCHIN',
      acceptedSpecies: ['SPECIES_RATTATA', 'SPECIES_RATICATE'], acceptedBaseForms: ['SPECIES_RATTATA'] },
    { town: 'LAVARIDGE', ingameTradeId: 'INGAME_TRADE_SLATEPORT', tier: 'UU', level: 36,
      routeMapId: 'MAP_ROUTE102', offeredSpecies: 'SPECIES_LILLIGANT',
      acceptedSpecies: ['SPECIES_WURMPLE', 'SPECIES_SILCOON', 'SPECIES_BEAUTIFLY', 'SPECIES_CASCOON', 'SPECIES_DUSTOX', 'SPECIES_WINGULL', 'SPECIES_PELIPPER'],
      acceptedBaseForms: ['SPECIES_WURMPLE', 'SPECIES_WINGULL'] },
];

describe('renderEntry', () => {
    const entry = renderEntry(TRADES[0]);
    test('uses a designated initializer keyed by the trade id', () => {
        expect(entry).toContain('[INGAME_TRADE_RUSTBORO] =');
    });
    test('sets the offered species, gym-cap level and empty nickname', () => {
        expect(entry).toContain('.species = SPECIES_PINCURCHIN,');
        expect(entry).toContain('.level = 13,');
        expect(entry).toContain('.nickname = _(""),');
        expect(entry).toContain('.heldItem = ITEM_NONE,');
    });
    test('inlines the accepted set and base forms with matching counts', () => {
        expect(entry).toContain('.requestedSpeciesList = { SPECIES_RATTATA, SPECIES_RATICATE },');
        expect(entry).toContain('.requestedSpeciesCount = 2,');
        expect(entry).toContain('.requestedBaseForms = { SPECIES_RATTATA },');
        expect(entry).toContain('.requestedBaseFormCount = 1,');
        expect(entry).toContain('.requestedSpecies = SPECIES_RATTATA,'); // vanilla-fallback = first base form
        expect(entry).not.toContain('sTradeAccepted_');                  // no side arrays any more
        expect(entry).not.toContain('sTradeBase_');
    });
    test('throws rather than overflowing a species list', () => {
        const tooMany = Array.from({ length: TRADE_SPECIES_LIST_CAPACITY + 1 }, (_, i) => `SPECIES_X${i}`);
        expect(() => renderEntry({ ...TRADES[0], acceptedSpecies: tooMany }))
            .toThrow(/TRADE_SPECIES_LIST_CAPACITY/);
    });
});

describe('renderTradeData', () => {
    const out = renderTradeData(TRADES);
    test('emits the exported, explicitly sized table with one entry per trade', () => {
        expect(out).toContain('const struct InGameTrade gIngameTrades[INGAME_TRADES_COUNT] =');
        expect(out).not.toContain('static const struct InGameTrade');
        expect(out).toContain('[INGAME_TRADE_RUSTBORO] =');
        expect(out).toContain('[INGAME_TRADE_SLATEPORT] =');
    });
    test('declares no per-trade lookup arrays', () => {
        expect(out).not.toContain('static const u16 sTrade');
    });
});

describe('applyTradesToContent', () => {
    // A minimal trade.h skeleton: a gIngameTrades[] block (indented entry close) + a trailing array to
    // prove only the target block is replaced.
    const CONTENT = [
        'const struct InGameTrade gIngameTrades[INGAME_TRADES_COUNT] =',
        '{',
        '    [INGAME_TRADE_RUSTBORO] =',
        '    {',
        '        .nickname = _("DOTS"),',
        '        .species = SPECIES_SEEDOT,',
        '    },',
        '};',
        '',
        'static const u16 sIngameTradeMail[][MAIL_WORDS_COUNT + 1] =',
        '{',
        '    { EC_WORD_BE },',
        '};',
        '',
    ].join('\n');

    test('replaces only the gIngameTrades[] block, preserving the rest', () => {
        const out = applyTradesToContent(CONTENT, TRADES);
        expect(out).toContain('.species = SPECIES_PINCURCHIN,');       // new data in
        expect(out).not.toContain('.nickname = _("DOTS"),');          // vanilla entry gone
        expect(out).not.toContain('.species = SPECIES_SEEDOT,');
        expect(out).toContain('static const u16 sIngameTradeMail[][MAIL_WORDS_COUNT + 1] ='); // untouched
        expect(out).toContain('    { EC_WORD_BE },');
    });

    test('throws when the block is missing (guards against silent no-op)', () => {
        expect(() => applyTradesToContent('no trades here', TRADES)).toThrow(/gIngameTrades/);
    });

    test('no trades → content unchanged', () => {
        expect(applyTradesToContent(CONTENT, [])).toBe(CONTENT);
    });
});
