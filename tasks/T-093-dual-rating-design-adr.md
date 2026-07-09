---
id: T-093
title: Design the dual singles/doubles rating dimension + ADR-015
status: proposed
type: docs
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, docs/adr/ADR-015.md]
blocked-by: []
---

# T-093 — Design the dual singles/doubles rating dimension + ADR-015

## Context

Group 2A opener. All move/ability/tier scoring lives in `randomizer/rating.js`, singles-only today.
We add a **parallel doubles dimension** so a move/ability/mon can carry both a singles score and a
doubles score, and team selection reads the one matching the trainer's battle type. `move.target`
is already parsed and `statusList` already parks the doubles-support moves low, so the seams are
clean — but the ~20 hardcoded singles floors/caps in `ratePokemon` and the ability caps need
doubles counterparts or shared parameterization, not blind reuse.

## Plan

Write **ADR-015** deciding:
- **Data fields:** persist `ratingDoubles` next to `.rating` on moves; `ratingDoubles` /
  `contextualRatingsDoubles` on pokes; a doubles ability value alongside the singles one.
- **Routing:** how the resolver picks singles vs doubles rating from a trainer's `battleType`
  (from T-086), and how "singles rating = current behaviour, applied to singles battles" is
  preserved exactly.
- **`move.target` normalization:** collapse the gen-conditional target strings (Surf/Earthquake
  `B_UPDATED_MOVE_DATA` ternaries) and `MOVE_TARGET_DEPENDS` into a canonical spread flag.
- **Floors/caps strategy:** which singles-specific floors/caps in `ratePokemon`/ability blocks get
  a doubles variant vs shared parameterization.
- **Viewer/docs contract:** the new fields flow into `output/pokes.js`/`moves.js` automatically;
  decide the per-format display (feeds T-111/T-112).

Acceptance criteria:
- [ ] `docs/adr/ADR-015.md` written (accepted), added to `docs/INDEX.md`.
- [ ] Field names/shapes for the doubles dimension are specified.
- [ ] The singles-unchanged guarantee is stated as a testable invariant.
- [ ] `move.target` normalization rules are enumerated.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
