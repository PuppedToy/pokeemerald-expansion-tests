'use strict';

// B-065 / T-262 — the resist-berry picks must never be starved.
//
// There are 18 resist berries (one per type). Handing them out 4 at a time to 5 locations needs 20,
// so the last location in the draw order (Route 121) used to receive only the 2 leftovers — the same
// 2-option menu in every run, seed-independent. Route 121 now draws from averageItemPool instead, so
// the 4 remaining berry locations each get a full pick of 4 unique berries.

const rng = require('../../rng');
const items = require('../../items');
const { buildAssignments } = require('../../itemRandomizer');

const ALL_BERRIES = new Set(Object.values(items.protectionBerries));

// Every assignment that hands out resist berries, found by content rather than by key name — so the
// invariant keeps holding whoever adds or moves a berry location.
function berryPicks(assignments) {
    return Object.entries(assignments)
        .filter(([, v]) => Array.isArray(v) && v.length > 0 && v.every(item => ALL_BERRIES.has(item)));
}

afterEach(() => rng.reset());

describe('resist-berry pick sizes (B-065)', () => {
    test.each([1, 42, 735016030])('every berry pick offers 4 options — seed %i', (s) => {
        rng.seed(s);
        const picks = berryPicks(buildAssignments());
        expect(picks.length).toBeGreaterThan(0);
        for (const [key, list] of picks) {
            expect([key, list.length]).toEqual([key, 4]);
        }
    });

    test('no berry is offered by two different locations', () => {
        rng.seed(735016030);
        const drawn = berryPicks(buildAssignments()).flatMap(([, list]) => list);
        expect(new Set(drawn).size).toBe(drawn.length);
    });
});

describe('the freed Route 121 ball (T-262)', () => {
    test('offers 3 averageItemPool items and no resist berry', () => {
        rng.seed(735016030);
        const a = buildAssignments();
        expect(a.route121Items).toHaveLength(3);
        for (const item of a.route121Items) {
            expect(items.averageItemPool).toContain(item);
            expect(ALL_BERRIES.has(item)).toBe(false);
        }
    });

    test('no berry key is assigned to the Route 121 pick any more', () => {
        rng.seed(1);
        const a = buildAssignments();
        expect(a.route121Berries).toBeUndefined();
    });
});
