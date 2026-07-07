'use strict';

// T-070 — buildLocationNaming: one unique nickname per LOCATION per ROM (single pool, without
// replacement), an optional per-location gender coin (only when genderLockPerRoute), reusing T-068's
// sharing-group logic for nuzlocke / soul-link. Pure + deterministic (seeded).

const rng = require('../../rng');
const { buildLocationNaming } = require('../../modules/locationNames');

const LOCATIONS = ['MAP_ROUTE101', 'MAP_ROUTE102', 'MAP_ROUTE103', 'MAP_PETALBURG_WOODS', 'MAP_DESERT_RUINS'];
const bigPool = Array.from({ length: 60 }, (_, i) => `Name${i}`);

const cfg = (over = {}) => ({
    enabled: true,
    genderLockPerRoute: false,
    sameNamesAcrossRuns: false,
    shareAcrossSoullink: true,
    pool: bigPool,
    ...over,
});

const roms1 = [{ player: 0, run: 0 }];
const romsNuz = (n) => Array.from({ length: n }, (_, i) => ({ player: 0, run: i }));
const romsSoul = (p, r) => {
    const out = [];
    for (let pi = 0; pi < p; pi++) for (let ri = 0; ri < r; ri++) out.push({ player: pi, run: ri });
    return out;
};

afterEach(() => rng.reset());

describe('buildLocationNaming — shape & basics', () => {
    test('one entry per ROM; each maps every location to a name', () => {
        const out = buildLocationNaming({ config: cfg(), locations: LOCATIONS, roms: roms1, seed: 1 });
        expect(out).toHaveLength(1);
        expect(Object.keys(out[0]).sort()).toEqual([...LOCATIONS].sort());
        for (const loc of LOCATIONS) expect(typeof out[0][loc].nickname).toBe('string');
    });

    test('genderLockPerRoute OFF → gender is null (names only)', () => {
        const out = buildLocationNaming({ config: cfg({ genderLockPerRoute: false }), locations: LOCATIONS, roms: roms1, seed: 3 });
        for (const loc of LOCATIONS) expect(out[0][loc].gender).toBeNull();
    });

    test('genderLockPerRoute ON → every location gets a coin gender M or F', () => {
        const out = buildLocationNaming({ config: cfg({ genderLockPerRoute: true }), locations: LOCATIONS, roms: roms1, seed: 3 });
        for (const loc of LOCATIONS) expect(['M', 'F']).toContain(out[0][loc].gender);
    });
});

describe('buildLocationNaming — determinism & uniqueness', () => {
    test('same seed + inputs → identical output', () => {
        const a = buildLocationNaming({ config: cfg(), locations: LOCATIONS, roms: romsNuz(3), seed: 42 });
        const b = buildLocationNaming({ config: cfg(), locations: LOCATIONS, roms: romsNuz(3), seed: 42 });
        expect(a).toEqual(b);
    });

    test('names are unique across locations within a ROM', () => {
        const out = buildLocationNaming({ config: cfg(), locations: LOCATIONS, roms: roms1, seed: 9 });
        const names = LOCATIONS.map((l) => out[0][l].nickname.toLowerCase());
        expect(new Set(names).size).toBe(names.length);
    });

    test('location order does not affect the location→name assignment (keyed, not positional)', () => {
        const a = buildLocationNaming({ config: cfg(), locations: LOCATIONS, roms: roms1, seed: 5 });
        const b = buildLocationNaming({ config: cfg(), locations: [...LOCATIONS].reverse(), roms: roms1, seed: 5 });
        // Same seed + same location SET → same name per location regardless of input order.
        for (const loc of LOCATIONS) expect(b[0][loc].nickname).toBe(a[0][loc].nickname);
    });

    test('pool exhaustion → surplus locations get a null nickname, no throw', () => {
        const out = buildLocationNaming({ config: cfg({ pool: ['Only', 'Two'] }), locations: LOCATIONS, roms: roms1, seed: 1 });
        const named = LOCATIONS.map((l) => out[0][l].nickname).filter(Boolean);
        expect(named).toHaveLength(2);
        expect(new Set(named.map((n) => n.toLowerCase())).size).toBe(2);
    });

    test('duplicate / blank pool entries are normalized away', () => {
        const out = buildLocationNaming({ config: cfg({ pool: [' Percy ', 'percy', 'PERCY', '', '  '] }), locations: LOCATIONS, roms: roms1, seed: 1 });
        const named = LOCATIONS.map((l) => out[0][l].nickname).filter(Boolean);
        expect(named).toHaveLength(1);
        expect(named[0].toLowerCase()).toBe('percy');
    });
});

describe('buildLocationNaming — sharing groups (mirrors T-068)', () => {
    test('nuzlocke sameNamesAcrossRuns ON → all ROMs share the same mapping', () => {
        const out = buildLocationNaming({ config: cfg({ sameNamesAcrossRuns: true }), locations: LOCATIONS, roms: romsNuz(3), seed: 4 });
        expect(out[1]).toEqual(out[0]);
        expect(out[2]).toEqual(out[0]);
    });

    test('nuzlocke sameNamesAcrossRuns OFF → ROMs are independent (differ)', () => {
        const out = buildLocationNaming({ config: cfg({ sameNamesAcrossRuns: false }), locations: LOCATIONS, roms: romsNuz(3), seed: 4 });
        expect(out[0]).not.toEqual(out[1]);
    });

    test('soul-link share ON + sameRuns OFF → same run index shares across players; runs differ', () => {
        const out = buildLocationNaming({ config: cfg({ shareAcrossSoullink: true, sameNamesAcrossRuns: false }), locations: LOCATIONS, roms: romsSoul(2, 2), seed: 21 });
        // order: (0,0)(0,1)(1,0)(1,1)
        expect(out[0]).toEqual(out[2]); // both players' run 0
        expect(out[1]).toEqual(out[3]); // both players' run 1
        expect(out[0]).not.toEqual(out[1]);
    });
});
