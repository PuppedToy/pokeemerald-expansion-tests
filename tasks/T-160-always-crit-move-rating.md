---
id: T-160
title: Rate always-crit moves for their guaranteed critical hit
status: done
type: fix
created: 2026-07-19
updated: 2026-07-19
target-version: 0.6.0
links: [randomizer/rating.js]
blocked-by: []
---

# T-160 — Rate always-crit moves for their guaranteed critical hit

## Context

Owner noticed Urshifu picking other moves over **Wicked Blow**. Its always-crit signature moves are
undervalued: the `alwaysCriticalHit` data flag was never used in the rater, so a guaranteed critical hit
carried no rating bonus.

## Findings (2026-07-19)

**ROM crit mechanics (this build — Gen 9 config):**
- **Crit damage ×1.5** (`src/battle_util.c` `GetCriticalModifier`; `B_CRIT_MULTIPLIER = GEN_LATEST`,
  Gen 6+ → 1.5×, not the old 2×).
- A crit **ignores the target's positive Def/SpDef stat stages** (`battle_util.c:8925`), **ignores the
  attacker's negative Atk/SpAtk stages** (`:8645`), and **ignores screens** Reflect/Light Screen/Aurora
  Veil (`GetScreensModifier` returns 1.0 on a crit, `:9164`). Blocked by Battle Armor / Shell Armor /
  Lucky Chant.
- `alwaysCriticalHit` move flag → `CRITICAL_HIT_ALWAYS` (guaranteed).

**Always-crit moves (6):** Wicked Blow (75 Dark phys), Surging Strikes (25×3 Water phys), Storm Throw
(60 Fighting), Frost Breath (60 Ice spec), Zippy Zap (80 Electric phys), Flower Trick (70 Grass phys).
Data field is the string `alwaysCriticalHit: "TRUE"`.

**Rater today (`randomizer/rating.js`):**
- `alwaysCriticalHit` is referenced NOWHERE. Baked ratings are power-only (Wicked Blow 5.36, no crit).
- `superCritMoves` (`:143`) = Storm Throw / Frost Breath / Surging Strikes / Wicked Blow — used only to
  ZERO crit items (Razor Claw returns 0 when present, `:1831/1837`), which is correct, but the list is
  **incomplete** (missing Flower Trick, Zippy Zap) and gives the moves themselves no bonus.
- The item side already correctly declines crit items on an always-crit mon; the gap is purely the
  move's own quality rating.

## Plan

- In `rateMove`, multiply effective `power` by the crit multiplier (1.5) when `alwaysCriticalHit` — model
  the guaranteed ×1.5 as effective power. (Secondary bypass-of-screens/boosts upside left unquantified.)
- Complete `superCritMoves` with Flower Trick + Zippy Zap so the existing crit-item zeroing covers all six.

Acceptance criteria:
- [x] Always-crit move rates ~1.5× a same-power non-crit move (`rateMove`); tests.
- [x] Surging Strikes (3× + always crit) rates near the cap.
- [x] Wicked Blow out-rates a same-power non-crit move end-to-end (`rateMoveForAPokemon`).
- [x] `superCritMoves` covers all six always-crit moves.
- [x] `cd randomizer && npm test` green (1322).

## Progress log

- **2026-07-19** — Task created. ROM + rater analysis done (above): fix is a ×1.5 effective-power bonus
  for `alwaysCriticalHit` moves + completing the `superCritMoves` list.
- **2026-07-19** — Implemented (TDD, red→green): `rateMove` multiplies effective power ×1.5 when
  `move.alwaysCriticalHit === 'TRUE'`; `superCritMoves` extended with Flower Trick + Zippy Zap. New tests
  in rateMove.test.js (3), rateMoveForAPokemon.test.js (1), rateItemForAPokemon.test.js (1). Full suite
  green (1322). Verified live: both Urshifu forms now pick their signature — Single Strike takes Wicked
  Blow, Rapid Strike takes Surging Strikes. Note: chooseMoveset/pokedexModule recompute rateMove fresh at
  runtime, so the boost applies everywhere (moves.json's baked field is regenerated on load).
- **2026-07-19** — Owner asked to also credit the secondary implication: a crit ignores the target's
  Def/SpDef boosts and screens (Reflect/Light Screen/Aurora Veil). Added a flat **+0.5** to always-crit
  moves in `rateMove`, applied AFTER the power cap so even capped moves (Surging Strikes) get it. Wicked
  Blow → 8.54, Surging Strikes → 12.5. Extra test in rateMove.test.js. Full suite green (1323). Awaiting
  owner review/merge.

## Outcome

Always-crit moves (`alwaysCriticalHit === 'TRUE'`: Wicked Blow, Surging Strikes, Storm Throw, Frost
Breath, Zippy Zap, Flower Trick) are now rated for the guaranteed critical hit in `rateMove`: ×1.5
effective power (crit damage, Gen 6+ `B_CRIT_MULTIPLIER`) plus a flat +0.5 for a crit ignoring the
target's Def/SpDef boosts and screens. `superCritMoves` completed with Flower Trick + Zippy Zap so the
existing crit-item zeroing (Razor Claw/Scope Lens are redundant on an always-crit mon) covers all six.
Wicked Blow 5.36 → 8.54, Surging Strikes → 12.5. Verified live: both Urshifu forms now pick their
signature move. Tests: rateMove.test.js (4), rateMoveForAPokemon.test.js (1), rateItemForAPokemon.test.js
(1). Full suite green (1323). Merged into master. No deviations from the plan.
</content>
