// Browser `crypto.createHash('sha256')` for the injector (T-249).
//
// `Rom.sha256()` is how a run is identified and how the browser path proves it produced the same ROM as
// the Node path (ADR-023). WebCrypto could do it, but `crypto.subtle.digest` is async and `sha256()` is
// called from synchronous code all through the injector — so this is the algorithm itself, ~40 lines,
// FIPS 180-4. Correctness is not taken on faith: randomizer/__tests__/unit/browserShims.test.js runs it
// against Node's crypto, padding edge cases (55/56/63/64/65 bytes) and a megabyte of bytes included.
'use strict';

const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const rotr = (x, n) => ((x >>> n) | (x << (32 - n))) >>> 0;

class Sha256 {
    constructor() {
        this.h = new Uint32Array([
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
        ]);
        this.block = new Uint8Array(64);
        this.blockLength = 0;
        this.totalLength = 0;
        this.w = new Uint32Array(64);
    }

    update(data) {
        const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data.buffer ?? data, data.byteOffset ?? 0, data.length ?? data.byteLength);
        this.totalLength += bytes.length;
        let at = 0;
        // Top up a partial block first, then consume whole blocks straight out of the input.
        if (this.blockLength > 0) {
            const need = Math.min(64 - this.blockLength, bytes.length);
            this.block.set(bytes.subarray(0, need), this.blockLength);
            this.blockLength += need;
            at = need;
            if (this.blockLength === 64) { this._compress(this.block, 0); this.blockLength = 0; }
        }
        for (; at + 64 <= bytes.length; at += 64) this._compress(bytes, at);
        if (at < bytes.length) {
            this.block.set(bytes.subarray(at), 0);
            this.blockLength = bytes.length - at;
        }
        return this;
    }

    digest(encoding = 'hex') {
        // FIPS 180-4 padding: 0x80, zeros, then the message length in bits as a 64-bit big-endian integer.
        const tail = new Uint8Array(this.blockLength + 1 <= 56 ? 64 : 128);
        tail.set(this.block.subarray(0, this.blockLength), 0);
        tail[this.blockLength] = 0x80;
        const bits = this.totalLength * 8;
        const view = new DataView(tail.buffer);
        // A GBA ROM is 32 MB, so the high word is always 0 here; written anyway, from the same number.
        view.setUint32(tail.length - 8, Math.floor(bits / 0x100000000), false);
        view.setUint32(tail.length - 4, bits >>> 0, false);
        for (let at = 0; at < tail.length; at += 64) this._compress(tail, at);

        const out = new Uint8Array(32);
        const outView = new DataView(out.buffer);
        for (let i = 0; i < 8; i++) outView.setUint32(i * 4, this.h[i], false);
        if (encoding === 'hex') return [...out].map(b => b.toString(16).padStart(2, '0')).join('');
        return out;
    }

    _compress(bytes, at) {
        const w = this.w;
        for (let i = 0; i < 16; i++) {
            const o = at + i * 4;
            w[i] = ((bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]) >>> 0;
        }
        for (let i = 16; i < 64; i++) {
            const s0 = (rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) >>> 0;
            const s1 = (rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)) >>> 0;
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
        }
        let [a, b, c, d, e, f, g, h] = this.h;
        for (let i = 0; i < 64; i++) {
            const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
            const ch = ((e & f) ^ (~e & g)) >>> 0;
            const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
            const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
            const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
            const temp2 = (S0 + maj) >>> 0;
            h = g; g = f; f = e;
            e = (d + temp1) >>> 0;
            d = c; c = b; b = a;
            a = (temp1 + temp2) >>> 0;
        }
        const h0 = this.h;
        h0[0] = (h0[0] + a) >>> 0; h0[1] = (h0[1] + b) >>> 0; h0[2] = (h0[2] + c) >>> 0; h0[3] = (h0[3] + d) >>> 0;
        h0[4] = (h0[4] + e) >>> 0; h0[5] = (h0[5] + f) >>> 0; h0[6] = (h0[6] + g) >>> 0; h0[7] = (h0[7] + h) >>> 0;
    }
}

function createHash(algorithm) {
    if (algorithm !== 'sha256') {
        throw new Error(`crypto shim: only sha256 is implemented, not '${algorithm}' (T-249)`);
    }
    return new Sha256();
}

module.exports = { createHash };
