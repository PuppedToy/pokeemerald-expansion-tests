---
id: B-066
title: The 4 terrain moves are unvetted TM-pool members and can fill one pick entirely
status: fixing          # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-08-10
updated: 2026-08-10
found-in: 0.5.0         # version where the bug was observed
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/tmPoolHygiene.test.js
links: [T-263]
---

# B-066 — The 4 terrain moves are unvetted TM-pool members and can fill one pick entirely

## Symptom

Run `735016030` (app 0.5.0, owner's `run-presentation` bundle): the Route 121 TM pick
(`FLAG_ITEM_ROUTE_121_PICK_TM` → `PICK_TM_ROUTE121` = TM82/83/84) offers **Psychic Terrain, Grassy
Terrain and Electric Terrain** — all three slots of a "choose 1 of 3" are the same functional card,
and all three are rated `2` by the rater. Tammy's mirrored reward confirms it. The fourth terrain
(Misty) landed on TM89, in Nolan's pick on Route 114, so at most 2 of the 4 terrains are obtainable
in the whole run.

Owner's position (2026-08-10): terrain-setting TMs were never specified for this game.
`randomizer/docs/tms.md` documents slot → tier → location and never pool membership, so nothing ever
reviewed what is inside `goodStatusMoves`.

## Root cause

Two separate facts:

1. **Provenance.** The 4 terrain moves have been in `goodStatusMoves` (`randomizer/tms.js`) since
   `c3cc77f7f9` ("Add TM pool classification file (puppedjs/tms.js)") — the inherited pre-Brooktec
   classification. The only later edit to that pool was T-152 (`77efc6593c`), which added Hone Claws
   and the doubles-only moves; the pre-existing members were never re-examined.
2. **No family constraint.** `buildTMList` (`randomizer/tmRandomizer.js`) shuffles each tier and
   slices; nothing prevents same-role moves from landing in the same pick. Measured over 400k
   simulated runs of the goodStatus tier (13 slots, groups 79-81 / 82-84 / 85-87 / 88-90):

   | run format | terrains per run | all 4 appear | a pick gets all 3 | a pick gets ≥2 |
   |---|---|---|---|---|
   | mixed/doubles (22 candidates) | 2.36 | 9.8 % | 1.0 % | **28.4 %** |
   | singles (18 candidates) | 2.89 | 23.4 % | 1.9 % | **41.3 %** |

   So the observed all-three pick is a ~1 % event, but a pick holding ≥2 terrains happens in more
   than a quarter of runs — the soft version of this defect is structural, not bad luck.

Note for whoever fixes it: removing the 4 terrains from `goodStatusMoves` leaves 14 candidates for
13 slots (TM78-90), which makes the tier nearly identical every singles run — the removal needs a
backfill. And because teachables are hard-filtered by the run's TM pool
(`randomizer/teachableExpander.js` → `originalTeachables.filter(m => tmPool.has(m))`), dropping the
terrain TMs also removes terrain from every teachable list: the Route 110 seed pick loses its
enabler and Wattson's `electric_terrain` gimmick falls back to Surge abilities / level-up learnsets
only (it degrades, it does not break — the B-036/B-030 reachability gate already covers it).

## Fix

T-263, by reclassification rather than by a spread constraint. Grassy/Psychic/Misty Terrain moved to
`averageStatusMoves` and **only Electric Terrain** stayed in `goodStatusMoves`, so the reported pick
can no longer hold two terrains at all. Six moves were promoted to keep the good tier at 21
candidates for its 13 slots (deleting the terrains outright would have left 14 — the same TMs every
singles run).

Measured over 400k simulated runs per tier, with the real pool sizes and the real pick groups:

| | before | after |
|---|---|---|
| a good-tier pick holds ≥2 terrains | 28.4 % | impossible (one terrain left in the tier) |
| an average-tier pick holds ≥2 terrains | — | 3.4 % |
| a pick holds all three | 1.0 % | 0.03 % |

**Not fully eliminated, on purpose:** two of the three average-tier terrains can still share a pick
3.4 % of the time. No per-pick family-spread constraint was implemented — that would need the TM pick
groups (which live in `src/randomizer_picks.c`) mirrored in JS. If the owner wants 0 %, that option is
still on the table.

Regression test `randomizer/__tests__/unit/tmPoolHygiene.test.js` pins the classification (and the
rest of the pool invariants) against the real `src/data/moves_info.h`. Verified red before the fix on
the terrain-tier assertions, green after. Status stays `fixing` until the owner confirms the manual
test.
