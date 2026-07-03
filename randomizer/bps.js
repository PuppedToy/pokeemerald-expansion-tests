'use strict';

/**
 * BPS patch codec (T-053, ADR-013).
 *
 * BPS is the standard delta-patch format for ROM hacks: a header (source/target sizes), a stream of
 * copy/insert actions, and CRC32 footers for source, target and the patch itself. We generate a
 * vanilla→built delta on the builder and apply it to the user's ROM in the browser (like rom-patcher).
 *
 * Split of responsibilities:
 *   - `applyBps` implements ALL FOUR commands (SourceRead/TargetRead/SourceCopy/TargetCopy) so it can
 *     apply optimal patches produced by flips/beat, not only ours.
 *   - `createBps` is a correct but deliberately simple encoder: it emits SourceRead for byte-aligned
 *     matches and TargetRead for everything else. It never emits SourceCopy/TargetCopy (relocated
 *     matches), so its output is correct and round-trips, but is not size-optimal. For a full-decomp
 *     base the delta is ≈target-sized regardless (see ADR-013); when an optimal patch is wanted the
 *     builder can shell out to flips and the same `applyBps` still applies it.
 *
 * Environment-agnostic: works on Uint8Array (browser) and Buffer (Node, a Uint8Array subclass), so the
 * one module is bundled to the frontend and required by make.js — no duplication.
 */

const MAGIC = [0x42, 0x50, 0x53, 0x31]; // "BPS1"
const FOOTER_BYTES = 12; // three little-endian CRC32s

function toU8(x) {
    if (x instanceof Uint8Array) return x;
    return new Uint8Array(x);
}

// ── CRC32 (reflected, poly 0xEDB88320) ─────────────────────────────────────────
const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(bytes, start = 0, end = bytes.length) {
    let crc = 0xffffffff;
    for (let i = start; i < end; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
    return (crc ^ 0xffffffff) >>> 0;
}

// ── BPS variable-length number encoding ─────────────────────────────────────────
// Uses division/modulo (not <<, >>) so values beyond 2^31 (large ROM offsets) stay exact.
function encodeNumber(number) {
    const out = [];
    let n = number;
    for (;;) {
        const x = n % 128;
        n = Math.floor(n / 128);
        if (n === 0) { out.push(0x80 | x); break; }
        out.push(x);
        n -= 1;
    }
    return out;
}

function decodeNumber(bytes, offset) {
    let value = 0;
    let shift = 1;
    let i = offset;
    for (;;) {
        const x = bytes[i++];
        value += (x & 0x7f) * shift;
        if (x & 0x80) break;
        shift *= 128;
        value += shift;
    }
    return { value, offset: i };
}

// ── Encode ──────────────────────────────────────────────────────────────────────
function pushU32LE(out, n) {
    out.push(n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff);
}

function createBps(sourceInput, targetInput) {
    const source = toU8(sourceInput);
    const target = toU8(targetInput);

    const out = [...MAGIC];
    out.push(...encodeNumber(source.length));
    out.push(...encodeNumber(target.length));
    out.push(...encodeNumber(0)); // no metadata

    let offset = 0;
    while (offset < target.length) {
        const aligned = offset < source.length && source[offset] === target[offset];
        if (aligned) {
            let len = 0;
            while (
                offset + len < target.length &&
                offset + len < source.length &&
                source[offset + len] === target[offset + len]
            ) len++;
            out.push(...encodeNumber((len - 1) * 4 + 0)); // command 0: SourceRead
            offset += len;
        } else {
            let len = 0;
            while (
                offset + len < target.length &&
                !(offset + len < source.length && source[offset + len] === target[offset + len])
            ) len++;
            out.push(...encodeNumber((len - 1) * 4 + 1)); // command 1: TargetRead
            for (let i = 0; i < len; i++) out.push(target[offset + i]);
            offset += len;
        }
    }

    pushU32LE(out, crc32(source));
    pushU32LE(out, crc32(target));
    pushU32LE(out, crc32(Uint8Array.from(out))); // checksum of everything written so far
    return Uint8Array.from(out);
}

// ── Decode ────────────────────────────────────────────────────────────────────────
function readU32LE(bytes, o) {
    return (bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16) | (bytes[o + 3] << 24)) >>> 0;
}

function applyBps(patchInput, sourceInput) {
    const patch = toU8(patchInput);
    const source = toU8(sourceInput);

    if (patch.length < 4 + FOOTER_BYTES || MAGIC.some((b, i) => patch[i] !== b)) {
        throw new Error('Not a BPS patch (bad magic)');
    }

    let rp = 4;
    const decode = () => { const { value, offset } = decodeNumber(patch, rp); rp = offset; return value; };

    const sourceSize = decode();
    const targetSize = decode();
    const metaSize = decode();
    rp += metaSize; // skip metadata

    if (source.length !== sourceSize) {
        throw new Error(`Source size mismatch: patch expects ${sourceSize} bytes, got ${source.length}`);
    }

    const target = new Uint8Array(targetSize);
    const actionsEnd = patch.length - FOOTER_BYTES;
    let outOffset = 0;
    let sourceRelative = 0;
    let targetRelative = 0;

    while (rp < actionsEnd) {
        const data = decode();
        const command = data % 4;
        const length = Math.floor(data / 4) + 1;
        switch (command) {
            case 0: // SourceRead — copy from source at the current output offset
                for (let i = 0; i < length; i++) { target[outOffset] = source[outOffset]; outOffset++; }
                break;
            case 1: // TargetRead — literal bytes from the patch
                for (let i = 0; i < length; i++) target[outOffset++] = patch[rp++];
                break;
            case 2: { // SourceCopy — copy from a relocated source offset
                const n = decode();
                sourceRelative += (n % 2 ? -1 : 1) * Math.floor(n / 2);
                for (let i = 0; i < length; i++) target[outOffset++] = source[sourceRelative++];
                break;
            }
            case 3: { // TargetCopy — copy from already-written output (enables RLE)
                const n = decode();
                targetRelative += (n % 2 ? -1 : 1) * Math.floor(n / 2);
                for (let i = 0; i < length; i++) target[outOffset++] = target[targetRelative++];
                break;
            }
            default: throw new Error(`Unknown BPS command ${command}`);
        }
    }

    if (crc32(source) !== readU32LE(patch, actionsEnd)) {
        throw new Error('Source checksum mismatch — this patch is for a different base ROM');
    }
    if (crc32(target) !== readU32LE(patch, actionsEnd + 4)) {
        throw new Error('Target checksum mismatch — the patch is corrupt');
    }
    if (crc32(patch, 0, actionsEnd + 8) !== readU32LE(patch, actionsEnd + 8)) {
        throw new Error('Patch checksum mismatch — the patch is corrupt');
    }
    return target;
}

module.exports = { createBps, applyBps, crc32, encodeNumber, decodeNumber };
