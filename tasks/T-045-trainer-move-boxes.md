---
id: T-045
title: Wider trainer move boxes so move names never wrap to two lines
status: done
type: feature
created: 2026-07-01
updated: 2026-07-01
target-version: 0.6.0
links: []
blocked-by: []
---

# T-045 — Wider trainer move boxes so move names never wrap to two lines

## Context

In the docs viewer's Trainers section, move chips are narrow (2×2 grid in a ~190px
column), so longer names ("Quick Attack", "Flash Cannon", "Double Wingbeat", "Toxic
Spikes"…) wrap to two lines and look ragged. Owner request: move boxes twice as wide so
names stay on one line, with ability/nature/item stacked on separate lines to free the
horizontal space, plus slightly taller/larger/rounded chips. Template-only change
(`frontend/template.html`) — the HTML template is exempt from the unit-test rule; the
frontend structural guards (B-016 width cap, responsive) must stay green.

## Plan

Keep the fixed 640px `.roster-row` (so two rows still fit the 1536px card cap — B-016) and
reallocate: widen the moves column to ~2× and let the stacked, now-narrower meta live in a
smaller info column.

- Ability / nature / item each on its **own line** (drop the `·` inline join; make the
  meta spans `display:block`).
- Moves column ≈ **double** width; each chip **+50% height**, **slightly** larger font,
  and **slightly** rounded corners (a deliberate local exception to the square design).

Acceptance criteria:
- [x] Move names in the Trainers section fit on one line (no 2-line chips) for the common cases.
- [x] Ability, nature and item render on separate lines.
- [x] Move chips are ~2× wider, ~50% taller, slightly larger font, slightly rounded.
- [x] `frontend` tests green (B-016 + responsive); no horizontal overflow; 2-up card layout
      on wide screens preserved.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-01** — Owner feedback round 2: rounded corners *still* not showing. Root cause found
  via computed-style inspection in the fixture: a global reset `*, *::before, *::after
  { border-radius:0 !important }` (T-006 "the kit is square always", ~line 598) — its `!important`
  beat my higher-specificity rule. Fixed by scoping `border-radius:8px !important` to
  `.roster-moves .move-item` (documented, owner-approved exception). Verified computed radius = 8px
  and visible in the screenshot; baselines refreshed. Awaiting owner review.
- **2026-07-01** — Owner feedback round 1: (1) rounded corners weren't visible — my `4px` did win
  over `.move-item{border-radius:0}` (higher specificity) but was too subtle → bumped to `8px`.
  (2) Pokémon sprite now fills the row's full height (`.roster-row` `align-items:stretch`, sprite
  column 60→108px, `.roster-row-spr` `height:100%`), pushing name/details right; info & moves get
  `align-self:center` so they stay vertically centred. (3) Moves a touch smaller with more air:
  font 17→16, padding 9/10→7/9, `min-height` 44→38, grid gap 6→8; moves column trimmed 360→320 to
  make room for the bigger sprite. (4) `.roster-info` `margin-left:6px` for a little more air after
  the sprite. Frontend green (14); visual baselines for `docs-trainers` (3 wide viewports) refreshed;
  verified vs the Champion Steven reference + grunt + Flannery. Awaiting owner review.
- **2026-07-01** — Implemented (template-only). `.roster-row` grid → `60px minmax(0,1fr) 360px`
  (moves column ~2× its old ~190px; info flexes). Meta spans (`.rm-ability/.rm-nature/.rm-item`)
  set `display:block` and the render JS join changed from `·`-separated to `''` so ability/nature/
  item stack on their own lines (dropped the now-dead `.rm-sep` rule). Move chips: `.roster-moves`
  `align-items:stretch` (uniform 2×2), `.move-item` font 16→17px, padding 4px 6px → 9px 10px with
  `min-height:44px` (~+50% height), `border-radius:4px` (slight rounding — deliberate local exception
  to the square design). Frontend `node --test` green (14); visual suite: only `docs-trainers` at
  ipad-portrait/landscape/desktop changed (intended) → baselines refreshed; no horizontal overflow;
  2-up preserved (row stayed 640). Verified vs the reference: Space Center grunt + Flannery — every
  move name now single-line. Awaiting owner review before commit/merge/close.
- **2026-07-01** — Task created. Found `.roster-row` is fixed 640px so two rows fit the
  1536px card cap; chose to keep 640 and reallocate width (moves ~360, info flex) rather than
  widen the row (which would break 2-up). Moves are a 2×2 grid inside the row; meta is a single
  line joined with `·` in the render JS.

## Outcome

Template-only redesign of the Trainers-section Pokémon rows (`frontend/template.html`). Move chips
are ~2× wider (moves column 190→320px in the fixed 640px row) so names never wrap; ability/nature/
item now stack on their own lines; chips are a touch smaller with more air (font 16px, gap 8px,
min-height 38px) and **slightly rounded** (`border-radius:8px !important` — an owner-approved
exception to the global square-corner reset that had been silently overriding it). The Pokémon
sprite fills the row's full height (sprite column 60→108px, `align-items:stretch`), pushing the
details right, with a little extra air after it. Kept the row at 640px so the 2-up card layout on
wide screens (B-016) is preserved.

Deviations from plan: two feedback rounds — (1) sprite full-height + smaller/airier moves + more
sprite↔details space; (2) the rounded corners needed `!important` to beat the global
`*{border-radius:0 !important}` reset (root cause found via computed-style inspection). Verified
across a grunt, a typed boss (Flannery) and the Champion Steven reference; frontend `node --test`
green (14), visual suite 74/74 with the three `docs-trainers` baselines refreshed. No follow-ups.
