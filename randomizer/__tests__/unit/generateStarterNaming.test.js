'use strict';

// T-068 — generate.js wiring: attachStarterNaming derives the extra-slot count from the per-ROM
// `wild.extraStarters`, honors the feature flag, and attaches a valid per-ROM `starterNaming`.

const { attachStarterNaming } = require('../../generate');

const mkRom = (romIndex, extraCount) => ({
    romIndex,
    artifacts: {
        pokedex: 'shared', trainers: 'shared', starters: 'shared',
        wild: { extraStarters: Array.from({ length: extraCount }, (_, i) => `SPECIES_X${i}`) },
    },
});

const pools = {
    male: Array.from({ length: 20 }, (_, i) => `M${i}`),
    female: Array.from({ length: 20 }, (_, i) => `F${i}`),
    both: Array.from({ length: 10 }, (_, i) => `B${i}`),
    single: [],
};
const nick = (over = {}) => ({
    enabled: true, includeStarter: false, sameNamesAcrossRuns: false,
    shareAcrossSoullink: true, differentPerGender: true, pools, ...over,
});

test('feature OFF → no starterNaming attached (bundle unchanged)', () => {
    const roms = [mkRom(0, 9)];
    attachStarterNaming({ seed: 1 }, { nicknames: nick({ enabled: false }) }, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.starterNaming).toBeUndefined();
});

test('no nicknames config at all → no-op', () => {
    const roms = [mkRom(0, 9)];
    attachStarterNaming({ seed: 1 }, {}, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.starterNaming).toBeUndefined();
});

test('feature ON → each ROM gets starterNaming with extras length = wild.extraStarters length', () => {
    const roms = [mkRom(0, 9)];
    attachStarterNaming({ seed: 1 }, { nicknames: nick() }, roms, [{ player: 0, run: 0 }]);
    const sn = roms[0].artifacts.starterNaming;
    expect(sn).toBeDefined();
    expect(sn.starter).toBeNull(); // includeStarter false
    expect(sn.extras).toHaveLength(9);
    for (const e of sn.extras) {
        expect(['M', 'F']).toContain(e.gender);
        expect(typeof e.nickname === 'string' || e.nickname === null).toBe(true);
    }
    // unique within the ROM
    const names = sn.extras.map((e) => e.nickname).filter(Boolean).map((n) => n.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
});

test('extraCount is the max across ROMs (uniform config expected, but robust)', () => {
    const roms = [mkRom(0, 9), mkRom(1, 7)];
    attachStarterNaming({ seed: 1 }, { nicknames: nick() }, roms, [{ player: 0, run: 0 }, { player: 0, run: 1 }]);
    expect(roms[0].artifacts.starterNaming.extras).toHaveLength(9);
    expect(roms[1].artifacts.starterNaming.extras).toHaveLength(9);
});

test('extraCount 0 and includeStarter false → no-op', () => {
    const roms = [mkRom(0, 0)];
    attachStarterNaming({ seed: 1 }, { nicknames: nick() }, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.starterNaming).toBeUndefined();
});

test('includeStarter true → starter slot present even with 0 extras', () => {
    const roms = [mkRom(0, 0)];
    attachStarterNaming({ seed: 1 }, { nicknames: nick({ includeStarter: true }) }, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.starterNaming.starter).not.toBeNull();
    expect(roms[0].artifacts.starterNaming.extras).toHaveLength(0);
});
