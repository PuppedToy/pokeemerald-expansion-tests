'use strict';

// TDD (T-001): crop the top-left frame out of a Pokémon animation sheet.
// anim_front.png is 64x128 (frame 0 stacked on frame 1); we want the top 64x64.
// Pure RGBA pixel math so it needs no image library to test.

const { cropTopLeft, keyColorToTransparent, keyBackgroundFromCorner, encodeIndexedPng } = require('../../spriteImage');
const { PNG } = require('pngjs');

// Read the IHDR color type byte (offset 25) from a PNG buffer.
function colorType(pngBuffer) {
    return pngBuffer[25];
}

// Build a width x height RGBA bitmap whose red channel encodes the row index,
// so we can prove which rows survived the crop.
function makeBitmap(width, height) {
    const data = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            data[i] = y;        // R = row
            data[i + 1] = x;    // G = col
            data[i + 2] = 0;
            data[i + 3] = 255;  // opaque
        }
    }
    return { width, height, data };
}

describe('cropTopLeft', () => {
    test('crops a 64x128 sheet down to 64x64', () => {
        const out = cropTopLeft(makeBitmap(64, 128), 64, 64);
        expect(out.width).toBe(64);
        expect(out.height).toBe(64);
        expect(out.data.length).toBe(64 * 64 * 4);
    });

    test('keeps the TOP frame (rows 0..63), not the bottom', () => {
        const out = cropTopLeft(makeBitmap(64, 128), 64, 64);
        // last surviving row should be 63
        const lastRow = (63 * 64 + 0) * 4;
        expect(out.data[lastRow]).toBe(63);
        // top-left pixel is row 0
        expect(out.data[0]).toBe(0);
    });

    test('preserves column ordering', () => {
        const out = cropTopLeft(makeBitmap(64, 128), 64, 64);
        const px = (0 * 64 + 10) * 4; // row 0, col 10
        expect(out.data[px + 1]).toBe(10); // G channel = col
    });

    test('is a no-op-sized copy when source already matches crop size', () => {
        const out = cropTopLeft(makeBitmap(64, 64), 64, 64);
        expect(out.width).toBe(64);
        expect(out.height).toBe(64);
        expect(out.data[(63 * 64) * 4]).toBe(63);
    });

    test('clamps when the source is smaller than the requested crop', () => {
        const out = cropTopLeft(makeBitmap(32, 40), 64, 64);
        // cannot invent pixels: output is the available 32x40
        expect(out.width).toBe(32);
        expect(out.height).toBe(40);
        expect(out.data.length).toBe(32 * 40 * 4);
    });
});

describe('keyColorToTransparent', () => {
    // 2x1 bitmap: pixel 0 = background color, pixel 1 = foreground
    function twoPixel(bg, fg) {
        const data = Buffer.from([...bg, 255, ...fg, 255]);
        return { width: 2, height: 1, data };
    }

    test('sets alpha 0 for pixels matching the key color', () => {
        const out = keyColorToTransparent(twoPixel([152, 160, 208], [80, 200, 120]), [152, 160, 208]);
        expect(out.data[3]).toBe(0); // bg pixel alpha cleared
    });
    test('leaves non-matching pixels fully opaque', () => {
        const out = keyColorToTransparent(twoPixel([152, 160, 208], [80, 200, 120]), [152, 160, 208]);
        expect(out.data[7]).toBe(255); // fg pixel untouched
        expect([out.data[4], out.data[5], out.data[6]]).toEqual([80, 200, 120]);
    });
    test('does not mutate the input buffer', () => {
        const input = twoPixel([152, 160, 208], [80, 200, 120]);
        keyColorToTransparent(input, [152, 160, 208]);
        expect(input.data[3]).toBe(255);
    });
});

describe('keyBackgroundFromCorner', () => {
    // 2x1: corner pixel + art pixel
    function bm(corner, art) {
        return { width: 2, height: 1, data: Buffer.from([...corner, ...art]) };
    }

    test('keys out an OPAQUE corner color (the visible background)', () => {
        // corner opaque green, art opaque red
        const out = keyBackgroundFromCorner(bm([153, 210, 164, 255], [200, 0, 0, 255]));
        expect(out.data[3]).toBe(0);    // green corner -> transparent
        expect(out.data[7]).toBe(255);  // red art untouched
    });

    test('clears every pixel matching the opaque corner color', () => {
        // two green pixels: both should go transparent
        const out = keyBackgroundFromCorner({ width: 2, height: 1, data: Buffer.from([153, 210, 164, 255, 153, 210, 164, 255]) });
        expect(out.data[3]).toBe(0);
        expect(out.data[7]).toBe(0);
    });

    test('does nothing when the corner is already transparent (real alpha present)', () => {
        // corner transparent black; an opaque black art pixel must NOT be punched out
        const out = keyBackgroundFromCorner(bm([0, 0, 0, 0], [0, 0, 0, 255]));
        expect(out.data[7]).toBe(255); // art preserved — no hole
    });

    test('handles an empty bitmap without throwing', () => {
        expect(() => keyBackgroundFromCorner({ width: 0, height: 0, data: Buffer.alloc(0) })).not.toThrow();
    });
});

describe('encodeIndexedPng', () => {
    // 2x2 RGBA bitmap: one transparent pixel + three opaque colors (<=256 colors).
    function bitmap() {
        const data = Buffer.from([
            10, 20, 30, 0,      // transparent
            40, 50, 60, 255,
            70, 80, 90, 255,
            40, 50, 60, 255,    // repeat of color 2 -> same palette index
        ]);
        return { width: 2, height: 2, data };
    }

    test('emits a palette PNG (IHDR color type 3)', () => {
        expect(colorType(encodeIndexedPng(bitmap()))).toBe(3);
    });

    test('round-trips losslessly through a PNG decoder', () => {
        const decoded = PNG.sync.read(encodeIndexedPng(bitmap()));
        expect(decoded.width).toBe(2);
        expect(decoded.height).toBe(2);
        expect(Buffer.compare(decoded.data, bitmap().data)).toBe(0);
    });

    test('preserves transparency via tRNS (alpha 0 survives)', () => {
        const decoded = PNG.sync.read(encodeIndexedPng(bitmap()));
        expect(decoded.data[3]).toBe(0);   // first pixel still transparent
        expect(decoded.data[7]).toBe(255); // opaque pixel still opaque
    });

    test('throws when the bitmap has more than 256 distinct colors', () => {
        const width = 257, height = 1;
        const data = Buffer.alloc(width * height * 4);
        for (let p = 0; p < width; p++) { data[p * 4] = p % 256; data[p * 4 + 1] = (p >> 8); data[p * 4 + 3] = 255; }
        // 257 distinct (R,G) combos -> 257 colors
        expect(() => encodeIndexedPng({ width, height, data })).toThrow(/256/);
    });
});
