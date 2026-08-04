'use strict';
// Web Worker entry point for the INJECTOR — the browser writes a bundle's data into the base ROM itself,
// so the server does no per-user compute at all (T-249, the payoff ADR-013/ADR-022 anticipate).
//
// It runs the very same modules as the Node path (randomizer/injector/*), which is the whole point: a
// second implementation could not be verified by GATE-3, and byte-equivalence is the contract (ADR-023).
// What differs is only where the inputs come from —
//
//   | input           | Node                        | here                                           |
//   |-----------------|-----------------------------|------------------------------------------------|
//   | base ROM        | base/pokeemerald.gba        | vanilla ROM in IndexedDB + base.bps            |
//   | offsets         | pokeemerald.map + .sym      | base-offsets.inject.json (the addressable ones) |
//   | base sources    | the repo tree               | base-sources.json                              |
//   | Buffer, crypto  | Node built-ins              | frontend/js/shims (pinned against Node's)      |
//
// Deliberately not here: the BPS delta. The browser already holds the user's own vanilla ROM, so the ROM
// it just built never has to be expressed as a patch — nothing leaves the machine either way.
//
// `.cjs` for the same reason as randomizer-worker.cjs: frontend/package.json is `type: module`, and
// esbuild would otherwise read these CommonJS files as ESM and leave `require` undefined (B-014).

// Required eagerly: leaves, and one of them has to be primed before anything else loads (see below).
const fsShim = require('./shims/fs.cjs');
const { BaseSources } = require('../../randomizer/injector/sources');

/**
 * Inject one ROM of a bundle.
 *
 * @param {object} args
 * @param {ArrayBuffer|Uint8Array} args.baseRom  the BASE ROM (vanilla + base.bps), not vanilla
 * @param {object} args.offsets                  parsed base-offsets.inject.json
 * @param {object} args.sources                  parsed base-sources.json
 * @param {object} args.bundle                   the randomizer bundle this run produced
 * @param {number} [args.romIndex=0]             which of `bundle.roms` to build
 * @returns {{ bytes: Uint8Array, sha256: string, applied: string[], bytesWritten: number }}
 */
function injectOne({ baseRom, offsets, sources, bundle, romIndex = 0 }) {
    const rom = bundle.roms[romIndex];
    if (!rom) throw new Error(`injector-worker: this bundle has no ROM ${romIndex} (it has ${bundle.roms.length})`);

    const baseSources = BaseSources.fromJSON(sources);

    // Order matters, and this is the only reason the graph is required here rather than at the top of the
    // file. `randomizer/layout.js` reads the capacities header the instant it is imported (and five
    // writers destructure them at import), so the artifact has to be registered with the `fs` shim BEFORE
    // the first of those modules loads. After this line the requires are cached, so it costs nothing.
    fsShim.setVirtualFiles(baseSources.files);
    const { Rom, OffsetMap, injectRom } = require('../../randomizer/injector');
    const { injectionDataFor } = require('../../randomizer/injector/romData');
    const rng = require('../../randomizer/rng');

    const offsetMap = OffsetMap.fromJSON(offsets);

    // Written IN PLACE, deliberately. `baseRom` arrives as a transferred ArrayBuffer, so this Worker owns
    // it and `Buffer.from(arrayBuffer)` is a view — no copy. Every avoided 32 MB matters here: a phone has
    // to hold the base, the ROM being built, the journal's ownership map and a ~19 MB bundle at once. The
    // price is that the base is CONSUMED: a multi-ROM bundle sends one base per ROM.
    const image = new Rom(Buffer.from(baseRom));
    // A base and the artifacts describing it are only valid together (T-249): a stale cached base with a
    // fresh offset map writes real data to wrong addresses, and nothing downstream would notice.
    if (baseSources.buildId && baseSources.buildId !== image.sha256()) {
        throw new Error(
            `injector-worker: these base sources were baked for base ${baseSources.buildId.slice(0, 12)}…, ` +
            `but the base ROM in hand is ${image.sha256().slice(0, 12)}…. Re-fetch base.bps and the ` +
            `artifacts together.`);
    }

    const seed = bundle.seed ?? (bundle.config && bundle.config.seed);
    const { data, romSeed } = injectionDataFor({ rom, bundle, seed, universeSeed: bundle.universeSeed ?? seed });
    rng.seed(romSeed);                                  // same seeding as the Node path, same values

    const { applied } = injectRom({ rom: image, offsetMap, data, baseSources });
    // `image.buffer`, not `toBuffer()`: the copy is 32 MB and this Rom is finished with.
    return { bytes: image.buffer, sha256: image.sha256(), applied, bytesWritten: image.bytesWritten };
}

if (typeof self !== 'undefined') {
    // Also exposed directly: the browser equivalence test (visual-tests/injector-equivalence.spec.mjs)
    // loads this bundle in a page and calls injectOne, rather than talking to itself over postMessage.
    self.injectOne = injectOne;

    self.onmessage = ({ data: { type, ...args } }) => {
        if (type !== 'inject') return;
        try {
            const { bytes, sha256, applied, bytesWritten } = injectOne(args);
            // Transferred, not copied — a 32 MB structured clone per ROM is exactly the memory pressure a
            // phone cannot afford. The ROM owns its whole ArrayBuffer (see injectOne), so it goes as-is;
            // the slice is only for the case where some caller handed us a view into a larger buffer.
            const whole = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength;
            const buffer = whole ? bytes.buffer : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
            self.postMessage({ type: 'done', rom: buffer, sha256, applied, bytesWritten }, [buffer]);
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message });
        }
    };
}

module.exports = { injectOne };
