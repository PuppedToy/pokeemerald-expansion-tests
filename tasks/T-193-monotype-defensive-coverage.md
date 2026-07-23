---
id: T-193
title: Monotype teams prefer secondary types/abilities that patch their weaknesses
status: in-progress
type: feature
created: 2026-07-23
updated: 2026-07-23
target-version: 0.6.0
links: []
blocked-by: []
---

# T-193 — Monotype teams prefer secondary types/abilities that patch their weaknesses

## Context

Owner request (2026-07-23): give **strict-monotype** trainer teams (gym leaders + Elite Four) a
"defensive coverage" interest bonus. After favourites/obligatory mons are placed, each remaining slot
first tries to pick a member whose **secondary type or ability** patches a weakness of the team's mono
type — with **immunities** at top priority, then **resistances/neutralities** — before falling back to
the normal per-slot pick. Probabilities scale with the trainer's sophistication.

This respects the existing engine: monotype is `trainer.types.length === 1` with
`TRAINER_RESTRICTION_ALLOW_ONLY_TYPES` (gyms + E4); the type chart / `damageMultiplier` is the SSOT for
typing matchups ([rating.js](../randomizer/rating.js)); the per-slot pick already runs through the
archetype picker which reads `context.team`, `context.sophistication` and the emergent identity, and
already hard-filters weather/gimmick/support sub-pools ([archetypePicker.js](../randomizer/modules/archetypePicker.js)).

Owner decisions (2026-07-23):
1. **Scope** — gyms + E4 only (strict `types.length === 1`). Aqua/Magma (5-type) and Champion Steven
   (lower slots not type-locked) are excluded.
2. **Ability gate** — an ability only counts as coverage if it is actually **assignable** at the
   trainer's level (respects the "no hidden ability below the strategic level" rule,
   `usesStrategicAbility` in [trainerAbility.js](../randomizer/modules/trainerAbility.js)). The chosen
   ability is then forced via the existing `preferredAbilities` channel.
3. **Priority** — coverage **yields** to a committed weather/gimmick/dedicated-support pick for a slot;
   it runs on the remaining ordinary slots, then falls through to the normal archetype-weighted pick.

## Plan

New pure, injected-`damageMultiplier` module `randomizer/modules/typeCoverage.js`:
- `TYPE_IMMUNITY_ABILITIES` / `TYPE_RESIST_ABILITIES` (only the ability side needs hardcoding — typing
  is derived from `damageMultiplier`):
  - Immunity: GROUND→Levitate,Earth Eater · ELECTRIC→Volt Absorb,Lightning Rod,Motor Drive ·
    WATER→Water Absorb,Storm Drain,Dry Skin† · FIRE→Flash Fire,Well-Baked Body · GRASS→Sap Sipper.
  - Resist (×0.5): FIRE→Thick Fat,Heatproof,Water Bubble · ICE→Thick Fat · GHOST→Purifying Salt.
  - († Dry Skin also adds +25% Fire damage — documented caveat.)
- `monotypeWeaknesses(baseType, dmg)`; `uncoveredImmunities/Resists(baseType, team, dmg)` (team-level:
  covered once some member is immune/≤1×); `coverageAbilityFor(candidate, w, level)` (assignable-only).
- Immunity means total `damageMultiplier(w, member.parsedTypes) === 0` OR an assignable immunity
  ability; resist/neutral means `≤ 1` OR an assignable ×0.5 ability bringing a 2× weakness to ≤1×.

Wiring (gated so non-monotype and `soph < 0.15` output stays **byte-identical**):
- `runAttempt` sets `context.monoType = trainer.types.length === 1 ? trainer.types[0] : null`.
- In the picker, per slot, when `monoType` set and `soph ≥ BIAS_MIN_SOPH` and the slot isn't claimed by
  a weather/gimmick/support hard-pick:
  - **2a** immunity pool (uncovered) ∩ archetype-fit → shuffle (seeded) → roll `min(1, 1.5×soph)`
    per candidate → first hit wins (forced ability stashed in a `context.coveragePicks` side-channel).
  - **2b** else resist/neutral pool → same, roll `0.9×soph`.
  - **2c** else existing pick (unchanged).
