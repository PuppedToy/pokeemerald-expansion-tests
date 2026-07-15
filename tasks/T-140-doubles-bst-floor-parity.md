---
id: T-140
title: Doubles tier — apply the BST floor (parity with singles)
status: in-progress
type: fix
created: 2026-07-15
updated: 2026-07-15
target-version: 0.8.0
links: [T-097]
---

# T-140 — Doubles tier — apply the BST floor (parity with singles)

## Context

The singles rater floors a Pokémon's tier by its raw BST (`ratePokemon`, rating.js): BST ≥ 400/480/540/600
guarantees at least NU/RU/UU/OU, ≥ 660 LEGEND (non-mega), mega ≥ 720 UBERS, ≥ 720/770 AG. This BST floor
is what **paces the nuzlocke** — as the run's BST budget ramps, so does the tier — and the owner requires
the same pacing in doubles.

The doubles rater (`ratePokemonDoubles`, T-097) applies its own bstRating + combo + frailty/passive
penalties and maps straight through `tierFromRatingDoubles` with **no BST floor**. So a high-BST but frail
Pokémon can land below its BST-implied tier in doubles — losing the pacing.

## Plan

- Port the singles BST-floor block to `ratePokemonDoubles`, using the **same** raw-BST cutoffs (they are
  format-independent) but the **doubles** tier thresholds (`DOUBLES_TIER_THRESHOLDS`) as the floor targets.
- Apply it **after** the doubles frailty/passive penalties, so the BST floor is the final guaranteed
  minimum (BST wins — matching singles, where the floor is the last word before `tierFromRating`).
- Use the same ability-adjusted `rawBST` as singles (HugePower etc. via `computePowerAndRole`'s
  multipliers) and the same mega handling (stone-mega → UBERS/AG mega thresholds; non-mega → LEGEND).
- Scope: ONLY the BST floor. The singles combo-specific floors (Dracovish, Urshifu, IMPOSTER, TANK-low-HP
  cap, …) are singles balance calls and stay singles-only; doubles has its own combo system.

Acceptance criteria:
- [ ] A high-BST, frail/low-combo Pokémon is floored to its BST tier in doubles (regression test).
- [ ] Low-BST Pokémon are unaffected (no spurious floor).
- [ ] Singles output byte-identical (determinism gates 17/17); fast suite green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-15** — Task created after the owner spotted the doubles tier ignoring the BST floor.
- **2026-07-15** — TDD red→green. Ported the singles BST floor to `ratePokemonDoubles` (rating.js): same
  ability-adjusted `rawBST` (via `computePowerAndRole`'s multipliers) and the same format-independent BST
  cutoffs, but flooring to `DOUBLES_TIER_THRESHOLDS`, applied AFTER the frailty/passive penalties so BST
  has the final word. Non-mega ≥660 → LEGEND; stone-mega ≥720 → UBERS, ≥770 (or POWER_CONSTRUCT) → AG.
  - **Dead end / learning:** the first red fixtures used `parsedAbilities: ['NONE']`, which trivially
    satisfies the TRUANT/DEFEATIST/SLOW_START `every()` guards in `computePowerAndRole` → all three
    offensive multipliers dropped (0.5/0.75/0.5), deflating the effective BST (660 → 432). Real mons carry
    a real ability; switched the fixtures to a neutral `PRESSURE` so `rawBST` == the true BST. Confirms
    the floor uses the SAME adjusted BST as singles (correct parity), not the raw stat sum.
  - **Calibration re-check (seed 777, base pokedex):** the owner-validated T-097 anchors all still hold —
    risers Incineroar RU→OU, Landorus-T OU→UBERS, Cresselia UU→OU, Tyranitar OU→UBERS; drops Pheromosa
    UBERS→OU, Kartana LEGEND→OU, Regieleki UBERS→OU. The drops now bottom out at their BST-implied OU
    floor (they're high-BST glass cannons; the owner's "BST paces doubles" rule intentionally caps how
    far they fall). BST now visibly paces doubles: Tyranitar Mega (700) → LEGEND, Landorus (600) → UBERS.
  - **Verified:** fast suite 1085 green (3 new BST-floor tests); determinism gates 17/17 (singles
    byte-identical, doubles teambuilding deterministic). Doubles-only + rng-free (no `chooseMoveset`).

## Outcome

<!-- Filled when closing. -->
Awaiting the owner's manual test (the drops now floor at OU — owner to confirm that pacing is acceptable).
