// T-238 — the write primitives every Phase-3 module (T-239…T-243) will use to put bytes into the base
// ROM. The invariant that matters: a byte only changes when a module MEANT to change it (INV-BYTES), so
// every write is bounds-checked, range-checked and journalled, and two modules writing the same byte is
// an error rather than a silent last-one-wins.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { Rom } = require('../../injector/rom');

const makeRom = (size = 0x100) => Rom.fromBuffer(Buffer.alloc(size, 0xff), { label: 'test' });

describe('Rom loading + identity (T-238)', () => {
    test('sha256 matches the underlying bytes and survives a round-trip through disk', () => {
        const buf = Buffer.alloc(64, 0xab);
        const rom = Rom.fromBuffer(buf);
        expect(rom.size).toBe(64);
        expect(rom.sha256()).toBe(crypto.createHash('sha256').update(buf).digest('hex'));

        const file = path.join(os.tmpdir(), `t238-rom-${process.pid}.gba`);
        try {
            rom.save(file);
            expect(Rom.load(file).sha256()).toBe(rom.sha256());
        } finally {
            fs.unlinkSync(file);
        }
    });

    test('fromBuffer copies — mutating the ROM never touches the caller\'s base buffer', () => {
        const base = Buffer.alloc(8, 0x00);
        const rom = Rom.fromBuffer(base);
        rom.writeU8(0, 0x42);
        expect(base[0]).toBe(0x00);
    });
});

describe('scalar read/write (T-238)', () => {
    test('u8/u16/u32 round-trip little-endian', () => {
        const rom = makeRom();
        rom.writeU8(0x10, 0x7f);
        rom.writeU16(0x20, 0x1234);
        rom.writeU32(0x30, 0xdeadbeef);
        expect(rom.readU8(0x10)).toBe(0x7f);
        expect(rom.readU16(0x20)).toBe(0x1234);
        expect(rom.readU32(0x30)).toBe(0xdeadbeef);
        expect(rom.readBytes(0x20, 2)).toEqual(Buffer.from([0x34, 0x12]));
    });

    test('writeBytes copies a whole struct/table in one go', () => {
        const rom = makeRom();
        rom.writeBytes(0x40, Buffer.from([1, 2, 3, 4]));
        expect(rom.readBytes(0x40, 4)).toEqual(Buffer.from([1, 2, 3, 4]));
    });

    test('rejects out-of-range values instead of truncating them', () => {
        const rom = makeRom();
        expect(() => rom.writeU8(0, 0x100)).toThrow(/range|0x100/i);
        expect(() => rom.writeU16(0, 0x10000)).toThrow(/range|0x10000/i);
        expect(() => rom.writeU8(0, -1)).toThrow(/range/i);
        expect(() => rom.writeU16(0, 1.5)).toThrow(/integer|range/i);
    });

    test('rejects reads and writes past the end of the ROM', () => {
        const rom = makeRom(0x10);
        expect(() => rom.writeU32(0x0e, 0)).toThrow(/bounds|outside/i);
        expect(() => rom.readU16(0x10)).toThrow(/bounds|outside/i);
        expect(() => rom.writeBytes(0x0c, Buffer.alloc(8))).toThrow(/bounds|outside/i);
        expect(() => rom.writeU8(-1, 0)).toThrow(/bounds|outside/i);
    });
});

describe('pointers (T-238)', () => {
    test('reads a GBA pointer as a ROM offset and writes one back', () => {
        const rom = makeRom();
        rom.writePointer(0x00, 0x64e1d8);
        expect(rom.readU32(0x00)).toBe(0x0864e1d8);
        expect(rom.readPointer(0x00)).toBe(0x64e1d8);
    });

    test('a word that is not a ROM pointer is an error, not a bogus offset', () => {
        const rom = makeRom();
        rom.writeU32(0x08, 0x02020000);          // an EWRAM address
        expect(() => rom.readPointer(0x08)).toThrow(/not in ROM|0x2020000/i);
    });
});

describe('bit fields (T-238)', () => {
    // gMovesInfo packs power/type/category into a word — injecting one field must not disturb its
    // neighbours, so the writer is a read-modify-write of the containing u32 (LSB-first, as GCC packs).
    test('writes a field without disturbing the rest of the word', () => {
        const rom = makeRom();                       // filled with 0xff
        rom.writeBits(0x00, 8, 4, 0b0101);
        expect(rom.readU32(0x00)).toBe(0xfffff5ff);
        expect(rom.readBits(0x00, 8, 4)).toBe(0b0101);
        expect(rom.readBits(0x00, 0, 8)).toBe(0xff);
    });

    // Ownership is tracked per BIT, not per byte: neighbouring fields legitimately share a word (that is
    // the whole point of a packed struct), but the same field written twice is still the collision the
    // journal exists to catch.
    test('two fields sharing a word are both writable; the same field twice is an overlap', () => {
        const rom = makeRom();
        rom.writeBits(0x00, 0, 8, 0x40, 'move:power');
        rom.writeBits(0x00, 8, 6, 0x0a, 'move:type');
        expect(rom.readBits(0x00, 0, 8)).toBe(0x40);
        expect(rom.readBits(0x00, 8, 6)).toBe(0x0a);
        expect(() => rom.writeBits(0x00, 4, 6, 1, 'move:power-again')).toThrow(/overlap/i);
    });

    test('a byte-level write and a bit-level write to the same byte still collide', () => {
        const rom = makeRom();
        rom.writeU8(0x04, 0x12, 'whole-byte');
        expect(() => rom.writeBits(0x04, 2, 3, 1, 'one-field')).toThrow(/whole-byte[\s\S]*one-field|overlap/i);
    });

    test('a value wider than its field is an error (silent truncation would corrupt the neighbour)', () => {
        const rom = makeRom();
        expect(() => rom.writeBits(0x00, 8, 4, 0b10000)).toThrow(/range|4 bits/i);
        expect(() => rom.writeBits(0x00, 30, 4, 1)).toThrow(/32|width|field/i);
    });
});

describe('the write journal (T-238)', () => {
    test('records every write with its tag', () => {
        const rom = makeRom();
        rom.writeU16(0x10, 1, 'species:1.baseHp');
        rom.writeBytes(0x20, Buffer.alloc(4), 'learnset:sBulbasaur');
        expect(rom.journal).toEqual([
            { offset: 0x10, length: 2, tag: 'species:1.baseHp' },
            { offset: 0x20, length: 4, tag: 'learnset:sBulbasaur' },
        ]);
        expect(rom.bytesWritten).toBe(6);
    });

    test('two modules writing the same byte is an error naming both tags', () => {
        const rom = makeRom();
        rom.writeU32(0x40, 0, 'moduleA');
        expect(() => rom.writeU16(0x42, 0, 'moduleB')).toThrow(/moduleA[\s\S]*moduleB|overlap/i);
    });

    test('an overwrite can be opted into explicitly (a module rewriting its own slot)', () => {
        const rom = makeRom();
        rom.writeU32(0x40, 0, 'moduleA');
        expect(() => rom.writeU32(0x40, 1, 'moduleA', { allowOverwrite: true })).not.toThrow();
        expect(rom.readU32(0x40)).toBe(1);
    });

    test('writing a byte back to the value it already had still counts as a write', () => {
        // Byte-parity is judged on the whole ROM, not on the journal — but the journal must not lie.
        const rom = makeRom();
        rom.writeU8(0x50, 0xff, 'noop');
        expect(rom.bytesWritten).toBe(1);
        expect(rom.sha256()).toBe(Rom.fromBuffer(Buffer.alloc(0x100, 0xff)).sha256());
    });
});
