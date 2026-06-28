---
id: B-007
title: Starters type-triangle unit test is flaky (unseeded isolated rng)
status: fixed
severity: minor
created: 2026-06-28
updated: 2026-06-28
found-in: 0.3.0
fixed-in: 0.4.0
regression-test: randomizer/__tests__/unit/startersModule.test.js
links: [T-031]
---

# B-007 — Starters type-triangle unit test is flaky (unseeded isolated rng)

## Symptom

`randomizer/__tests__/unit/startersModule.test.js` → "the 3 starters form a type-triangle"
intermittently fails (`startersModule.test.js:117` — `s0` not super-effective against `s1`).
It passed on one `npm test` and failed on the very next run with no code change, which aborted
a deploy at the `update.sh` preflight gate. Empirically ~14% of rng states hit it.

Reproduction (probe over fixed seeds, non-isolated module): of seeds `0..299`,
**257 form a triangle, 43 fall through to the no-triangle fallback** — so the assertion fails
for ~1 in 7 uncontrolled draws. Seed 42 forms `FIRE>GRASS>WATER`.

## Root cause

The test built the module with `freshModule()` (`jest.isolateModules`), which gives the module
its **own** `rng` instance — separate from the test's top-level `rng`. So `beforeEach(rng.seed(42))`
seeded the test's instance but **not** the module's; the module drew from an uncontrolled rng.
`runStartersModule` is allowed to not form a triangle: when its greedy pick of `starters[0]` →
random `starters[1]` fails, it discards that `starters[0]` permanently and, once candidates are
exhausted, takes the no-type-constraint **fallback** (startersModule.js:63-76). With the fixture,
an unlucky early draw (e.g. `FIRE`→`BUG`) consumes `FIRE` and makes the `FIRE>GRASS>WATER` triangle
impossible → fallback → assertion fails. The determinism test in the same file already documents
this isolate-vs-seed gotcha (it deliberately uses a non-isolated require).

## Fix

Switched the type-triangle test to the **non-isolated** `require('../../modules/startersModule')`
so the `beforeEach` `rng.seed(42)` controls the module's own rng instance (seed 42 → a valid
`FIRE>GRASS>WATER` triangle). No production code changed; the test's intent (the algorithm forms a
type triangle) is preserved, only the nondeterminism is removed. Verified PASS 5/5 (file) + 3/3
(full suite, 464/464) after the fix; before the fix the assertion failed for 43/300 fixed seeds.

Note (separate, not fixed here): the algorithm itself is greedy — it can hit the fallback even when
a triangle exists in the pool, because it discards a viable `starters[0]` after a single failed
`starters[1]` draw. Making it exhaustive (so it always finds a triangle when one exists) is a
production-logic change tracked as a follow-up, intentionally out of scope for this test-only fix.
