---
id: B-034
title: Trick Room and electric-terrain gimmicks roll back and never build (Tate & Liza / Wattson)
status: open
severity: major
created: 2026-07-16
updated: 2026-07-16
found-in: 0.8.0
fixed-in:
regression-test:
links: [T-124, T-126, T-125]
---

# B-034 — Trick Room + electric-terrain gimmicks never build

## Symptom

Across 7 sampled seeds, **no generated team fields a Trick Room move** — including the TR-seeded Tate & Liza
(they field e.g. Solrock + Lunatone but no `MOVE_TRICK_ROOM`), and **no team forms electric terrain** either
(no Electric Surge / Hadron Engine setter). Both are headline gimmicks (T-124/T-126) that are effectively
dead in output. Surfaced while verifying T-125 (the Room Service + Terrain Extender item claims are correct
but never fire, because the gimmicks they serve never build).

## Root cause

Not a data gap: Trick Room is broadly learnable at runtime — **296 species teachable + 5 by level-up** (the
teachable expansion adds the TR TM to its learners). The failure is in the attempt-based gimmick system
(ADR-017): the TR attempt is **rolled back**. The team audit for `TRAINER_TATE_AND_LIZA_1` shows
`rolledBack: { gimmick: "trick_room", attempts: 1 }` and a final `gimmicks: []` (was `['trick_room']`).

- **Trick Room:** Tate & Liza are seeded `roomStyle: 'full'`, whose hold condition is **2 setters + 4
  abusers** (`TR_FULL_SETTERS` + `TR_FULL_ABUSERS`, gimmickPlan.js). The built team isn't slow enough to
  field 4 TR abusers (it drew fast mons — Deoxys / Iron Leaves / Gallade), so the full-room attempt can't
  hold → the gimmick is discarded, TR never gets injected. The slow-mon bias in the picker (`TR_SLOW_FACTOR`)
  isn't strong enough to guarantee a TR-shaped team.
- **Electric terrain:** Electric Surge / Hadron Engine are scarce after `mutateAbilities` (none appeared
  across the sampled seeds), so the setter+2-abusers condition can't be met and the gimmick can't form.

## Fix

<!-- Owner-directed (2026-07-16): investigate now. Root cause confirmed above. Fix direction (needs an owner
     design call in T-124): loosen the full-room hold (fall back to a half-room: 1 setter + 2 abusers when 4
     abusers aren't buildable), and/or strengthen the slow-mon bias so a TR-seeded team is actually built
     slow, and/or a move-setter guarantee for the seeded setter. For electric terrain: a move-setter retrofit
     (Electric Terrain move) when no ability-setter is buildable, mirroring the weather move-setter path.
     Regression test must reproduce: a TR-seeded trainer fields Trick Room. No test, no `fixed`. -->
