/**
 * Seeded PRNG wrapper (mulberry32 algorithm).
 *
 * Usage:
 *   const rng = require('./rng');
 *   rng.seed(42);          // deterministic mode (tests, reproducible runs)
 *   rng.random();          // returns float in [0, 1)
 *
 * Without a seed call, falls back to Math.random (default pipeline behavior).
 */

let _rng = Math.random;

function seed(s) {
    let t = s >>> 0;
    _rng = function () {
        t |= 0;
        t = (t + 0x6D2B79F5) | 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) | 0;
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

function random() {
    return _rng();
}

/** Reset to unseeded (Math.random) — useful between tests. */
function reset() {
    _rng = Math.random;
}

module.exports = { seed, random, reset };
