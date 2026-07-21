'use strict';

// T-180 — order-independent global held-item assignment. The pure matching core: given each mon's per-item
// ratings and the bag (loose copies + pick-groups), assign items to maximise the team's TOTAL rating,
// respecting copy counts and capacity-1 pick-groups. Deterministic, no RNG.

const { assignItemsGlobally, maxWeightAssignment } = require('../../modules/itemAssignment');

// Brute-force optimum over all row→distinct-col assignments (rows ≤ cols), for cross-checking optimality.
function bruteForceMaxWeight(w) {
    const n = w.length, m = w[0].length;
    let best = -Infinity;
    const used = new Array(m).fill(false);
    const rec = (i, acc) => {
        if (i === n) { best = Math.max(best, acc); return; }
        for (let j = 0; j < m; j++) if (!used[j]) { used[j] = true; rec(i + 1, acc + w[i][j]); used[j] = false; }
    };
    rec(0, 0);
    return best;
}
const totalOf = (w, colForRow) => colForRow.reduce((s, c, i) => s + (c >= 0 ? w[i][c] : 0), 0);

describe('maxWeightAssignment — optimal bipartite matching (Hungarian)', () => {
    test('assigns each row to a distinct column maximising total weight', () => {
        const w = [[7, 5, 0], [6, 8, 0], [0, 0, 3]];
        const res = maxWeightAssignment(w);
        expect(new Set(res).size).toBe(res.length); // distinct columns
        expect(totalOf(w, res)).toBe(bruteForceMaxWeight(w));
    });

    test('matches brute force on many random small instances (deterministic PRNG)', () => {
        let seed = 12345;
        const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
        for (let t = 0; t < 200; t++) {
            const n = 1 + Math.floor(rand() * 6);         // 1..6 rows
            const m = n + Math.floor(rand() * 6);         // n..n+5 cols (n ≤ m)
            const w = Array.from({ length: n }, () => Array.from({ length: m }, () => Math.floor(rand() * 10)));
            const res = maxWeightAssignment(w);
            expect(new Set(res).size).toBe(res.length);
            expect(totalOf(w, res)).toBe(bruteForceMaxWeight(w));
        }
    });
});

