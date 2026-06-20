---
id: T-010
title: Per-section scroll policy on load/switch in the generated docs
status: proposed
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
- [ ] Switching to Encounters scrolls to the last captured entry (top if none).
- [ ] Switching to Trainers scrolls to the last defeated trainer (top if none).
- [ ] Mail, Pokédex, Moves, Abilities always open scrolled to the top.
- [ ] Policy fires on every section switch (not only first load); app (`index.html`) unaffected;
      docs stay self-contained; `cd randomizer && npm test` green; `node scripts/check-tracker.mjs` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-20** — Task created (noted for the future, per user request). Captures the per-section
  scroll-on-load policy table.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
