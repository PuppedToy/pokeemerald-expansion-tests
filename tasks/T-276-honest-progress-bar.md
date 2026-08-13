---
id: T-276
title: Make the randomization progress bar reflect the real work
status: done
type: fix
created: 2026-08-12
updated: 2026-08-13
target-version: 0.9.0
links: []
blocked-by: []
---

# T-276 — Make the randomization progress bar reflect the real work

## Context

The generation progress bar is misleading: it jumps from 20% to 80% instantly and then stalls.
The cause is the progress model in `randomizer/generate.js`: it counts *milestones*, giving every
one the same weight (`Math.round((++done / totalSteps) * 100)`), while the real cost of those
milestones differs by three orders of magnitude.

Measured on a `default` single-ROM run (28.8 s total, `frontend/data/base-data.json` as base data):

| Milestone | bar shows | real time | real share |
|---|---|---|---|
| Pokédex | 0 → 20% | 19.5 s | **68%** |
| Trainer teams (templates) | 20 → 40% | 16 ms | 0.1% |
| Starters | 40 → 60% | 9 ms | 0.0% |
| Wild encounters | 60 → 80% | 47 ms | 0.2% |
| Docs (trades + team resolution) | 80 → 100% | 9.1 s | **32%** |

Inside those two heavy milestones the time is concentrated in one loop each, both of which have a
known iteration count and so can report honest sub-progress:

- Pokédex: the per-level contextual rating pass — 17.4 s (60% of the whole run), 30 750
  `rateContextual` calls (1230 species × 25 level caps). The absolute rating pass is another 1.5 s.
- Docs: per-trainer team resolution — 8.5 s in 190 `resolveTrainerTeam` calls (~45 ms each).

So the bar has two problems, and both need fixing for it to mean anything: the milestones are
unweighted, and the two milestones that carry 100% of the time emit nothing while they run.
The generation runs in the client's browser, so an ETA is not predictable — this task only makes
the *positions* honest, it does not add a time estimate.

## Plan

1. New `randomizer/progress.js` — the single home of the cost model (measured relative weights per
   unit of work) and of the arithmetic that turns "work done" into a percentage. It exposes a
   tracker: given how many units of each kind a run will do, `run(kind, label, fn)` emits the
   percentage at the start of a unit, hands the unit a sub-progress callback, and adds the unit's
   weight when it completes. Emissions are monotonic, throttled to whole-percent changes, and
   capped below 100 until the run really finishes.
