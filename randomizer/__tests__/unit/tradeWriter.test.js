'use strict';

// T-194 — tradeWriter renders the per-ROM sIngameTrades[] block (offered species + gym-cap level +
// accepted set + base forms) and patches it into src/data/trade.h, leaving the rest of the file intact.

const { renderTradeData, applyTradesToContent, renderEntry } = require('../../tradeWriter');

const TRADES = [
    { town: 'RUSTBORO', ingameTradeId: 'INGAME_TRADE_SEEDOT', tier: 'RU', level: 13,
      routeMapId: 'MAP_ROUTE101', offeredSpecies: 'SPECIES_PINCURCHIN',
      acceptedSpecies: ['SPECIES_RATTATA', 'SPECIES_RATICATE'], acceptedBaseForms: ['SPECIES_RATTATA'] },
    { town: 'LAVARIDGE', ingameTradeId: 'INGAME_TRADE_HORSEA', tier: 'UU', level: 36,
      routeMapId: 'MAP_ROUTE102', offeredSpecies: 'SPECIES_LILLIGANT',
      acceptedSpecies: ['SPECIES_WURMPLE', 'SPECIES_SILCOON', 'SPECIES_BEAUTIFLY', 'SPECIES_CASCOON', 'SPECIES_DUSTOX', 'SPECIES_WINGULL', 'SPECIES_PELIPPER'],
      acceptedBaseForms: ['SPECIES_WURMPLE', 'SPECIES_WINGULL'] },
];

describe('renderEntry', () => {
    const entry = renderEntry(TRADES[0]);
    test('uses a designated initializer keyed by the trade id', () => {
        expect(entry).toContain('[INGAME_TRADE_SEEDOT] =');
    });
    test('sets the offered species, gym-cap level and empty nickname', () => {
        expect(entry).toContain('.species = SPECIES_PINCURCHIN,');
        expect(entry).toContain('.level = 13,');
        expect(entry).toContain('.nickname = _(""),');
        expect(entry).toContain('.heldItem = ITEM_NONE,');
    });
    test('wires the accepted-set and base-form arrays with matching counts', () => {
        expect(entry).toContain('.requestedSpeciesList = sTradeAccepted_INGAME_TRADE_SEEDOT,');
        expect(entry).toContain('.requestedSpeciesCount = 2,');
        expect(entry).toContain('.requestedBaseForms = sTradeBase_INGAME_TRADE_SEEDOT,');
        expect(entry).toContain('.requestedBaseFormCount = 1,');
        expect(entry).toContain('.requestedSpecies = SPECIES_RATTATA,'); // vanilla-fallback = first base form
    });
});

describe('renderTradeData', () => {
    const out = renderTradeData(TRADES);
    test('declares the lookup arrays before the sIngameTrades[] block', () => {
        expect(out).toContain('static const u16 sTradeAccepted_INGAME_TRADE_SEEDOT[] = { SPECIES_RATTATA, SPECIES_RATICATE };');
        expect(out).toContain('static const u16 sTradeBase_INGAME_TRADE_HORSEA[] = { SPECIES_WURMPLE, SPECIES_WINGULL };');
        expect(out.indexOf('sTradeAccepted_INGAME_TRADE_SEEDOT[]')).toBeLessThan(out.indexOf('static const struct InGameTrade sIngameTrades[]'));
    });
    test('emits one entry per trade', () => {
        expect(out).toContain('[INGAME_TRADE_SEEDOT] =');
        expect(out).toContain('[INGAME_TRADE_HORSEA] =');
    });
});

describe('applyTradesToContent', () => {
    // A minimal trade.h skeleton: an sIngameTrades[] block (indented entry close) + a trailing array to
    // prove only the target block is replaced.
    const CONTENT = [
        'static const struct InGameTrade sIngameTrades[] =',
        '{',
        '    [INGAME_TRADE_SEEDOT] =',
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

    test('replaces only the sIngameTrades[] block, preserving the rest', () => {
        const out = applyTradesToContent(CONTENT, TRADES);
        expect(out).toContain('.species = SPECIES_PINCURCHIN,');       // new data in
        expect(out).not.toContain('.nickname = _("DOTS"),');          // vanilla entry gone
        expect(out).not.toContain('.species = SPECIES_SEEDOT,');
        expect(out).toContain('static const u16 sIngameTradeMail[][MAIL_WORDS_COUNT + 1] ='); // untouched
        expect(out).toContain('    { EC_WORD_BE },');
    });

    test('throws when the block is missing (guards against silent no-op)', () => {
        expect(() => applyTradesToContent('no trades here', TRADES)).toThrow(/sIngameTrades/);
    });

    test('no trades → content unchanged', () => {
        expect(applyTradesToContent(CONTENT, [])).toBe(CONTENT);
    });
});
