'use strict';

// T-200 Duda 3 — when a single `usedByGroup` Map is threaded through the starter, location and trade
// builders (as generate.js does), NO auto-nickname repeats anywhere in a ROM: starters, wild routes,
// statics, gifts and trades all draw from one global without-replacement pool per sharing group.

const rng = require('../../rng');
const { buildStarterNaming } = require('../../modules/starterNames');
const { buildLocationNaming, buildTradeNaming } = require('../../modules/locationNames');

afterEach(() => rng.reset());

const POOL = { male: [], female: [], both: [], single: Array.from({ length: 60 }, (_, i) => `N${i}`) };
const nick = (over = {}) => ({
    enabled: true, includeStarter: true, differentPerGender: false, lockGenderPerRoute: false,
    sameNamesAcrossRuns: false, shareAcrossSoullink: true, pools: POOL, ...over,
});
const LOCS = ['MAP_ROUTE101', 'MAP_ROUTE102', 'MAP_ANCIENT_TOMB', 'MAP_DEWFORD_TOWN_GYM'];
const TRADES = ['INGAME_TRADE_RUSTBORO', 'INGAME_TRADE_SLATEPORT'];

function allNames(rom, sn, ln, tn) {
    const out = [];
    if (sn.starter?.nickname) out.push(sn.starter.nickname);
    for (const e of sn.extras) if (e.nickname) out.push(e.nickname);
    for (const k of Object.keys(ln)) if (ln[k].nickname) out.push(ln[k].nickname);
    for (const k of Object.keys(tn)) if (tn[k].nickname) out.push(tn[k].nickname);
    return out;
}

test('shared usedByGroup → starter/location/trade names never collide within a ROM', () => {
    const roms = [{ player: 0, run: 0 }];
    const nicknames = nick();
    const usedByGroup = new Map();
    const sn = buildStarterNaming({ nicknames, roms, extraCount: 3, seed: 9, usedByGroup });
    const ln = buildLocationNaming({ nicknames, locations: LOCS, roms, seed: 9, usedByGroup });
    const tn = buildTradeNaming({ nicknames, trades: TRADES, roms, seed: 9, usedByGroup });

    const names = allNames(roms[0], sn[0], ln[0], tn[0]).map((n) => n.toLowerCase());
    expect(names.length).toBe(1 /*starter*/ + 3 /*extras*/ + 4 /*locs*/ + 2 /*trades*/); // pool big enough
    expect(new Set(names).size).toBe(names.length); // globally unique
});

test('WITHOUT a shared usedByGroup the same name CAN appear as a starter and a location (regression guard)', () => {
    // Demonstrates why the shared set is required: independent draws from the same single-name pool collide.
    const roms = [{ player: 0, run: 0 }];
    const one = { male: [], female: [], both: [], single: ['Solo'] };
    const nicknames = nick({ pools: one });
    const sn = buildStarterNaming({ nicknames, roms, extraCount: 0, seed: 3 });
    const ln = buildLocationNaming({ nicknames, locations: ['MAP_ROUTE101'], roms, seed: 3 });
    expect(sn[0].starter.nickname).toBe('Solo');
    expect(ln[0].MAP_ROUTE101.nickname).toBe('Solo'); // collision when not shared
});

test('shared usedByGroup with a single-name pool → the second builder gets null (never reuses)', () => {
    const roms = [{ player: 0, run: 0 }];
    const one = { male: [], female: [], both: [], single: ['Solo'] };
    const nicknames = nick({ pools: one });
    const usedByGroup = new Map();
    const sn = buildStarterNaming({ nicknames, roms, extraCount: 0, seed: 3, usedByGroup });
    const ln = buildLocationNaming({ nicknames, locations: ['MAP_ROUTE101'], roms, seed: 3, usedByGroup });
    expect(sn[0].starter.nickname).toBe('Solo');
    expect(ln[0].MAP_ROUTE101.nickname).toBeNull(); // exhausted → unnamed, never reused
});

test('shared usedByGroup preserves per-group sharing (nuzlocke same-across-runs)', () => {
    const roms = [{ player: 0, run: 0 }, { player: 0, run: 1 }];
    const nicknames = nick({ sameNamesAcrossRuns: true });
    const usedByGroup = new Map();
    const ln = buildLocationNaming({ nicknames, locations: LOCS, roms, seed: 5, usedByGroup });
    expect(ln[1]).toEqual(ln[0]); // both runs share the one group's mapping
});
