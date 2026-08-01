'use strict';

/**
 * rom.js — the write primitives of the injector (T-238).
 *
 * A `Rom` wraps a copy of the base ROM's bytes and offers bounds-checked, range-checked,
 * **journalled** writes. The journal exists because of INV-BYTES: `inject(base, bundle)` must equal
 * `compile(bundle)` byte-for-byte, so a byte that changes without a module meaning to change it is a
 * bug. Two modules writing the same byte therefore throws (naming both tags) instead of last-one-wins.
 *
 * Everything is little-endian; bit fields are packed LSB-first inside their storage word, the way GCC
 * packs them for ARM — that is how `gMovesInfo`'s power/type/category share a word.
 */

const fs = require('fs');
const crypto = require('crypto');
const { toRomOffset, toGbaPointer } = require('./symbolMap');

class Rom {
    constructor(buffer, { label = null, trackWrites = true } = {}) {
        this.buffer = buffer;
        this.label = label;
        this.journal = [];
        this.bytesWritten = 0;
        this._trackWrites = trackWrites;
        // Lazily-allocated ownership map: one byte per ROM byte, holding the MASK of bits already
        // claimed. Bit granularity, because packed fields (gMovesInfo) legitimately share a word —
        // the owning tag is recovered from the journal in the error path, so this stays 1 byte/byte.
        this._claimed = null;
    }

    static fromBuffer(buffer, opts = {}) {
        if (!Buffer.isBuffer(buffer)) throw new Error('Rom.fromBuffer expects a Buffer');
        return new Rom(Buffer.from(buffer), opts);   // copy: the base buffer stays pristine
    }

    static load(filePath, opts = {}) {
        if (!fs.existsSync(filePath)) throw new Error(`Base ROM not found: ${filePath}`);
        return new Rom(fs.readFileSync(filePath), { label: filePath, ...opts });
    }

    get size() { return this.buffer.length; }

    sha256() { return crypto.createHash('sha256').update(this.buffer).digest('hex'); }

    /** A copy of the bytes — callers can never mutate the ROM behind its journal's back. */
    toBuffer() { return Buffer.from(this.buffer); }

    save(filePath) { fs.writeFileSync(filePath, this.buffer); return filePath; }

    // ── Bounds / range guards ────────────────────────────────────────────────

    _checkBounds(offset, length) {
        if (!Number.isInteger(offset) || offset < 0 || offset + length > this.buffer.length) {
            throw new Error(
                `Offset 0x${Number(offset).toString(16)}+${length} is outside the ROM (0..0x${(this.buffer.length - 1).toString(16)})`);
        }
    }

    static _checkValue(value, bits) {
        const max = bits === 32 ? 0xffffffff : (1 << bits) - 1;
        if (!Number.isInteger(value) || value < 0 || value > max) {
            throw new Error(`Value ${value} out of range for u${bits} (0..0x${max.toString(16)})`);
        }
    }

    // ── Reads ────────────────────────────────────────────────────────────────

    readU8(offset)  { this._checkBounds(offset, 1); return this.buffer.readUInt8(offset); }
    readU16(offset) { this._checkBounds(offset, 2); return this.buffer.readUInt16LE(offset); }
    readU32(offset) { this._checkBounds(offset, 4); return this.buffer.readUInt32LE(offset) >>> 0; }

    readBytes(offset, length) {
        this._checkBounds(offset, length);
        return Buffer.from(this.buffer.subarray(offset, offset + length));
    }

    /** Read a GBA pointer stored at `offset` and return it as a ROM offset. */
    readPointer(offset) { return toRomOffset(this.readU32(offset)); }

    /** Read `length` bits starting `bitOffset` bits into the u32 at `offset` (LSB-first). */
    readBits(offset, bitOffset, bitLength) {
        Rom._checkField(bitOffset, bitLength);
        const word = this.readU32(offset);
        const mask = bitLength === 32 ? 0xffffffff : ((1 << bitLength) - 1);
        return ((word >>> bitOffset) & mask) >>> 0;
    }

    // ── Writes ───────────────────────────────────────────────────────────────

    writeU8(offset, value, tag = null, opts = {}) {
        Rom._checkValue(value, 8);
        this._claim(offset, 1, tag, opts);
        this.buffer.writeUInt8(value, offset);
        return this;
    }

