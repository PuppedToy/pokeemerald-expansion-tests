// T-238 — free-space allocator + repointer: the B2 fallback of the injection strategy.
// After T-237 every table the randomizer rewrites is B1 (fixed capacity, overwritten in place), so
// NOTHING should need this in Phase 3 — but a table that outgrows its capacity later needs a repoint,
// and repointing without an allocator is how ROM hacks corrupt themselves. Using it breaks byte-parity
// with `compile()` by design (the compiler would have laid the data out elsewhere), so it is opt-in and
// never reached by the default path.
const { Rom } = require('../../injector/rom');
const { FreeSpaceArena, findFreeRuns, repoint } = require('../../injector/freeSpace');

// A 0x80-byte "ROM": data up front, a padding tail from 0x40.
function makeRom() {
    const buf = Buffer.alloc(0x80, 0x00);
    buf.fill(0xff, 0x40);
    return Rom.fromBuffer(buf);
}

describe('findFreeRuns (T-238)', () => {
    test('finds the padding runs of the fill byte, longest-first metadata intact', () => {
        const rom = makeRom();
        const runs = findFreeRuns(rom, { fillByte: 0xff, minLength: 0x10 });
        expect(runs).toEqual([{ offset: 0x40, length: 0x40 }]);
    });

    test('ignores runs shorter than minLength and stays inside the search window', () => {
        const rom = makeRom();
        rom.writeBytes(0x10, Buffer.alloc(4, 0xff), 'noise');
        expect(findFreeRuns(rom, { fillByte: 0xff, minLength: 0x08 })).toEqual([{ offset: 0x40, length: 0x40 }]);
        expect(findFreeRuns(rom, { fillByte: 0xff, minLength: 4, to: 0x40 })).toEqual([{ offset: 0x10, length: 4 }]);
    });
});

describe('FreeSpaceArena (T-238)', () => {
    test('allocates sequentially, 4-byte aligned, and tracks what is left', () => {
        const rom = makeRom();
        const arena = new FreeSpaceArena(rom, { start: 0x40, end: 0x80 });
        expect(arena.remaining).toBe(0x40);

        expect(arena.allocate(6, 'a')).toBe(0x40);
        expect(arena.allocate(4, 'b')).toBe(0x48);      // 6 rounded up to 8
        expect(arena.remaining).toBe(0x80 - 0x4c);
    });

    test('refuses to hand out space that is not actually free', () => {
        const rom = makeRom();
        rom.writeU8(0x50, 0x01, 'live-data');            // something real inside the arena
        const arena = new FreeSpaceArena(rom, { start: 0x40, end: 0x80 });
        expect(() => arena.allocate(0x20, 'greedy')).toThrow(/not free|0x50/i);
    });

    test('exhaustion throws naming the request and what was left', () => {
        const rom = makeRom();
        const arena = new FreeSpaceArena(rom, { start: 0x40, end: 0x80 });
        arena.allocate(0x30, 'a');
        expect(() => arena.allocate(0x20, 'b')).toThrow(/0x20[\s\S]*0x10|exhaust/i);
    });

    test('the arena bounds must be explicit — never a silent "grow the ROM"', () => {
        const rom = makeRom();
        expect(() => new FreeSpaceArena(rom, {})).toThrow(/start|end|bounds/i);
        expect(() => new FreeSpaceArena(rom, { start: 0x40, end: 0x100 })).toThrow(/bounds|outside/i);
    });

    test('write() puts the payload in the ROM and returns where it landed', () => {
        const rom = makeRom();
        const arena = new FreeSpaceArena(rom, { start: 0x40, end: 0x80 });
        const at = arena.write(Buffer.from([1, 2, 3]), 'payload');
        expect(at).toBe(0x40);
        expect(rom.readBytes(0x40, 3)).toEqual(Buffer.from([1, 2, 3]));
        expect(rom.journal.at(-1)).toEqual({ offset: 0x40, length: 3, tag: 'payload' });
    });
});

describe('repoint (T-238)', () => {
    test('writes the payload into free space and rewrites the owning pointer', () => {
        const rom = makeRom();
        rom.writePointer(0x00, 0x20, 'old-pointer');     // struct field pointing at the old array
        const arena = new FreeSpaceArena(rom, { start: 0x40, end: 0x80 });

        const at = repoint(rom, {
            pointerOffset: 0x00,
            data: Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]),
            arena,
            tag: 'learnset:sBulbasaur',
            allowOverwrite: true,                        // the pointer word was already written above
        });

        expect(at).toBe(0x40);
        expect(rom.readPointer(0x00)).toBe(0x40);
        expect(rom.readBytes(0x40, 4)).toEqual(Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]));
    });

    test('a repoint that does not fit fails before touching the pointer', () => {
        const rom = makeRom();
        rom.writePointer(0x00, 0x20, 'old-pointer');
        const arena = new FreeSpaceArena(rom, { start: 0x40, end: 0x50 });
        expect(() => repoint(rom, { pointerOffset: 0x00, data: Buffer.alloc(0x20), arena, tag: 'big', allowOverwrite: true }))
            .toThrow(/0x20|exhaust/i);
        expect(rom.readPointer(0x00)).toBe(0x20);        // untouched
    });
});
