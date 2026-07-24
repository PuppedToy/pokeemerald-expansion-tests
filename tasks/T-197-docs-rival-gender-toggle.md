---
id: T-197
title: Docs viewer — let the player pick their rival (May / Brendan)
status: in-progress
type: feature
created: 2026-07-24
updated: 2026-07-24
target-version: 0.6.0
links: [frontend/template.html]
blocked-by: []
---

# T-197 — Docs viewer — let the player pick their rival (May / Brendan)

## Context

In the generated docs viewer (`frontend/template.html`), the Wild encounters tab shows a special
**Starters** card. Picking a starter there hides every rival-trainer card except the one variant that
counters the chosen starter — exactly like the in-game rival, who picks the type-advantage starter.

The rival's *gender* is the opposite of the player's, so which trainer set actually applies depends on
the player's chosen character. Today that is **hardcoded to May** (`applyStarterRivals` always hides
every `TRAINER_BRENDAN_*` card and shows only the matching `TRAINER_MAY_*` variant). A player who plays
as May (rival = Brendan) sees the wrong rival's teams.

This is a display-only aid in the viewer — both rival sets exist in the ROM regardless (the game
resolves the rival from the player's gender at new-game). No pipeline/ROM change is needed.

## Plan

Add a **Rival: May / Brendan** radio pair inside the Starters card (just below the starter tiles),
defaulting to **May** (current behaviour). The selection drives which rival's trainer cards remain
visible once a starter is picked, symmetrically for both genders.

- Tag `TRAINER_BRENDAN_*` cards with per-starter classes (`rival-brendan-{treecko,torchic,mudkip}`),
  mirroring the existing `rival-may-*` tagging.
- Render the radio group only in the `STARTERS` card; persist the choice in `nzState` (localStorage)
  so it survives reloads, defaulting to `may`.
- Rewrite `applyStarterRivals()` to be symmetric: once a starter is chosen, show only the selected
  rival's variant matching that starter and hide every other rival card.
- Wire the radio into the existing delegated `change` handler and reflect the persisted value on init.

Acceptance criteria:
- [ ] The Starters card shows a "Rival:" radio pair (May / Brendan); May is selected by default.
- [ ] With May selected + a starter picked → only the matching `TRAINER_MAY_*` card shows; all Brendan hidden (unchanged behaviour).
- [ ] With Brendan selected + a starter picked → only the matching `TRAINER_BRENDAN_*` card shows; all May hidden.
- [ ] Switching the radio re-filters immediately; the choice persists across reloads.
- [ ] `cd frontend && npm test` green (new structural guard test included).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-24** — Task created. Traced the mechanism: rival cards tagged at template.html:1725-1728;
  filtering in `applyStarterRivals()` (2995-3010); state via `nzState`/`locState`; init at 3125-3130;
  delegated `change` handler at 3110-3121. `goToNextBoss` (3508-3520) already keys off the visible
  variant's inline `display`, so the toggle keeps working there. No CSS elsewhere targets the rival
  classes. Confirmed template.html is hand-authored SSOT (served via `fetch('/template.html')`).
- **2026-07-24** — Implemented (Red→Green). Added structural guard test
  `frontend/__tests__/docs-rival-gender.test.js` (ADR-009 style — template.html has no headless DOM
  harness); watched it fail, then implemented in `frontend/template.html`: per-starter Brendan classes
  (`rival-brendan-{treecko,torchic,mudkip}`), the `Rival: May/Brendan` radio in the STARTERS card, a
  `.rival-select` style, `nzState.rivalGender` (default `may`) + `getRivalGender()`,
  `handleRivalGenderChange`, delegated `change` wiring, and an init pass that reflects the persisted
  choice. Rewrote `applyStarterRivals()` to filter both genders symmetrically. No pipeline/ROM change
  (both rival sets already ship; the game resolves the rival from player gender). `cd frontend &&
  npm test` → 142 pass; `cd randomizer && npm test` → 1639 pass. No bundle rebuild needed
  (template.html is fetched at runtime, not embedded in randomizer.bundle.js). Awaiting user manual
  test in a freshly generated docs viewer.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
