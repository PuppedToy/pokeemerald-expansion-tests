---
id: B-033
title: Wally Victory Road lost its legend + ubers aces (backwards-generation regression)
status: open
severity: major
created: 2026-07-16
updated: 2026-07-16
found-in: 0.8.0
fixed-in:
regression-test: randomizer/__tests__/unit/wallyContinuity.test.js
links: [T-106, T-124]
---

# B-033 — Wally Victory Road lost its legend + ubers aces

## Symptom

Wally's endgame team at Victory Road (`TRAINER_WALLY_VR_1`) no longer fields a legendary or an
ubers ace. Expected (owner, "versiones previas"):

- **Victory Road** = 4 ID Pokémon born here (WALLY_1-4, the continuity anchors) **+ 1 ubers + 1 legend**.
- **Lilycove** = the 4 VR IDs + **2 new UU IDs** (WALLY_5-6, born at Lilycove).
- **Mauville** = the 4 VR IDs + the 2 Lilycove IDs.

Actual: VR fields WALLY_1 (favourite Mega Gardevoir) + WALLY_2-4 (OU) + **WALLY_5-6 (UU)** + a boss mega —
six propagating IDs and NO legend/ubers ace. Lilycove and Mauville both just echo WALLY_1-6.

## Root cause

The T-106 "Wally inversion" commit (`2532425921`, *T-106/T-128 — Wally inversion (Victory Road
authoritative)*) made Victory Road the authoritative endgame roster. Pre-inversion, VR was
`getBossPreset('JUAN', true)[0]` + `[1]` + WALLY_1-4 repeats — and the JUAN boss preset's first two slots
are exactly `{ absoluteTier: [TIER_LEGEND] }` and `{ absoluteTier: [TIER_UBERS] }`. The inversion replaced
those two aces with WALLY_5-6 (UU) IDs and moved the UU IDs' birthplace from Lilycove to VR, so the legend
and ubers were dropped. (The later T-128 favourite migration + a `bossMega` addition kept the aces gone.)

## Fix

Restore VR as 4 IDs (WALLY_1 favourite mega + WALLY_2-4 OU) **+ an UBERS ace + a LEGEND ace** (`absoluteTier`
slots, VR-only, no id so they don't propagate); move WALLY_5-6 (UU) to be **defined at Lilycove** and echoed
at Mauville. This needs a second continuity group (`TRAINER_WALLY_LILYCOVE` auth over `TRAINER_WALLY_MAUVILLE`)
so the build order becomes VR → Lilycove → Mauville (Lilycove must store WALLY_5-6 before Mauville echoes
them). The regression test reproduces the symptom: VR must field a legend + ubers slot and exactly 4 WALLY
IDs — verified to FAIL before the fix and PASS after.
