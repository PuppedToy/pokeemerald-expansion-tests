---
id: T-010
title: Per-section scroll policy on load/switch in the generated docs
status: done
type: feature
created: 2026-06-20
updated: 2026-06-20
target-version: 0.1.0
links: [tasks/T-007-mail-notifications.md, tasks/T-008-box-evolution-coherence.md, tasks/T-009-pc-box-grid.md]
blocked-by: []
---

# T-010 — Per-section scroll policy

## Context

The generated docs are a single page with nav sections that toggle `.active`. Today, switching
sections keeps/raw-resets the scroll inconsistently. Each section should land the scroll at a
purposeful place so the player sees the most relevant content immediately (e.g. their progress
frontier in Encounters/Trainers).

## Plan

On section activation (the existing nav-switch path — same hook the Mail tab uses to re-render),
apply a per-section scroll policy:

| # | Section    | Scroll-on-load policy                         |
|---|------------|-----------------------------------------------|
| 1 | Encounters | down to the **last captured** entry           |
| 2 | Trainers   | down to the **last defeated** trainer         |
| 3 | Mail       | top                                           |
| 4 | Pokédex    | top                                           |
| 5 | Moves      | top                                           |
| 6 | Abilities  | top                                           |

Notes / open questions to resolve at implementation:
- Define "last" for Encounters/Trainers — DOM order (last matching element down the page) is the
  natural reading; confirm that matches the intended progression order, otherwise derive an explicit
  order. Scroll the matched element into view (e.g. `scrollIntoView`), not just the section top.
- Decide the scroll container (page vs. an inner scroll region) and that it works with the
  nav-collapsed layout. "Top" = reset that container to 0.
- Empty/none case (nothing captured/defeated yet) → fall back to top.
- Should compose cleanly with the PC tab (T-009) once it lands; if PC needs a policy, add it here
  (default top).

## Acceptance criteria
- [x] Switching to Encounters scrolls to the last captured entry (top if none).
- [x] Switching to Trainers scrolls to the last defeated trainer (top if none).
- [x] Mail, Pokédex, Moves, Abilities (and PC) always open scrolled to the top.
- [x] Policy fires on every section switch (not only first load); app (`index.html`) unaffected;
      docs stay self-contained; `cd randomizer && npm test` green; `node scripts/check-tracker.mjs` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-20** — Task created (noted for the future, per user request). Captures the per-section
  scroll-on-load policy table.
- **2026-06-20** — Implemented on `feature/T-010-section-scroll-policy`. Added `applySectionScroll(targetId)`
  to the nav-switch handler (also covers initial load, since `window.load` fires `firstNavLink.click()`).
  The page itself (window) is the scroll container. Policy: **wildpokes** → centre the last
  `.location-card` containing a captured slot (`.wild-poke.nz-selected`/`.nz-auto-selected`);
  **trainers** → centre the last `.trainer-card.nz-defeated`; **mail / pokemon / moves / abilities /
  pc** (and the no-capture/no-defeat fallback) → `window.scrollTo(0,0)`. Centres via an absolute
  `scrollTo` computed from `getBoundingClientRect()` (forces a reflow so the just-activated section's
  real layout is used — `scrollIntoView` mis-fired mid-tab-switch). Runs on `requestAnimationFrame`
  **and** again after a 150 ms settle, because a freshly-activated section isn't always laid out on the
  first try (headless showed single-rAF fixed Encounters but not Trainers, double-rAF the reverse; the
  rAF+settle pair makes the later pass the authority and gets both right).
  - Verified (headless, all routes captured + all 32 bosses defeated): Encounters lands on the last
    captured card (`inView=true` in a 900px viewport); Trainers lands on the last defeated trainer
    (scrolled to the bottom where it sits); Mail/Pokédex/Moves/Abilities open at `scrollY=0`.
    `cd randomizer && npm test` 422 green; `node scripts/check-tracker.mjs` OK.
  - **Pending user manual test before closing.**

## Outcome

- **2026-06-20** — Closed at the user's explicit request (`Commit, merge & close`) after manual testing.

**Shipped:** A per-section scroll-on-open policy in the generated docs. `applySectionScroll(targetId)`
in the nav-switch handler (also runs on initial load via `firstNavLink.click()`): Encounters centers
the last captured route card, Trainers the last defeated trainer card, and Mail / Pokédex / Moves /
Abilities / PC (plus the no-progress fallback) reset to the top. Centering uses an absolute `scrollTo`
from `getBoundingClientRect()` run on `requestAnimationFrame` + a 150 ms settle (the later pass is the
authority, since a just-activated section isn't always laid out on the first try).

**Deviations from plan:** none of substance — PC (added by T-009 after this task was written) is covered
by the same top-default branch, as the plan anticipated. UI-only (`frontend/template.html`), outside the
Jest suite per CLAUDE.md; verified by headless probes.
