'use strict';

// T-070 — buildLocationNaming: one unique nickname per LOCATION per ROM, drawn from the SHARED nickname
// pools (same list as starters). Gender coin picks the pool when differentPerGender; it's forced only when
// lockGenderPerRoute. Reuses T-068 sharing groups. Pure + deterministic (seeded).

const rng = require('../../rng');
const { buildLocationNaming } = require('../../modules/locationNames');

const LOCATIONS = ['MAP_ROUTE101', 'MAP_ROUTE102', 'MAP_ROUTE103', 'MAP_PETALBURG_WOODS', 'MAP_DESERT_RUINS'];

const pools = () => ({
    male: Array.from({ length: 40 }, (_, i) => `M${i}`),
    female: Array.from({ length: 40 }, (_, i) => `F${i}`),
    both: Array.from({ length: 20 }, (_, i) => `B${i}`),
    single: Array.from({ length: 80 }, (_, i) => `S${i}`),
});
const cfg = (over = {}) => ({
    differentPerGender: false,
    lockGenderPerRoute: false,
    sameNamesAcrossRuns: false,
    shareAcrossSoullink: true,
    pools: pools(),
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

describe('buildLocationNaming — pools & gender', () => {
    test('one entry per ROM mapping every location to a name', () => {
        const out = buildLocationNaming({ nicknames: cfg(), locations: LOCATIONS, roms: roms1, seed: 1 });
        expect(out).toHaveLength(1);
        expect(Object.keys(out[0]).sort()).toEqual([...LOCATIONS].sort());
        for (const loc of LOCATIONS) expect(typeof out[0][loc].nickname).toBe('string');
    });

    test('!differentPerGender → single pool, gender null', () => {
        const out = buildLocationNaming({ nicknames: cfg({ differentPerGender: false }), locations: LOCATIONS, roms: roms1, seed: 3 });
        for (const loc of LOCATIONS) {
            expect(out[0][loc].gender).toBeNull();
            expect(out[0][loc].nickname.startsWith('S')).toBe(true); // drawn from single (S*) pool
        }
    });

    test('differentPerGender + lockGenderPerRoute → coin gender forced (M/F), name from that gender pool ∪ both', () => {
        const out = buildLocationNaming({ nicknames: cfg({ differentPerGender: true, lockGenderPerRoute: true }), locations: LOCATIONS, roms: roms1, seed: 3 });
        for (const loc of LOCATIONS) {
            const { gender, nickname } = out[0][loc];
            expect(['M', 'F']).toContain(gender);
            const prefix = gender === 'F' ? /^[FB]/ : /^[MB]/;
            expect(nickname).toMatch(prefix);
        }
    });

    // T-200 Duda 1 (deliberate spec change): with gendered pools but the per-route lock OFF, a route can no
    // longer receive a gendered name (which could land on the wrong-gender mon in-game). Names come ONLY from
    // the unisex `both` pool; gender stays null. (Previously it drew from `gender ∪ both` via a coin.)
    test('differentPerGender WITHOUT lockGenderPerRoute → names ONLY from the unisex `both` pool, gender null', () => {
        const out = buildLocationNaming({ nicknames: cfg({ differentPerGender: true, lockGenderPerRoute: false }), locations: LOCATIONS, roms: roms1, seed: 3 });
        for (const loc of LOCATIONS) {
            expect(out[0][loc].gender).toBeNull();
            expect(out[0][loc].nickname.startsWith('B')).toBe(true); // only the `both` (B*) pool
        }
    });
});

describe('buildLocationNaming — determinism & uniqueness', () => {
    test('same seed + inputs → identical output', () => {
        const a = buildLocationNaming({ nicknames: cfg(), locations: LOCATIONS, roms: romsNuz(3), seed: 42 });
        const b = buildLocationNaming({ nicknames: cfg(), locations: LOCATIONS, roms: romsNuz(3), seed: 42 });
        expect(a).toEqual(b);
    });

    test('names unique across locations within a ROM, incl. cross-gender (both pool not reused)', () => {
        // female/male empty → all draws come from `both`; two locations → distinct both-names.
        const p = { male: [], female: [], both: ['Alex', 'Sam'], single: [] };
        const out = buildLocationNaming({ nicknames: cfg({ differentPerGender: true, pools: p }), locations: ['MAP_A', 'MAP_B'], roms: roms1, seed: 5 });
        const names = ['MAP_A', 'MAP_B'].map((l) => out[0][l].nickname).sort();
        expect(names).toEqual(['Alex', 'Sam']);
    });

    test('assignment is location-keyed, independent of input order', () => {
        const a = buildLocationNaming({ nicknames: cfg(), locations: LOCATIONS, roms: roms1, seed: 5 });
        const b = buildLocationNaming({ nicknames: cfg(), locations: [...LOCATIONS].reverse(), roms: roms1, seed: 5 });
        for (const loc of LOCATIONS) expect(b[0][loc].nickname).toBe(a[0][loc].nickname);
    });

    test('pool exhaustion → surplus locations get null nickname, no throw', () => {
        const out = buildLocationNaming({ nicknames: cfg({ pools: { male: [], female: [], both: [], single: ['Only', 'Two'] } }), locations: LOCATIONS, roms: roms1, seed: 1 });
        expect(LOCATIONS.map((l) => out[0][l].nickname).filter(Boolean)).toHaveLength(2);
    });

    // T-200 Duda 2 — once names run out, later entities are left UNNAMED (never a reused name). Here the
    // gender-lock is OFF so only the single-name `both` pool feeds three locations → exactly one is named.
    test('gendered pools, lock OFF: `both` pool exhausted → surplus locations null, no repeats', () => {
        const p = { male: ['M0', 'M1'], female: ['F0', 'F1'], both: ['Uni'], single: [] };
        const out = buildLocationNaming({ nicknames: cfg({ differentPerGender: true, lockGenderPerRoute: false, pools: p }), locations: ['MAP_A', 'MAP_B', 'MAP_C'], roms: roms1, seed: 7 });
        const nonNull = ['MAP_A', 'MAP_B', 'MAP_C'].map((l) => out[0][l].nickname).filter(Boolean);
        expect(nonNull).toEqual(['Uni']);                        // only the unisex name is usable
        expect(new Set(nonNull.map((n) => n.toLowerCase())).size).toBe(nonNull.length); // never repeats
    });
});

describe('buildLocationNaming — sharing groups (mirrors T-068)', () => {
    test('nuzlocke sameNamesAcrossRuns ON → all ROMs share the mapping', () => {
        const out = buildLocationNaming({ nicknames: cfg({ sameNamesAcrossRuns: true }), locations: LOCATIONS, roms: romsNuz(3), seed: 4 });
        expect(out[1]).toEqual(out[0]);
        expect(out[2]).toEqual(out[0]);
    });

    test('nuzlocke sameNamesAcrossRuns OFF → ROMs are independent', () => {
        const out = buildLocationNaming({ nicknames: cfg({ sameNamesAcrossRuns: false }), locations: LOCATIONS, roms: romsNuz(3), seed: 4 });
        expect(out[0]).not.toEqual(out[1]);
    });

    test('soul-link share ON + sameRuns OFF → same run index shares across players; runs differ', () => {
        const out = buildLocationNaming({ nicknames: cfg({ shareAcrossSoullink: true, sameNamesAcrossRuns: false }), locations: LOCATIONS, roms: romsSoul(2, 2), seed: 21 });
        expect(out[0]).toEqual(out[2]);
        expect(out[1]).toEqual(out[3]);
        expect(out[0]).not.toEqual(out[1]);
    });
});
