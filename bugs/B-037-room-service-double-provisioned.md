---
id: B-037
title: Room Service double-provisioned — a Trick Room team could field two
status: fixed
severity: minor
created: 2026-07-16
updated: 2026-07-16
found-in: 0.8.0
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/gimmickItemBag.test.js
links: [T-125, B-034]
---

# B-037 — Room Service double-provisioned

## Symptom

Owner (bundle run-2041273390 (1)): Tate & Liza field **two** Room Service. "2 room service no se puede si
solo hay 1 en la bolsa" — there's only one Room Service in the world, so a team should never hold two.

## Root cause

Room Service is in `averageItemPool` (a single world item, T-125 items.md) — it already reaches trainer bags
via its pick location. T-125 inc.6 ALSO added an explicit `'Room Service'` to `tateAndLizaBag`, so a TR
trainer's bag could hold **two** copies (the pool one + the hardcoded one) → two `baseSpeed>60` mons each
claimed one. (Also a band-aid: it papered over fast mons on a TR team instead of building the team slow.)

## Fix

Removed the hardcoded `'Room Service'` from `tateAndLizaBag` (the pool is the single source), and added a
**≤1-per-team guard** to the TR speed-item claim (`resolveTrainerTeam.js`): it now skips if a teammate
already holds Room Service / Iron Ball, so a team never fields two speed-control items regardless of bag
composition. Regression test in `gimmickItemBag.test.js` (Tate & Liza's bag has no hardcoded Room Service).
Fast suite green.