describe('assignItemsGlobally — team item assignment', () => {
    const bag = (units, groups = []) => ({ units, groups });

    test('two attackers contend for one scarce item → it goes to whoever gains most (order-independent)', () => {
        // Only one Life Orb; mon B values it more. Both can fall back to Muscle Band (also single copy).
        // Unique optimum: A→MB(6)+B→LO(9)=15  >  A→LO(8)+B→MB(3)=11.
        const A = { ratings: { 'Life Orb': 8, 'Muscle Band': 6 } };
        const B = { ratings: { 'Life Orb': 9, 'Muscle Band': 3 } };
        const units = ['Life Orb', 'Muscle Band'];
        const res = assignItemsGlobally([A, B], bag(units));
        expect(res).toEqual(['Muscle Band', 'Life Orb']); // B (9) takes Life Orb, A takes Muscle Band
        // order-independent: swapping the inputs swaps the outputs but keeps each mon's item
        const resSwapped = assignItemsGlobally([B, A], bag(units));
        expect(resSwapped).toEqual(['Life Orb', 'Muscle Band']);
    });

    test('greedy-in-order would be worse; global assignment beats it', () => {
        // Greedy(A first): A grabs Life Orb (8), B left with Muscle Band (6) → 14. Here that IS optimal, so
        // build a case where greedy loses: A values LO 8 and has no fallback; B values LO 9 but Muscle Band 1.
        const A = { ratings: { 'Life Orb': 8 } };                       // no fallback
        const B = { ratings: { 'Life Orb': 9, 'Muscle Band': 1 } };
        const units = ['Life Orb', 'Muscle Band'];
        // Greedy A-first: A→LO(8), B→MB(1) = 9. Optimal: A→LO(8)? then B→MB(1)=9; OR B→LO(9),A→nothing=9.
        // Make A's fallback exist to force a real difference:
        const A2 = { ratings: { 'Life Orb': 8, 'Muscle Band': 7 } };
        const res = assignItemsGlobally([A2, B], bag(units));
        // Optimal: A2→MB(7)+B→LO(9)=16  vs  A2→LO(8)+B→MB(1)=9 → picks the 16 split
        expect(res).toEqual(['Muscle Band', 'Life Orb']);
    });

    test('a mon with no positive-rated available item gets nothing (null)', () => {
        const A = { ratings: { 'Life Orb': 8 } };
        const B = { ratings: {} }; // wants nothing in the bag
        const res = assignItemsGlobally([A, B], bag(['Life Orb']));
        expect(res[0]).toBe('Life Orb');
        expect(res[1]).toBeNull();
    });

    test('respects copy count: two copies of an item can serve two mons', () => {
        const A = { ratings: { 'Sitrus Berry': 7 } };
        const B = { ratings: { 'Sitrus Berry': 7 } };
        const res = assignItemsGlobally([A, B], bag(['Sitrus Berry', 'Sitrus Berry']));
        expect(res).toEqual(['Sitrus Berry', 'Sitrus Berry']);
    });

    test('single copy cannot serve two mons', () => {
        const A = { ratings: { 'Sitrus Berry': 7 } };
        const B = { ratings: { 'Sitrus Berry': 7 } };
        const res = assignItemsGlobally([A, B], bag(['Sitrus Berry']));
        expect(res.filter(x => x === 'Sitrus Berry')).toHaveLength(1);
        expect(res).toContain(null);
    });

    test('pick-group is capacity-1: only one mon draws from the pack, choosing its best member', () => {
        // One pick-pack [TM_A_ITEM, TM_B_ITEM] (a 2-choice). Two mons want different members.
        const A = { ratings: { 'Item A': 6, 'Item B': 2 } };
        const B = { ratings: { 'Item A': 2, 'Item B': 6 } };
        const units = ['Item A', 'Item B'];
        const groups = [{ members: ['Item A', 'Item B'] }];
        const res = assignItemsGlobally([A, B], bag(units, groups));
        // Only ONE of them can be served (the pack yields one unit); the other gets nothing.
        const served = res.filter(Boolean);
        expect(served).toHaveLength(1);
        // and the served mon took its best member
        if (res[0]) expect(res[0]).toBe('Item A'); else expect(res[1]).toBe('Item B');
    });

    test('loose copy + a pack containing the same item can serve two mons', () => {
        // bag has 1 loose "X" plus a pack [X, Y]; two mons both want X → both can get X (2 physical copies).
        const A = { ratings: { X: 5 } };
        const B = { ratings: { X: 5 } };
        const units = ['X', 'X', 'Y'];               // 2 copies of X (1 loose + 1 pack), 1 Y (pack)
        const groups = [{ members: ['X', 'Y'] }];
        const res = assignItemsGlobally([A, B], bag(units, groups));
        expect(res).toEqual(['X', 'X']);
    });

    test('order-independence: any permutation of mons yields the same per-mon assignment', () => {
        const mons = [
            { id: 'a', ratings: { 'Life Orb': 8, 'Assault Vest': 3 } },
            { id: 'b', ratings: { 'Life Orb': 9, 'Leftovers': 5 } },
            { id: 'c', ratings: { 'Assault Vest': 6, 'Leftovers': 4 } },
        ];
        const units = ['Life Orb', 'Assault Vest', 'Leftovers'];
        const base = assignItemsGlobally(mons, bag(units));
        const baseMap = Object.fromEntries(mons.map((m, i) => [m.id, base[i]]));
        // all 6 permutations
        const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
        for (const p of perms) {
            const permuted = p.map(i => mons[i]);
            const r = assignItemsGlobally(permuted, bag(units));
            const map = Object.fromEntries(permuted.map((m, i) => [m.id, r[i]]));
            expect(map).toEqual(baseMap);
        }
    });
});