2. `randomizer/generate.js` — replace the equal-weight `tick` in all three run types
   (`default`, `nuzlocke`, `soullink`) with that tracker. The per-kind counts already exist there
   (they are what feeds today's `totalSteps`), so multi-ROM runs get correctly re-weighted for
   free: a shared Pokédex amortized over N ROMs stops being "20% of the bar" regardless of N.
3. Sub-progress inside the two heavy units, threaded as an optional `onProgress` hook so every
   other caller (`analyze.js`, the visual-test fixture, tests) is unaffected:
   `runPokedexModule` (absolute-rating pass + contextual pass, weighted by their measured shares)
   and `writerDocs` (per resolved trainer).
4. Frontend (`frontend/js/app.js`): the fake "crawl" animation currently invents up to 18 points of
   progress to cover the stalls. With real sub-progress it is no longer needed to cover them, so
   tighten it to a small smoothing allowance that can never run far ahead of the truth.
5. Reserve the browser's base-data download at the head of the scale (the one step whose cost is
   the client's network and cannot be known), via a `progressFloor` hook, so generation starts
   where the load left off instead of jumping backwards.

Acceptance criteria:
- [x] Progress percentages are proportional to measured cost: no milestone moves the bar by more
      than a few points more than its real share of the run.
- [x] The bar advances continuously during the Pokédex pass and during trainer resolution (no
      silent interval longer than ~1 s of a run's wall clock).
- [x] Emissions are monotonic (never decrease) and 100% is emitted only once the run is done.
- [x] Multi-ROM runs weight the shared work by how much of the run it actually is.
- [x] Existing callers that pass no progress hook behave exactly as before (bundle output
      unchanged — byte-identical for a fixed seed).
- [x] `cd randomizer && npm test` green, new unit tests for the cost model + the wiring.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-12** — Task created. Measured the real cost of every milestone before touching code
  (numbers in Context above, three throwaway harnesses over the real pipeline with
  `frontend/data/base-data.json`): the 20→80% jump is 0.3% of the run, and the two ends of the bar
  are 100% of it. Decision: fix the model (weights) *and* the resolution (sub-progress) — weighting
  alone would still leave a bar that sits still for 19 s and then for 9 s.

- **2026-08-12** — Implemented. `randomizer/progress.js` is the new home of the cost model (`WEIGHTS`,
  `POKEDEX_PASSES`, `DOCS_TRAINERS_SHARE`), of the tracker (`createProgressTracker`) and of the loop
  reporter (`passReporter`, which throttles to ~50 reports per loop so a 1230-species pass doesn't
  cross 1230 postMessage boundaries). `generate.js` drives it in all three run types; the equal-weight
  `tick`/`totalSteps` is gone. Each step now announces itself at its own start (present tense) instead
  of the previous step naming the next one. Sub-progress threaded as optional hooks:
  `runPokedexModule(config, baseData, { onProgress })` and `writerDocs(..., { onProgress })`, so
  `analyze.js`, `randomizer/index.js`, the visual-test fixture and every existing test are untouched.
  On the frontend the "crawl" animation moved to its own module (`frontend/js/gen-progress.js`) with its
  lookahead cut from 18 points to 2 — it smooths between reports now instead of inventing progress —
  and the worker reserves the first 2% for the base-data download via the new `progressFloor` hook.

  Verified three ways:
  1. **Output neutrality** — bundle sha256 (timestamps normalised; `pokedexModule` stamps its own
     `new Date()`, which made a first naive comparison look like a diff) is byte-identical to the
     pre-change code for a fixed seed, for both a `default` and a 2-ROM shared `nuzlocke` run.
  2. **Node pipeline** — the same 28.8 s run now reports 90 percentages: the Pokédex spans 0→68%
     over its 19.5 s, the docs 68→99% over their 9.1 s, largest silent gap 0.76 s (2.6% of the run).
  3. **Real browser** (Playwright against the local app, client-side Worker, default settings) —
     19.4 s run, 76 visible changes, longest gap 0.4 s; Pokédex ends at 65% at t=13.1 s, i.e. 67% of
     the bar for 67% of the wall clock. The three cheap steps flash past in ~60 ms, which is honest.

  `cd randomizer && npm test` 2523 passed / 209 suites; `cd frontend && node --test` 258 passed.
  Browser bundle rebuilt (`node build.js`) so the Worker actually carries the new model.

- **2026-08-13** — Owner generated a run and validated the bar. Closing.

## Outcome

Shipped as planned, in one commit (`0c4162dd2f`). The progress bar's percentages are now a weighted
fraction of the work a run will really do, and the two units that carry ~100% of a run's wall clock
report from inside their own loops.

What shipped:
- `randomizer/progress.js` — the cost model's single home (`WEIGHTS` per unit of work,
  `POKEDEX_PASSES`, `DOCS_TRAINERS_SHARE`), the tracker (`createProgressTracker`: monotonic,
  throttled to whole percents, 100% only from `finish()`), and `passReporter` for long loops.
- `randomizer/generate.js` — all three run types drive the tracker; the equal-weight
  `tick`/`totalSteps` is gone. Counts come from the run's own shape, so multi-ROM runs amortize
  shared work automatically. Each step announces itself at its own start instead of the previous
  step naming the next one.
- Sub-progress through optional hooks: `runPokedexModule(config, baseData, { onProgress })` and
  `writerDocs(..., { onProgress })`. Every caller that passes nothing is untouched.
- `frontend/js/gen-progress.js` — the display side, extracted from `app.js` and now tested: the
  crawl's lookahead went from 18 points to 2, so it smooths between reports instead of inventing
  progress. `frontend/js/randomizer-worker.cjs` reserves the first 2% for the base-data download
  via the new `progressFloor` hook.
- Tests: `randomizer/__tests__/unit/progress.test.js` (model),
  `.../unit/progressWiring.test.js` (pipeline), `.../unit/pokedexProgress.test.js`,
  `.../integration/docsProgress.test.js` (the two loops), `frontend/__tests__/gen-progress.test.js`.

Deviations from the plan: none in substance. Two things worth recording:
- The plan's "Pokédex sub-passes" turned out to need three shares, not two — the rebalance pass sits
  between rating and contextual and re-rates what it mutated, so it gets its own share of the weight.
- Proving output neutrality needed timestamp normalisation first: `runPokedexModule` stamps its own
  `new Date()` into the artifact, so two identical runs never hash the same. With that normalised,
  the bundles are byte-identical before and after, for both a `default` and a 2-ROM `nuzlocke` run.

Deliberately not done: no ETA, and no streaming progress for the base-data download. A 4 MB fetch
served with `Content-Encoding` reports compressed `Content-Length` while the reader yields
decompressed bytes, so a byte-counting progress bar there would overshoot — the flat 2% is honest.

No follow-up tasks spawned.
