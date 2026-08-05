// Browser Buffer for the injector (T-249).
//
// The injector's byte layer is Node's `Buffer` (randomizer/injector/rom.js and every module that encodes a
// struct). A browser has no Buffer, and the injector must run there unchanged — the whole point of the
// base+injection migration is one implementation, verified once (ADR-023). esbuild `inject`s this file so
// the bare `Buffer` those modules reference resolves here.
//
// Hand-written rather than pulled in as a polyfill dependency: the surface the injector actually uses is
// small (the statics below plus 9 methods), the repo carries exactly one devDependency, and a shim this
// size can be pinned method-by-method against the real Buffer —
// randomizer/__tests__/unit/browserShims.test.js does exactly that.
//
// The two semantics worth stating, because getting them wrong corrupts a ROM quietly:
//   - `slice()` is an ALIAS OF `subarray()`, as in Node: it returns a VIEW that shares memory. The
//     injector writes through slices. (`Uint8Array.prototype.slice` copies — inheriting it would be a bug.)
//   - `Buffer.from(x)` COPIES a buffer/array but VIEWS an ArrayBuffer, again as in Node.
'use strict';

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

const isArrayBuffer = (value) => Object.prototype.toString.call(value) === '[object ArrayBuffer]';

class Buffer extends Uint8Array {
    // ── Statics ──────────────────────────────────────────────────────────────

    static alloc(size, fill = 0) {
        const buf = new Buffer(size);
        if (fill) buf.fill(fill);
        return buf;
    }

    static from(value, encoding = 'utf8') {
        if (typeof value === 'string') {
            if (encoding !== 'utf8' && encoding !== 'utf-8') {
                throw new Error(`buffer shim: only utf8 is supported, not '${encoding}'`);
            }
            return Buffer._wrap(utf8Encoder.encode(value));
        }
        // Duck-typed, not `instanceof`: bytes can arrive from another realm (a transferred buffer, a `vm`
        // sandbox in the equivalence test) where `instanceof Uint8Array` is false for a real Uint8Array.
        if (isArrayBuffer(value)) return new Buffer(value);              // a view, as Node does
        if (ArrayBuffer.isView(value)) {                                 // …but a copy, also as Node does
            const copy = new Buffer(value.byteLength);
            copy.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
            return copy;
        }
        if (Array.isArray(value)) return Buffer._wrap(new Uint8Array(value));
        throw new Error('buffer shim: Buffer.from expects a string, Uint8Array, Array or ArrayBuffer');
    }

    static concat(list) {
        const total = list.reduce((sum, b) => sum + b.length, 0);
        const out = Buffer.alloc(total);
        let at = 0;
        for (const b of list) { out.set(b, at); at += b.length; }
        return out;
    }

    static isBuffer(value) { return value instanceof Buffer; }

    static byteLength(value, encoding = 'utf8') {
        if (typeof value !== 'string') return value.length;
        if (encoding !== 'utf8' && encoding !== 'utf-8') {
            throw new Error(`buffer shim: only utf8 is supported, not '${encoding}'`);
        }
        return utf8Encoder.encode(value).length;
    }

    /** Re-badge an existing Uint8Array's memory as a Buffer without copying it. */
    static _wrap(u8) { return new Buffer(u8.buffer, u8.byteOffset, u8.length); }

    // ── Reads / writes (little-endian, the only order the injector uses) ──────

    get _view() {
        // Cached per instance: a DataView allocation per byte write would dominate a 32 MB injection.
        if (!this.__view) Object.defineProperty(this, '__view', { value: new DataView(this.buffer, this.byteOffset, this.byteLength), enumerable: false });
        return this.__view;
    }

    readUInt8(offset = 0) { return this._view.getUint8(offset); }
    readUInt16LE(offset = 0) { return this._view.getUint16(offset, true); }
    readUInt32LE(offset = 0) { return this._view.getUint32(offset, true); }

    writeUInt8(value, offset = 0) { this._view.setUint8(offset, value); return offset + 1; }
    writeUInt16LE(value, offset = 0) { this._view.setUint16(offset, value, true); return offset + 2; }
    writeUInt32LE(value, offset = 0) { this._view.setUint32(offset, value >>> 0, true); return offset + 4; }

    // ── Views and comparisons ────────────────────────────────────────────────

    subarray(start = 0, end = this.length) {
        const from = start < 0 ? Math.max(this.length + start, 0) : Math.min(start, this.length);
        const to = end < 0 ? Math.max(this.length + end, 0) : Math.min(end, this.length);
        return new Buffer(this.buffer, this.byteOffset + from, Math.max(to - from, 0));
    }

    /** Node's `slice` shares memory — see the header. */
    slice(start, end) { return this.subarray(start, end); }

    copy(target, targetStart = 0, sourceStart = 0, sourceEnd = this.length) {
        const source = this.subarray(sourceStart, sourceEnd);
        target.set(source, targetStart);
        return source.length;
    }

    equals(other) {
        if (!other || this.length !== other.length) return false;
        for (let i = 0; i < this.length; i++) if (this[i] !== other[i]) return false;
        return true;
    }

    toString(encoding = 'utf8') {
        if (encoding === 'hex') return [...this].map(b => b.toString(16).padStart(2, '0')).join('');
        if (encoding !== 'utf8' && encoding !== 'utf-8') {
            throw new Error(`buffer shim: only utf8 and hex are supported, not '${encoding}'`);
        }
        return utf8Decoder.decode(this);
    }
}

module.exports = { Buffer };
