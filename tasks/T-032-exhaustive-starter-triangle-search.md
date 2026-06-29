---
id: T-032
title: Make starter type-triangle search exhaustive (no fallback when a triangle exists)
status: done
type: refactor
created: 2026-06-28
updated: 2026-06-29
target-version: 0.5.0
links: [B-007]
---

# T-032 — Make starter type-triangle search exhaustive (no fallback when a triangle exists)

## Context

Surfaced while fixing [B-007](../bugs/B-007-flaky-starters-type-triangle-test.md). `runStartersModule`
(randomizer/modules/startersModule.js) is greedy: it picks `starters[0]`, then a single random
`starters[1]`, and if that branch can't be completed it **permanently discards** `starters[0]`
(`sampleAndRemove`) and moves on. So it can exhaust the candidate pool and take the no-type-constraint
**fallback even when a valid triangle exists** in the pool (empirically ~14% of rng states on the test
fixture). The fallback produces 3 starters that do not form a type triangle — a real, if rare,
quality regression in generated games.

## Plan

Make the search exhaustive / backtracking so it always returns a triangle when one exists, only
falling back when the pool genuinely admits none. Likely: for each candidate `starters[0]`, consider
all valid `starters[1]` (not one random pick) and all valid `starters[2]`; randomize the *choice
among valid complete triangles* rather than randomizing mid-search and giving up.

Acceptance criteria:
- [x] For any pool containing at least one type triangle, the module returns a triangle for **every**
      rng seed (verify over a wide seed sweep on the B-007 fixture — 0 fallbacks).
- [x] The fallback still triggers (and only triggers) when the pool admits no triangle (e.g. the
      all-NORMAL fixture).
- [x] Determinism preserved: same seed → same starters.
- [x] Selection stays unbiased/random among valid triangles (not always the first found).
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-28** — Task created as the production-logic follow-up to B-007 (which fixed only the flaky
  test by controlling the seed). Deferred out of T-031 to keep the frontend deploy low-risk.

- **2026-06-29** — Implemented (TDD). Replaced the greedy pick-one-`starters[1]`-then-give-up loop with
  an **exhaustive enumeration** of every valid triangle (a beats b, b beats c, c beats a) over the
  eligible pool, then a single uniform `sample()` among them; the fallback now triggers only when the
  enumeration is empty. Red→Green: added a 300-seed sweep that asserts a real triangle for every seed
  (failed on the greedy code as expected — ~14% fallbacks — passes now), plus "randomized among valid
  triangles" and "fallback only when no triangle" tests. Pipeline order is pokedex→trainers→**starters**
  →wild, and `sample`/`sampleAndRemove` draw from the shared rng, so the new draw count (1 vs the old
  3+) **shifts the downstream `wild` module's output for a given seed** — deliberate and acceptable (no
  snapshot pins it; full suite stays green at 473/473). Reaches the browser on the next deploy (update.sh
  rebuilds the bundle). Awaiting owner OK to close (changes generated output).

## Outcome

- **2026-06-29** — Done (owner OK'd close). Greedy single-pick search replaced by exhaustive triangle
  enumeration + one uniform `sample()`; fallback only when the pool admits no triangle. All acceptance
  criteria met and test-verified (300-seed sweep = 0 fallbacks, fallback-only-when-none, determinism,
  randomized selection). randomizer 473/473. Deviation/cost: the new rng draw count shifts the
  downstream `wild` module's per-seed output (deliberate, unpinned). Ships to the browser bundle on the
  next deploy (`update.sh` rebuilds it). No follow-ups.
