'use strict';

/**
 * spriteImage — image helpers for the local sprite generator (T-001).
 *
 * `cropTopLeft` is pure RGBA pixel math (unit-tested without any image lib).
 * `cropPngTopFrame` wraps it with pngjs decode/encode for the actual file I/O,
 * used by generateSprites.js. Pokémon `anim_front.png` sheets are 64x128
 * (frame 0 stacked on frame 1); we keep the top 64x64.
 */

// Crop the top-left cropW x cropH region out of an {width,height,data(RGBA)} bitmap.
// Clamps to the available size — never invents pixels.
function cropTopLeft(bitmap, cropW, cropH) {
    const { width, height, data } = bitmap;
    const w = Math.min(cropW, width);
    const h = Math.min(cropH, height);
    const out = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
        const srcStart = (y * width) * 4;
        const dstStart = (y * w) * 4;
        data.copy(out, dstStart, srcStart, srcStart + w * 4);
    }
    return { width: w, height: h, data: out };
}

// Return a copy of the bitmap with alpha cleared on every pixel matching [r,g,b].
// pokeemerald front sprites reserve palette index 0 as the (opaque) background;
// keying it out reproduces the transparency the game applies at runtime.
function keyColorToTransparent(bitmap, [r, g, b]) {
    const { width, height, data } = bitmap;
    const out = Buffer.from(data);
    for (let i = 0; i < out.length; i += 4) {
        if (out[i] === r && out[i + 1] === g && out[i + 2] === b) out[i + 3] = 0;
    }
    return { width, height, data: out };
}

// Key out the background using the top-left corner as the reference, but ONLY when
// that corner is opaque. An opaque corner means a visible background block that must
// be removed (true for both the index-0 backgrounds of anim_front sheets and the
// green/cyan backgrounds baked into form front.png files, whose own tRNS does NOT
// cover them). When the corner is already transparent the sprite carries real alpha,
// so we leave it untouched to avoid punching holes in same-colored art.
function keyBackgroundFromCorner(bitmap) {
    if (bitmap.data.length < 4 || bitmap.data[3] !== 255) return bitmap;
    return keyColorToTransparent(bitmap, [bitmap.data[0], bitmap.data[1], bitmap.data[2]]);
}

// ── Minimal indexed-PNG encoder ──────────────────────────────────────────────
// pngjs can only write truecolor PNGs (RGBA). Pokémon sprites have ≤16 colors,
// so we losslessly rebuild a palette and emit an 8-bit indexed PNG with a tRNS
// chunk for the transparent entries — ~3x smaller than RGBA, which matters
// because every referenced sprite is base64-embedded into the docs (T-001).

const zlib = require('zlib');

function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
    }
    return (~c) >>> 0;
}

function pngChunk(type, data) {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'latin1');
    data.copy(out, 8);
    out.writeUInt32BE(crc32(out.slice(4, 8 + data.length)), 8 + data.length);
    return out;
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Encode an {width,height,data(RGBA)} bitmap as an 8-bit palette PNG. Lossless
// when the bitmap has ≤256 distinct colors; throws otherwise.
function encodeIndexedPng(bitmap) {
    const { width, height, data } = bitmap;
    const palette = new Map();
    const indices = Buffer.alloc(width * height);
    for (let p = 0; p < width * height; p++) {
        const i = p * 4;
        const key = ((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]) >>> 0;
        let idx = palette.get(key);
        if (idx === undefined) {
            if (palette.size >= 256) throw new Error('encodeIndexedPng: more than 256 colors');
            idx = palette.size;
            palette.set(key, idx);
        }
        indices[p] = idx;
    }

    const plte = Buffer.alloc(palette.size * 3);
    const trns = Buffer.alloc(palette.size);
    let trnsLen = 0;
    for (const [key, idx] of palette) {
        plte[idx * 3] = (key >>> 24) & 255;
        plte[idx * 3 + 1] = (key >>> 16) & 255;
        plte[idx * 3 + 2] = (key >>> 8) & 255;
        const a = key & 255;
        trns[idx] = a;
        if (a < 255) trnsLen = idx + 1; // tRNS only needs entries up to the last non-opaque one
    }

    // Raw scanlines with filter type 0 (None); zlib handles the compression.
    const raw = Buffer.alloc(height * (1 + width));
    for (let y = 0; y < height; y++) {
        raw[y * (1 + width)] = 0;
        indices.copy(raw, y * (1 + width) + 1, y * width, y * width + width);
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 3;  // color type 3 = palette

    const parts = [PNG_SIGNATURE, pngChunk('IHDR', ihdr), pngChunk('PLTE', plte)];
    if (trnsLen > 0) parts.push(pngChunk('tRNS', trns.slice(0, trnsLen)));
    parts.push(pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })), pngChunk('IEND', Buffer.alloc(0)));
    return Buffer.concat(parts);
}

// Decode a PNG buffer, crop its top size x size frame, key out the background
// color (unless the source already has alpha), and return an indexed PNG buffer.
function spriteToIndexedPng(pngBuffer, size = 64) {
    const { PNG } = require('pngjs');
    const src = PNG.sync.read(pngBuffer);
    const bitmap = keyBackgroundFromCorner(cropTopLeft(src, size, size));
    return encodeIndexedPng(bitmap);
}

module.exports = { cropTopLeft, keyColorToTransparent, keyBackgroundFromCorner, encodeIndexedPng, spriteToIndexedPng };
