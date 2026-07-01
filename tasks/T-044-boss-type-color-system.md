---
id: T-044
title: Per-type color system for boss trainer cards
status: done
type: feature
created: 2026-07-01
updated: 2026-07-01
target-version: 0.6.0
links: [docs/adr/ADR-011-trainer-colour-ssot.md]
blocked-by: []
---

# T-044 — Per-type color system for boss trainer cards

## Context

Today every boss trainer card in the docs viewer is rendered in the same dark-red
`.specialCard` style (`frontend/template.html`), regardless of who the boss is. The
owner wants each boss to carry colours that reflect its identity, driven by a single
source of truth:

- **Typed bosses** (gym leaders, Elite Four, champion): use the colours of the
  **randomized** type they actually run this seed (`gymMainTypes[N]` / `e4NMainType`;
  Steven is always **Steel**).
- **Evil-team bosses** (Aqua, Magma): mix two types — Aqua = Water(1)+Dark(2),
  Magma = Fire(1)+Ground(2).
- **Rival / non-typed bosses**: fixed identity palettes — the rival (May/Brendan) gets
  emerald with red+blue accents; Wally gets emerald with white (Gardevoir-like).
- **Common trainers**: deliberately generic (neutral slate-blue), **no** top gradient
  bar, kept visually distinct from Water and Ice so those types still "shine".

Each boss card gets: a top gradient **bar** (main → secondary), **title** letters in the
main colour, **trainer rail** background in `mainBg`, and **Pokémon-card** background in
`secondaryBg` (typed) / `mainBg` of the second type (evil).

Reference: the Flannery mock-up (orange→amber bar) and the current all-red state supplied
by the owner. The type main colour already exists in the frontend (`typeColors`); this
task defines the other three per type and consolidates all four into one home.

## Plan

- New SSOT module `randomizer/trainerColors.js`: `TYPE_PALETTES` (4 colours × 18 types,
  `main` = the existing frontend hexes), fixed `GENERIC`, rival, Wally & evil-team
  definitions, and a pure `resolveTrainerColors(trainer)` that returns CSS-ready
  `{ kind, bar, title, railBg, cardBg }`.
- `getTrainersData` attaches `themeType` to typed bosses (gym→`gymMainTypes[i]`,
  E4→`e4NMainType`, Steven→`STEEL`) — one post-pass, covers every battle instance.
- `runTrainersModule` attaches `trainer.colors = resolveTrainerColors(trainer)` to every
  trainer — the single seam both `writer.js` (out.html) and `writerDocs.js` (browser
  bundle) already consume, so both runtimes get colours with no template logic.
- Move-chip `typeColors` is consolidated: the frontend stops hardcoding it and receives
  it (derived from the SSOT) via the existing script-tag injection in both runtimes.
- `frontend/template.html`: add the top gradient bar + CSS, render each card from
  `trainer.colors` (inline styles), drop the static red `.specialCard` colours.

Acceptance criteria:
- [x] `randomizer/trainerColors.js` defines 4 colours for all 18 types; `main` values
      equal the current frontend `typeColors`. Covered by tests.
- [x] `resolveTrainerColors` classifies typed / evil / rival / Wally / common correctly
      and returns the right colour slots for each. Covered by tests.
- [x] Real pipeline: gym leaders/E4 carry a `themeType`; Steven is Steel; Aqua=Water+Dark,
      Magma=Fire+Ground; every trainer carries a resolved `colors`. Covered by tests.
- [x] Generic (common-trainer) palette is distinct from Water and Ice; common trainers
      have no top bar.
