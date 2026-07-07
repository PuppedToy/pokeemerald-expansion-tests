'use strict';

// T-070 — location-based nickname assignment (bundle side).
//
// Part of the SAME nickname feature as T-068 starters: it reuses the shared `nicknames` config — the same
// name pools and the `differentPerGender` switch — so there is only ever ONE name list. Assigns one
// unique nickname per LOCATION (a MAP_* key) per ROM, drawn without replacement.
//
// Gender: when `differentPerGender` is on, a coin picks which gender pool (∪ both) the route's name comes
// from; that gender is FORCED in-game only when `lockGenderPerRoute` is also on (else the name is still
// gendered-pool-derived but the mons keep their natural gender). When `differentPerGender` is off, names
// come from the single pool and no gender is forced (gender-lock is disabled in the UI).
//
// Sharing (nuzlocke same-across-runs, soul-link share-per-player) reuses T-068's group logic.

const rng = require('../rng');
const { groupKeyFor, normalizePool } = require('./starterNames');

const GOLDEN = 0x9E3779B9;
// Salt so location group seeds don't collide with starter group seeds (both derive from cfg.seed), which
// would otherwise correlate the first starter name with the first location's name.
const LOCATION_SALT = 0x1B873593;

function mergePools(a, b) {
    const out = a.slice();
    const seen = new Set(a.map((n) => n.toLowerCase()));
    for (const n of b) {
        const key = n.toLowerCase();
        if (!seen.has(key)) { seen.add(key); out.push(n); }
    }
    return out;
}

// One location→{nickname,gender} mapping for a whole sharing group.
function rollGroup({ femalePool, malePool, singlePool, differentPerGender, lockGender }, locations) {
    const used = new Set();
    const map = {};
    for (const loc of locations) {
        let coin = null;
        let candidates;
        if (differentPerGender) {
            coin = rng.random() < 0.5 ? 'M' : 'F';
            candidates = coin === 'F' ? femalePool : malePool;
        } else {
            candidates = singlePool;
        }
        const avail = candidates.filter((n) => !used.has(n.toLowerCase()));
        let nickname = null;
        if (avail.length > 0) {
            nickname = avail[Math.floor(rng.random() * avail.length)];
            used.add(nickname.toLowerCase());
        }
        map[loc] = { nickname, gender: (differentPerGender && lockGender) ? coin : null };
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
 * @param {object}   args.nicknames  the shared `nicknames` config (pools, differentPerGender,
 *                                    lockGenderPerRoute, sameNamesAcrossRuns, shareAcrossSoullink)
 * @param {string[]} args.locations  the location keys (MAP_* strings) that need a name
 * @param {Array}    args.roms       per-ROM descriptors in bundle order: [{ player, run }, …]
 * @param {number}   args.seed       base RNG seed (cfg.seed)
 * @returns {Array<Object<string,{nickname:?string,gender:?('M'|'F')}>>} one location→naming map per ROM
 */
function buildLocationNaming({ nicknames, locations, roms, seed }) {
    const male = normalizePool(nicknames.pools?.male);
    const female = normalizePool(nicknames.pools?.female);
    const both = normalizePool(nicknames.pools?.both);
    let single = normalizePool(nicknames.pools?.single);
    if (single.length === 0) single = mergePools(mergePools(both, female), male);
    const groupPools = {
        femalePool: mergePools(female, both),
        malePool: mergePools(male, both),
        singlePool: single,
        differentPerGender: nicknames.differentPerGender !== false,
        lockGender: nicknames.lockGenderPerRoute === true,
    };

    const sortedLocations = [...new Set(locations)].sort();
    const shareCfg = {
        shareAcrossSoullink: nicknames.shareAcrossSoullink,
        sameNamesAcrossRuns: nicknames.sameNamesAcrossRuns,
    };

    const seqByKey = new Map();
    let ordinal = 0;
    for (const rom of roms) {
        const key = groupKeyFor(rom, shareCfg);
        if (seqByKey.has(key)) continue;
        rng.seed(((seed ^ (ordinal * GOLDEN)) ^ LOCATION_SALT) >>> 0);
        seqByKey.set(key, rollGroup(groupPools, sortedLocations));
        ordinal++;
    }

    return roms.map((rom) => cloneMap(seqByKey.get(groupKeyFor(rom, shareCfg))));
}

module.exports = { buildLocationNaming };
