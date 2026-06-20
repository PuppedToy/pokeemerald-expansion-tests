---
id: T-009
title: PC tab — scrollable grid of the player's (non-fainted) box Pokémon
status: in-progress
type: feature
created: 2026-06-20
updated: 2026-06-20
target-version: 0.1.0
links: [tasks/T-007-mail-notifications.md, tasks/T-008-box-evolution-coherence.md]
blocked-by: []
---

# T-009 — PC tab (box grid)

## Context

T-007 introduced the "box" (captured-and-not-fainted Pokémon, identified by encounter with an
evolution overlay) and T-008 surfaced box state inside the Pokédex modal. This task adds a dedicated
**PC** tab to the generated docs that simply *shows the box*: a grid of the player's current
(non-fainted) Pokémon, each clickable to open its existing detail modal. The underlying state already
exists — this is a presentation layer over the box, no new model.

Scope for now is deliberately minimal: **only** the grid + click-to-open-modal. No team/party concept,
no fainted view, no search/filter, no per-cell stats, no drag/drop, no box organisation.

## Plan

**Placement.** New nav `<a data-target="pc">` **above Mail** (order: … Trainers → **PC** → Mail →
Pokédex), using the `pc` icon (`frontend/assets/pc.png`, already created; emoji 📦 fallback via
`getIcon`). New `<section id="pc">`.

**Data.** Reuse the box the Mail engine already computes — `boxMembers()` (= `capturedEntries()`
filtered to `!fainted`, each `{encounterKey, routeId, slot, baseSpecies, currentSpecies, fainted}`,
`currentSpecies` resolving the evo overlay). Expose it as `window.docBoxList()` from the Mail IIFE
(sibling of `docBoxSectionHTML`/`docBoxEvolve`/`docCurrentCap`) so the PC section, which is its own
scope, can read it without duplicating the capture/faint/STARTER_EXTRA/overlay logic.

**Render.** A CSS-grid of cells (`grid-template-columns: repeat(auto-fill, …)`), **not paginated** —
one continuous block that grows downward and scrolls with the page/section. Each cell: the Pokémon
sprite (`getPokeImg`) + name (`nameify`), Obsidian-styled (hard edges, offset shadow, hover raise).
Click → `showPokemonModal(pokeById[currentSpecies])` (the same modal used elsewhere, so the T-008 box
section shows there too). De-duplicate identical species if the box holds more than one? **No** — show
one cell per box entry (encounter), so two of the same species both appear.

**Live updates.** Re-render on box changes by hooking the existing `onBoxMaybeChanged`/
`onBossDefeatChange` path (capture/faint/evolve) and on tab open (same pattern as Mail's nav-click
re-render). Empty state: a short "No Pokémon in your box yet" message.

**Self-contained.** No new external requests (T-004 invariant); pure presentation, no build-side
changes expected (box data + sprites are already embedded).

Acceptance criteria:
- [x] A **PC** nav item sits directly above Mail (with the `pc` icon) and opens a `#pc` section.
- [x] The section renders one clickable cell per non-fainted box entry (evolution overlay respected),
      as a single scrollable grid (no pagination), Obsidian-styled.
- [x] Clicking a cell opens that Pokémon's existing detail modal.
- [x] The grid reflects live box changes (capture/faint/evolve) and shows an empty state when the box
      is empty; fainted Pokémon never appear.
- [x] App (`index.html`) unaffected; `cd randomizer && npm test` green; `node scripts/check-tracker.mjs`
      green; docs stay self-contained (0 new external requests).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-20** — Task created (future work, requested while reviewing T-008). Box logic already exists
  in the Mail engine; plan is to expose `window.docBoxList()` and render a non-paginated clickable grid.
- **2026-06-20** — Implemented on the `feature/T-008-box-coherence` branch (T-009 strictly depends on
  T-008's `boxMembers()`, which lives only there and is still unmerged — so built additively on top).
  (1) PC nav `<a data-target="pc">` inserted between Trainers and Mail with `data-icon="pc"` (picks up
  `pc.png`); new `<section id="pc">` with `#pc-empty` + `#pc-grid`. (2) Mail engine exposes
  `window.docBoxList()` (= `boxMembers()`). (3) Standalone PC IIFE: `window.renderPC()` paints one
  `.pc-cell` per box entry (sprite via `getPokeImg` + clean name via `nameify` minus `SPECIES_`),
  delegated click → `showPokemonModal(pokes.find(...))`; empty state toggled; Obsidian-styled CSS grid
  `repeat(auto-fill, minmax(120px,1fr))` (no pagination, grows/scrolls with the page). (4) Re-render on
  tab open (nav-switch hook, like `_renderPokedex`) + after an in-place evolve (`renderPC` call in
  `evolveEntry`). Verified by headless screenshots (Rufflet + 9 STARTER_EXTRA = 10 cells): grid renders
  with clean names; clicking a cell opens that Pokémon's modal (`SPECIES_KUBFU → modal opened=true`). No
  build-side changes; `cd randomizer && npm test` green; `node scripts/check-tracker.mjs` green.
  - **Note (workflow):** developed alongside T-008 per the user's request to proceed while T-008 is
    manually tested. It will be its own logical commit; merge order is T-008 then T-009.
  - **To confirm in manual test:** the grid against a real run; the empty state with nothing captured;
    that evolving from a modal opened over the PC tab updates the grid behind it.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
