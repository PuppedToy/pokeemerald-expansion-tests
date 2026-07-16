---
id: T-126
title: Trainer archetype/gimmick seed assignments (deliberate variety)
status: abandoned
type: feature
created: 2026-07-11
updated: 2026-07-16
target-version: 0.8.0
links: [T-107, T-123, T-124]
blocked-by: [T-124]
priority: high
---

# T-126 — Trainer archetype/gimmick seed assignments

## Context

The seed mechanism exists — `resolveTrainerTeam` reads `trainer.archetypeSeed` and `resolveIdentity`
honours it (T-107 107e) — but **no trainer sets a seed** today, so all identities are purely emergent.
Seeds are the lever for deliberate variety and character (and they counter the hyper-attractor /
stall-unreachable skew from problem 2). The owner has validated specific assignments.

## Plan

- **Assign `trainer.archetypeSeed`** where trainers are defined/loaded, per the owner-validated leans:
  - **weather** (base gimmick lean): the **Museum grunts, Tabitha, Maxie (ALL forms), Flannery, Archie**.
  - **trick_room:** **Tate & Liza** (this was force-hardcoded in the old engine → now a seed that the
    engine BUILDS toward, per T-124: slow mons / Room Service).
  - Everyone else: **no seed** — they may fall into a gimmick emergently but do not prioritise one.
- Seeds are a *lean*, not a force: an impossible seed degrades gracefully (T-107 contract). A seeded
  weather trainer only becomes a real weather team once T-124 (gimmick completion) + T-122 (role
  delivery) land — so this task is sequenced after them.
- Format-agnostic: doubles trainers seed against the doubles model (weather / redirection / TR cores).
- Extend with more per-trainer leans (archetype personalities) as we validate them.

> **Meta-analysis validation (owner-gated).** Seed assignments are "what a trainer prefers" rules —
> owner-validated. The weather set (Museum/Tabitha/Maxie/Flannery/Archie) and Tate & Liza → TR are
> validated (2026-07-11); further assignments need the owner.

Acceptance criteria:
- [ ] The validated trainers carry their seed; the decision log shows them leaning into it (and building it).
- [ ] Un-seeded trainers are unaffected (still emergent).
- [ ] Determinism gate green; `cd randomizer && npm test` green.

## Progress log

- **2026-07-11 — core seeds wired.** `modules/trainerSeeds.js` maps the owner-validated trainers to
  seeds (with themed weather subtype): Team Aqua (Museum grunts, Archie) → `weather:rain`; Team Magma
  (Tabitha, Maxie — all forms) + Flannery → `weather:sun`; Tate & Liza → `trick_room`. The resolver
  uses `trainer.archetypeSeed || getTrainerSeed(trainer.id)`. With T-124's identity-aware ability
  selection, the weather-seeded trainers now build REAL weather teams (Archie=rain, Maxie=sun, verified).
  **Pending:** TR completion for Tate & Liza (T-124 follow-up: slow mons / Room Service) so its seed is
  realised, not phantom; trim/verify seed IDs (some rematch variants like FLANNERY_5 are no-ops);
  doubles seeds; more archetype personalities as validated.
- **2026-07-11** — Created from the owner's problem-2 reflections (weather-seeded villain/gym trainers;
  Tate & Liza → TR, replacing the old force). Sequenced after T-124/T-122 so a seed actually builds.

## Outcome

Abandoned by owner (2026-07-16). The core seed assignments shipped and stay in the code (trainerSeeds.js — Tate & Liza full Trick Room, weather-seeded villains/gyms). The remaining scope — deliberate doubles-seed personalities + more archetype variety — was judged optional polish (doubles trainers already build coherent archetypes emergently + the up-front support roll), not worth pursuing. No further work.
