---
id: T-168
title: Show a "Shiny" star badge in the docs for 150+ IV Pokémon
status: in-progress
type: feature
created: 2026-07-20
updated: 2026-07-20
target-version: 0.6.0
links: [B-044]
blocked-by: []
---

# T-168 — Show a "Shiny" star badge in the docs for 150+ IV Pokémon

## Context

The docs viewer can already display each trainer Pokémon's IVs (opt-in "Show IVs", T-163 —
rendered in `frontend/template.html`). This game makes shininess deterministic from IV total: any
Pokémon whose IVs sum to **≥ 150** is shiny (already documented in `frontend/index.html:290`). So
whenever the IVs are shown, a mon that would be shiny in-game should be flagged as such next to its
IVs, to mirror the real game behaviour.

## Plan

In the trainer roster row (where `ivsHTML` is built), compute the IV total and, when it is ≥ 150,
append a gold star + "Shiny" badge next to the IV numbers. Must read well at every screen size
(the meta block already stacks/wraps; the badge rides on the IVs line and wraps with it). The
template is the SSOT for the docs HTML and is the (test-exempt) HTML template per CLAUDE.md; the
150 threshold matches the game rule stated in `frontend/index.html`.

Acceptance criteria:
- [x] When "Show IVs" is on and a mon's IV total ≥ 150, a yellow ★ + "Shiny" badge appears by its IVs.
- [x] A mon with IV total < 150 shows no badge.
- [x] The badge renders correctly (no overflow/clipping) on wide and narrow layouts.
- [x] Change is reflected in the docs (served/read from `template.html` directly — no bundle rebuild needed).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-20** — Task created. Threshold (≥150) confirmed against the game rule already documented
  in `frontend/index.html`. Implementing in `frontend/template.html` roster-row rendering.
- **2026-07-20** — Implemented in `frontend/template.html`: the roster row now totals `member.ivs` and,
  at ≥150, appends `<span class="rm-shiny"><span class="rm-shiny-star">★</span> Shiny</span>` inside the
  IV line. Styled gold (#FFD43B), `white-space:nowrap` so "★ Shiny" stays intact, `margin-left` from the
  numbers. Used a CSS-coloured `★` (not `getIcon('star')`, whose asset image can't be guaranteed yellow).
  `template.html` reaches the browser via `fetch('/template.html')` and the Node docs path reads it
  directly, so no `build.js`/bundle rebuild is involved.
- **2026-07-20** — Verified with the visual harness (Playwright, seed-42 fixture built with
  `DV_JSON='{"showIVs":true}'`): 106 badges render; computed colour `rgb(255,212,59)` = #FFD43B;
  desktop shows "IVs …/… ★ Shiny" inline; mobile (375px) wraps "★ Shiny" to its own line with no
  horizontal overflow. Sub-150 mons show no badge. Added structural guard
  `frontend/__tests__/shiny-iv-badge.test.js` (threshold + markup + gold colour); full frontend suite
  green (89/89). Temp fixture/screenshots cleaned up; default fixture rebuilt.

## Outcome

<!-- Filled when closing. -->
