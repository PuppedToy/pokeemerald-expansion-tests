---
id: T-158
title: Add Silvally, unified onto Multitype + Plates (drop Memories)
status: in-progress
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [T-156, randomizer/parser.js, randomizer/rating.js, src/data/pokemon/form_change_tables.h, src/data/moves_info.h]
blocked-by: [T-153, T-156]
---

# T-158 — Add Silvally, unified onto Multitype + Plates

## Context

Silvally / Type: Null (`P_FAMILY_TYPE_NULL`) was left out of T-153..T-157 because it duplicates Arceus's
type-flex gimmick with a *second* item set (Memories + RKS System + Multi-Attack). The owner wants ONE
mechanic: give Silvally **Multitype + Plates** (like Arceus) so Memories become unnecessary.

Engine facts (verified by reading the C):
- Type-change is species-agnostic in battle code (no species gate on Judgment/Multi-Attack/Multitype/
  RKS). Judgment/Multi-Attack derive their type from the held item's hold-effect
  (`src/battle_util.c` `HOLD_EFFECT_PLATE`/`HOLD_EFFECT_MEMORY`).
- The type change is data-driven **form changes** (`form_change_tables.h`): `ARCEUS_NORMAL + Plate +
  MULTITYPE → ARCEUS_<type>`; the Silvally mirror uses Memories + RKS. Per-species tables, so Arceus and
  Silvally can share Multitype + Plates without conflict.
- For Arceus the plate→type mechanic already works in the compiled ROM (T-156 only stopped the
  randomizer from *placing* the extra forms; the forms + tables still exist).

Owner decisions (2026-07-18):
- Unify Silvally onto **Multitype + Plates** (not Memories).
- **Keep Multi-Attack as Silvally's move** and flip the *move* to Plates — even though that breaks ~7
  upstream battle tests that use `MULTI_ATTACK + *_MEMORY` as a vehicle (they must be updated to Plates).
- Type: Null stays a plain Normal mon (no special treatment); Silvally gets the Arceus treatment.
- "Multitype on *any* pokemon" is intentionally NOT done — type change is per-species form tables, only
  Arceus and Silvally have them, and nothing else ever gets Multitype (rebalancer bans assigning it).

**Verification constraint:** there is no local GBA toolchain (`make check` runs only in CI / on the
builder). The C changes below are therefore **unverified locally** — they must be validated by CI
`make check` and an owner ROM playtest. The JS changes are locally tested. This task lives on its own
branch (`feature/T-158-silvally-multitype-plates`) and should NOT merge to master until CI is green and
the owner has playtested.

## Plan

**C (CI/builder-verified only):**
1. `MOVE_MULTI_ATTACK` (`src/data/moves_info.h`): `.argument.holdEffect` `HOLD_EFFECT_MEMORY` → `HOLD_EFFECT_PLATE`.
2. Silvally ability (`SILVALLY_SPECIES_INFO` macro, gen_7): `ABILITY_RKS_SYSTEM` → `ABILITY_MULTITYPE`.
3. `sSilvallyFormChangeTable` (`form_change_tables.h`): each `*_MEMORY` → the matching `*_PLATE`, and
   `ABILITY_RKS_SYSTEM` → `ABILITY_MULTITYPE` on every row.
4. Update the ~7 upstream tests that pair `MULTI_ATTACK` with a `*_MEMORY` (refrigerate, aerilate,
   galvanize, normalize, pixilate, anticipation, embargo) to use the matching Plate — mechanical
   Memory→Plate item swaps; the resulting move type (`secondaryId`) is unchanged.

**JS (locally tested):**
5. `parser.js`: remove `P_FAMILY_TYPE_NULL` from `REMOVED_FAMILIES`; add it to `COSMETIC_FAMILIES`
   (keep-first-per-natDex → keeps Type: Null + `SILVALLY_NORMAL`, drops the 17 other Silvally forms).
6. `rating.js` + `constants.js`: generalize T-156's forced signature move so a Multitype mon force-picks
   whichever of {Judgment, Multi-Attack} it can learn (Silvally learns Multi-Attack). The plate
   valuation + type-restriction logic already key on `MULTITYPE`, so they cover Silvally automatically.

Acceptance criteria:
- [x] Type: Null + `SILVALLY_NORMAL` parse; the 17 Silvally type forms are dropped; Type: Null → Silvally evo intact.
- [x] Silvally is rated/teambuilt with the Multitype treatment — verified via `analyze.js`: Silvally
      Normal/Multitype, tier UU, `bestMoveset` includes Multi-Attack (forced). Type: Null stays plain
      Normal/Battle Armor (RU), no treatment. Plate valuation + type-restriction already key on MULTITYPE.
- [x] New JS unit tests (`randomizer/__tests__/unit/silvally.test.js`); `cd randomizer && npm test` green (1279).
- [ ] (CI/builder — NOT verifiable locally) `make check` green after the Multi-Attack/Silvally C changes +
      the 7 upstream test updates (refrigerate, aerilate, galvanize, normalize, pixilate, anticipation, embargo).
- [ ] (Owner) ROM playtest: Silvally + a Plate becomes that type in battle and Multi-Attack matches; Arceus
      still works; nothing else regressed by the Multi-Attack Memory→Plate flip.

## Progress log

- **2026-07-18** — Task created after owner chose the unified Plates approach and to keep Multi-Attack
  (flipped to Plates). Documented the local-verification constraint for the C half.
- **2026-07-18** — Implemented on branch `feature/T-158-silvally-multitype-plates` (NOT merged).
  JS (locally verified): parser un-removes `P_FAMILY_TYPE_NULL` → `COSMETIC_FAMILIES` (keeps Type: Null +
  Silvally-Normal); `MULTITYPE_SIGNATURE_MOVES = [Judgment, Multi-Attack]` generalizes the T-156 forced
  signature move; plate valuation + type restriction already key on MULTITYPE. Verified: Silvally UU,
  Multi-Attack forced; Type: Null plain RU; full suite green (1279); `analyze.js` exits 0.
  C (needs CI/builder + playtest): `MOVE_MULTI_ATTACK` holdEffect Memory→Plate + description; Silvally
  ability RKS System→Multitype (macro); `sSilvallyFormChangeTable` 18 rows Memory→matching Plate +
  Multitype; 7 upstream battle tests updated Memory→Plate (type/secondaryId preserved; refrigerate now
  has a harmless duplicate ASSUME pair). Could NOT run `make check` locally.
  Dead weight after this change: Memory items + RKS System become unused (harmless, like the drives).

## Outcome
