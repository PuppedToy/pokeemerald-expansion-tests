'use strict';

// T-068 — starter-extra nickname & gender assignment (bundle side).
//
// Pure, seeded, no I/O. For each ROM it decides, per named slot (the main starter — only when
// `includeStarter` — and every extra starter), a 50/50 gender coin and a nickname drawn WITHOUT
// REPLACEMENT from the appropriate pool, so a name never repeats within a ROM regardless of gender.
//
// Sharing: ROMs that must carry the SAME names slot-by-slot are grouped (see groupKeyFor). One
// (coin, name) sequence is rolled per group and copied to every ROM in it; independent groups draw
// from fresh pool copies (names may coincide across groups — they are separate games). The gender is
// always a coin regardless of a species' natural ratio; the ROM maker forces it only where the
// species allows it (genderless/fixed-gender mons keep their real gender).

const rng = require('../rng');

const GOLDEN = 0x9E3779B9;

// Dedupe case-insensitively, trim, drop blanks; preserve first-seen order.
function normalizePool(list) {
    const out = [];
    const seen = new Set();
    for (const raw of Array.isArray(list) ? list : []) {
        if (typeof raw !== 'string') continue;
        const name = raw.trim();
        if (!name) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(name);
    }
    return out;
}

// Concatenate two already-normalized pools, dropping cross-pool duplicates (first wins).
function mergePools(a, b) {
    const out = a.slice();
    const seen = new Set(a.map((n) => n.toLowerCase()));
    for (const n of b) {
        const key = n.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(n);
    }
    return out;
}

// The sharing-group key for one ROM. Collapsing a dimension to '*' means names are shared along it:
//   shareAcrossSoullink → share across players (same run index);
//   sameNamesAcrossRuns → share across a player's runs.
// This one formula covers default (single ROM), nuzlocke (player always 0) and soul-link.
function groupKeyFor(rom, nicknames) {
    const player = nicknames.shareAcrossSoullink ? '*' : (rom.player ?? 0);
    const run = nicknames.sameNamesAcrossRuns ? '*' : (rom.run ?? 0);
    return `${player}|${run}`;
}

// Roll one slot: coin gender, then a pool-unique name (or null if the pool is exhausted).
function rollSlot(pools, differentPerGender, used) {
    const gender = rng.random() < 0.5 ? 'M' : 'F';
    const candidates = differentPerGender
        ? mergePools(gender === 'F' ? pools.female : pools.male, pools.both)
        : pools.single;
    const avail = candidates.filter((n) => !used.has(n.toLowerCase()));
    if (avail.length === 0) return { gender, nickname: null };
    const pick = avail[Math.floor(rng.random() * avail.length)];
    used.add(pick.toLowerCase());
    return { gender, nickname: pick };
}

// One (starter?, extras[]) sequence for a whole group.
function rollGroup(pools, nicknames, extraCount) {
    const used = new Set();
    const starter = nicknames.includeStarter
        ? rollSlot(pools, nicknames.differentPerGender, used)
        : null;
    const extras = [];
    for (let i = 0; i < extraCount; i++) extras.push(rollSlot(pools, nicknames.differentPerGender, used));
    return { starter, extras };
}

const clone = (seq) => ({
    starter: seq.starter ? { ...seq.starter } : null,
    extras: seq.extras.map((e) => ({ ...e })),
});

/**
 * @param {object}   args
 * @param {object}   args.nicknames  the config `nicknames` object (enabled/includeStarter/…/pools)
 * @param {Array}    args.roms       per-ROM descriptors in bundle order: [{ player, run }, …]
 * @param {number}   args.extraCount number of extra-starter slots (uniform across ROMs)
 * @param {number}   args.seed       base RNG seed (cfg.seed)
 * @returns {Array<{starter:?{gender,nickname},extras:Array<{gender,nickname}>}>} parallel to roms
 */
function buildStarterNaming({ nicknames, roms, extraCount, seed }) {
    const male = normalizePool(nicknames.pools?.male);
    const female = normalizePool(nicknames.pools?.female);
    const both = normalizePool(nicknames.pools?.both);
    let single = normalizePool(nicknames.pools?.single);
    if (single.length === 0) single = mergePools(mergePools(both, female), male);
    const pools = { male, female, both, single };

    // Assign a stable ordinal to each group by first appearance (bundle order), roll its sequence once.
    const seqByKey = new Map();
    let ordinal = 0;
    for (const rom of roms) {
        const key = groupKeyFor(rom, nicknames);
        if (seqByKey.has(key)) continue;
        const groupSeed = (seed ^ (ordinal * GOLDEN)) >>> 0;
        rng.seed(groupSeed);
        seqByKey.set(key, rollGroup(pools, nicknames, extraCount));
        ordinal++;
    }

    return roms.map((rom) => clone(seqByKey.get(groupKeyFor(rom, nicknames))));
}

module.exports = { buildStarterNaming, groupKeyFor, normalizePool };
