---
id: T-133
title: Bound item pick-groups + planner-assigned items (fairness-aware item economy)
status: proposed
type: feature
created: 2026-07-13
updated: 2026-07-13
target-version: 0.8.0
links: [T-129, T-117, docs/adr/ADR-017-gimmick-attempt-rollback.md]
blocked-by: []
---

# T-133 — Bound item pick-groups + planner-assigned items

## Context

Spun off from T-129. T-129 made the small, correct fix — *items respect roles* (a hazard/reactive mon is
never Choiced). This task is the larger, intelligent system the owner described (2026-07-13) that T-129
deliberately left for later.

Two intertwined ideas:

1. **Fairness / bound pick-groups.** The game is built on fairness: at many points the *player* chooses one
   item out of a group (e.g. Choice Band / Specs / Scarf; the Weather Rocks; the plates; the type gems; …)
   and the other options in that group become unavailable from then on. Trainers should mirror this. Today
   each trainer just gets a *random* item from each such group in their bag. Instead: a trainer holds **all**
   options of a pick-group in its bag, but the options are **bound** together — when the trainer assigns one
   to a Pokémon, its bound siblings are **removed** from the bag (and the reduced bag cascades to the rest of
   the algorithm and to later bosses, as the pipeline already passes bags down). This makes each trainer's
   item choice a *meaningful* decision instead of noise.

2. **Planner-assigned items (item as a team-building decision).** Once bags carry bound groups, the
   team-builder itself can **assign** items during team-building — grabbing from the bag (which then removes
   the bound siblings). Crucially this closes the forward loop T-129 could not: if the planner decides a mon
   will hold a **Choice item (a Choice role)**, that mon **builds its moves knowing it is Choiced** (≥3
   spammable attacks, no status/hazard/reactive move) — instead of T-129's reverse guard that only vetoes an
   incoherent pairing after the fact. And because the item is a bound resource, **no other mon on the team
   (or later bosses, per the group) receives that same item**.

## Plan

Design first (this touches the item economy + the team-builder + the rater), validate with the owner, then
build test-first. Likely pieces:
- A declaration of **pick-groups** (which item ids are bound together, mirroring the player's in-world
  choices) — its single home is TBD (candidate: `randomizer/docs/items.md` data + a constants module).
  Cross-check against `randomizer/docs/items.md` (pools + world locations) and `tms.md` for the TM pick-lists.
- **Bag model**: when an item from a bound group is consumed, drop the siblings. Must stay deterministic and
  respect the per-slot reseed + cross-ROM determinism (see `trainer-determinism.md`).
- **Planner item assignment**: let the team-builder claim an item (esp. a Choice item) as a *role* and drive
  the moveset from it (the forward path). Reuse the attempt/rollback discipline (ADR-017) so a claimed item
  that doesn't pan out is released cleanly.
- Keep T-129's reverse guard as the safety net for any item still chosen after the moveset.

Acceptance criteria:
- [ ] Bound pick-groups are declared in ONE home; assigning one member removes its siblings from the bag,
      and the reduced bag is what cascades onward.
- [ ] A trainer never fields two Pokémon holding items from the same bound group; the group's remaining
      options shrink across successive bosses (fairness).
- [ ] The team-builder can assign at least Choice items as a role, and such a mon builds an all-attacking
      set (forward coherence), with no other team member getting that item.
- [ ] Deterministic; per-slot reseed + cross-ROM determinism intact; `cd randomizer && npm test` + the
      determinism/continuity gates green.
- [ ] Auditable via the T-130 decision log (which item was claimed, which siblings were removed).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-13** — Task created (spun off from T-129, per owner's fairness/bound-items + planner-assignment
  description). Design + owner validation pending before any code.

## Outcome

<!-- Filled when closing. -->
