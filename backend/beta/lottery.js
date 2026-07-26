/**
 * Beta batch-selection lottery (T-217). Pure + deterministic given an injected `rng`, so the whole
 * algorithm unit-tests without a DB or a server. NOT exposed to users — the panel only shows results.
 *
 * Two pools of eligible (email-verified, pending) users:
 *   - Pool A = users WITH a held `pending` ROM. Inviting one adds ~avgRomSecs × romsTotal of build time,
 *     so Pool A intake is capped by a queue budget (default ≤ 1h of added build time).
 *   - Pool B = users WITHOUT a held ROM. No immediate build, so they fill the rest of the batch freely.
 *
 * Within each pool's allocation, 25% of the slots go to the EARLIEST sign-ups (a fairness floor for the
 * longest waiters) and 75% are random among the rest. Item shape: { userId, email, createdAt, romsTotal }.
 */

// Small seedable PRNG (mulberry32). Production passes Math.random; tests pass mulberry32(seed) for
// reproducible batches. Returns a function → float in [0, 1).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher–Yates using the injected rng (non-mutating).
function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `k` from `pool`: the earliest 25% by sign-up time (fairness floor) + the rest random.
 * `k` is clamped to the pool size. Returns the chosen items (earliest slice first, then random picks).
 */
export function lotteryPick(pool, k, rng) {
  const n = Math.max(0, Math.min(k, pool.length));
  if (n === 0) return [];
  const byAge = pool.slice().sort((x, y) => x.createdAt - y.createdAt);
  const earliestCount = Math.min(n, Math.round(n * 0.25)); // 25% oldest waiters
  const earliest = byAge.slice(0, earliestCount);
  const rest = byAge.slice(earliestCount);
  const randomPicks = shuffle(rest, rng).slice(0, n - earliest.length); // 75% random among the rest
  return [...earliest, ...randomPicks];
}

/**
 * Select a balanced invite batch of up to `count` users. Pool A intake is capped so its added build
 * time stays within `budgetSecs` (via the pool's average ROM count, per the design); Pool B fills the
 * remainder. Returns the selection plus audit fields (granted, added build time, what was capped).
 */
export function selectBatch({ poolA = [], poolB = [], count, avgRomSecs, budgetSecs = 3600, rng = Math.random }) {
  const n = Math.max(0, Math.floor(count || 0));

  // Budget → a count cap on Pool A, using the pool's average ROM count (design uses avgRoms, not
  // per-user variance). If a build has no cost (avgRomSecs/avgRoms 0), the cap is just the pool size.
  const avgRoms = poolA.length
    ? Math.max(1, poolA.reduce((s, u) => s + Math.max(1, u.romsTotal || 1), 0) / poolA.length)
    : 1;
  const perAUserSecs = avgRomSecs * avgRoms;
  const maxAByBudget = perAUserSecs > 0 ? Math.floor(budgetSecs / perAUserSecs) : poolA.length;

  const wantA = Math.min(n, poolA.length);              // what A could supply ignoring budget
  const allocA = Math.max(0, Math.min(wantA, maxAByBudget));
  const pickedA = lotteryPick(poolA, allocA, rng);

  const allocB = Math.max(0, Math.min(n - pickedA.length, poolB.length));
  const pickedB = lotteryPick(poolB, allocB, rng);

  const selected = [...pickedA, ...pickedB];
  const addedBuildSecs = pickedA.reduce((s, u) => s + avgRomSecs * Math.max(1, u.romsTotal || 1), 0);

  return {
    selected,
    withRom: pickedA,                       // promoted to build now
    withoutRom: pickedB,                    // get the immediate "you're in" email
    requested: n,
    granted: selected.length,
    addedBuildSecs,
    cappedByBudget: allocA < wantA,         // budget kept some ready A-users out of this batch
    shortfall: Math.max(0, n - selected.length), // > 0 → pools exhausted before N was met
  };
}
