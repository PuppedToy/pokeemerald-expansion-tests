'use strict';

// T-005 — per-run localStorage namespace. Docs from different runs (seed / player /
// ROM) must never share browser storage; this helper derives the stable id baked into
// each generated docs file.
const { docRunNamespace } = require('../../writer');

describe('docRunNamespace', () => {
    test('combines seed, player and rom into a stable id', () => {
        expect(docRunNamespace({ seed: 42, playerIndex: 1, romIndex: 2 })).toBe('s42-p1-r2');
    });

    test('omits player when there is no playerIndex (single-ROM run)', () => {
        expect(docRunNamespace({ seed: 42, romIndex: 0 })).toBe('s42-r0');
    });

    test('seed-only run (analyze / out.html) yields a seed-scoped id', () => {
        expect(docRunNamespace({ seed: 99999 })).toBe('s99999');
    });

    test('is deterministic for the same inputs (stable across regeneration)', () => {
        const a = docRunNamespace({ seed: 7, playerIndex: 0, romIndex: 3 });
        const b = docRunNamespace({ seed: 7, playerIndex: 0, romIndex: 3 });
        expect(a).toBe(b);
    });

    test('different runs produce different ids', () => {
        const first = docRunNamespace({ seed: 1, playerIndex: 0, romIndex: 0 });
        const second = docRunNamespace({ seed: 2, playerIndex: 0, romIndex: 0 });
        const third = docRunNamespace({ seed: 1, playerIndex: 0, romIndex: 1 });
        expect(new Set([first, second, third]).size).toBe(3);
    });

    test('playerIndex 0 / romIndex 0 are kept (not dropped as falsy)', () => {
        expect(docRunNamespace({ seed: 5, playerIndex: 0, romIndex: 0 })).toBe('s5-p0-r0');
    });

    test('sanitizes characters outside [A-Za-z0-9_-] so the id is JS/string safe', () => {
        expect(docRunNamespace({ seed: 'a b%c/4' })).toBe('sabc4');
    });

    test('empty input falls back to no namespace (shared, matches legacy behavior)', () => {
        expect(docRunNamespace({})).toBe('');
        expect(docRunNamespace()).toBe('');
    });
});
