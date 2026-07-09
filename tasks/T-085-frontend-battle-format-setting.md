---
id: T-085
title: Frontend battle-format setting — big-box singles/doubles/mixed + % + Run & Bun
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.7.0
links: [T-083, T-084]
blocked-by: [T-084]
---

# T-085 — Frontend battle-format setting — big-box singles/doubles/mixed + % + Run & Bun

## Context

The user-facing setting for the battle format (see [T-084](T-084-battle-format-architecture-adr.md)
for the contract). Modelled on the existing "Run type" big-box control in
`frontend/js/config-form.js:640-769`; the config rides into the bundle whole via
`config:{...cfg}`, so no bundle-code change is needed once the fields flow through the two
`toModuleConfig` copies.

## Plan

All in `frontend/js/config-form.js` unless noted, following the Run-type pattern:

- **Big boxes:** a new `config-category` section with a `radio-card-group radio-card-group-3`
  named `battle-format`, values `singles` (default, checked) / `doubles` / `mixed`.
- **Conditional % input:** `#singles-percent` (number, 0–100, default 60), in a `#singles-percent-row`
  shown only when `mixed` is selected. Read as an int; reuse the champion-percent field pattern
  (`config-form.js:927-931`).
- **Conditional Run & Bun checkbox:** `#league-runandbun` in a `#league-runandbun-row` shown only
  for `mixed`, with a **dynamic description** (`#league-runandbun-desc`) that shows the live E4 split
  computed from `singlesPercent` (`round(pct/100×4)` clamped 1–3, e.g. "3 singles / 1 doubles").
- **Wire-up:** add the three keys to `DEFAULTS` (`:199-230`), read in `getConfig()` (`:283-352`),
  restore in `setConfig()` (`:355-416`), toggle visibility + update the dynamic text in `_syncUI()`
  (`:1158-1202`), and add listeners in `_wireEvents()` (`:1253-1412`).
- **Forward to the engine:** add the identical three fields to `toModuleConfig` in **both**
  `frontend/js/randomizer-worker.cjs:62-93` and `backend/generator.js:87-115` (kept in sync).
- **Tests:** extend `frontend/__tests__/config-form.test.js` (new `data-cat`, ≥3-occurrence
  round-trip assertion for each new key), `config-roundtrip.test.js` fixture, and add a unit test for
  the E4-count formula used by the dynamic description.

Acceptance criteria:
- [ ] Three big boxes render (singles default); `#singles-percent-row` and `#league-runandbun-row`
      appear only for `mixed`.
- [ ] The Run & Bun description updates live and shows the correct clamped E4 split for 50/60/90/100%.
- [ ] `battleFormat`, `singlesPercent`, `leagueRunAndBun` round-trip through DEFAULTS/getConfig/setConfig
      and appear in `bundle.config`.
- [ ] Both `toModuleConfig` copies forward the three fields.
- [ ] Frontend `node --test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