- [x] `cd randomizer && npm test` green; generated `out.html` shows per-boss colours.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-01** — Owner feedback round 1. (1) **Partner Steven regressed** — it carries
  `class: 'Steven'` so `getTrainersData` tagged it `themeType: STEEL` and it rendered as a Steel
  *enemy* boss, clobbering the old friendly green. Added an `ALLY_PALETTE` and made
  `resolveTrainerColors` short-circuit on `isPartner` (before `themeType`) → friendly green, plus a
  green **"Ally" tag** in the rail (new `.roster-ally-tag`). (2) **ROCK** secondary darkened
  (`#D9C05A`→`#8C7A2A`) for visible bar contrast. (3) **STEEL** secondary lightened
  (`#8F9EC7`→`#C9D6F2`). New tests: ally in `trainerColors.test.js` + `PARTNER_STEVEN` in the
  pipeline test. Suite green (504); rebuilt the seed-42 fixture and re-verified Partner Steven
  (green + Ally tag, no crown), Roxanne (Rock) and Steven (Steel) bars visually.
- **2026-07-01** — Implemented. New SSOT module `randomizer/trainerColors.js` (18 type
  palettes + generic/rival/Wally/fallback + evil-team pairs + `resolveTrainerColors`), unit-tested
  (17 tests, TDD red→green). `getTrainersData` tags typed bosses with `themeType` (class-keyed
  post-pass); `runTrainersModule` attaches `trainer.colors` — the single seam both writers use.
  `writer.js`/`writerDocs.js` carry `colors` into their trainersResults (initially missed — the
  writers build fresh result objects, so colours were dropped; caught during out.html verification
  and fixed, guarded by a `buildTrainersResultsSimplified` test). Move-chip `typeColors` consolidated
  into the module and injected via a new `colors.js` placeholder (writer.js + app.js + the
  visual-tests fixture builder). Template renders the top gradient bar / rail / title / card bg from
  `trainer.colors`. Full suite green (randomizer 502, frontend 14, backend 94); 74 Playwright visual
  checks still pass with no baseline change. Verified out.html + the browser-path fixture visually:
  Flannery(Fire), Roxanne(Rock), Archie(Water+Dark), Maxie(Fire+Ground), Steven(Steel), Sidney(Dark
  E4), May(rival), Wally, Jose(common, no bar) all render correctly. ADR-011 records the design.
  **Gotcha:** the real `randomizeItems()` writes game files, so the pipeline integration test mocks
  `itemRandomizer` (mirrors the existing `trainersModule` test). Awaiting user manual test to close.
- **2026-07-01** — Task created. Mapped the color/rendering seams: type colours live in
  `frontend/template.html:993` (`typeColors`); boss cards get `.specialCard` (dark red) via
  `isBoss`; both runtimes inject resolved trainer data (`writer.js:970`, `app.js:207`) from
  the same `trainersResultsSimplified`, both fed by `runTrainersModule`. Verified from source
  that gym leaders map to `gymMainTypes[0..7]` (Roxanne..Juan) and E4 to `e41..e44MainType`
  (Sidney..Drake); `POKEMON_TYPE_*` constants are the uppercase strings used as `typeColors`
  keys. Chose `runTrainersModule` as the single color-attach seam and `getTrainersData` for
  `themeType`.

## Outcome

Shipped the per-type boss colour system. `randomizer/trainerColors.js` is the single home for
all four colours × 18 types (main = the existing frontend values), the generic/rival/Wally/ally/
fallback palettes and the evil-team type pairs, plus the pure `resolveTrainerColors`. Typed bosses
are tagged with `themeType` in `getTrainersData`; `runTrainersModule` resolves `trainer.colors`
once (the seam both `writer.js` and `writerDocs.js` consume), so out.html and the browser bundle
colour identically with no logic in the template. The template renders the top gradient bar, title,
dossier rail and Pokémon-card backgrounds from `trainer.colors`; the move-chip `typeColors` is now
derived from the same module and injected (no more hardcoded copy). Battle allies (partner Steven)
get a friendly green palette + "Ally" tag instead of their enemy/type palette.

Deviations: (1) the two writers build fresh result objects, so `colors` had to be added to their
assignment sites too (not just the upstream seam) — caught during out.html verification. (2) Owner
feedback tuned ROCK/STEEL secondaries for bar contrast and added the ally treatment for partners.
Design recorded in [ADR-011](../docs/adr/ADR-011-trainer-colour-ssot.md). Verified by unit +
integration tests (504 green) and by screenshotting every boss kind from the seed-42 browser fixture.
No follow-ups spawned.
