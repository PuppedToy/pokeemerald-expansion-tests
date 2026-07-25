'use strict';

// T-070 — location-based nickname assignment (bundle side).
//
// Part of the SAME nickname feature as T-068 starters: it reuses the shared `nicknames` config — the same
// name pools and the `differentPerGender` switch — so there is only ever ONE name list. Assigns one
// unique nickname per LOCATION (a MAP_* key) per ROM, drawn without replacement.
//
// Gender: when `differentPerGender` AND `lockGenderPerRoute` are both on, a coin picks the route gender, the
// name comes from that gender's pool (∪ both), and the gender is FORCED in-game. When `differentPerGender` is
// on but the lock is OFF (T-200 Duda 1), names are drawn ONLY from the unisex `both` pool with no forced
// gender — so a gendered name can never land on a wrong-gender Pokémon. When `differentPerGender` is off,
// names come from the single merged pool and no gender is forced (gender-lock is disabled in the UI).
//
// Sharing (nuzlocke same-across-runs, soul-link share-per-player) reuses T-068's group logic.

const rng = require('../rng');
const { groupKeyFor, normalizePool } = require('./starterNames');

const GOLDEN = 0x9E3779B9;
// Salts so each keyed-naming stream (locations, trades) derives an independent RNG sequence from cfg.seed,
// which would otherwise correlate the first starter/location/trade names with each other.
const LOCATION_SALT = 0x1B873593;
const TRADE_SALT = 0x85EBCA6B;

function mergePools(a, b) {
    const out = a.slice();
    const seen = new Set(a.map((n) => n.toLowerCase()));
    for (const n of b) {
        const key = n.toLowerCase();
        if (!seen.has(key)) { seen.add(key); out.push(n); }
    }
    return out;
}

// One key→{nickname,gender} mapping for a whole sharing group. `used` may be shared across builders (T-200)
// for global uniqueness; default is a fresh per-group set.
function rollGroup({ femalePool, malePool, bothPool, singlePool, differentPerGender, lockGender }, keys, used = new Set()) {
    const map = {};
    for (const loc of keys) {
        let coin = null;
        let candidates;
        if (differentPerGender && lockGender) {
            // Gender is forced per route → the name may come from that gender's pool (∪ both).
            coin = rng.random() < 0.5 ? 'M' : 'F';
            candidates = coin === 'F' ? femalePool : malePool;
        } else if (differentPerGender) {
            // T-200 Duda 1: gendered pools but the per-route gender is NOT locked → draw ONLY from the
            // unisex `both` pool, so a gendered name can never land on a wrong-gender Pokémon in-game.
            candidates = bothPool;
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

// Generic per-key naming pass (T-200): assigns one unique nickname per key (a MAP_* or a trade id) per
// sharing group, drawn from the shared pools without replacement. `salt` decorrelates the RNG stream from
// the other naming passes; `usedByGroup` (optional) threads one Set per group across builders so the whole
// game draws from a single without-replacement pool.
function buildKeyedNaming({ nicknames, keys, roms, seed, salt = 0, usedByGroup }) {
    const male = normalizePool(nicknames.pools?.male);
    const female = normalizePool(nicknames.pools?.female);
    const both = normalizePool(nicknames.pools?.both);
    let single = normalizePool(nicknames.pools?.single);
    if (single.length === 0) single = mergePools(mergePools(both, female), male);
    const groupPools = {
        femalePool: mergePools(female, both),
        malePool: mergePools(male, both),
        bothPool: both,
        singlePool: single,
        differentPerGender: nicknames.differentPerGender !== false,
        lockGender: nicknames.lockGenderPerRoute === true,
    };

    const sortedKeys = [...new Set(keys)].sort();
    const shareCfg = {
        shareAcrossSoullink: nicknames.shareAcrossSoullink,
        sameNamesAcrossRuns: nicknames.sameNamesAcrossRuns,
    };

    const seqByKey = new Map();
    let ordinal = 0;
    for (const rom of roms) {
        const key = groupKeyFor(rom, shareCfg);
        if (seqByKey.has(key)) continue;
        rng.seed(((seed ^ (ordinal * GOLDEN)) ^ salt) >>> 0);
        const used = usedByGroup ? (usedByGroup.get(key) || new Set()) : new Set();
        seqByKey.set(key, rollGroup(groupPools, sortedKeys, used));
        if (usedByGroup) usedByGroup.set(key, used);
        ordinal++;
    }

    return roms.map((rom) => cloneMap(seqByKey.get(groupKeyFor(rom, shareCfg))));
}

/**
 * @param {object}   args
 * @param {object}   args.nicknames  the shared `nicknames` config (pools, differentPerGender,
 *                                    lockGenderPerRoute, sameNamesAcrossRuns, shareAcrossSoullink)
 * @param {string[]} args.locations  the location keys (MAP_* strings) that need a name
 * @param {Array}    args.roms       per-ROM descriptors in bundle order: [{ player, run }, …]
 * @param {number}   args.seed       base RNG seed (cfg.seed)
 * @param {Map}      [args.usedByGroup]  optional shared used-name Set per sharing group (global uniqueness)
 * @returns {Array<Object<string,{nickname:?string,gender:?('M'|'F')}>>} one location→naming map per ROM
 */
function buildLocationNaming({ nicknames, locations, roms, seed, usedByGroup }) {
    return buildKeyedNaming({ nicknames, keys: locations, roms, seed, salt: LOCATION_SALT, usedByGroup });
}

/**
 * Town-trade naming (T-200): same pools/rules as locations but keyed by trade id (INGAME_TRADE_*), since
 * trades are not map-keyed. Shares `usedByGroup` so trade names never collide with any other auto-nickname.
 */
function buildTradeNaming({ nicknames, trades, roms, seed, usedByGroup }) {
    return buildKeyedNaming({ nicknames, keys: trades, roms, seed, salt: TRADE_SALT, usedByGroup });
}

module.exports = { buildLocationNaming, buildTradeNaming, buildKeyedNaming };
