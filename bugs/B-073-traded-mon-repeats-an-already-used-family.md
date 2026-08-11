---
id: B-073
title: A town trade offers a species whose family is already used elsewhere in the run
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.9.0         # version where the bug was observed
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/trades.test.js   # describe: "B-073 — a trade never hands over a family the run already used"
links: [T-269]
---

# B-073 — A town trade offers a species whose family is already used elsewhere in the run

## Symptom

Bundle `bundle-2231547897.json` (session ROM 0) offers **Sandaconda** at the Dewford trade while
the same family is already an **extra starter** (the starter list holds its pre-evolution
Silicobra). The player can end the run holding two members of one family from two different
sources, which the run's design forbids everywhere else: starters, extra starters, gym rewards,
statics and wild encounters all draw from a single without-replacement pool of families
(`wild.alreadyChosenFamilies`, built in `randomizer/modules/wildModule.js`).

Reproduce: read `roms[0].artifacts.trades[0].offeredSpecies` and
`roms[0].artifacts.wild.extraStarters` of that bundle — Sandaconda's family appears in both.

## Root cause

The run has ONE without-replacement pool of families — `wild.alreadyChosenFamilies`, built in
`randomizer/modules/wildModule.js` as starters, extra starters, gym rewards, statics and wild
encounters claim theirs. The trades were never part of it: `randomizer/trades.js`'s `offeredCandidates`
picked from the WHOLE pokédex filtered only by tier, never read that set, and never added its own picks
to it. So a trade could collide with anything the rest of the run had already claimed (the Sandaconda
case) and two trades could collide with each other.

Not a slip in one expression — the trades simply were not wired into the pool at all, which is why the
fix is a wiring change rather than a condition.

## Fix

Fixed with the trader rework, [T-269](../tasks/T-269-trader-rework-pipeline.md) (commit
`0d8ea074d6`): `selectTrades` seeds `usedFamilies` from `wild.alreadyChosenFamilies` and adds every
family it takes — the offered one AND the one the player hands over — so the traders draw from the same
pool as everything else. A trade also never gives back a member of the family it is asking for. When a
tier has no unused family left it repeats one rather than dropping the trade, and says so
(`TRADE_OFFER_POOL_EMPTY`).

Regression test: `randomizer/__tests__/unit/trades.test.js`, describe **"B-073 — a trade never hands
over a family the run already used"** (4 cases). Verified by restoring the pre-fix behaviour (an empty
`usedFamilies`): all 4 FAIL; with the fix in place all 4 PASS, alongside the whole suite (2445).
