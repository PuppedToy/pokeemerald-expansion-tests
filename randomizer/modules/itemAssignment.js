'use strict';

// T-180 — order-independent global held-item assignment for a trainer's team.
//
// Today items are picked greedily one mon at a time in team order, so a mon can grab an item another mon
// would have valued more (team order changes the result). This module instead solves the whole team's
// held-item placement as a max-weight bipartite ASSIGNMENT: rows = the mons that need an item (≤ 6), columns
// = the bag's distinct resources (each loose copy of an item, plus each capacity-1 pick-group). The result
// maximises the team's TOTAL item rating and is invariant to the order the mons are given in.
//
// The compute cost is negligible: the rating matrix is already built by the current greedy path, and the
// matching itself is O(n²·m) on an n≤6 problem (see tasks/T-180 for the cost analysis). Pure + deterministic:
// consumes no RNG and its output depends only on (candidates, bag).

// Max-weight assignment of every row to a DISTINCT column (n rows ≤ m cols), via the O(n²·m) Hungarian
// (Kuhn–Munkres) potentials method run on the negated matrix. Returns colForRow[] (length n).
function maxWeightAssignment(weights) {
    const n = weights.length;
    if (n === 0) return [];
    const m = weights[0].length;
    // cost = -weight (minimise cost ⇒ maximise weight). 1-indexed internal arrays per the classic template.
    const cost = weights.map(row => row.map(w => -w));
    const INF = Infinity;
    const u = new Array(n + 1).fill(0);
    const v = new Array(m + 1).fill(0);
    const p = new Array(m + 1).fill(0);   // p[j] = row (1-indexed) currently assigned to column j; 0 = free
    const way = new Array(m + 1).fill(0);
    for (let i = 1; i <= n; i++) {
        p[0] = i;
        let j0 = 0;
        const minv = new Array(m + 1).fill(INF);
        const used = new Array(m + 1).fill(false);
        do {
            used[j0] = true;
            const i0 = p[j0];
            let delta = INF;
            let j1 = -1;
            for (let j = 1; j <= m; j++) {
                if (used[j]) continue;
                const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
                if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
                if (minv[j] < delta) { delta = minv[j]; j1 = j; }
            }
            for (let j = 0; j <= m; j++) {
                if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
                else minv[j] -= delta;
            }
            j0 = j1;
        } while (p[j0] !== 0);
        do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
    }
    const colForRow = new Array(n).fill(-1);
    for (let j = 1; j <= m; j++) if (p[j] >= 1 && p[j] <= n) colForRow[p[j] - 1] = j - 1;
    return colForRow;
}

// Turn a bag (flat `units` multiset + `groups` pick-packs) into assignable columns. A loose (unlinked) copy of
// an item is its own column; each pick-group is ONE capacity-1 column offering its members. Mirrors the
// consumption model in itemLinks.js: taking a group forgoes its siblings, so a pack serves at most one mon,
// while a loose copy (a buyable/fixed-reward duplicate beyond the pack) is independent.
function buildColumns(units, groups) {
    const total = new Map();
    for (const u of units) total.set(u, (total.get(u) || 0) + 1);
    const groupList = (groups || []).map(g => (g.members || []).slice());
    const groupCountFor = id => groupList.reduce((c, g) => c + (g.includes(id) ? 1 : 0), 0);
    const cols = [];
    for (const [id, cnt] of total) {
        const loose = cnt - groupCountFor(id);
        for (let i = 0; i < loose; i++) cols.push({ kind: 'loose', id });
    }
    for (const members of groupList) cols.push({ kind: 'group', members });
    return cols;
}

// value of a column for a candidate (0 if the mon doesn't want any obtainable item in it), plus which member
// a group column would yield for that mon.
function columnValue(cand, col) {
    if (col.kind === 'loose') return { value: cand.ratings[col.id] || 0, item: col.id };
    let bestVal = 0;
    let bestItem = null;
    for (const mbr of col.members) {
        const val = cand.ratings[mbr] || 0;
        if (val > bestVal) { bestVal = val; bestItem = mbr; }
    }
    return { value: bestVal, item: bestItem };
}

// Assign one item (or null) to each candidate to maximise the team's total rating.
//   candidates: [{ ratings: { <itemId>: <rating>0> } }]  — only positive ratings should be present.
//   bag: { units: string[], groups: [{ members: string[] }] }
// Returns string|null[] aligned to `candidates` (null = no item). Deterministic; no RNG.
function assignItemsGlobally(candidates, bag) {
    const n = candidates.length;
    if (n === 0) return [];
    const cols = buildColumns(bag.units || [], bag.groups || []);
    // n dummy columns (value 0) guarantee every row is assignable ⇒ "no item" when nothing positive is free.
    const totalCols = cols.length + n;
    const weights = candidates.map(cand => {
        const row = new Array(totalCols).fill(0);
        for (let j = 0; j < cols.length; j++) row[j] = columnValue(cand, cols[j]).value;
        return row; // dummy columns already 0
    });
    const colForRow = maxWeightAssignment(weights);
    return candidates.map((cand, i) => {
        const j = colForRow[i];
        if (j < 0 || j >= cols.length) return null;          // dummy column ⇒ no item
        const { value, item } = columnValue(cand, cols[j]);
        return value > 0 ? item : null;                      // a 0-value real column ⇒ no item
    });
}

module.exports = { assignItemsGlobally, maxWeightAssignment, buildColumns };
