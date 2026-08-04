// T-249 — the two browser shims the injector needs, checked against the real thing.
//
// The injector's byte layer is Node `Buffer` and `crypto.createHash` (rom.js). Neither exists in a
// browser, and both are load-bearing: a `writeUInt32LE` that differs by one byte, or a `slice` that copies
// where Node's shares memory, produces a ROM that is wrong in a way no test of the modules would notice.
//
// So these tests are differential: every method is run against Node's Buffer/crypto and the shim, and the
// two must agree. This is also why the shim is hand-written rather than a polyfill dependency — the
// surface is 14 methods, and this file pins all of them.

const nodeCrypto = require('crypto');
const { Buffer: ShimBuffer } = require('../../../frontend/js/shims/buffer.cjs');
const shimCrypto = require('../../../frontend/js/shims/crypto.cjs');

const bytes = (buf) => [...buf];

describe('the Buffer shim', () => {
    test('alloc: zeroed, or filled', () => {
        expect(bytes(ShimBuffer.alloc(4))).toEqual(bytes(Buffer.alloc(4)));
        expect(bytes(ShimBuffer.alloc(4, 0xff))).toEqual(bytes(Buffer.alloc(4, 0xff)));
        expect(ShimBuffer.alloc(0).length).toBe(0);
    });

    test('from: utf8 text, another buffer, an array, an ArrayBuffer', () => {
        const text = 'Milos — ポケモン';                      // multi-byte on purpose
        expect(bytes(ShimBuffer.from(text))).toEqual(bytes(Buffer.from(text)));
        expect(bytes(ShimBuffer.from(text, 'utf8'))).toEqual(bytes(Buffer.from(text, 'utf8')));
        expect(ShimBuffer.byteLength(text)).toBe(Buffer.byteLength(text));

        const source = Buffer.from([1, 2, 3]);
        expect(bytes(ShimBuffer.from(source))).toEqual([1, 2, 3]);
        expect(bytes(ShimBuffer.from([4, 5, 6]))).toEqual([4, 5, 6]);

        // Node's Buffer.from(buffer) COPIES: mutating the copy must not touch the original.
        const copy = ShimBuffer.from(source);
        copy[0] = 99;
        expect(source[0]).toBe(1);

        // …while Buffer.from(arrayBuffer) VIEWS it, which is how a fetched ROM avoids a second 32 MB.
        const ab = new ArrayBuffer(3);
        const view = ShimBuffer.from(ab);
        view[1] = 7;
        expect(new Uint8Array(ab)[1]).toBe(7);
    });

    test('from: bytes that arrive from ANOTHER REALM, which is how a transferred buffer arrives', () => {
        // `instanceof Uint8Array` is false for a real Uint8Array built in another realm — the case that
        // would make the browser path throw on the very ROM it was handed.
        const vm = require('vm');
        const foreign = vm.runInNewContext('new Uint8Array([1, 2, 3])');
        expect(bytes(ShimBuffer.from(foreign))).toEqual([1, 2, 3]);
        const foreignArrayBuffer = vm.runInNewContext('new Uint8Array([4, 5, 6]).buffer');
        expect(bytes(ShimBuffer.from(foreignArrayBuffer))).toEqual([4, 5, 6]);
    });

    test('isBuffer accepts a shim buffer and rejects a plain array', () => {
        expect(ShimBuffer.isBuffer(ShimBuffer.alloc(1))).toBe(true);
        expect(ShimBuffer.isBuffer([1, 2])).toBe(false);
        // A Uint8Array is not a Buffer for Node either — Rom.fromBuffer refuses it, and so must this.
        expect(ShimBuffer.isBuffer(new Uint8Array(1))).toBe(false);
    });

    test('u8/u16/u32 reads and writes agree with Node, including values above 2^31', () => {
        const values = [0, 1, 0x7f, 0x80, 0xff, 0x0100, 0x1234, 0xffff, 0x80000000, 0xdeadbeef, 0xffffffff];
        for (const value of values) {
            const real = Buffer.alloc(8);
            const shim = ShimBuffer.alloc(8);
            if (value <= 0xff) { real.writeUInt8(value, 1); shim.writeUInt8(value, 1); }
            if (value <= 0xffff) { real.writeUInt16LE(value, 2); shim.writeUInt16LE(value, 2); }
            real.writeUInt32LE(value >>> 0, 4);
            shim.writeUInt32LE(value >>> 0, 4);
            expect(bytes(shim)).toEqual(bytes(real));
            expect(shim.readUInt8(1)).toBe(real.readUInt8(1));
            expect(shim.readUInt16LE(2)).toBe(real.readUInt16LE(2));
            expect(shim.readUInt32LE(4)).toBe(real.readUInt32LE(4));
        }
    });

    test('a write past the end throws instead of silently doing nothing', () => {
        expect(() => ShimBuffer.alloc(2).writeUInt32LE(1, 0)).toThrow();
        expect(() => ShimBuffer.alloc(2).readUInt32LE(0)).toThrow();
    });

    test('copy: whole buffer, and the (target, targetStart, sourceStart, sourceEnd) form', () => {
        const source = [1, 2, 3, 4, 5];
        const real = Buffer.alloc(8);
        const shim = ShimBuffer.alloc(8);
        expect(ShimBuffer.from(source).copy(shim, 2)).toBe(Buffer.from(source).copy(real, 2));
        expect(bytes(shim)).toEqual(bytes(real));

        ShimBuffer.from(source).copy(shim, 0, 1, 3);
        Buffer.from(source).copy(real, 0, 1, 3);
        expect(bytes(shim)).toEqual(bytes(real));
    });

    test('equals', () => {
        expect(ShimBuffer.from([1, 2]).equals(ShimBuffer.from([1, 2]))).toBe(true);
        expect(ShimBuffer.from([1, 2]).equals(ShimBuffer.from([1, 3]))).toBe(false);
        expect(ShimBuffer.from([1, 2]).equals(ShimBuffer.from([1, 2, 3]))).toBe(false);
        // Node compares content, not class: a Buffer equals an identical Uint8Array.
        expect(ShimBuffer.from([1, 2]).equals(new Uint8Array([1, 2]))).toBe(true);
    });

    test('slice and subarray SHARE memory, as Node\'s do — the injector writes through them', () => {
        for (const method of ['slice', 'subarray']) {
            const real = Buffer.alloc(4);
            const shim = ShimBuffer.alloc(4);
            real[method](1, 3)[0] = 9;
            shim[method](1, 3)[0] = 9;
            expect(bytes(shim)).toEqual(bytes(real));
            expect(shim[method](1, 3).length).toBe(real[method](1, 3).length);
            // …and the view is itself a Buffer, so its own readUInt16LE exists.
            expect(shim[method](1, 3).readUInt16LE(0)).toBe(real[method](1, 3).readUInt16LE(0));
        }
    });

    test('concat and fill', () => {
        expect(bytes(ShimBuffer.concat([ShimBuffer.from([1]), ShimBuffer.from([2, 3])])))
            .toEqual(bytes(Buffer.concat([Buffer.from([1]), Buffer.from([2, 3])])));
        expect(bytes(ShimBuffer.alloc(3).fill(7))).toEqual(bytes(Buffer.alloc(3).fill(7)));
    });
});

