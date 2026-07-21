---
id: T-172
title: Warn in the config UI when the ROM count would land the build in the slow queue
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 0.6.0
links: [backend/queue/scheduler.js, frontend/js/config-form.js]
blocked-by: []
---

# T-172 — Warn in the config UI when the ROM count would land the build in the slow queue

## Context

The build scheduler is two-tier (ADR-005): a request is *fast* (priority) when it builds few ROMs
and *slow* otherwise. The cut-off is [`classify`](../backend/queue/scheduler.js) — `romsTotal <= fastMaxRoms`
(`DEFAULT_FAST_MAX_ROMS = 2`) → fast; more → slow. A slow build waits behind every fast one and gets
preempted between ROMs, so it can take noticeably longer.

Today the frontend never surfaces this. A user picking a Nuzlocke / Soul-Link ROM count that exceeds the
fast limit has no idea their build will be de-prioritised until it is already queued. The owner wants an
inline warning at config time: when the chosen number of ROMs exceeds the fast-queue limit, tell the user
their build will go to the slow queue and state what the fast-queue limit is.

Total ROMs by run type ([config-form.js](../frontend/js/config-form.js)): `default` = 1 (never warns),
`nuzlocke` = `numROMs` (2–10), `soullink` = `numPlayers` × `romsPerPlayer` (2–80). So the warning fires
when total > 2, i.e. 3+ ROMs.

## Plan

**SSOT of the limit (decided with owner 2026-07-21):** the fast-queue limit's single home stays the
backend. Export it from `scheduler.js` as a named constant (`FAST_MAX_ROMS`). The frontend keeps a mirror
constant used only for the UX hint (the browser can't import backend ESM), and a frontend test reads
`scheduler.js` and asserts the two are equal — so the mirror can never silently drift from its home.

- **Backend:** promote `DEFAULT_FAST_MAX_ROMS` to an exported `FAST_MAX_ROMS` (keep `classify` behaviour
  identical). No queue-policy change.
- **Frontend (`config-form.js`):**
  - A pure, exported helper `totalRoms(cfg)` (the one ROM-count computation, reused from app.js's inline
    copy) and `slowQueueWarning(cfg, fastMax)` → `{ show, total, fastMax }` (or the message string).
  - Two inline `warning-banner` elements (Nuzlocke panel under `#nz-numroms`; Soul-Link panel under the
    `ROMs per player` field), like the existing Pokédex warnings, toggled in `_syncNuzlocke`/`_syncSoullink`.
  - Wording: names the chosen total, that it exceeds the fast-queue limit of N, and that the build will go
    to the slow queue (may take longer). Decided with owner: **inline near the inputs only** (not the Review step).
- **TDD:** unit-test `totalRoms` / `slowQueueWarning` across default/nuzlocke/soullink and boundary
  (=limit → no warn, limit+1 → warn); structural test that both banners exist in the template and are wired;
  drift-guard test that the frontend mirror equals the backend `FAST_MAX_ROMS`.

Acceptance criteria:
- [x] Backend exports `FAST_MAX_ROMS`; `classify` behaviour unchanged; `cd backend && npm test` green.
- [x] `totalRoms(cfg)` and `slowQueueWarning(cfg, fastMax)` exported + unit-tested (boundary: 2 → no warn, 3 → warn).
- [x] Nuzlocke & Soul-Link panels each show an inline warning naming the total and the fast-queue limit,
      shown only when total > limit, hidden otherwise; toggled live on input change.
- [x] Drift-guard test asserts the frontend mirror limit equals the backend `FAST_MAX_ROMS`.
- [x] `cd frontend && npm test` and `cd randomizer && npm test` green; CHANGELOG `[Unreleased]` line added.
- [ ] Owner manual-tests in the UI and confirms (required to close).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Owner decisions: (1) source the limit as a frontend mirror constant with
  a drift-guard test against the backend `FAST_MAX_ROMS` (no runtime endpoint); (2) show the warning inline
  next to the ROM-count inputs only (Nuzlocke + Soul-Link panels), not in the Review step. Confirmed the
  effective limit is `DEFAULT_FAST_MAX_ROMS = 2` (classify uses the default; no override wired), so the
  warning fires at 3+ ROMs.

- **2026-07-21** — Implemented via TDD (Red→Green). Backend: promoted `DEFAULT_FAST_MAX_ROMS` → exported
  `FAST_MAX_ROMS` in `queue/scheduler.js` (classify unchanged); added a backend test pinning it as the
  cut-off. Frontend `config-form.js`: exported `FAST_QUEUE_MAX_ROMS` (mirror), `totalRoms(cfg)`,
  `slowQueueWarning(cfg, fastMax)`, `slowQueueMessage(total, fastMax)`; added `#nz-slow-queue-warning` and
  `#sl-slow-queue-warning` `.warning-banner`s toggled + filled in `_syncNuzlocke`/`_syncSoullink` via a new
  `_syncSlowQueueWarning` helper (reads live inputs via `_intField`, so the count matches what `getConfig`
  produces). Refactor: replaced app.js's inline ROM-count duplicate (`showGenDone` + the Review "Total ROMs"
  row) with `totalRoms`. Tests: new `frontend/__tests__/slow-queue-warning.test.js` (helpers + boundary +
  structural + drift-guard) and a real-browser Playwright interaction test in `visual-tests/interaction.spec.mjs`
  (the DOM stub can't parse innerHTML, so the show/hide + text wiring is verified there). All suites green:
  frontend 98, backend 133, randomizer 1401; Playwright T-172 interaction test passes on desktop.
  Note: the pre-existing `randomizer` desktop **visual-regression** baseline mismatches on this machine
  (global font-render drift) — reproduced with my changes stashed, so it is unrelated to T-172; baselines
  left untouched. Pending owner manual test before close.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
