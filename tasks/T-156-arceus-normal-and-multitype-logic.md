---
id: T-156
title: Re-enable Arceus (Normal only) with Multitype/Plate/Judgment trainer logic
status: in-progress
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [randomizer/parser.js, randomizer/rating.js, randomizer/modules/trainerSelector.js, randomizer/items.js]
blocked-by: [T-153, T-154]
---

# T-156 — Re-enable Arceus (Normal only) with Multitype/Plate/Judgment trainer logic

## Context

Owner item 3. The hardest of the batch. Arceus is macro-defined (`ARCEUS_SPECIES_INFO`) → depends on
T-153.

Spawns/exists **only as `SPECIES_ARCEUS_NORMAL`** (the other 17 type forms are banned) — a
Multitype Normal-type with base 120 across the board and the signature move Judgment (Normal-type
100 BP that becomes the held Plate's type). Instead of placing 18 species, the type change is a
**virtual** concept driven by the held Plate. Trainers must understand this:

1. **Type requirements** — a type-restricted trainer (e.g. a Dark E4 with `ALLOW_ONLY_TYPES`) that
   has the matching Plate in its bag may count a Multitype mon + that Plate as a mon of that type.
2. **Plate valuation** — trainers give Multitype mons a large boost for holding a Plate, **especially**
   when the Plate's type adds new coverage to the team.
3. **Judgment priority** — trainers prioritize Judgment on a Plate holder (STAB in the Plate's type).

Investigation notes: plate items live in `items.js` `plates`; `rating.js:1865` already values a Plate
by the mon's damaging move of the plate's type (+STAB if the mon shares it). `MULTITYPE` is a
`BANNED_ABILITIES` entry in the rebalancer (not rebalanced — fine). Trainer type restrictions:
`TRAINER_RESTRICTION_ALLOW_ONLY_TYPES` in `trainerSelector.js` (candidate filter ~308-319). Trainer
bag items are assigned in the item/trainer pipeline (`itemRandomizer.js`, `resolveTrainerTeam.js`,
`itemLinks.js`).

## Plan

**Parser:** add `P_FAMILY_ARCEUS` to `COSMETIC_FAMILIES` (keep-first → `ARCEUS_NORMAL`, drop 17).
Remove from `REMOVED_FAMILIES`. No other Arceus species parsed.

**Trainer/rater (the meat):**
- Model "effective type" for a Multitype mon as `plateType(heldPlate)` when it holds a Plate; feed
  that into the `ALLOW_ONLY_TYPES` candidate filter so a type-restricted trainer with the right Plate
  in bag can field Arceus for that type.
- Boost Plate valuation for Multitype mons (extend the `rating.js` plate branch), with an extra
  bump when the Plate's type is new coverage for the team.
- Ensure Judgment is selected/valued on Plate holders (moveset selection + rating).

Scope is genuinely open-ended; if the trainer/item plumbing needed to route a specific Plate into a
type-restricted trainer's bag is larger than expected, **pause and report to the owner** with options
before expanding scope.

Owner decision (2026-07-18): **rater logic only, no new Plate distribution.** Implement the three
rater/trainer behaviours, but do NOT add plate-to-bag distribution (that would change existing boss
item picks — the risky part). Consequence: a type-restricted trainer fields Arceus for its type only
where a matching Plate is *already* in that trainer's bag; elsewhere Arceus is a Normal legendary.

Acceptance criteria:
- [x] Arceus surfaces `NORMAL` only; no other type forms in teams/docs (verified in `pokes.js`).
- [x] A type-restricted trainer counts Multitype Arceus for a type when its bag holds a matching Plate
      (`multitypeSatisfiesTypes` wired into both type filters in `trainerSelector.js`; unit-tested).
- [x] A Plate is boosted in valuation for a Multitype mon (STAB via Judgment), with a new-coverage
      bonus (unit-tested; a non-Multitype mon lacking a move of the plate's type still rates it 0).
- [x] Judgment is force-picked on a Multitype mon (verified: Arceus's `bestMoveset` includes Judgment).
- [x] New unit tests for all three behaviors; `cd randomizer && npm test` green (1274). Pipeline exits 0.
- [ ] (Out of scope by owner decision) universal / type-themed Plate distribution to trainer bags.

## Progress log

- **2026-07-18** — Task created. Flagged as highest-risk; owner check-in likely mid-task.
- **2026-07-18** — Parser: added `P_FAMILY_ARCEUS` to `COSMETIC_FAMILIES` (keeps Normal, drops 17 type
  forms). Investigation (agent) mapped the four injection points; the only deep-plumbing piece is
  distributing Plates into type-themed trainer bags. Presented the scope choice to the owner, who chose
  **rater logic only** (no new Plate distribution).
- **2026-07-18** — Implemented (TDD, `randomizer/__tests__/unit/arceus.test.js`): constants
  `MULTITYPE_ABILITY`/`JUDGMENT_MOVE_ID`; `chooseMoveset` force-picks Judgment for a Multitype mon
  (mirrors Meloetta Relic Song, protected from the same-type dedup); `rateItemForAPokemon` values any
  Plate for a Multitype holder as STAB-via-Judgment + new-coverage bonus; `trainerSelector`
  `trainerBagPlateTypes`/`multitypeSatisfiesTypes` let a Multitype candidate satisfy a type restriction
  when a matching Plate is in the trainer's bag (both type filters). Verified via `analyze.js`: Arceus
  Normal-only, tier AG, `bestMoveset` includes Judgment. Full suite green (1274).

## Outcome