    writeU16(offset, value, tag = null, opts = {}) {
        Rom._checkValue(value, 16);
        this._claim(offset, 2, tag, opts);
        this.buffer.writeUInt16LE(value, offset);
        return this;
    }

    writeU32(offset, value, tag = null, opts = {}) {
        Rom._checkValue(value, 32);
        this._claim(offset, 4, tag, opts);
        this.buffer.writeUInt32LE(value >>> 0, offset);
        return this;
    }

    writeBytes(offset, bytes, tag = null, opts = {}) {
        const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
        this._claim(offset, buf.length, tag, opts);
        buf.copy(this.buffer, offset);
        return this;
    }

    /** Write a ROM offset as the GBA pointer the game will dereference. */
    writePointer(offset, targetRomOffset, tag = null, opts = {}) {
        return this.writeU32(offset, toGbaPointer(targetRomOffset), tag, opts);
    }

    /** Read-modify-write of one bit field inside the u32 at `offset` (LSB-first, as GCC packs). */
    writeBits(offset, bitOffset, bitLength, value, tag = null, opts = {}) {
        Rom._checkField(bitOffset, bitLength);
        const max = bitLength === 32 ? 0xffffffff : (1 << bitLength) - 1;
        if (!Number.isInteger(value) || value < 0 || value > max) {
            throw new Error(`Value ${value} out of range for a ${bitLength} bits field (0..0x${max.toString(16)})`);
        }
        const mask = (bitLength === 32 ? 0xffffffff : ((1 << bitLength) - 1)) >>> 0;
        // Claim only the bits of this field, so a neighbouring field in the same word stays writable.
        const byteMasks = [];
        for (let b = 0; b < 4; b++) {
            byteMasks.push(((mask << bitOffset) >>> (b * 8)) & 0xff);
        }
        this._claim(offset, 4, tag, opts, byteMasks);
        const word = this.buffer.readUInt32LE(offset) >>> 0;
        const next = (((word & ~(mask << bitOffset)) >>> 0) | ((value & mask) << bitOffset)) >>> 0;
        this.buffer.writeUInt32LE(next, offset);
        return this;
    }

    static _checkField(bitOffset, bitLength) {
        if (!Number.isInteger(bitOffset) || !Number.isInteger(bitLength) || bitLength <= 0 || bitOffset < 0) {
            throw new Error(`Invalid bit field (offset ${bitOffset}, width ${bitLength})`);
        }
        if (bitOffset + bitLength > 32) {
            throw new Error(`Bit field at ${bitOffset}+${bitLength} does not fit in the 32 bits word`);
        }
    }

    // ── Journal / overlap detection ──────────────────────────────────────────

    /**
     * Record ownership of `length` bytes from `offset` (or, when `byteMasks` is given, only of those
     * bits within each byte) and refuse a second claim on the same bits.
     */
    _claim(offset, length, tag, { allowOverwrite = false } = {}, byteMasks = null) {
        this._checkBounds(offset, length);
        if (this._trackWrites) {
            if (!this._claimed) this._claimed = new Uint8Array(this.buffer.length);
            for (let i = 0; i < length; i++) {
                const mask = byteMasks ? byteMasks[i] : 0xff;
                if (!mask) continue;
                const prev = this._claimed[offset + i];
                if (prev & mask && !allowOverwrite) {
                    throw new Error(
                        `Injection overlap at 0x${(offset + i).toString(16)}: '${this._ownerOf(offset + i)}' ` +
                        `already wrote this byte, now '${tag ?? '(untagged)'}' wants it. ` +
                        `Two modules must never own the same bytes (INV-BYTES).`);
                }
                this._claimed[offset + i] = prev | mask;
            }
        }
        this.journal.push({ offset, length, tag });
        this.bytesWritten += length;
    }

    /** Who wrote the byte at `offset` — journal scan, error path only. */
    _ownerOf(offset) {
        for (let i = this.journal.length - 1; i >= 0; i--) {
            const e = this.journal[i];
            if (offset >= e.offset && offset < e.offset + e.length) return e.tag ?? '(untagged)';
        }
        return '(unknown)';
    }
}

module.exports = { Rom };
