---
id: T-157
title: Re-enable Burmy and Ogerpon on the Deerling multi-form model
status: proposed
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [randomizer/constants.js, randomizer/modules/utils.js, randomizer/parser.js]
blocked-by: [T-153]
---

# T-157 — Re-enable Burmy and Ogerpon on the Deerling multi-form model

## Context

Owner items 2 and 10. These have **meaningfully different** catchable forms (not cosmetic), so they
follow the existing Deerling model: each form is its own family that randomizes independently, but
only ONE form appears in the wild per run and any single trainer holds at most one (trainers across
the run may use any form). Both are macro-defined (`MOTHIM_SPECIES_INFO`, `OGERPON_SPECIES_INFO`) →
depend on T-153. (Burmy-Plant and Wormadam are already full-struct; Mothim and all Ogerpon are macros.)

- **Burmy** (`P_FAMILY_BURMY`): cloaks Plant/Sandy/Trash. Wormadam is the level-up ("rare candy")
  evolution (different type per cloak: Grass/Steel, Ground/Steel, Bug/Steel); Mothim is the stone
  evolution. The base data already encodes exactly this: `EVO_LEVEL 20 → Wormadam` and
  `EVO_ITEM ITEM_DAWN_STONE → Mothim`. Stone = Dawn Stone.
- **Ogerpon** (`P_FAMILY_OGERPON`): masks Teal (Grass), Wellspring (Grass/Water), Hearthflame
  (Grass/Fire), Cornerstone (Grass/Rock), each with its own ability. The four `_TERA` forms are
  battle-only (Terastal, not in this Gen-3 base) and must be banned.

The Deerling mechanism (from investigation): a form suffix in **`POKE_FORMS`** (constants.js) makes
the parser split it into a derived family `P_FAMILY_<BASE>_<SUFFIX>` (→ independent randomization);
the same suffix in **`COSMETIC_FORM_SUFFIXES`** (utils.js `getFamilyGroup`) collapses that derived
family back to the base for the "one obtainable per family per run" dedup and per-trainer dedup.
Deerling's SUMMER/AUTUMN/WINTER are in both lists; regional forms (ALOLA/…) are in POKE_FORMS only.

## Plan

- Add `SANDY`, `TRASH` (Burmy) and `WELLSPRING`, `HEARTHFLAME`, `CORNERSTONE` (Ogerpon) to
  `POKE_FORMS` (constants.js) **and** `COSMETIC_FORM_SUFFIXES` (utils.js). (Teal and Plant are the
  base families — no suffix.) Confirm no unintended other species end with these suffixes.
- Remove `P_FAMILY_BURMY` and `P_FAMILY_OGERPON` from `REMOVED_FAMILIES`.
- Add the four `SPECIES_OGERPON_*_TERA` to `REMOVED_SPECIES` (use exact ids, not a substring match —
  `_TERA` would also catch Terapagos).
- Verify Burmy's branched evolution parses (level→Wormadam, Dawn Stone→Mothim) and that Dawn Stone is
  obtainable in this game; if the evo-level/stone pass needs adjustment for the branch, handle it.

Acceptance criteria:
- [ ] Each Burmy cloak (3) and Ogerpon mask (4) parses as its own family and can randomize independently.
- [ ] Wild dedup places only one Burmy-family form and one Ogerpon-family form per run; a single
      trainer holds at most one of each family (existing `getFamilyGroup` dedup).
- [ ] Ogerpon `_TERA` forms are absent from teams/docs.
- [ ] Burmy → Wormadam (level) and Burmy → Mothim (Dawn Stone) evolutions are present and sane.
- [ ] New unit tests (family split + `getFamilyGroup` collapse for the new suffixes; TERA removed);
      `cd randomizer && npm test` green.

## Progress log

- **2026-07-18** — Task created. Confirmed base data already has Burmy's level/stone branched evo.

## Outcome
