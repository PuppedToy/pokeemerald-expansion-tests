---
id: T-093
title: Design the dual singles/doubles rating dimension + ADR-015
status: proposed
type: docs
created: 2026-07-09
updated: 2026-07-10
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
- [x] `docs/adr/ADR-015.md` written (accepted), added to `docs/INDEX.md`.
- [x] Field names/shapes for the doubles dimension are specified (`ratingDoubles`,
      `contextualRatingsDoubles`, sibling `*Doubles` fns; shared `tierFromRating`).
- [x] The singles-unchanged guarantee is stated as a testable invariant (no singles code touched;
      seed output identical).
- [x] `move.target` normalization rules are enumerated (gen-conditional strings + `MOVE_TARGET_DEPENDS`
      → one spread helper).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Wrote and accepted **ADR-015** (`feature/T-093-dual-rating-adr`), indexed in
  `docs/INDEX.md`. Doubles is a **parallel** rating dimension: singles code/values untouched; new
  sibling fns (`rateMoveDoubles`, `rateMoveForAPokemonDoubles`, `ratePokemonDoubles`,
  `rateContextualDoubles`) write `ratingDoubles`/`contextualRatingsDoubles` beside the singles fields
  and reuse the shared `tierFromRating`. `move.target` normalised into one spread helper. Singles
  floors/caps get doubles counterparts (not blind reuse). Group 2A **computes + surfaces** doubles
  ratings; consumption is wired by the new engine in 2C (interim doubles teams stay singles-based —
  the `TODO(T-109)` seam). No open user-decision (unlike ADR-014's Tate & Liza), so closed on green.

## Outcome

Shipped **ADR-015** — the contract for the doubles rating dimension the whole of Group 2A builds on.
No deviations; no follow-ups beyond the planned T-094…T-097 + the 2C consumption. ADR indexed.
