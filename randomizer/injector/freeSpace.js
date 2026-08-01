'use strict';

/**
 * freeSpace.js — free-space scanning, allocation and repointing (T-238). The **B2 fallback** of the
 * injection strategy (docs/base-plus-injection-strategy.md, Group B).
 *
 * After T-237 every table the randomizer rewrites has a fixed capacity in the base and is overwritten
 * in place (B1), so the default Phase-3 path never allocates a byte here. This exists for the day a
 * payload outgrows its slot: a repoint done by hand — pick an address, hope it is free, patch a pointer
 * — is the classic way a ROM hack corrupts itself, so the primitive is written once, guarded, and
 * tested.
 *
 * ⚠ Using it breaks INV-BYTES against `compile()` by construction: the compiler would have laid the
 * data out somewhere else. A module that repoints can no longer be verified by hash equality; say so in
 * its task before reaching for this.
 */

/**
 * Runs of `fillByte` at least `minLength` long inside [from, to) — the candidate arenas in a ROM.
 */
function findFreeRuns(rom, { fillByte = 0xff, minLength = 4, from = 0, to = null } = {}) {
    const end = to === null ? rom.size : to;
    const runs = [];
    let start = -1;
    for (let i = from; i <= end; i++) {
        const isFill = i < end && rom.buffer[i] === fillByte;
        if (isFill && start === -1) start = i;
        if (!isFill && start !== -1) {
            if (i - start >= minLength) runs.push({ offset: start, length: i - start });
            start = -1;
        }
    }
    return runs;
}

/**
 * A bump allocator over an explicitly-bounded free region. Bounds are never inferred: an allocator
 * that silently grows the ROM (or wanders past the region it was given) is the failure mode this class
 * exists to prevent.
 */
class FreeSpaceArena {
    constructor(rom, { start, end, align = 4, fillByte = 0xff, verifyFree = true } = {}) {
        if (!Number.isInteger(start) || !Number.isInteger(end)) {
            throw new Error('FreeSpaceArena needs explicit { start, end } bounds — it must never guess where free space is');
        }
        if (start < 0 || end > rom.size || end <= start) {
            throw new Error(`Arena 0x${start.toString(16)}..0x${end.toString(16)} is outside the ROM bounds (0..0x${rom.size.toString(16)})`);
        }
        this.rom = rom;
        this.start = start;
        this.end = end;
        this.align = align;
        this.fillByte = fillByte;
        this.verifyFree = verifyFree;
        this.cursor = start;
    }

    get used() { return this.cursor - this.start; }

    get remaining() { return this.end - this.cursor; }

    /** Reserve `size` aligned bytes and return the offset. Throws rather than overflowing the arena. */
    allocate(size, tag = null) {
        if (!Number.isInteger(size) || size <= 0) throw new Error(`Cannot allocate ${size} bytes`);
        const at = Math.ceil(this.cursor / this.align) * this.align;
        if (at + size > this.end) {
            throw new Error(
                `Free-space arena exhausted: '${tag ?? 'allocation'}' wants 0x${size.toString(16)} bytes, ` +
                `0x${Math.max(0, this.end - at).toString(16)} left of 0x${(this.end - this.start).toString(16)}`);
        }
        if (this.verifyFree) {
            for (let i = at; i < at + size; i++) {
                if (this.rom.buffer[i] !== this.fillByte) {
                    throw new Error(
                        `Refusing to allocate 0x${at.toString(16)}..0x${(at + size).toString(16)} for ` +
                        `'${tag ?? 'allocation'}': 0x${i.toString(16)} is not free ` +
                        `(0x${this.rom.buffer[i].toString(16)}, expected 0x${this.fillByte.toString(16)})`);
                }
            }
        }
        this.cursor = at + size;
        return at;
    }

    /** Allocate and write in one step; returns where the payload landed. */
    write(bytes, tag = null) {
        const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
        const at = this.allocate(buf.length, tag);
        this.rom.writeBytes(at, buf, tag);
        return at;
    }
}

/**
 * Classic repoint: park `data` in the arena, then point the owning struct field at it. The allocation
 * happens first, so a payload that does not fit fails with the pointer still intact.
 */
function repoint(rom, { pointerOffset, data, arena, tag = null, allowOverwrite = false }) {
    const at = arena.write(data, tag);
    rom.writePointer(pointerOffset, at, tag ? `${tag}:pointer` : null, { allowOverwrite });
    return at;
}

module.exports = { FreeSpaceArena, findFreeRuns, repoint };
