'use strict';

// T-070 — generate.js wiring: attachLocationNaming is gated by the shared nicknames master toggle + the
// autoLocation switch, and attaches a per-ROM location→naming map covering ENCOUNTER_LOCATIONS.

const { attachLocationNaming } = require('../../generate');
const { ENCOUNTER_LOCATIONS } = require('../../data/encounterLocations');

const mkRom = () => ({ romIndex: 0, artifacts: { pokedex: 'shared', trainers: 'shared', starters: 'shared', wild: {} } });
const nick = (over = {}) => ({
    enabled: true, autoLocation: true, differentPerGender: false, lockGenderPerRoute: false,
    sameNamesAcrossRuns: false, shareAcrossSoullink: true,
    pools: { male: [], female: [], both: [], single: Array.from({ length: 400 }, (_, i) => `Nm${i}`) },
    ...over,
});

test('master OFF → no locationNaming', () => {
    const roms = [mkRom()];
    attachLocationNaming({ seed: 1 }, { nicknames: nick({ enabled: false }) }, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.locationNaming).toBeUndefined();
});

test('autoLocation OFF → no locationNaming (even with master ON)', () => {
    const roms = [mkRom()];
    attachLocationNaming({ seed: 1 }, { nicknames: nick({ autoLocation: false }) }, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.locationNaming).toBeUndefined();
});

test('no nicknames config → no-op', () => {
    const roms = [mkRom()];
    attachLocationNaming({ seed: 1 }, {}, roms, [{ player: 0, run: 0 }]);
    expect(roms[0].artifacts.locationNaming).toBeUndefined();
});

test('master + autoLocation ON → per-ROM map covering every location with a unique name', () => {
    const roms = [mkRom()];
    attachLocationNaming({ seed: 7 }, { nicknames: nick() }, roms, [{ player: 0, run: 0 }]);
    const ln = roms[0].artifacts.locationNaming;
    expect(ln).toBeDefined();
    expect(Object.keys(ln).sort()).toEqual([...ENCOUNTER_LOCATIONS].sort());
    expect(typeof ln.MAP_ROUTE102.nickname).toBe('string');
    expect(ln.MAP_ROUTE102.gender).toBeNull(); // lock off
    const names = Object.values(ln).map((v) => v.nickname.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
});

test('differentPerGender + lockGenderPerRoute → each location carries a coin gender', () => {
    const roms = [mkRom()];
    attachLocationNaming({ seed: 7 }, {
        nicknames: nick({ differentPerGender: true, lockGenderPerRoute: true,
            pools: { male: Array.from({ length: 200 }, (_, i) => `M${i}`), female: Array.from({ length: 200 }, (_, i) => `F${i}`), both: [], single: [] } }),
    }, roms, [{ player: 0, run: 0 }]);
    expect(['M', 'F']).toContain(roms[0].artifacts.locationNaming.MAP_ROUTE102.gender);
});
