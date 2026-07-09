---
id: T-075
title: Randomizer diagnostics — audit warnings, rich 48h server store, local classification action
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.6.0
links: [tasks/T-058-brawly-five-pokemon-bundle.md]
blocked-by: []
---

# T-075 — Randomizer diagnostics — audit warnings, rich 48h server store, local classification action

## Context

A trainer team can end up short (e.g. 5 instead of 6 mons) when the randomized pick
exhausts every fallback for a slot. **That behaviour is accepted** — the task is to
*audit* it. Today the drop only emits a `console.error` inside a Web Worker
([writerDocs.js:258-264](../randomizer/writerDocs.js)), which in the browser goes to
devtools only: invisible, unstored, unanalysable. Same for the rest of the pipeline
warnings. There is no warnings collector, no client→server log channel, and no durable
home for these events.

The randomizer runs 100% in the browser (worker `frontend/js/randomizer.bundle.js`,
bundled from `randomizer/` by `build.js`). Bundles are stored 48h server-side by the
retention sweeper ([lifecycle/sweeper.js](../backend/lifecycle/sweeper.js), `ttlMs = 2*DAY`).

Design decisions (agreed with the owner): send diagnostics on **every** randomization;
store them in a new **SQLite `diagnostics` table** (queryable, expired by the sweeper,
read like `export-feedback.mjs`); the local audit tool reads the live DB via **SSH +
rsync of `app.db`**. Diagnostics travel **outside the bundle** (a sibling field in the
worker `postMessage`) so the bundle shape — and the determinism tests / `validateBundle`
— stay untouched; the durable SSOT home is the table.

Full design: [plan](../../.claude/plans/lively-fluttering-wren.md) and the audit doc
`docs/randomizer-diagnostics.md` (created by this task).

## Plan

Three parts:
1. **Capture** — `randomizer/diagnostics.js` sink threaded through `runGeneration`; the
   slot drop → `TRAINER_SLOT_DROPPED` with rich context, plus a post-loop `TRAINER_TEAM_SHORT`
   guard (the "team of 5"); convert other browser-reachable warning points to `diag.*`.
2. **Transport + store** — `POST /api/diagnostics` (optional auth, rate-limited) → SQLite
   `diagnostics` table; sweeper purges it at 48h; the worker returns diagnostics and the
   front reports them fire-and-forget on every run.
3. **Local action** — `backend/scripts/scan-diagnostics.mjs` (SSH rsync of live `app.db`,
   group by code + normalized signature) + `/diagnostics-audit` skill that proposes a fix
   per class.

Acceptance criteria:
- [ ] `randomizer/diagnostics.js` sink with `warn/error/fatal/all/counts`, unit-tested.
- [ ] Degraded-team integration test: a run that forces a short team produces
      `TRAINER_SLOT_DROPPED` + `TRAINER_TEAM_SHORT` with expected context, and the bundle
      shape is unchanged (no `diagnostics` field on it).
- [ ] `POST /api/diagnostics` stores a row; optional auth (anon + authed) and size caps,
      handler + repo tested against an in-memory DB.
- [ ] Sweeper purges diagnostics rows older than 48h (tested); account deletion clears a
      user's diagnostics.
- [ ] Front sends diagnostics on every completed generation (fire-and-forget, never blocks UI).
- [ ] `scan-diagnostics.mjs` groups live diagnostics by code + signature (`--json`/`--report`,
      `--local` for offline).
- [ ] `/diagnostics-audit` skill runs the script and proposes a solution per class.
- [ ] `docs/randomizer-diagnostics.md` (emission inventory + code catalog + transport) linked
      from `docs/INDEX.md`; `cd randomizer && npm test` and `cd backend && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Recon done (3 explore agents): mapped every randomizer
  warning/error emission point, the degraded-team fallback (`writerDocs.js` per-slot early
  `return`), backend bundle storage + 48h sweeper, no client-log endpoint, and the live
  server topology (Hetzner box, SSH `~/.ssh/emerald_box`, SQLite `app.db`). Plan approved.
- **2026-07-09** — Implemented all three parts (TDD, Red→Green throughout).
  - Part 1: new `randomizer/diagnostics.js` sink (unit-tested) threaded through `generate.js`
    both explicitly (→ `writerDocs`) and ambiently (`setActiveDiagnostics` for deep helpers).
    `writerDocs` now emits `TRAINER_SLOT_DROPPED` per dropped slot + a post-loop
    `TRAINER_TEAM_SHORT` (the "team of 5"); `startersModule`/`utils`/`rating` warnings routed
    to the sink. Integration test drives the real team loop via a forced-null fallback.
    Decision: diagnostics ride OUTSIDE the bundle (worker returns them as a sibling) so the
    bundle shape / determinism tests / `validateBundle` are untouched.
  - Part 2: `diagnostics` SQLite table + repo + `POST /api/diagnostics` (new `optionalAuth`,
    rate-limited, size-capped); sweeper purges it at 48h; account-delete clears it; worker +
    `app.js` report every run fire-and-forget. Verified end-to-end against a real server
    (curl → 201, row stored with derived user_agent; bad payload → 400).
  - Part 3: `backend/scripts/scan-diagnostics.mjs` (SSH rsync of live `app.db`, group by
    code + normalized signature; pure helpers unit-tested; verified in `--local`/`--report`/
    `--json`) + `/diagnostics-audit` skill that proposes a fix per class.
  - Docs: `docs/randomizer-diagnostics.md` (inventory + code catalog + transport) linked from
    `docs/INDEX.md`; CHANGELOG `[Unreleased]` line added.
  - Green: randomizer 747 passed/1 skipped; backend 139 passed; tracker OK; no game-source
    mutations. Rebuilt the gitignored worker bundle (`node build.js`). Node-only warning
    points (`rebalancer.js`, `writer.js`, `parser.js`) documented but left as `console` (they
    never reach the browser). Awaiting the owner's manual test before closing.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
