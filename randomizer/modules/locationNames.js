'use strict';

// T-070 — location-based nickname assignment (bundle side).
//
// Pure, seeded, no I/O. Assigns ONE unique nickname per LOCATION (a MAP_* key) per ROM, drawn without
// replacement from a single pool, plus an optional per-location gender coin used only when
// `genderLockPerRoute` (so all encounters on a route can share a gender for coherence). The ROM maker
// applies the name to every wild/gift/static mon spawned on that map, and forces the gender only where
// the species allows it (genderless/fixed-gender mons keep their real gender).
//
// Sharing (nuzlocke same-across-runs, soul-link share-per-player) reuses T-068's group logic verbatim:
// ROMs in one sharing group get an identical location→name mapping; independent groups draw from fresh
// pool copies (names may coincide across separate games — that's fine).

const rng = require('../rng');
const { groupKeyFor, normalizePool } = require('./starterNames');

const GOLDEN = 0x9E3779B9;

// One location→{nickname,gender} mapping for a whole sharing group.
function rollGroup(pool, locations, genderLock) {
    const used = new Set();
    const map = {};
    for (const loc of locations) {
        const gender = genderLock ? (rng.random() < 0.5 ? 'M' : 'F') : null;
        const avail = pool.filter((n) => !used.has(n.toLowerCase()));
        let nickname = null;
        if (avail.length > 0) {
            nickname = avail[Math.floor(rng.random() * avail.length)];
            used.add(nickname.toLowerCase());
        }
        map[loc] = { nickname, gender };
    }
    return map;
}

const cloneMap = (m) => {
    const out = {};
    for (const k of Object.keys(m)) out[k] = { ...m[k] };
    return out;
};

/**
 * @param {object}   args
 * @param {object}   args.config     the `locationNicknames` config (enabled/genderLockPerRoute/…/pool)
 * @param {string[]} args.locations  the location keys (MAP_* strings) that need a name
 * @param {Array}    args.roms       per-ROM descriptors in bundle order: [{ player, run }, …]
 * @param {number}   args.seed       base RNG seed (cfg.seed)
 * @returns {Array<Object<string,{nickname:?string,gender:?('M'|'F')}>>} one location→naming map per ROM
 */
function buildLocationNaming({ config, locations, roms, seed }) {
    const pool = normalizePool(config.pool);
    // Canonical draw order so a location's name depends only on the location SET + seed, never on the
    // order the caller happened to list them in.
    const sortedLocations = [...new Set(locations)].sort();
    // groupKeyFor only reads shareAcrossSoullink + sameNamesAcrossRuns off this object.
    const shareCfg = {
        shareAcrossSoullink: config.shareAcrossSoullink,
        sameNamesAcrossRuns: config.sameNamesAcrossRuns,
    };

    const seqByKey = new Map();
    let ordinal = 0;
    for (const rom of roms) {
        const key = groupKeyFor(rom, shareCfg);
        if (seqByKey.has(key)) continue;
        const groupSeed = (seed ^ (ordinal * GOLDEN)) >>> 0;
        rng.seed(groupSeed);
        seqByKey.set(key, rollGroup(pool, sortedLocations, config.genderLockPerRoute));
        ordinal++;
    }

    return roms.map((rom) => cloneMap(seqByKey.get(groupKeyFor(rom, shareCfg))));
}

module.exports = { buildLocationNaming };
