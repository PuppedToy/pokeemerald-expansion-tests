---
id: B-035
title: Emergent Trick Room over-fires — too many trainers build TR just because a mon can learn the TM
status: fixed
severity: major
created: 2026-07-16
updated: 2026-07-16
found-in: 0.8.0
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/emergentGimmick.test.js
links: [B-034, T-124]
---

# B-035 — Emergent Trick Room over-fires

## Symptom

After B-034 revived Trick Room, **too many non-seeded trainers build TR** (owner, run-2041273390): "being
able to learn it doesn't mean building a team around it… half the world has Trick Room if the TM exists."
~34–45 teams/seed field a TR move — most emergent (only Tate & Liza is TR-seeded).

## Root cause

`emergentGimmick` (gimmickPlan.js) fires emergent TR when `slowCore >= 2` (two mons whose
`trickRoomAbuseScore ≥ 2`, i.e. base Speed ≤ `TR_ABUSE_SPEED_MAX`) **AND any member can learn the TR move**.
Two problems: (1) `trickRoomAbuseScore` counts ANY slow mon — a slow WALL, not a slow ATTACKER — so the
"core" isn't a real TR core; (2) "a member can learn TR" is nearly always true (296 species teach the TR TM),
so the setter test is meaningless. B-034 raising `TR_ABUSE_SPEED_MAX` 55→60 widened the slow pool and made
it worse. Net: "can-learn ⇒ build TR."

## Fix

`emergentGimmick` (gimmickPlan.js) now requires a genuine slow-OFFENSIVE core: **≥3 members that are slow
(`baseSpeed ≤ TR_ABUSE_SPEED_MAX`) AND hard-hitting (`max(atk,spa) ≥ TR_STRONG_OFFENSE = 100`)** —
`TR_EMERGENT_MIN_CORE = 3` — instead of "≥2 slow bodies + a member can learn the TM". Being able to set TR
stays necessary but is no longer sufficient. The seeded path (Tate & Liza → `gimmickFallbackChain` +
`trickRoomHolds`) is untouched, so it still builds.

Result (e2e, 4 seeds): emergent TR dropped from **34–45 → 7–16 teams/seed** (a niche level), while
**Tate & Liza still field Trick Room in 4/4** seeds. Regression test `emergentGimmick.test.js` (a 2-slow-weak
+ can-learn team must NOT trigger; a genuine slow-strong core still does). Fast suite 1166.

Further levers if the owner wants it even rarer: raise `TR_EMERGENT_MIN_CORE` to 4, and/or add a deterministic
per-trainer % gate (the "% al uso random" the owner floated).
