---
id: T-143
title: Trick Room is emergent-only — never force-seeded (Tate & Liza de-seeded)
status: done
type: feature
created: 2026-07-16
updated: 2026-07-16
target-version: 0.8.0
links: [B-034, B-035, B-036, B-037, T-124, T-126]
---

# T-143 — Trick Room is emergent-only

## Context

The Trick Room line (B-034 revive → B-035 tighten emergent → B-036 TM-gate → B-037 Room Service) surfaced a
structural problem the owner then decided on: **forcing TR on a type-restricted boss doesn't work.** Tate &
Liza are Psychic-restricted, and there are almost no slow Psychic mons — and no slow Psychic MEGA (Alakazam /
Medicham / Gardevoir / Gallade / Metagross / Latios are all fast; only Mega Slowbro is slow, rarely in pool)
— at the boss tiers. So a forced full room produced a *fast* "TR" team (Mega Alakazam @ 150), and the fast
mons come from slots whose candidate pool has no slow option at all — not fixable by any weight-bias.

Owner decision (2026-07-16): **"Trick Room no se fuerza nunca; cuando sale emergente se construye. Tate &
Liza no fuerza nada."**

## Plan / Outcome

- **Removed the `TRICK_ROOM` seed** (`modules/trainerSeeds.js`): Tate & Liza (all 5 forms) force nothing —
  they're a normal Psychic boss. No trainer force-seeds Trick Room any more.
- **TR is now EMERGENT-only**, and well-built for that case (the prior bug fixes stand):
  - fires only for a genuine **slow-offensive core** (≥3 slow hard-hitters — B-035), not "can-learn ⇒ TR";
  - the setter move is **TM-gated** (B-036) — never taught without the TR TM in the bag;
  - **≤1 Room Service** per team (B-037);
  - the picker already prefers slow mons *when the pool has them* (`TR_SLOW_FACTOR`).
- **Determinism assertion updated** (`reverseOrderContinuity.test.js`): was "Tate & Liza build TR"; now
  "Trick Room still builds emergently somewhere" (TR is no longer force-seeded).
- The dormant full-room machinery (`roomStyle:'full'`, `TR_FULL_SETTERS/ABUSERS`, the half-room fallback) is
  left in place, harmless — it only activates if a full room is ever seeded again.

Verified: fast suite green; determinism 18/18; T&L are a normal Psychic team; emergent TR still builds
(slow cores, TM-gated). Owner-directed close ("lo dejamos bien hecho para emergentes y cerramos tarea").
