// T-238 — INV-BYTES tooling: when `inject(base, bundle)` and `compile(bundle)` disagree, "the hashes
// differ" is useless. These helpers say WHICH bytes differ and WHICH SYMBOL owns them, which is how a
// T-239…T-243 module gets debugged.
const fs = require('fs');
const path = require('path');
const { diffRegions, attributeDiff, formatDiff } = require('../../injector/parity');
const { compareRoms } = require('../../injector/verifyParity');
const { parseMapFile } = require('../../injector/symbolMap');

const mapText = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'mini.map'), 'utf8');

describe('diffRegions (T-238)', () => {
    test('identical buffers have no differences', () => {
        expect(diffRegions(Buffer.alloc(16, 7), Buffer.alloc(16, 7))).toEqual([]);
    });

    test('reports each differing run as an offset + length', () => {
        const a = Buffer.alloc(16, 0);
        const b = Buffer.alloc(16, 0);
        b[3] = 1; b[4] = 1; b[10] = 1;
        expect(diffRegions(a, b)).toEqual([
            { offset: 3, length: 2 },
            { offset: 10, length: 1 },
        ]);
    });

    test('merges runs separated by less than the gap tolerance (one struct, not twenty fields)', () => {
        const a = Buffer.alloc(32, 0);
        const b = Buffer.alloc(32, 0);
        b[4] = 1; b[8] = 1;
        expect(diffRegions(a, b, { mergeGap: 8 })).toEqual([{ offset: 4, length: 5 }]);
    });

    test('a size mismatch is reported, not silently ignored (a repoint that grew the ROM)', () => {
        const regions = diffRegions(Buffer.alloc(8, 0), Buffer.alloc(12, 0));
        expect(regions).toEqual([{ offset: 8, length: 4, sizeMismatch: true }]);
    });

    test('stops collecting after maxRegions so a totally wrong ROM does not print 2 million lines', () => {
        const a = Buffer.alloc(1000, 0);
        const b = Buffer.alloc(1000, 0xff);
        const regions = diffRegions(a, b, { maxRegions: 1, mergeGap: 0 });
        expect(regions).toHaveLength(1);
        expect(regions.truncated).toBe(true);
    });
});

describe('attributeDiff (T-238)', () => {
    const map = parseMapFile(mapText);

    test('names the symbol that owns each differing region', () => {
        const at = attributeDiff(map, [{ offset: 0x60a998 + 4, length: 2 }]);
        expect(at[0].symbol).toBe('gItemsInfo');
        expect(at[0].delta).toBe(4);                         // bytes into the symbol
    });

    test('a region in nobody\'s symbol is reported as unattributed rather than guessed', () => {
        const at = attributeDiff(map, [{ offset: 0x10, length: 1 }]);
        expect(at[0].symbol).toBeNull();
    });

    test('formatDiff renders one readable line per region', () => {
        const text = formatDiff(attributeDiff(map, [{ offset: 0xd2fb14, length: 8 }]));
        expect(text).toMatch(/0xd2fb14/);
        expect(text).toMatch(/gIngameTrades/);
        expect(text).toMatch(/8 bytes/);
    });
});

describe('compareRoms — the INV-BYTES gate (T-238)', () => {
    const map = parseMapFile(mapText);

    test('two identical ROMs pass', () => {
        const rom = Buffer.alloc(0x100, 0x11);
        expect(compareRoms({ a: rom, b: Buffer.from(rom) })).toMatchObject({ identical: true, regions: [] });
    });

    test('a differing ROM fails and points at the owning symbol', () => {
        const a = Buffer.alloc(0x700000, 0);
        const b = Buffer.from(a);
        b[0x60a99c] = 0xff;
        const result = compareRoms({ a, b, offsetMap: map });
        expect(result.identical).toBe(false);
        expect(result.regions[0]).toMatchObject({ offset: 0x60a99c, symbol: 'gItemsInfo' });
    });
});
