---
id: T-138
title: Trick Room full-room enforcement (2 setters + 4 abusers)
status: done
type: feature
created: 2026-07-14
updated: 2026-07-14
target-version: 0.8.0
links: [T-137, T-139, docs/research/trick-room.md]
blocked-by: []
---

# T-138 — Trick Room full-room + weather+room

## Context

T-137 shipped Trick Room as a gimmick but left two refinements (owner wants them now):
1. **`roomStyle:'full'` enforcement.** Tate & Liza are seeded `roomStyle:'full'` but the flag isn't acted on
   — they build the minimal room (1 setter + 2 abusers). The owner's spec: FULL room = **2 setters
   (redundancy, the 6v6 signature) + 4 slow abusers**.
2. **weather + room coexistence (half).** The corpus has 6v6 teams running weather AND a Trick Room mode on
   the same team (Bulu/Sun TR, Charizard-Y Sun) — a minor but real pattern. A weather team with a slow core
   should be able to splash a half-room TR layer.

## Plan

1. Thread `roomStyle` through: `trickRoomHolds(team, ctx, roomStyle)` requires 2 setters + 4 abusers for
   `full` (else setter + 2 abusers); the picker's abuser budget = 4 for full; `ensureTrickRoomSetter` injects
   up to 2 setter moves for full (redundancy). Full = "full or rollback" (seed variance accepted).
2. weather+room (half): a committed/emergent WEATHER team that also has ≥2 slow abusers + a TR-move learner
   gets a half-room TR layer (inject 1 TR setter) — the shared slow wallbreakers benefit from both.

Acceptance criteria:
- [x] Tate & Liza build a full room (2 TR setters + 4 slow abusers) when the pool supports it; roll back
      cleanly otherwise.
- [~] A weather team with a slow core can additionally run a half-room TR layer — DEFERRED to T-139 (owner:
      "skip de momento").
- [x] Deterministic; `cd randomizer && npm test` + determinism/continuity gates green.

## Progress log

- **2026-07-14** — Task created from the T-137 deferred refinements (owner: take them now).
- **2026-07-14 — `roomStyle:'full'` DONE + verified.** `trickRoomHolds(team, ctx)` requires 2 setters + 4
  abusers when `ctx.roomStyle==='full'`; the picker's abuser budget = 4 for a full room;
  `ensureTrickRoomSetter(team, count)` injects up to `count` setter moves (2 for full); resolver threads
  `roomStyle` into the attempt/emergent `gimmickHolds` + `ensureSetter` count; teamAudit threads it into
  `gimmickMaterialised`. Verified (seed sweep): Tate & Liza build a genuine full room (2 setters + 4 slow
  abusers) in seeds 100 (Solrock/Reuniclus/Exeggutor/Iron-Leaves/Celebi/Slowbro) + 777, roll back cleanly in
  1/42 (fast rolled pools) — "full room or nothing", as specified. `npm test` 1070; determinism + continuity
  gates 17/17. +1 unit test (full-room hold).
- **2026-07-14 — weather+room needs a FREQUENCY decision before coding.** The clean gate is "a weather team
  whose abusers are SLOW (≥2 slow-strong) + a TR learner → splash a half-room TR". That's naturally rare for
  fast speed-abuser weather (Swift Swim/Chlorophyll are FAST → no slow core), BUT it WOULD fire for slow-core
  weather villains — e.g. Maxie's sun with Torkoal + Camerupt (both slow) would get a Trick Room move. That's
  corpus-legit (Bulu/Sun TR) but might surprise. Pending owner input on how broadly it should apply before
  coding (deferred rather than shipped over-eager).
- **2026-07-14 — owner: "skip weather+room de momento".** Spun off to **T-139** (proposed) with the frequency
  question. T-138's scope is now just the full-room enforcement, which is done + verified. Ready for the
  owner's batch manual-test + close.

## Outcome

Shipped `roomStyle:'full'` enforcement: a full room needs 2 Trick Room setters (6v6 redundancy) + 4 slow
abusers. `trickRoomHolds` gates on `ctx.roomStyle`; the picker's abuser budget = 4 for full;
`ensureTrickRoomSetter(team, count)` retrofits up to 2 setter moves; the resolver threads `roomStyle` into the
attempt/emergent hold checks + the setter count; teamAudit threads it into the materialised verdict. "Full
room or nothing" — rolls back to a normal team when the (randomized) pool can't support it.

Verified (seed sweep) + owner-accepted 2026-07-14: Tate & Liza build a genuine full room in seeds 100
(Solrock/Reuniclus/Exeggutor/Iron-Leaves/Celebi/Slowbro) + 777, roll back cleanly in 1/42 (fast rolled
pools). `npm test` 1070; determinism + continuity gates 17/17.

weather + room (half) coexistence spun off to **T-139** (owner deferred — a corpus-minor pattern needing a
frequency decision so it doesn't over-apply to slow-core weather villains).
