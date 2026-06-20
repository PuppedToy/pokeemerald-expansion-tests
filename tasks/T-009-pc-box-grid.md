---
id: T-009
title: PC tab — scrollable grid of the player's (non-fainted) box Pokémon
status: done
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
- [x] **Available ↔ Fainted toggle** (scope added during review): the PC tab has a two-chip toggle;
      "Available" shows the non-fainted box, "Fainted" shows fainted entries with a black-and-white
      (grayscale) filter over each Pokémon. Cells stay clickable in both views.

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
- **2026-06-20** — T-008 merged to master (carrying this PC tab's base). Continued T-009 on a fresh
  `feature/T-009-pc-box-grid` branch off master.
- **2026-06-20** — Added the **Available ↔ Fainted toggle** (user request: "Fainted aplicará un filtro
  blanco y negro sobre cada pokemon"). PC section gains `#pc-controls` with two `.filter-chip` buttons;
  a module `pcView` state (default `available`, in-memory like the mail filter) drives `renderPC()`,
  which pulls `window.docBoxList()` (available) or the new `window.docFaintedList()` (= captured-and-
  fainted entries) and tags fainted cells `.pc-fainted` → `img{filter:grayscale(1);opacity:.85}` + dim
  name. Cells stay clickable in both views (open the modal, where fainted shows the Undo control).
  `onBoxMaybeChanged` now also calls `renderPC()` so the grid tracks capture/faint changes live.
  Verified (headless, 3 of 9 STARTER_EXTRA fainted): Available = 6 colour cells (`grayscale=0`),
  Fainted = 3 cells all `grayscale=3`; toggle active-state correct. Suite 422 green.
  - **Pending user manual test before closing.** Note: fainting purges the evo overlay (existing T-007
    behaviour), so a fainted evolved mon shows its base species in the Fainted view.
- **2026-06-20** — Evolution-form coherence (user follow-up: "freeze the fainted pokemon in the form it
  fainted"). Root cause of fainted-shows-base: `reconcileEvo` purged the evo overlay whenever an
  encounter left the **box** (i.e. on faint *or* deselect). Reworked so the overlay = the obtained
  Pokémon's current evolution stage, persisted for any **still-captured** encounter (purged only when
  the encounter is no longer captured → deselect rollback to base). Mails still drop on faint
  (unactionable). Also made the **Encounters tab reflect the current form**: each obtained slot now
  carries `data-base-species`, and `applyLocVisuals` swaps the slot sprite/name to the overlay species
  (base when none) — reading the overlay straight from `localStorage[nsKey('mail_v1')].evo` so it's
  init-order-independent. Exposed `window.nzRefreshAll` (= `applyAllLocVisuals`); the Mail engine calls
  it from `evolveEntry`, `onBoxMaybeChanged`, and mail-init so Encounters stays in sync after an
  evolve / box change / on load. Net effect: Encounters, box, PC (incl. Fainted, frozen at the evolved
  stage) and the modal all show the same form. Verified by headless: seeding Chimchar→Monferno overlay,
  the Encounters STARTER_EXTRA slot shows **Monferno** (others stay base) and the PC Fainted view shows
  **Monferno** grayscale (was base before); interactive deselect on a route slot rolled it back to
  **Chimchar** with the overlay purged. `cd randomizer && npm test` 422 green; `check-tracker` OK.
  - **Touches shared behaviour:** changes the T-007/T-008 overlay-purge rule and the Encounters-tab
    (T-005) rendering. Still pending user manual test before closing T-009.
  - **To confirm in manual test:** the grid against a real run; the empty state with nothing captured;
    that evolving from a modal opened over the PC tab updates the grid behind it.

## Outcome

- **2026-06-20** — Closed at the user's explicit request (`commit, merge y cierra`) after manual testing.

**Shipped:** A **PC** tab in the generated docs (between Trainers and Mail) — a single scrollable,
non-paginated grid of the box, each cell opening its detail modal — with an **Available ↔ Fainted**
toggle (Fainted renders each Pokémon in black-and-white). Plus **evolution-form coherence**: the
obtained Pokémon's current stage is shown consistently across the Encounters tab, box, PC (incl. the
Fainted view, frozen at the form it fainted at) and the modal; deselecting a Pokémon rolls it back to
its base form.

**Deviations / scope growth from the original plan:** the plan was just the grid. Review added the
Available/Fainted toggle, and the form-coherence fix — which reworked the T-007/T-008 evo-overlay
purge rule (keep on faint, purge only on deselect) and the Encounters-tab (T-005) rendering
(`applyLocVisuals` now swaps sprite/name to the overlay form via a new `window.nzRefreshAll` hook).
All UI logic in `frontend/template.html`, outside the Jest suite per CLAUDE.md; verified by data
simulation + headless screenshots. Suite stayed 422 green.

**Notes:** developed on its own branch off master after T-008 merged (T-009 depends on T-008's box
helpers). **T-010** (per-section scroll policy) remains noted for later.
