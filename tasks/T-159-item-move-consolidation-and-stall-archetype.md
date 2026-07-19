---
id: T-159
title: Item↔move consolidation pass + stall-archetype breakpoint
status: done
type: feature
created: 2026-07-18
updated: 2026-07-19
target-version: 0.6.0
links: [randomizer/rating.js, randomizer/modules/resolveTrainerTeam.js, randomizer/modules/trainerTeamOrder.js, randomizer/data/archetypes/singles.json, randomizer/data/archetypes/doubles.json, docs/research/rating-decisions.md]
blocked-by: []
---

# T-159 — Item↔move consolidation pass + stall-archetype breakpoint

## Context

Owner-reported teambuilding issues (analysis-first; validate before coding — see
[[feedback_research_analysis_first_validate]]). Two themes:

1. **Second validation pass (item↔move consolidation).** Item-conditional moves (Power-Herb
   charge moves, Belch↔berry, Weakness Policy↔offense) can survive on a mon whose final item
   does not satisfy their condition. Need a consolidation step that, after the item is locked,
   drops item-orphaned moves and re-picks.
2. **Stall archetype in concrete cases.** Mons whose offensive stats are too low *for their tier*
   should flip to a pure-stall moveset (Toxic/Leech Seed/trapping-chip/Salt Cure + heal engine +
   Protect + utility incl. fixed-damage Seismic Toss / Foul Play) instead of a token attack —
   *only* when it pays off, without flooding every team with stall.

Corpus backing: `docs/research/` (145 teams; 12 dedicated singles stall teams). Codified role
thresholds live in `docs/research/rating-decisions.md` (Batches 4-5).

## Findings (2026-07-18 exploration)

All line refs in `randomizer/`.

### Item side — `rating.js` `rateItemForAPokemon`
- **Weakness Policy** `rating.js:1797-1799`: `10 * genericDefensePower * rng`. **No offensive-move
  gate** — a pure support with no damaging move can still equip it. WP boosts Atk **and** SpAtk, so
  it needs ≥1 damaging move (physical or special). ← problem #1.
- **Power Herb** `rating.js:1604-1614`: correctly gated by `powerHerbMoves` (`rating.js:113-122`).
- **Belch↔berry**: reciprocal hints only; no forced link. Item chosen AFTER moveset.
- Item is chosen **after** the moveset (`resolveTrainerTeam.js:539-560`); a single consolidation
  step `adjustMoveset` re-runs only if an item was equipped (`:570-572`).

### Move side — `rating.js`
- **Belch** `rating.js:1435-1438`: capped to `min(rating, 0.05)` unless a Berry is *held*. Base
  value comes from `statusList` (`MOVE_BELCH: 6`, `:678`) — ignores its 120 power. Effectively
  already prevented on berryless mons; owner wants a hard 0 + consolidation drop. ← problem #2.
- **Hazard statusList values** (`rating.js:732-735`): `STEALTH_ROCK 8`, `STICKY_WEB 8`,
  `TOXIC_SPIKES 6.5`, `SPIKES 6`. Sticky Web currently **equals** Stealth Rock. ← problem #3.
- **Two-turn / charge moves**: base penalty in `rateMove` (`:924` ×0.5 two-turn, `:950` ×0.8
  Solar Beam, `:932` ×0.7 semi-invuln). Per-mon branch `rating.js:1414-1428`: no-enabler ×0.2,
  with-enabler ×2.0-3.0. Effective no-enabler ≈ **10-16% of full** (base × 0.2), owner wants
  ~40%. ← problem #4.
- **Meteor Beam vs Electro Shot vs Solar Beam** `rating.js:1415-1420`: **already differentiated
  correctly** — Solar Beam = sun OR herb (×2.4); Meteor Beam = herb only (×2.6); Electro Shot =
  rain (×3.0) OR herb (×2.6). Matches owner's model. Only the no-enabler floor magnitude and a
  herb-source inconsistency (Solar Beam ignores bag herb; others honor `ctx.powerHerb`) need work.
  ← problem #5 mostly already done.
- **Trapping moves** (Whirlpool/Sand Tomb/Infestation/Magma Storm/Salt Cure): `EFFECT_HIT` with
  `MOVE_EFFECT_WRAP`/`TRAP_BOTH`/`SALT_CURE` tags **never referenced** in `rating.js` → valued at
  raw (low) base power only; residual/trap utility invisible. ← problem #6a.
