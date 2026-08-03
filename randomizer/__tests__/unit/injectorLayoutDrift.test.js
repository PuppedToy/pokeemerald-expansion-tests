// T-248 / B-057 — INV-LAYOUT, the tripwire.
//
// A compiled ROM is not laid out like the base: one `const u16` value can add 4 bytes of generated code
// and move 41,382 symbols. That drift is HARMLESS for injection — we write into the base's own layout,
// read from the base's own `.map`, and the base cannot react to data that does not exist yet.
//
// What would NOT be harmless is a different drift: an injectable table whose SIZE depends on the data,
// or one that disappears. That breaks injection outright, and nothing in the current gate would notice.
// This check exists to tell the two apart.
const { compareLayout, formatLayoutDrift } = require('../../injector/layoutDrift');

// Accepts either `[romOffset, size]` tuples or ready-made symbol objects, so a test can spread an
// existing map and override one entry.
const mapOf = (symbols) => ({
    symbols: Object.fromEntries(Object.entries(symbols).map(([name, value]) => [name,
        Array.isArray(value) ? { name, romOffset: value[0], size: value[1] } : { name, ...value }])),
    get(name) { return this.symbols[name]; },
    has(name) { return Boolean(this.symbols[name]); },
});

const BASE = mapOf({
    gSpeciesInfo: [0x1000, 400],
    gItemPicks: [0x2000, 424],
    gTradeNicknames: [0x3000, 128],
    SomeFunction: [0x4000, 40],
});

describe('benign drift — everything moved, nothing changed shape', () => {
    test('a uniform shift is reported and is NOT dangerous', () => {
        const compiled = mapOf({
            gSpeciesInfo: [0x1010, 400],
            gItemPicks: [0x2010, 424],
            gTradeNicknames: [0x3010, 128],
            SomeFunction: [0x4010, 40],
        });
        const drift = compareLayout({ baseMap: BASE, compiledMap: compiled, injectable: ['gSpeciesInfo', 'gItemPicks', 'gTradeNicknames'] });

        expect(drift.moved).toBe(4);
        expect(drift.compared).toBe(4);
        expect(drift.dangerous).toEqual([]);
        expect(drift.ok).toBe(true);
    });

    test('an unmoved layout reports zero drift', () => {
        const drift = compareLayout({ baseMap: BASE, compiledMap: BASE, injectable: ['gItemPicks'] });
        expect(drift.moved).toBe(0);
        expect(drift.ok).toBe(true);
    });

    test('it names the first symbol that moved and by how much — the useful diagnostic', () => {
        const compiled = mapOf({ ...BASE.symbols, gItemPicks: { name: 'gItemPicks', romOffset: 0x2010, size: 424 } });
        const drift = compareLayout({ baseMap: BASE, compiledMap: compiled, injectable: ['gItemPicks'] });

        expect(drift.firstMoved).toEqual({ name: 'gItemPicks', from: 0x2000, to: 0x2010, delta: 16 });
    });
});

describe('dangerous drift — an injectable table changed shape', () => {
    test('an injectable table that RESIZED is dangerous: its capacity depends on the data', () => {
        const compiled = mapOf({ ...BASE.symbols, gItemPicks: { name: 'gItemPicks', romOffset: 0x2000, size: 448 } });
        const drift = compareLayout({ baseMap: BASE, compiledMap: compiled, injectable: ['gItemPicks'] });

        expect(drift.ok).toBe(false);
        expect(drift.dangerous).toEqual([{ name: 'gItemPicks', kind: 'resized', baseSize: 424, compiledSize: 448 }]);
    });

    test('an injectable table that VANISHED is dangerous (the T-234/T-237 garbage-collection trap)', () => {
        const symbols = { ...BASE.symbols };
        delete symbols.gTradeNicknames;
        const drift = compareLayout({ baseMap: BASE, compiledMap: mapOf({}), injectable: ['gTradeNicknames'] });

        expect(drift.ok).toBe(false);
        expect(drift.dangerous[0]).toMatchObject({ name: 'gTradeNicknames', kind: 'missing' });
    });

    test('a NON-injectable symbol changing size is only noise — code is allowed to grow', () => {
        // This is exactly what B-057 is: `.text` grew by 4 bytes. Nothing to act on.
        const compiled = mapOf({ ...BASE.symbols, SomeFunction: { name: 'SomeFunction', romOffset: 0x4000, size: 44 } });
        const drift = compareLayout({ baseMap: BASE, compiledMap: compiled, injectable: ['gItemPicks'] });

        expect(drift.ok).toBe(true);
        expect(drift.resizedOther).toBe(1);
    });
});

describe('the report', () => {
    test('says plainly that a moved-but-intact layout is expected', () => {
        const compiled = mapOf({
            gSpeciesInfo: [0x1010, 400], gItemPicks: [0x2010, 424], gTradeNicknames: [0x3010, 128], SomeFunction: [0x4010, 40],
        });
        const text = formatLayoutDrift(compareLayout({ baseMap: BASE, compiledMap: compiled, injectable: ['gItemPicks'] }));

        expect(text).toMatch(/4 .*moved/i);
        expect(text).toMatch(/expected|benign|B-057/i);
    });

    test('a dangerous drift is stated as a failure, naming the table', () => {
        const compiled = mapOf({ ...BASE.symbols, gItemPicks: { name: 'gItemPicks', romOffset: 0x2000, size: 448 } });
        const text = formatLayoutDrift(compareLayout({ baseMap: BASE, compiledMap: compiled, injectable: ['gItemPicks'] }));

        expect(text).toMatch(/gItemPicks/);
        expect(text).toMatch(/424.*448|448.*424/);
        expect(text).toMatch(/INV-LAYOUT/);
    });
});
