---
id: B-036
title: Trick Room / Electric Terrain gimmick setter moves are injected without the TM (B-030 violation)
status: fixed
severity: major
created: 2026-07-16
updated: 2026-07-16
found-in: 0.8.0
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/gimmickSetterTmGate.test.js
links: [B-034, B-030, T-124]
---

# B-036 — gimmick setter moves bypass the TM bag

## Symptom

Owner (bundle run-2041273390 (1)): **Brice (lvl 32) has a Munchlax with Trick Room**, but the Trick Room
TM isn't obtainable until Nolan (lvl 36) and Munchlax doesn't learn TR by level-up — so no trainer before
Flannery-era should be able to teach it. "Has vuelto a hardcodear movimientos sin revisar si hay una TM."
Same class of bug as B-030.

## Root cause

The gimmick MOVE-setter retrofits `ensureTrickRoomSetter` and `ensureElectricTerrainSetter` (gimmickPlan.js)
inject the setter move (`MOVE_TRICK_ROOM` / `MOVE_ELECTRIC_TERRAIN`, both TMs) using `monCanLearn`, which
checks learnset + teachables but is **NOT gated on the trainer's TM bag** — and the call site
(`GIMMICK_SPEC[seedGid].ensureSetter(team, setterCount)`, resolveTrainerTeam.js) passes no `tms`/`level`. So
the retrofit teaches a teachable TM the trainer doesn't hold. This was latent while TR never built; **B-034
revived TR and exposed it** (the analogous WEATHER retrofit `ensureMoveSetter` WAS gated in T-125 inc.2, but
these two `GIMMICK_SPEC` retrofits were missed).

Items are NOT affected — Room Service + Terrain Extender are already claimed only from the bag
(`trainer.bag.includes(...)` + `consumeLinkedUnit`, T-125 inc.4/inc.6).

## Fix

New `setterMoveReachable(mon, move, {tms, level})` helper (gimmickPlan.js) — a setter move is usable only if
reachable by level-up OR the trainer HOLDS its TM. Both retrofits now take a gate:
`ensureTrickRoomSetter(team, count, gate)` and `ensureElectricTerrainSetter(team, count, gate)` use it instead
of the ungated `monCanLearn`; the resolver threads `{ tms: trainer.tms, level: trainer.level }` at the
`GIMMICK_SPEC.ensureSetter` call site. No hardcoded provisioning: TR/ET are goodStatus TMs the TM randomizer
already places in the world/bag around Nolan, so gating makes trainer availability match the player's.

Verified e2e on the owner's seed 2041273390: **Brice (lvl 32) no longer has Trick Room**; **0 TR trainers
below lvl 36** (min TR trainer level 49); **Tate & Liza still build TR** (they hold the TM at their level).
Regression test `randomizer/__tests__/unit/gimmickSetterTmGate.test.js` (no TM ⇒ no injection; holds TM ⇒
injects; level-up learner needs no TM). Fast suite 1171.
