---
id: T-032
title: Make starter type-triangle search exhaustive (no fallback when a triangle exists)
status: proposed
type: refactor
created: 2026-06-28
updated: 2026-06-28
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
- [ ] For any pool containing at least one type triangle, the module returns a triangle for **every**
      rng seed (verify over a wide seed sweep on the B-007 fixture — 0 fallbacks).
- [ ] The fallback still triggers (and only triggers) when the pool admits no triangle (e.g. the
      all-NORMAL fixture).
- [ ] Determinism preserved: same seed → same starters.
- [ ] Selection stays unbiased/random among valid triangles (not always the first found).
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-28** — Task created as the production-logic follow-up to B-007 (which fixed only the flaky
  test by controlling the seed). Deferred out of T-031 to keep the frontend deploy low-risk.

## Outcome

<!-- Filled when closing. -->
