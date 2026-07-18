---
id: B-038
title: Duplicate level-cap fanfare after the Wally Lilycove battle
status: fixed
severity: minor
created: 2026-07-18
updated: 2026-07-18
found-in: 0.9.0
fixed-in: 0.9.0
regression-test: randomizer/__tests__/unit/levelCapMessagesSSOT.test.js
links: [T-151]
---

# B-038 — Duplicate level-cap fanfare after the Wally Lilycove battle

## Symptom

Beating Wally at Lilycove (`LilycoveCity_EventScript_Rival`) fires the level-cap fanfare **twice**:
once immediately after the battle with **no message** (a redundant "level-up" to the cap the party is
already at), then again — correctly — a moment later with the "Your Pokémon have leveled up to N!"
message. The other path that resolves the same milestone (`LilycoveCity_EventScript_RivalFlyAway`)
plays the fanfare only once (the correct, message-bearing one). So the battle path plays a spurious,
message-less fanfare jingle.

## Root cause

A stray `call Common_EventScript_PlayLevelCapFanfare` at `data/maps/LilycoveCity/scripts.inc:226`,
sitting between the `trainerbattle_no_intro TRAINER_WALLY_LILYCOVE` and the milestone's
`setflag FLAG_MET_RIVAL_LILYCOVE`. At that point `FLAG_MET_RIVAL_LILYCOVE` is not yet set, so
`GetCurrentLevelCap()` still returns the pre-Wally cap — the party is already there, making it a no-op
that only plays the fanfare. The equivalent `RivalFlyAway` path has no such call. It is the **only**
`PlayLevelCapFanfare` in the game not immediately preceded by a `waitmessage` (i.e. not paired with a
level-cap message).

## Fix

Remove the stray `call Common_EventScript_PlayLevelCapFanfare` (line 226) so the battle path matches
`RivalFlyAway`: battle → rewards → `setflag` → `BufferLevelCap` → message → fanfare (once).

Regression test asserts the invariant that **every** `call Common_EventScript_PlayLevelCapFanfare` is
immediately preceded by `waitmessage` — it fails on the stray call and passes once it is removed.
