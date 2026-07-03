'use strict';

// TDD (T-053): BPS patch codec. The builder diffs vanilla→built into a .bps; the browser applies it
// to the user's ROM. `applyBps` must handle ALL FOUR BPS commands so it can apply optimal patches made
// by flips/beat, even though our `createBps` only emits SourceRead/TargetRead. See ADR-013.

const { createBps, applyBps, crc32, encodeNumber, decodeNumber } = require('../../bps');

const u8 = (...bytes) => Uint8Array.from(bytes);
const eq = (a, b) => Array.from(a).join(',') === Array.from(b).join(',');

// Little-endian u32 → byte array, for hand-building patch footers/fixtures.
const u32le = (n) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];

// Hand-build a BPS from an explicit action-byte stream so we can exercise commands createBps never
// emits (SourceCopy/TargetCopy). Uses the module's own encodeNumber/crc32 (independently tested below).
function buildBps(sourceLen, targetLen, actionBytes, source, target) {
    let bytes = [0x42, 0x50, 0x53, 0x31] // "BPS1"
        .concat(encodeNumber(sourceLen), encodeNumber(targetLen), encodeNumber(0), actionBytes);
    bytes = bytes.concat(u32le(crc32(Uint8Array.from(source))), u32le(crc32(Uint8Array.from(target))));
    bytes = bytes.concat(u32le(crc32(Uint8Array.from(bytes))));
    return Uint8Array.from(bytes);
}

describe('crc32', () => {
    test('matches the canonical check value for "123456789"', () => {
        expect(crc32(Uint8Array.from([...'123456789'].map((c) => c.charCodeAt(0))))).toBe(0xcbf43926);
    });
    test('empty input is 0', () => {
        expect(crc32(u8())).toBe(0);
    });
});

describe('encodeNumber / decodeNumber', () => {
    test.each([0, 1, 127, 128, 129, 255, 256, 16383, 16384, 2097151, 16 * 1024 * 1024])(
        'round-trips %i', (n) => {
            const bytes = encodeNumber(n);
            expect(decodeNumber(Uint8Array.from(bytes), 0)).toEqual({ value: n, offset: bytes.length });
        },
    );
});

describe('createBps → applyBps round-trip', () => {
    const cases = {
        'identical buffers':        [u8(1, 2, 3, 4, 5), u8(1, 2, 3, 4, 5)],
        'same length, few changes': [u8(1, 2, 3, 4, 5), u8(1, 9, 3, 8, 5)],
        'target shorter':           [u8(1, 2, 3, 4, 5, 6, 7, 8), u8(1, 2, 3)],
        'target longer':            [u8(1, 2, 3), u8(1, 2, 3, 4, 5, 6, 7, 8)],
        'empty source':             [u8(), u8(9, 8, 7)],
        'empty target':             [u8(9, 8, 7), u8()],
        'both empty':               [u8(), u8()],
        'fully different':          [u8(0, 0, 0, 0), u8(255, 254, 253, 252)],
    };
    for (const [name, [source, target]] of Object.entries(cases)) {
        test(name, () => {
            const patch = createBps(source, target);
            expect(eq(applyBps(patch, source), target)).toBe(true);
        });
    }

    test('larger pseudo-random buffers with a shared middle region', () => {
        const source = new Uint8Array(4096);
        const target = new Uint8Array(4096);
        for (let i = 0; i < 4096; i++) { source[i] = (i * 37) & 0xff; target[i] = (i * 37) & 0xff; }
        for (let i = 0; i < 1000; i++) target[i] = (i * 91 + 7) & 0xff; // diverge only in the head
        const patch = createBps(source, target);
        expect(eq(applyBps(patch, source), target)).toBe(true);
    });
});

describe('applyBps handles all four commands (flips/beat compatibility)', () => {
    test('SourceCopy reads from a relocated source offset', () => {
        const source = u8(10, 20, 30, 40, 50);
        const target = u8(30, 40, 50);
        // SourceCopy, length 3 → data=(3-1)*4+2=10 ; signed offset +2 → (2*2)|0 = 4
        const actions = [].concat(encodeNumber(10), encodeNumber(4));
        const patch = buildBps(source.length, target.length, actions, source, target);
        expect(eq(applyBps(patch, source), target)).toBe(true);
    });

    test('TargetCopy performs RLE from already-written output', () => {
        const source = u8();
        const target = u8(7, 7, 7, 7);
        // TargetRead one literal 7 → data=(1-1)*4+1=1, then the byte 7
        // TargetCopy length 3 → data=(3-1)*4+3=11 ; signed offset 0 → 0
        const actions = [].concat(encodeNumber(1), [7], encodeNumber(11), encodeNumber(0));
        const patch = buildBps(source.length, target.length, actions, source, target);
        expect(eq(applyBps(patch, source), target)).toBe(true);
    });
});

describe('applyBps validation', () => {
    test('throws on wrong source (source checksum mismatch)', () => {
        const patch = createBps(u8(1, 2, 3, 4), u8(1, 2, 9, 4));
        expect(() => applyBps(patch, u8(9, 9, 9, 9))).toThrow(/source checksum/i);
    });
    test('throws on wrong source size', () => {
        const patch = createBps(u8(1, 2, 3, 4), u8(1, 2, 9, 4));
        expect(() => applyBps(patch, u8(1, 2, 3))).toThrow(/source size/i);
    });
    test('throws on bad magic', () => {
        const patch = createBps(u8(1, 2, 3), u8(3, 2, 1));
        const corrupt = Uint8Array.from(patch);
        corrupt[0] = 0x00;
        expect(() => applyBps(corrupt, u8(1, 2, 3))).toThrow(/bps/i);
    });
});
