'use strict';

// T-068 — buildStarterNaming: per-ROM gender coin + pool-unique nickname draw, with sharing groups.
// Pure + deterministic (seeded). No filesystem, no game data.

const rng = require('../../rng');
const { buildStarterNaming, groupKeyFor } = require('../../modules/starterNames');

// A generous, disjoint set of pools so uniqueness has room.
const bigPools = () => ({
    male: Array.from({ length: 40 }, (_, i) => `M${i}`),
    female: Array.from({ length: 40 }, (_, i) => `F${i}`),
    both: Array.from({ length: 20 }, (_, i) => `B${i}`),
    single: Array.from({ length: 80 }, (_, i) => `S${i}`),
});

const cfg = (over = {}) => ({
    enabled: true,
    includeStarter: false,
    sameNamesAcrossRuns: false,
    shareAcrossSoullink: true,
    differentPerGender: true,
    pools: bigPools(),
    ...over,
});

const roms1 = [{ player: 0, run: 0 }];
const romsNuz = (n) => Array.from({ length: n }, (_, i) => ({ player: 0, run: i }));
const romsSoul = (p, r) => {
    const out = [];
    for (let pi = 0; pi < p; pi++) for (let ri = 0; ri < r; ri++) out.push({ player: pi, run: ri });
    return out;
};

const allNames = (rom) =>
    [rom.starter, ...rom.extras].filter(Boolean).map((s) => s.nickname).filter((n) => n != null);

afterEach(() => rng.reset());

describe('buildStarterNaming — shape & basics', () => {
    test('returns one entry per ROM, extras length = extraCount', () => {
        const out = buildStarterNaming({ nicknames: cfg(), roms: roms1, extraCount: 9, seed: 1 });
        expect(out).toHaveLength(1);
        expect(out[0].extras).toHaveLength(9);
    });

    test('includeStarter=false → starter is null; extras still named', () => {
        const out = buildStarterNaming({ nicknames: cfg({ includeStarter: false }), roms: roms1, extraCount: 3, seed: 7 });
        expect(out[0].starter).toBeNull();
        expect(out[0].extras.every((e) => typeof e.nickname === 'string' && e.nickname.length > 0)).toBe(true);
    });

    test('includeStarter=true → starter has a coin gender and a nickname', () => {
        const out = buildStarterNaming({ nicknames: cfg({ includeStarter: true }), roms: roms1, extraCount: 3, seed: 7 });
        expect(out[0].starter).not.toBeNull();
        expect(['M', 'F']).toContain(out[0].starter.gender);
        expect(typeof out[0].starter.nickname).toBe('string');
    });

    test('every slot gender is a 50/50 coin — only M or F', () => {
        const out = buildStarterNaming({ nicknames: cfg({ includeStarter: true }), roms: romsNuz(4), extraCount: 9, seed: 3 });
        for (const rom of out) for (const slot of [rom.starter, ...rom.extras]) expect(['M', 'F']).toContain(slot.gender);
    });
});

describe('buildStarterNaming — determinism', () => {
    test('same seed + inputs → identical output', () => {
        const a = buildStarterNaming({ nicknames: cfg(), roms: romsNuz(3), extraCount: 9, seed: 42 });
        const b = buildStarterNaming({ nicknames: cfg(), roms: romsNuz(3), extraCount: 9, seed: 42 });
        expect(a).toEqual(b);
    });

    test('different seed → different output (with a large pool)', () => {
        const a = buildStarterNaming({ nicknames: cfg(), roms: roms1, extraCount: 9, seed: 1 });
        const b = buildStarterNaming({ nicknames: cfg(), roms: roms1, extraCount: 9, seed: 2 });
        expect(a).not.toEqual(b);
    });
});

