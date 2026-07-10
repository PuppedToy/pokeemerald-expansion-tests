'use strict';

// T-105 / ADR-016 §3 — the sophistication scalar: how hard the generator pursues a coherent
// archetype identity for a given trainer. ~0 for early-route trainers, ~1 by the endgame.

const { createSophisticationScale } = require('../../modules/sophistication');
const { createTeamResolver } = require('../../modules/resolveTrainerTeam');

// Synthetic boss caps with monotonically rising level caps (mirrors buildBossCaps() output shape).
const CAPS = [
    { order: 0, level: 6 },
    { order: 1, level: 15 },
    { order: 2, level: 30 },
    { order: 3, level: 45 },
    { order: 4, level: 60 },
];

describe('sophistication scale (T-105)', () => {
    test('returns floor at the first cap level and ceil at the last', () => {
        const s = createSophisticationScale(CAPS);
        expect(s({ level: 6 })).toBeCloseTo(0);
        expect(s({ level: 60 })).toBeCloseTo(1);
    });

    test('is monotonic non-decreasing along the boss progression', () => {
        const s = createSophisticationScale(CAPS);
        const vals = CAPS.map(c => s({ level: c.level }));
        for (let i = 1; i < vals.length; i++) {
            expect(vals[i]).toBeGreaterThanOrEqual(vals[i - 1]);
        }
    });

    test('is monotonic non-decreasing in trainer level generally', () => {
        const s = createSophisticationScale(CAPS);
        let prev = -Infinity;
        for (let lvl = 1; lvl <= 70; lvl++) {
            const v = s({ level: lvl });
            expect(v).toBeGreaterThanOrEqual(prev);
            prev = v;
        }
    });

    test('output stays within [0,1] with default bounds, clamping out-of-range levels', () => {
        const s = createSophisticationScale(CAPS);
        expect(s({ level: 1 })).toBe(0);      // below the first cap → floor
        expect(s({ level: 999 })).toBe(1);    // above the last cap → ceil
        for (let lvl = 1; lvl <= 70; lvl++) {
            const v = s({ level: lvl });
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThanOrEqual(1);
        }
    });

    test('respects configured floor/ceil bounds', () => {
        const s = createSophisticationScale(CAPS, { floor: 0.1, ceil: 0.9 });
        expect(s({ level: 6 })).toBeCloseTo(0.1);
        expect(s({ level: 60 })).toBeCloseTo(0.9);
        expect(s({ level: 30 })).toBeGreaterThan(0.1);
        expect(s({ level: 30 })).toBeLessThan(0.9);
    });

    test('gamma > 1 eases in — mid-game less sophisticated, endpoints unchanged', () => {
        const linear = createSophisticationScale(CAPS, { gamma: 1 });
        const eased = createSophisticationScale(CAPS, { gamma: 2 });
        const mid = { level: 30 };
        expect(eased(mid)).toBeLessThan(linear(mid));
        expect(eased({ level: 6 })).toBeCloseTo(linear({ level: 6 }));
        expect(eased({ level: 60 })).toBeCloseTo(linear({ level: 60 }));
    });

    test('degenerate/empty caps → neutral (fully sophisticated) and never throws', () => {
        expect(createSophisticationScale([])({ level: 20 })).toBe(1);
        expect(createSophisticationScale([{ level: 40 }])({ level: 40 })).toBe(1);
        expect(() => createSophisticationScale(undefined)({ level: 20 })).not.toThrow();
    });

    test('missing/invalid trainer level falls back to the low end', () => {
        const s = createSophisticationScale(CAPS);
        expect(s({})).toBe(0);
        expect(s(null)).toBe(0);
        expect(s({ level: NaN })).toBe(0);
    });
});

describe('resolver sophistication seam (T-105 wiring)', () => {
    test('the shared resolver exposes the sophistication scale, defaulting to neutral (1)', () => {
        // Neutral default keeps team output unchanged until T-107 gates on it.
        expect(createTeamResolver({}).sophisticationFor({ level: 5 })).toBe(1);
    });

    test('a supplied scale is threaded through to the resolver', () => {
        const scale = createSophisticationScale(CAPS);
        const resolver = createTeamResolver({ sophistication: scale });
        expect(resolver.sophisticationFor({ level: 6 })).toBeCloseTo(0);
        expect(resolver.sophisticationFor({ level: 60 })).toBeCloseTo(1);
    });
});
