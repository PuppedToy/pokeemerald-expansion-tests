'use strict';

// T-234 / T-237 — every injectable value must be read through an `noipa` accessor.
//
// The tables and scalars the injector rewrites are `const` objects with committed initializers, and
// -O2 + LTO propagates those initializers straight into the callers (T-234 verified this happens even
// for `const volatile`). Two things then go wrong at once: the injected bytes are ignored because the
// read was folded away, and — when the folded value makes a loop dead — the whole table is
// garbage-collected out of the ROM, so there is no symbol left to inject into.
//
// That is not hypothetical: gLocationNicknames and gTradeNicknames were BOTH missing from the build
// box's .map on the first T-237 compile, because their committed count is 0. `noipa` on the accessor is
// the fix; this test keeps it from being quietly dropped by a later edit.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');

// [file, function name] — the definition must carry the attribute, the same shape T-234 established.
const GUARDED = [
    ['src/randomizer_settings.c', 'GetRandomizerSettings'],
    ['src/location_nicknames.c', 'GetLocationNicknameCount'],
    ['src/trade_nicknames.c', 'GetTradeNicknameCount'],
    ['src/starter_choose.c', 'GetStarterPokemon'],
    ['src/starter_choose.c', 'GetExtraPokemonCount'],
    ['src/starter_choose.c', 'GetExtraPokemon'],
    ['src/starter_choose.c', 'GetStarterNickname'],
    ['src/starter_choose.c', 'GetStarterGender'],
    ['src/starter_choose.c', 'GetExtraStarterNickname'],
    ['src/starter_choose.c', 'GetExtraStarterGender'],
];

describe('injectable values are read through noipa accessors (T-234, T-237)', () => {
    test.each(GUARDED)('%s: %s', (file, fn) => {
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        // the attribute line must sit directly above the definition (comments in between are fine)
        const definition = new RegExp(
            `__attribute__\\(\\(noinline, noipa\\)\\)\\s*(?://[^\\n]*\\n\\s*)*[\\w \\*]+\\b${fn}\\s*\\(`);
        expect(source).toMatch(definition);
    });

    // The nickname lookups must go through the accessor, not read the count directly — a direct read is
    // exactly what folds the loop away.
    test.each([
        ['src/location_nicknames.c', 'gLocationNicknameCount', 'GetLocationNicknameCount'],
        ['src/trade_nicknames.c', 'gTradeNicknameCount', 'GetTradeNicknameCount'],
    ])('%s reads the count via the accessor', (file, variable, accessor) => {
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        const body = source.slice(source.indexOf(`${accessor}(void)`) + 1);
        // after the accessor's own definition, the raw variable must not be referenced again
        expect(body.split(`${accessor}(`).slice(2).join('')).not.toContain(variable);
        expect(source).toContain(`${accessor}()`);
    });
});
