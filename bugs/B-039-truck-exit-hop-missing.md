---
id: B-039
title: Player no longer does the little hop when getting out of the truck
status: fixed
severity: minor
created: 2026-07-18
updated: 2026-07-18
found-in: 0.9.0
fixed-in: 0.9.0
regression-test: randomizer/__tests__/unit/truckExitHop.test.js
links: []
---

# B-039 — Player no longer does the little hop when getting out of the truck

## Symptom

At the start of a new game the player used to do a little hop as they step out of the moving truck
into Littleroot Town. That hop no longer plays — the player just appears in town.

## Root cause

Commit `0d4f9f3a13` ("Skip initial steps and go directly to save birch") changed the truck-exit
(`InsideOfTruck_EventScript_SetIntroFlagsMale/Female`) to set `VAR_LITTLEROOT_INTRO_STATE = 7`
(the "intro complete / told to go meet rival" state) so the player skips going home and can head
straight to Route 101 to save Birch. But Littleroot Town's `OnFrame` only handles states **1** and
**2** (`StepOffTruck…`, which is what runs the `jump_right` hop). State 7 matches nothing, so the hop
(and the vanilla go-home cutscene) were both skipped. Only the hop needs restoring; the
skip-going-home behaviour must stay. State **7** must remain the final value because
`players_house.inc` gates the "Did you meet Prof Birch?" mom line on `INTRO_STATE == 7`.

## Fix

The truck exit sets a transient `VAR_LITTLEROOT_INTRO_STATE = 8` (a new "just stepped off the truck"
state). Littleroot Town's `OnFrame` handles state 8 with a hop-only script
(`LittlerootTown_EventScript_StepOffTruckToBirch`) that plays the `SE_LEDGE` sound + the existing
`LittlerootTown_Movement_PlayerStepOffTruck` (`jump_right`) at the unchanged vanilla warp tile
(3,10 / 12,10), then sets the state to **7**. So the hop fires exactly once, nothing else changes,
and the go-straight-to-Birch flow (final state 7) is preserved.

Regression test (structural, since the intro can't be built/run locally): the `INTRO_STATE` value the
truck exit sets must be handled by a Littleroot Town `OnFrame` script that applies
`LittlerootTown_Movement_PlayerStepOffTruck`. Fails before the fix (state 7 unhandled), passes after.
