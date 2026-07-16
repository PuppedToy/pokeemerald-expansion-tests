---
id: B-034
title: Trick Room and electric-terrain gimmicks roll back and never build (Tate & Liza / Wattson)
status: fixed
severity: major
created: 2026-07-16
updated: 2026-07-16
found-in: 0.8.0
fixed-in: 0.8.0
regression-test: randomizer/__tests__/integration/reverseOrderContinuity.test.js
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

> **Follow-up (T-143):** the *forced* full room was later removed entirely — Tate & Liza (Psychic-restricted,
> no slow Psychic mons/megas at the boss tiers) can't build a genuinely slow team, so forcing TR produced
> *fast* "TR" teams. TR is now **emergent-only**. This B-034 fix still stands: it's what lets emergent TR
> build a room. The determinism assertion moved from "T&L builds TR" to "TR builds emergently somewhere".

## Fix

Two structural fixes to the Trick Room gimmick (`gimmickPlan.js`):
1. **Half-room fallback** — `gimmickFallbackChain` now returns `[full, half, dropped]` for a `roomStyle:'full'`
   TR seed (was `[full, dropped]`). A full room that can't field 4 abusers falls back to a **half room
   (1 setter + 2 abusers)** before dropping TR entirely.
2. **Abuser Speed threshold aligned** — `TR_ABUSE_SPEED_MAX` 55 → **60**, matching the picker's
   `TR_SLOW_SPEED`, so a slow mon the picker biased in actually counts as a TR abuser.

Result (e2e): **Tate & Liza field Trick Room in 5/5 sampled seeds** (was 0), and **34–45 teams/seed** now
build TR (comparable to weather's ~43 — a healthy level, not an explosion). `ensureTrickRoomSetter` already
guarantees the setter move; no separate move-setter change was needed.

**Electric terrain — corrected finding:** it was NOT actually broken. The original "never forms" report was a
detection error (scanning only the Surge *ability*, missing the Electric-Terrain *move*-setter). Electric
terrain builds **3–9 teams/seed** via the move-setter retrofit, and Wattson builds it in **2/3** sampled
seeds (the occasional miss is normal attempt-variance). No electric-terrain code change.

Regression test: `randomizer/__tests__/integration/reverseOrderContinuity.test.js` — the Tate & Liza block
now asserts a Trick Room setter is fielded (gated with `RUN_DETERMINISM=1`; failed before the fix — the team
rolled back to a non-gimmick roster — and passes after).
