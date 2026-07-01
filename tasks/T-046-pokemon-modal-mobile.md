---
id: T-046
title: Make the Pokémon detail modal mobile-responsive (learnset/teachables + no horizontal scroll)
status: done
type: fix
created: 2026-07-02
updated: 2026-07-02
target-version: 0.6.0
links: [T-040]
blocked-by: []
---

# T-046 — Make the Pokémon detail modal mobile-responsive

## Context

The mobile-responsive sprint (T-040) covered the app and the docs-viewer sections, but the
**Pokémon detail modal** (`#pokemon-modal`, opened by tapping a Pokémon) was missed. On a phone
the Learnset and Teachables rows overflow: each `.list-item` is a single no-wrap flex row
(Lv · type · move · Pwr · Acc · PP), so the stats spill off the right edge and the whole modal
scrolls horizontally. Reported by owner with a phone screenshot.

## Plan

Template-only. Extend the existing `@media (max-width:600px)` layer (T-040) to the modal:

- Reflow `.modal-content .list-item` (Learnset/Teachables rows) with `flex-wrap` so the
  Pwr/Acc/PP stats wrap to a second line instead of overflowing; tighten gap/size a touch.
- Reduce the modal's padding on phones so more width is usable.
- Ensure the modal no longer scrolls horizontally (verify no element exceeds the viewport;
  wrap/scroll any other wide sub-content — e.g. the evo chain — if needed).

Acceptance criteria:
- [x] On ≤600px the modal shows no horizontal scrollbar.
- [x] Learnset and Teachables rows are fully readable (Lv/type/move/Pwr/Acc/PP all visible),
      wrapping instead of clipping.
- [x] Desktop modal layout unchanged.
- [x] `frontend` tests green; visual suite unaffected (or baselines updated intentionally).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-02** — Implemented (template-only, in the `@media(max-width:600px)` block): reduced
  `.modal-content` padding 28→16px + `overflow-x:hidden`; `.modal-content .list-item`
  `flex-wrap:wrap` so Learnset/Teachables stats (Pwr/Acc/PP) wrap to a second line instead of
  spilling; `.poke-miniature` wrap for the evo chain. Measured overflow in the fixture at 375px:
  the last offender was `.modal-bg` (a transparent `z-index:-1` filler whose `width:100%` of the
  padding box was 16px wider than the scrollbar-reduced content) → hid it on mobile. Result:
  `docOverflow:false`, modal `scrollWidth == clientWidth` (no clip, no sideways scroll). Learnset
  rows verified readable in a phone screenshot. Frontend green (14); visual suite 74/74 with **no**
  baseline change (modal isn't in the visual screens → desktop/docs untouched). Awaiting owner review.
- **2026-07-02** — Task created. Root: `.list-item` (l.331) is `display:flex; gap:10px` with no
  wrap; the modal (`.modal-content`, l.64) has `overflow-y:auto` (→ overflow-x becomes auto),
  padding 28px, and the T-040 `@media(max-width:600px)` block (l.719) never mentions the modal.
  Learnset/teachables built in `buildLearnsetList`/`buildTeachablesList` as `.list-item` rows.

## Outcome

Template-only fix extending the T-040 `@media(max-width:600px)` layer to the Pokémon detail modal
(missed by T-040). On phones the Learnset/Teachables rows now `flex-wrap` (Pwr/Acc/PP drop to a
second line instead of spilling off-screen), the modal padding shrinks (28→16px), and the dead
transparent `.modal-bg` filler is hidden (it was the last 16px of overflow, from `width:100%` of the
padding box vs the scrollbar-reduced content). Verified at 375px: no page or modal horizontal scroll
(`scrollWidth == clientWidth`), nothing clipped, rows fully readable. Desktop unchanged.

Deviations: none of substance — the only surprise was the transparent `.modal-bg` forcing the last
16px of overflow, found via computed-layout inspection. Frontend `node --test` green (14); visual
suite 74/74 with no baseline change (the modal isn't in the regression screens). No follow-ups.
