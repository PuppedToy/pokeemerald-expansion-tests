'use strict';

// T-070 — generate.js wiring: attachLocationNaming honors the flag and attaches a per-ROM
// location→naming map covering the ENCOUNTER_LOCATIONS set.

const { attachLocationNaming } = require('../../generate');
const { ENCOUNTER_LOCATIONS } = require('../../data/encounterLocations');

const mkRom = () => ({ romIndex: 0, artifacts: { pokedex: 'shared', trainers: 'shared', starters: 'shared', wild: {} } });
const cfg = (over = {}) => ({
    enabled: true, genderLockPerRoute: false, sameNamesAcrossRuns: false,
    shareAcrossSoullink: true, pool: Array.from({ length: 400 }, (_, i) => `Nm${i}`), ...over,
});

test('feature OFF → no locationNaming attached', () => {
    const roms = [mkRom()];
    attachLocationNaming({ seed: 1 }, { locationNicknames: cfg({ enabled: false }) }, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.locationNaming).toBeUndefined();
});

test('no locationNicknames config → no-op', () => {
    const roms = [mkRom()];
    attachLocationNaming({ seed: 1 }, {}, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.locationNaming).toBeUndefined();
});

test('feature ON → per-ROM map covering every encounter location with a unique name', () => {
    const roms = [mkRom()];
    attachLocationNaming({ seed: 7 }, { locationNicknames: cfg() }, roms, [{ player: 0, run: 0 }]);
    const ln = roms[0].artifacts.locationNaming;
    expect(ln).toBeDefined();
    expect(Object.keys(ln).sort()).toEqual([...ENCOUNTER_LOCATIONS].sort());
    // a concrete route gets a name; gender null when lock is off
    expect(typeof ln.MAP_ROUTE102.nickname).toBe('string');
    expect(ln.MAP_ROUTE102.gender).toBeNull();
    // pool (400) >= locations (134) → all named, all unique
    const names = Object.values(ln).map((v) => v.nickname.toLowerCase());
    expect(names.every(Boolean)).toBe(true);
    expect(new Set(names).size).toBe(names.length);
});

test('genderLockPerRoute ON → each location carries a coin gender', () => {
    const roms = [mkRom()];
    attachLocationNaming({ seed: 7 }, { locationNicknames: cfg({ genderLockPerRoute: true }) }, roms, [{ player: 0, run: 0 }]);
    expect(['M', 'F']).toContain(roms[0].artifacts.locationNaming.MAP_ROUTE102.gender);
});