- Ability step reads `context.coveragePicks` to force the coverage ability (via `preferredAbilities`).

Acceptance criteria:
- [ ] `typeCoverage.js` unit-tested: immunity/resist tables, weakness derivation, uncovered-set logic,
      assignable-ability gate, per-candidate roll math (Red→Green).
- [ ] A high-soph Rock monotype gym reliably fields Ghost/Flying/Levitate/Water-Absorb/etc. coverage;
      a low-soph (`< 0.15`) or non-monotype team is **byte-identical** to before (regression test).
- [ ] Immunities take priority over resistances; coverage yields to committed weather/gimmick/support.
- [ ] `cd randomizer && npm test` green; affected integration snapshots reviewed & intended.
- [ ] Browser bundle rebuilt (`node build.js`) so the client Worker has the change.
- [ ] Owner manually tests generated gym/E4 teams and confirms before close.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-23** — Task created. Explored the fill path (resolveTrainerTeam → trainerSelector →
  archetypePicker), confirmed monotype detection, the `damageMultiplier` SSOT, the ability-assignment
  timing/hidden-ability gate, and that no ability→immunity table exists (must build one). Computed the
  full 18-monotype coverage matrix from the canonical chart. Plan + 3 decisions validated with owner.
- **2026-07-23** — Red→Green on the pure core: added `modules/typeCoverage.js` + `__tests__/unit/typeCoverage.test.js` (immunity/resist tables, weakness derivation, provides/uncovered logic, assignable-ability hidden-gate, `autoIncludeProbability` = min(1,1.5×soph)/0.9×soph, seeded `selectByRoll`). Refined `uncoveredImmunities` to list only threats where an immunity is *achievable* (Steel etc. fall to the resist round). Full suite green (1599 passing). Next: wire into the picker/runAttempt (output-changing) — reading picker internals.
- **2026-07-23** — Wired into the generator + full-suite green (1611). `runAttempt` computes
  `context.monoType`/`trainerLevel`/`coveragePick(s)`; `makeArchetypePicker` gains an injected
  `damageMultiplier` and a coverage branch placed AFTER the weather/gimmick/support hard-picks (yields to
  committed identity) and BEFORE the weighted pick — immunities (150%×soph) then resists (90%×soph), with
  archetype fit as a filter (`scoreCandidate>0` when an identity exists). Ability-driven picks force the
  ability via a per-slot `context.coveragePick` guarded by poke id → threaded into `preferredAbilities`.
  Added `typeCoverageWiring.test.js`. Smoke on real trainer data: exactly 12 monotype trainers detected
  (8 gyms + 4 E4); Aqua/Magma/Steven correctly excluded. Integration snapshots didn't move (they assert
  determinism/type-pool/colors/counts, not exact compositions — no exact-team snapshot exists). Rebuilt
  the browser bundle (`node build.js`) — coverage code confirmed present in randomizer.bundle.js.
- **2026-07-23** — Owner ask: log coverage EXHAUSTIVELY in the decision log. Refactored the picker to
  `evaluateCoverage` (returns a full trace: BOTH rounds' uncovered set + full pool [id, threats, via
  typing/ability, forced ability] + auto-include % + reached flag + pick; rolls still follow the real
  algorithm — resist only rolls if immunity didn't pick). `runAttempt` tags each entry with
  `context.currentSlotIndex`; `finishTeam` now carries `coveragePicks`; `renderTeamAuditText` prints a
  per-slot exhaustive block (rounds, pools, ‹picked›). New tests: `evaluateCoverage`/
  `candidateCoverageDetail` units + a teamAudit render test; wiring test updated to the trace shape.
  Real-run smoke (seed 7, difficulty 13): 44 coverage entries rendered across the run; verified Juan
  (ICE, soph 0.8) shows both rounds per slot with the uncovered set correctly SHRINKING as coverage
  lands (FIRE drops after a Baxcalibur pick). Suite green (1617). Bundle rebuilt (log code present).
  The decision log is downloaded from the frontend ("Download decision log" → `decision-log-<seed>.txt`).
  REMAINING: owner manual test of real gym/E4 teams + decision log before close.

## Outcome

<!-- Filled when closing. -->
