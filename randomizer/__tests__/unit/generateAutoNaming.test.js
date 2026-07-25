'use strict';

// T-200 — attachAutoNaming wires starter + location/gift + trade naming through ONE shared pool per
// sharing group, so no auto-nickname repeats anywhere in a ROM, and attaches the new `tradeNaming` artifact.

const { attachAutoNaming } = require('../../generate');
const { TOWN_TRADES } = require('../../trades');

const mkRom = (extraCount) => ({
    romIndex: 0,
    artifacts: { pokedex: 's', trainers: 's', starters: 's', wild: { extraStarters: Array.from({ length: extraCount }, (_, i) => `SPECIES_X${i}`) } },
});
const nick = (over = {}) => ({
    enabled: true, includeStarter: true, autoLocation: true, autoTradesGifts: true,
    differentPerGender: false, lockGenderPerRoute: false, sameNamesAcrossRuns: false, shareAcrossSoullink: true,
    pools: { male: [], female: [], both: [], single: Array.from({ length: 400 }, (_, i) => `Nm${i}`) },
    ...over,
});

function collect(rom) {
    const names = [];
    const sn = rom.artifacts.starterNaming;
    if (sn) { if (sn.starter?.nickname) names.push(sn.starter.nickname); sn.extras.forEach((e) => e.nickname && names.push(e.nickname)); }
    for (const art of ['locationNaming', 'tradeNaming']) {
        const m = rom.artifacts[art] || {};
        for (const k of Object.keys(m)) if (m[k].nickname) names.push(m[k].nickname);
    }
    return names.map((n) => n.toLowerCase());
}

test('attaches starterNaming, locationNaming and tradeNaming when all toggles on', () => {
    const roms = [mkRom(3)];
    attachAutoNaming({ seed: 5 }, { nicknames: nick() }, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.starterNaming).toBeDefined();
    expect(roms[0].artifacts.locationNaming).toBeDefined();
    const tn = roms[0].artifacts.tradeNaming;
    expect(tn).toBeDefined();
    expect(Object.keys(tn).sort()).toEqual(TOWN_TRADES.map((t) => t.ingameTradeId).sort());
});

test('no auto-nickname repeats across starters + locations + trades within a ROM', () => {
    const roms = [mkRom(3)];
    attachAutoNaming({ seed: 5 }, { nicknames: nick() }, roms, [{ player: 0, run: 0 }]);
    const names = collect(roms[0]);
    expect(names.length).toBeGreaterThan(130); // starters + 134 locations + 4 trades, pool big enough
    expect(new Set(names).size).toBe(names.length); // globally unique
});

test('autoTradesGifts OFF → no tradeNaming, and gifts absent from locationNaming', () => {
    const roms = [mkRom(0)];
    attachAutoNaming({ seed: 5 }, { nicknames: nick({ includeStarter: false, autoTradesGifts: false }) }, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.tradeNaming).toBeUndefined();
    const ln = roms[0].artifacts.locationNaming;
    expect(ln.MAP_DEWFORD_TOWN_GYM).toBeUndefined(); // a gift map — not named when the toggle is off
    expect(ln.MAP_ROUTE102).toBeDefined();           // a wild route — still named by autoLocation
});

test('feature OFF → nothing attached', () => {
    const roms = [mkRom(3)];
    attachAutoNaming({ seed: 5 }, { nicknames: nick({ enabled: false }) }, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.starterNaming).toBeUndefined();
    expect(roms[0].artifacts.locationNaming).toBeUndefined();
    expect(roms[0].artifacts.tradeNaming).toBeUndefined();
});
