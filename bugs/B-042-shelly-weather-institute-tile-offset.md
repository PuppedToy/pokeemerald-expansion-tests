---
id: B-042
title: Player ends 1 tile too low after beating Shelly at the Weather Institute
status: open            # open | fixing | fixed | wont-fix
severity: minor
created: 2026-07-19
updated: 2026-07-19
found-in: 0.5.0
fixed-in:
regression-test:        # n/a — overworld map-script movement; no local GBA toolchain / no automated harness (see note)
links: [T-164]
---

# B-042 — Player ends 1 tile too low after beating Shelly at the Weather Institute

## Symptom

At the Weather Institute (Route 119, 2F), after defeating Team Aqua's Shelly, she leaves
and the player then talks to the scientist (Castform gift scene). The player is left standing
one tile **below** their real position, so the conversation with the scientist looks misaligned.

Reproduce: beat Shelly at the Weather Institute → observe the player slide down one tile before
the scientist walks over.

## Root cause

Vanilla had a post-battle cutscene where an Aqua grunt ran in and shoved the player UP one tile
(`ride_water_current_up`), and a later movement slid the player back DOWN one tile (`slide_down`)
to restore the original position — net zero. In this repo the grunt-shove cutscene was removed,
but the compensating `slide_down` was left in `Route119_WeatherInstitute_2F_Movement_PlayerReturnToPosition`.
With nothing to cancel it, the player now slides one tile too low.

Evidence: the shove movements (`..._Movement_GruntApproachShelly`, `..._Movement_ShovePlayerOutOfWay`
with the `ride_water_current_up`) and their texts are defined but referenced nowhere.

## Fix

Remove the orphaned `slide_down` from `Route119_WeatherInstitute_2F_Movement_PlayerReturnToPosition`
(leave only the facing step). See T-164.

Regression test: not applicable — this is an overworld map-script/movement defect. This repo has no
local GBA toolchain (build runs in CI / on the builder) and no automated harness for overworld scripts,
so the iron rule's regression test cannot be authored here. Verified manually in the ROM instead;
`fixed` status is pending the owner's manual confirmation.