describe('buildStarterNaming — uniqueness', () => {
    test('no nickname repeats within a ROM (starter + extras)', () => {
        const out = buildStarterNaming({ nicknames: cfg({ includeStarter: true }), roms: roms1, extraCount: 9, seed: 99 });
        const names = allNames(out[0]).map((n) => n.toLowerCase());
        expect(new Set(names).size).toBe(names.length);
    });

    test('uniqueness holds across genders — a both-pool name is not reused', () => {
        // Force all draws from `both` (male/female empty): 2 names, 2 slots → both distinct.
        const pools = { male: [], female: [], both: ['Alex', 'Sam'], single: [] };
        const out = buildStarterNaming({ nicknames: cfg({ pools, includeStarter: false }), roms: roms1, extraCount: 2, seed: 5 });
        const names = out[0].extras.map((e) => e.nickname).sort();
        expect(names).toEqual(['Alex', 'Sam']);
    });

    test('pool exhaustion → excess slots get null nickname, no throw', () => {
        const pools = { male: [], female: [], both: ['Only'], single: [] };
        const out = buildStarterNaming({ nicknames: cfg({ pools, includeStarter: false }), roms: roms1, extraCount: 3, seed: 5 });
        const nn = out[0].extras.map((e) => e.nickname);
        expect(nn.filter((n) => n != null)).toEqual(['Only']);
        expect(nn.filter((n) => n === null)).toHaveLength(2);
    });

    test('duplicate / whitespace / empty pool entries are normalized away', () => {
        const pools = { male: [], female: [], both: [' Alex ', 'alex', 'ALEX', '', '  '], single: [] };
        const out = buildStarterNaming({ nicknames: cfg({ pools, includeStarter: false }), roms: roms1, extraCount: 3, seed: 1 });
        const named = out[0].extras.map((e) => e.nickname).filter((n) => n != null);
        expect(named).toHaveLength(1); // only one distinct "Alex"
        expect(named[0].toLowerCase()).toBe('alex');
    });

    test('!differentPerGender → names drawn from the single pool', () => {
        const pools = { male: ['x'], female: ['y'], both: ['z'], single: ['One', 'Two', 'Three'] };
        const out = buildStarterNaming({
            nicknames: cfg({ pools, differentPerGender: false, includeStarter: false }),
            roms: roms1, extraCount: 3, seed: 8,
        });
        const named = out[0].extras.map((e) => e.nickname).sort();
        expect(named).toEqual(['One', 'Three', 'Two']);
    });
});

describe('groupKeyFor — sharing partition', () => {
    test('default single ROM is its own group', () => {
        const k = groupKeyFor({ player: 0, run: 0 }, cfg());
        expect(typeof k).toBe('string');
    });

    test('nuzlocke: sameNamesAcrossRuns ON → all runs share one key', () => {
        const c = cfg({ sameNamesAcrossRuns: true });
        const keys = romsNuz(3).map((r) => groupKeyFor(r, c));
        expect(new Set(keys).size).toBe(1);
    });

    test('nuzlocke: sameNamesAcrossRuns OFF → each run its own key', () => {
        const c = cfg({ sameNamesAcrossRuns: false });
        const keys = romsNuz(3).map((r) => groupKeyFor(r, c));
        expect(new Set(keys).size).toBe(3);
    });

    test('soul-link: share ON + sameRuns OFF → grouped by run across players', () => {
        const c = cfg({ shareAcrossSoullink: true, sameNamesAcrossRuns: false });
        const k = (p, r) => groupKeyFor({ player: p, run: r }, c);
        expect(k(0, 0)).toBe(k(1, 0));
        expect(k(0, 1)).toBe(k(1, 1));
        expect(k(0, 0)).not.toBe(k(0, 1));
    });

    test('soul-link: both OFF → every (player,run) distinct', () => {
        const c = cfg({ shareAcrossSoullink: false, sameNamesAcrossRuns: false });
        const keys = romsSoul(2, 2).map((r) => groupKeyFor(r, c));
        expect(new Set(keys).size).toBe(4);
    });

    test('soul-link: both ON → one group', () => {
        const c = cfg({ shareAcrossSoullink: true, sameNamesAcrossRuns: true });
        const keys = romsSoul(2, 2).map((r) => groupKeyFor(r, c));
        expect(new Set(keys).size).toBe(1);
    });
});

describe('buildStarterNaming — sharing produces matching / independent naming', () => {
    test('ROMs in the same group get IDENTICAL naming', () => {
        const c = cfg({ shareAcrossSoullink: true, sameNamesAcrossRuns: false });
        const roms = romsSoul(2, 2); // (0,0)(0,1)(1,0)(1,1)
        const out = buildStarterNaming({ nicknames: c, roms, extraCount: 9, seed: 21 });
        // index0=(0,0) index2=(1,0) same run → identical; index1=(0,1) index3=(1,1) identical
        expect(out[0]).toEqual(out[2]);
        expect(out[1]).toEqual(out[3]);
        expect(out[0]).not.toEqual(out[1]);
    });

    test('nuzlocke sameNamesAcrossRuns ON → all ROMs identical', () => {
        const out = buildStarterNaming({ nicknames: cfg({ sameNamesAcrossRuns: true }), roms: romsNuz(3), extraCount: 9, seed: 4 });
        expect(out[1]).toEqual(out[0]);
        expect(out[2]).toEqual(out[0]);
    });

    test('nuzlocke sameNamesAcrossRuns OFF → ROMs are independent (differ)', () => {
        const out = buildStarterNaming({ nicknames: cfg({ sameNamesAcrossRuns: false }), roms: romsNuz(3), extraCount: 9, seed: 4 });
        expect(out[0]).not.toEqual(out[1]);
    });
});
