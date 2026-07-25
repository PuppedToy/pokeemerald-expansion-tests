---
id: B-052
title: Seed-pinned regression tests drift against regenerated base-data (Tate & Liza determinism + B-024 evolution-mail interaction)
status: open            # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-07-25
updated: 2026-07-25
found-in: 0.6.0         # observed on master mid-0.6.0 dev cycle
fixed-in:
regression-test: randomizer/__tests__/integration/reverseOrderContinuity.test.js  # already exists (currently RED)
links: [T-199]          # discovered while verifying T-199; NOT caused by it
---

# B-052 — Seed-pinned regression tests drift against regenerated base-data

## Symptom

`RUN_DETERMINISM=1 npx jest reverseOrderContinuity` fails 3 tests in the
`Tate & Liza dual favourite (T-128) — one twin fielded when both share a tier (T-169)` block, at the
fixed seed `1830319788`:

- `fields six mons and never a legendary (Solgaleo/Lunala are over the up-to-Uber budget)`
- `Solrock (chain 0) claims the sole RU slot; Lunatone (same tier) is correctly dropped`
- `B-034/T-143 — Trick Room still builds emergently somewhere (never force-seeded)`

Expected: `TRAINER_TATE_AND_LIZA_1` fields Solrock (RU), never Solgaleo/Lunala, and Trick Room emerges
somewhere. Actual team: `[MUNKIDORI, ALAKAZAM, SOLGALEO, FARIGIRAF, LUNALA, GARDEVOIR]` — it fields BOTH
Solgaleo and Lunala (the full Uber legendaries, over the up-to-Uber budget) and no Trick Room emerges.

**Reproduces on `master` (feature branch stashed) with the identical received team** — so this is a
PRE-EXISTING failure, independent of T-199 (verified 2026-07-25: T-199's rival-legendary shuffle does not
perturb this outcome; master and the T-199 branch produce byte-identical Tate & Liza teams).

### Second symptom (same root cause) — B-024 evolution-mail interaction test

`visual-tests/interaction.spec.mjs` → `B-024: evolution mails below the first cap` fails at its
PRECONDITION (line ~202: `expect(expected, 'seed-42 fixture has a box mon evolving at ≤ first cap')`):
`expected` is `null` because the seed-42 fixture's STARTER_EXTRA box mons no longer include one whose
evolution level is ≤ the first cap. That precondition is computed from the run's extra-starters BEFORE
any interaction, so it is pure fixture/seed drift — also independent of T-199 (STARTER_EXTRA is chosen in
`runWildModule` before T-199's shuffle; the seed-42 extra-starters are byte-identical to master).

Both symptoms share one root cause: **seed-pinned regression tests were authored against an older
`frontend/data/base-data.json`; after later data/rating changes (and a fresh `node build.js` regenerating
base-data), the pinned seeds now produce different, still-valid outputs, so the assertions are stale.**

## Root cause

<!-- To triage. Two leading hypotheses:
  (1) A later rating/rebalance change legitimately changed Tate & Liza's favourite-chain budget outcome
      for this seed, leaving these seed-pinned assertions stale (spec drift → update the tests), OR
  (2) A genuine regression in the up-to-Uber favourite budget that now lets Tate & Liza field two Uber
      legendaries (Solgaleo + Lunala) instead of the devolved Solrock/Lunatone (product bug).
  Also check for frontend/data/base-data.json drift (stale generated input feeding the determinism run).
  Needs an owner decision on which of (1)/(2) is the truth before writing/adjusting the regression test. -->

## Fix

<!-- Not fixed. Iron rule: the regression test above must FAIL before and PASS after whatever fix lands. -->