describe('the fs shim', () => {
    const fsShim = require('../../../frontend/js/shims/fs.cjs');

    afterEach(() => fsShim.setVirtualFiles({}));

    test('with nothing registered it behaves as the old pure stub', () => {
        expect(fsShim.existsSync('/anything')).toBe(false);
        expect(() => fsShim.readFileSync('/anything', 'utf8')).toThrow(/not available in the browser/);
        expect(() => fsShim.writeFileSync('/anything', 'x')).toThrow();
    });

    test('serves a baked file through the shim-built absolute path that reaches it', () => {
        fsShim.setVirtualFiles({ 'include/constants/randomizer_layout.h': '#define LEVEL_UP_LEARNSET_CAPACITY 44' });
        // What `path.resolve(__dirname, '..', 'include', 'constants', 'randomizer_layout.h')` produces
        // under the path shim: absolute-looking, meaningful only in its tail.
        expect(fsShim.readFileSync('/randomizer/../include/constants/randomizer_layout.h', 'utf8'))
            .toMatch(/44/);
        expect(fsShim.existsSync('/randomizer/../include/constants/randomizer_layout.h')).toBe(true);
        expect(fsShim.readFileSync('include/constants/randomizer_layout.h', 'utf8')).toMatch(/44/);
    });

    test('the longest matching key wins, so a short key cannot shadow a longer path', () => {
        fsShim.setVirtualFiles({ 'map.json': 'wrong', 'data/maps/Route111/map.json': 'right' });
        expect(fsShim.readFileSync('/x/data/maps/Route111/map.json', 'utf8')).toBe('right');
    });

    test('a path the artifact does not carry says so, and names what to do', () => {
        fsShim.setVirtualFiles({ 'charmap.txt': "'A' = BB" });
        expect(() => fsShim.readFileSync('/src/data/items.h', 'utf8')).toThrow(/BASE_SOURCE_FILES/);
        expect(fsShim.existsSync('/src/data/items.h')).toBe(false);
    });
});

describe('the crypto shim', () => {
    const sha256 = (data) => shimCrypto.createHash('sha256').update(data).digest('hex');
    const real = (data) => nodeCrypto.createHash('sha256').update(data).digest('hex');

    test('agrees with Node on the padding edge cases (55/56/63/64/65 bytes)', () => {
        for (const length of [0, 1, 55, 56, 57, 63, 64, 65, 119, 128]) {
            const data = Buffer.alloc(length);
            for (let i = 0; i < length; i++) data[i] = (i * 37 + 11) & 0xff;
            expect(sha256(data)).toBe(real(data));
        }
    });

    test('agrees on text and on a megabyte of bytes (the ROM is 32 of these)', () => {
        expect(sha256('abc')).toBe(real('abc'));
        expect(sha256('')).toBe(real(''));
        const big = Buffer.alloc(1024 * 1024);
        for (let i = 0; i < big.length; i++) big[i] = (i * 131 + 7) & 0xff;
        expect(sha256(big)).toBe(real(big));
        expect(sha256(new Uint8Array(big))).toBe(real(big));
    });

    test('an unsupported algorithm is refused, not silently wrong', () => {
        expect(() => shimCrypto.createHash('md5')).toThrow(/md5|sha256/i);
    });
});
