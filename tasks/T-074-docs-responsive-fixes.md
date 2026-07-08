---
id: T-074
title: Fix documentation responsive rendering issues
status: in-progress
type: fix
created: 2026-07-08
updated: 2026-07-08
target-version: 0.6.0
links: []
blocked-by: []
---

# T-074 — Fix documentation responsive rendering issues

## Context

The documentation has rendering problems at some viewport sizes — several elements are not displaying correctly on responsive layouts. Screenshots illustrating each problem will be added by the user under `tasks/assets/T-074/`, and the detailed feedback (what is wrong in each screenshot) will follow once they can be referenced.

Related earlier docs work: [T-002](T-002-offline-docs-assets.md), [T-004](T-004-docs-overhaul.md), [T-006](T-006-docs-obsidian-polish.md).

Scope: the **Trainers** section of the generated docs viewer (`frontend/template.html`, the SSOT
template read by both the browser doc-builder and `randomizer/writer.js`). Screenshots (freshly
generated docs on localhost) in `tasks/assets/T-074/`.

Reported issues:
1. Large desktop — fine (do not regress).
2. `size_laptop_100percent.png` — at 100% zoom only one Pokémon column shows, wasting the right
   half; at 80% zoom (`size_laptop_80percent.png`) two columns fit and it looks far better.
3. `size_half_laptop_100percent.png` — narrowing the window clips the move chips under the sidebar.
4. `size_smaller_laptop_100percent.png` — after the breakpoint the sprite overlaps the meta text and
   the card/moves don't adapt to the available width.
5. `size_mobile_100percent.png` — layout stacks fine but the meta text still overlaps the sprite.

Root cause: the Pokémon card (`.roster-row`) uses a rigid grid with fixed track widths
(`108px minmax(0,1fr) 320px`, card fixed at `640px`) and the sprite keeps `width:108px` even when the
≤760px breakpoint shrinks its column to `56px`.

Approach:
- `.roster-team` → responsive grid `repeat(auto-fill, minmax(min(440px,100%),1fr))` so cards pack
  2-up much earlier and stretch to fill (issue #2).
- `.roster-row` → flexbox with wrap (sprite · info · moves); moves wrap to a full-width line below
  when the card is narrow — driven by the card's own width, so it works at 1 **or** 2 columns
  (issues #3, #4, #5). No fixed tracks → nothing clips.
- Sprite becomes a real flex item (`width:100px`, drop `height:100%`) → never overlaps text.
- `minmax(0,…)` on `.roster`/team tracks so the card can shrink; rail stacks on top ≤900px.

Verify with the existing visual harness (`visual-tests/shoot.mjs`, ADR-010): regenerate the fixture
from the edited template, screenshot `docs-trainers` at every viewport, confirm zero horizontal
overflow and no overlap.

Acceptance criteria:
- [ ] Two+ Pokémon columns pack in at laptop width without wasted space (issue #2)
- [ ] No horizontal overflow / clipped move chips at any viewport (issues #3, #4) — `shoot.mjs` reports clean
- [ ] Sprite never overlaps the meta text at any width (issues #4, #5)
- [ ] Large-desktop trainers layout not regressed (issue #1)
- [ ] `cd randomizer && npm test` green; visual fixture regenerated

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-08** — Task created. Assets folder `tasks/assets/T-074/` created for the user's screenshots; awaiting screenshots + per-image feedback before planning the fix.
- **2026-07-08** — Received 6 screenshots + per-image feedback (all Trainers-section responsive). Diagnosed root cause (rigid fixed-track `.roster-row` grid + oversized sprite past the breakpoint). Set in-progress; wrote the fluid-flex redesign plan above. Implementing in `frontend/template.html`.
- **2026-07-08** — Implemented in `frontend/template.html`: `.roster-team` → responsive grid `repeat(auto-fill, minmax(min(430px,100%),1fr))`; `.roster-row` → flex-wrap (sprite · info · moves, moves wrap full-width below when narrow); sprite → real flex item (`width:100px`, no `height:100%`); `minmax(0,…)` on `.roster` + rail stacks ≤900px; removed the obsolete `≤760px`/`≤600px` grid overrides. The `430px` min is tuned to the B-016 band: 2 columns from ~1400px viewports up, but never 3 even at the 1536px card cap.
  Verified with the visual harness (`visual-tests/shoot.mjs` model): regenerated the seed-42 fixture and screenshot `docs-trainers` at 375/768/960/1366/1440/1512/1920 — **zero horizontal overflow at every width**. Confirmed visually: mobile & half-laptop no sprite/text overlap and moves wrap full-width below (issues #3/#4/#5 fixed); laptop-1440 now shows **2 columns** (was 1 + wasted space — issue #2 fixed); desktop-1920 stays 2-column horizontal (B-016 held, issue #1 not regressed). `cd randomizer && npm test` green (737 passed, 1 skipped). Fixture is gitignored (regenerated on demand); only `frontend/template.html` changes.
  Awaiting user manual test + next round of screenshots before closing.
- **2026-07-08** — User feedback (round 2): visuals perfect, but resizing the window makes the layout re-adjust "millimetre by millimetre over ~1s" instead of snapping. Diagnosed: no CSS transition on any trainer element (confirmed via computed styles — all `0s`); the cause is layout **performance** — the Trainers view is ~20,843 DOM nodes / 208 cards / 3,251 imgs and a full reflow costs **~400ms**, so a continuous drag (many resize events) can't keep up. `setTbh` reading `bar.offsetHeight` on every resize event forced an extra synchronous full-page layout each time.
  Fix (both purely performance, no visual change): (1) `content-visibility:auto; contain-intrinsic-size:auto 480px;` on `.trainer-card` → off-screen cards are skipped, so a reflow only touches the on-screen handful; (2) rAF-throttle the `resize`→`setTbh` handler → one measurement per frame, not per event. Measured forced-reflow cost dropped **~400ms → ~18ms** (~20×). Screenshot at 1440px confirms the layout is pixel-identical. Fixture rebuilds clean. Ready for user re-test.
- **2026-07-08** — User approved extending the same perf hint to the other heavy grids. Measured them: pokedex `#pokemon-cards` is the heaviest (34,831 nodes / 1011 cards), moves 13,090 / 847, abilities 1,892 / 310, encounters 3,435 / 56 (pc & mail are tiny — skipped). Added `content-visibility:auto` + tuned `contain-intrinsic-size` scoped to each grid's own children (`#pokemon-cards > .card`, `#moves-cards > .card`, `#abilities-cards > .card`, `#wildpokes-cards > .location-card`) — deliberately NOT the shared `.card` class, since the pokémon-detail **modal** reuses `.card` (line ~1952). Re-verified: forced-reflow per section dropped to **~0.1–0.3ms**, zero horizontal overflow at 375px & 1440px, and screenshots of Pokédex + Moves are visually unchanged (filters/sprites/cards intact). Only `frontend/template.html` changed. Ready for user re-test.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