- **Fixed-damage moves** (Seismic Toss/Night Shade `EFFECT_LEVEL_DAMAGE`, etc.): `power: 1` →
  `rateMove` ≈ 0.07, then still scaled by `baseAttack/100` (`:1279-1284`) even though they ignore
  the user's Attack. Rated ≈ 0, never picked. ← problem #6b (the Blissey/Chansey case).

### Teambuilding — `modules/`
- Stages: SEED (`trainerSeeds.js`) → FILL (`archetypePicker.js`) → CRYSTALLIZE (`archetypeFit.js`)
  → REFINE (`archetypeRefine.js`), orchestrated in `resolveTrainerTeam.js:639`.
- **Team order / hazards** `trainerTeamOrder.js:59-106`: phase cascade weather(95%) → SR(90%) →
  **Sticky Web(90%, after SR)** → Spikes/T.Spikes(80%) → Illusion. Sticky Web already ranks
  between SR and Spikes in *ordering*; only the *move value* equals SR (problem #3).
- **Archetypes**: `full_stall` exists in `singles.json` (physicalWall+specialWall+unawareWall+
  cleric+hazardRemover). **Doubles has no stall base** (nearest: `dedicatedSupport`).
- Role detection is **stat/movepool-gated, not tier-gated** (`featureDetectors.js`). No
  "offense-too-low-for-tier → stall" flip exists. Natural hook: `computePowerAndRole`
  (`rating.js:2991`) and the offensiveness gate (`rating.js:1131-1161`); `poke.rating.tier` /
  `poke.tierDoubles` are already available at both sites.

### Corpus — `docs/research/`
- 12 stall teams, all singles (Gen 6-7 era). Chansey runs **Seismic Toss as its only damage move
  on 12/12 stall teams** — exactly the owner's Blissey case (fixed damage, not a token STAB).
- Codified breakpoint band (`rating-decisions.md`): **offense ≤ ~95 → support/wall/cleric**;
  **offense ≥ ~115 → offensive**; cleric = bulk ≥ 285 AND offense ≤ 95, always runs recovery.
- Hazard usage: SR 213 ≫ Spikes 82 ≫ T.Spikes 26 ≫ **Sticky Web 2** (data-vs-rating discrepancy).
- Partial-trap moves (Whirlpool/Infestation/Sand Tomb) and Salt Cure: **0 in corpus** — but the
  corpus is Gen 6-7 (pre-Salt Cure, pre-modern trap-stall). Real corpus stall traps *counters*
  with abilities (Magnet Pull/Arena Trap), not partial-trap chip moves.
- Stall is a **singles** phenomenon in the corpus; doubles defensive analogues are Balance /
  Perish-Trap / damage-suppression, not full stall. Documented stall counter: hyper-offense +
  Taunt + Mold-Breaker hazard setters.

## Plan

Design decisions validated with owner 2026-07-18 (see Progress log). Acceptance criteria:

- [x] **WP gate** — Weakness Policy scores 0 without ≥1 damaging move (physical or special).
- [x] **Belch** — value 0 (not 0.05) without a held berry; dropped in consolidation if final item ≠ berry.
- [x] **Sticky Web** — move value strictly between Stealth Rock (8) and Toxic Spikes (6.5) → 7.5.
- [x] **Charge 40% floor** — Solar Beam / Meteor Beam / Electro Shot / generic two-turn without
      their enabler land at ~40% of full value (uniform); Meteor≠Electro≠Solar distinction kept;
      herb-source made consistent (held item honored everywhere).
- [x] **Consolidation** — item-conditional moves re-evaluated against the **actual held item** (not
      bag availability); orphans dropped and replaced (confirmed live: 167 charge drops/run).
- [x] **Fixed damage** — Seismic Toss / Night Shade (`EFFECT_LEVEL_DAMAGE`) rated
      attack-independently; viable on low-offense stallers (corpus: Chansey 12/12).
- [x] **Trapping** — Whirlpool/Sand Tomb/Infestation/Salt Cure bumped for defensive/stall mons
      (they cover the stall function: chip + deny switch), not globally.
- [x] **Stall breakpoint (conservative)** — a mon whose offense is far below its tier AND that can
      complete a real stall kit is built as pure stall; otherwise not forced. Applies to singles and
      doubles. Stall is its OWN archetype, distinct from `dedicatedSupport`.
- [x] **One status per mon** (owner follow-up) — a set never runs two status-infliction moves
      (Toxic + Will-O-Wisp, …); universal rule.
- [x] `cd randomizer && npm test` green (1317); new tests for each behavior (TDD, red first).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-18** — Task created. Ran 4 parallel explorations (move rating, item assignment,
  teambuilding/ordering, corpus). Findings recorded above. Key surprises: (a) Meteor Beam /
  Electro Shot / Solar Beam are *already* correctly differentiated (problem #5 mostly done);
  (b) Sticky Web already ranks between SR and Spikes in team *ordering*, only its move *value*
  ties SR; (c) a consolidation step (`adjustMoveset`) already exists but keys off bag herb
  availability (`ctx.powerHerb`) rather than the actual held item, so herb-orphaned charge moves
  survive; (d) corpus confirms the Chansey/Seismic-Toss stall pattern and an offense ≤95 / ≥115
  breakpoint band, but partial-trap moves are absent (Gen 6-7 era artifact). Presented analysis to
  owner for validation of design decisions before coding.
- **2026-07-18** — Owner validated design (AskUserQuestion): charge floor = **40% of full**;
  stall implemented in **both singles and doubles** as its **own** archetype (NOT dedicatedSupport),
  with doubles utility allowed to be a support move; breakpoint **conservative** (only far-below-tier
  offense AND a satisfiable stall kit); trapping bump is **role-specific to stall**, not global.
  Owner note on charge moves: current ~10-16% floor "no se refleja en la experiencia" — Dig-type
  moves still appear, confirming the bag-herb consolidation leak is the real culprit. Starting TDD
  implementation.

- **2026-07-18** — Implemented increments 1-6 (TDD, red→green, full suite green at 1301 tests):
  1. **WP gate** — `rateItemForAPokemon` returns 0 for Weakness Policy without a move that benefits
     from a +Atk/+SpAtk boost (new `benefitsFromOffenseBoost` + `OFFENSE_INDEPENDENT_EFFECTS`).
     Tests in `rateItemForAPokemon.test.js`.
  2. **Belch** — berryless Belch now a hard 0 (was 0.05). Existing T-013 test tightened to `toBe(0)`.
  3. **Sticky Web** — `statusList` value 8 → 7.5 (SR 8 > Web 7.5 > T.Spikes 6.5 > Spikes 6). New
     ordering test in `rateMove.test.js`.
  4. **Fixed damage** — new `FIXED_DAMAGE_EFFECTS`; `rateMove` gives EFFECT_LEVEL_DAMAGE a flat 4.5
     (Super Fang 3.5, Endeavor 3, rest 1.5); `rateMoveForAPokemon` skips offense-scaling AND STAB for
     them (new `isFixedDamage`). Seismic Toss/Night Shade now viable & attack-independent on stallers.
  5. **Charge 40% floor** — no-enabler factors retuned so base×factor ≈ 0.40 (Solar 0.5, two-turn 0.8,
     semi-invuln 0.57, split into two branches); all charge moves now honour a bag herb (`herbReady`)
     uniformly. Tests compare each charge move to its 1-turn twin (empty currentMoves isolates the factor).
  6. **Consolidation** — `adjustMoveset` now re-rates under an honest ctx (`powerHerb = item==='Power
     Herb'`, ignoring the bag) and force-drops item-orphaned charge moves (detected by re-rating with
     all enablers forced and comparing) for any strictly-better learnable move. New
     `adjustMovesetConsolidation.test.js`. This is the fix for "no se refleja en la experiencia".
  Remaining: increment 7 (stall archetype + trapping bump, singles + doubles).
- **2026-07-18** — Implemented increment 7 (stall archetype + trapping bump). New `rating.js` helpers
  `isPureStaller` / `isStallTool` / `isTrappingMove` (+ constants `STALL_MAX_OFFENSE_POWER 6.0`,
  `STALL_MIN_DEF_GAP 2.0`, `STALL_MIN_TOOLS 3`, `STALL_TOOL_BOOST 1.5`, `STALL_EXTRA_ATTACK_CUT 0.4`).
  Breakpoint: role TANK/BULKY + offensePower ≤ 6.0 + defence gap ≥ 2.0 + reliable recovery + ≥3 stall
  tools available (else NOT forced). `chooseMoveset`/`adjustMoveset` resolve `ctx.stallMode` once and
  thread it; `resolveTrainerTeam` gets `ctx.doubles`. In `rateMoveForAPokemon`: (A) trapping bump scaled
  by defensiveness + residual presence; (B) under stallMode — status gate relaxed ONLY for stall tools
  (non-stall status like Light Screen still gated), stall-tool ×1.5, second attack ×0.4, and dedup of
  protect-variants/phazing. New `stallArchetype.test.js` (13 tests). Full suite green (1313).
  Real-data validation (analyze.js --no-balance): breakpoint flags Blissey/Chansey/Toxapex/Pyukumuku/
  Alomomola/Cresselia and NOT Garchomp/Dragapult/Ferrothorn/Skarmory/Corviknight/Quagsire (utility
  walls that still attack). Sample stall sets: Toxapex = Recover/Baneful Bunker/Toxic/Will-O-Wisp;
  Alomomola = Wish/Waterfall/Protect/Aqua Ring; Cresselia = Moonlight/Psychic/Spikes/Protect. Known
  edge: Blissey has a thin stall movepool here (no Toxic/Wish/Heal Bell) so it lands as a bulky special
  wall with two attacks — acceptable given the data; the five constants above are the tuning knobs if the
  breakpoint needs to be looser/stricter. Consolidation confirmed live: 167 charge-move drops in one run
  (e.g. Hoopa-U Solar Beam→Knock Off, Salamence Fly→Dual Wingbeat).
- **2026-07-18** — CHANGELOG.brooktec.md updated ([Unreleased] Fixed + Changed). check-tracker OK.
  Awaiting owner manual test of the batch before closing (per [[feedback_batch_tasks_test_together]]).
- **2026-07-18** — Owner feedback: Toxapex came back Toxic + Will-O-Wisp — two non-volatile status moves
  is absurd (a target holds only one status). Added a UNIVERSAL rule (not stall-only) in
  `rateMoveForAPokemon`: a status-infliction move (`STATUS_INFLICTION_EFFECTS` = EFFECT_NON_VOLATILE_STATUS
  / DARK_VOID / YAWN / TOXIC_THREAD) returns 0 if the set already has one. New tests in
  rateMoveForAPokemon.test.js (4). Toxapex now = Recover/Baneful Bunker/Toxic/Toxic Spikes. Full suite
  green (1317). Bundle rebuilt. Note: Toxic + Toxic Spikes is still allowed (hazard vs direct status) —
  flag if the owner wants hazard-poison deduped against Toxic too.

## Outcome

Shipped all seven requested behaviours plus one owner follow-up, in `randomizer/rating.js` (with the
consolidation living in `adjustMoveset` and the stall/`ctx.doubles` threading in
`modules/resolveTrainerTeam.js`):

1. Weakness Policy gated on an offense-boosted move. 2. Belch → 0 without a berry. 3. Sticky Web move
value 7.5 (between SR and Toxic Spikes; team ordering already correct). 4. Charge moves without their
enabler → ~40% of full, uniform, with a consistent held-or-bag herb signal. 5. Meteor Beam ≠ Electro
Shot ≠ Solar Beam confirmed already-correct; only the floor + herb-source needed work. 6. Fixed-damage
moves (Seismic Toss / Night Shade) rated attack-independently; partial-trap moves bumped for defensive
mons; conservative pure-stall breakpoint (role TANK/BULKY + low offence + defence gap + satisfiable kit)
in singles and doubles, distinct from `dedicatedSupport`. Plus the item↔move consolidation pass that
drops item-orphaned charge/Belch moves against the FINAL held item.

Owner follow-up during review: enforced "one status-infliction move per set" (universal), fixing
Toxapex coming back with Toxic + Will-O-Wisp.

Verification: full Jest suite green (1317 passed); `analyze.js --no-balance` runs clean; breakpoint
flags the archetypal walls (Blissey/Chansey/Toxapex/Pyukumuku/Alomomola/Cresselia) and not attackers or
utility-bulky mons; consolidation confirmed live (167 charge-move drops in one run). Merged into master.

Follow-ups / tuning knobs (not blocking): the five `STALL_*` constants adjust breakpoint strictness;
Blissey lands as a bulky special wall (thin stall movepool here, no Toxic); Toxic + Toxic Spikes is
still allowed (hazard vs direct status) — revisit if the owner wants that deduped too.
</content>
</invoke>
