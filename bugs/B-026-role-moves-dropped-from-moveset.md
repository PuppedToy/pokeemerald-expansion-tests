---
id: B-026
title: Decision log reports POTENTIAL roles, not DELIVERED — made role delivery look broken
status: fixed
severity: low
created: 2026-07-11
updated: 2026-07-11
found-in: Unreleased
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/teamAudit.test.js
links: [T-107, T-117, T-118, T-122, T-123]
---

# B-026 — Decision log reports potential (can-do) roles, not delivered roles

## History / correction

This bug was **originally filed as "assigned role moves are dropped from the final moveset"** based on
a measurement that compared the audit's per-slot `roleMove` (team **build order**) against the docs
`trainersResultsSimplified` moveset (team **shuffle order**, applied by `buildTrainersResultsSimplified`).
The order mismatch crossed one mon's role with another mon's moves → a false "35/36 dropped".

**Direct resolver instrumentation disproved it:** of 214 planned role moves, 210 were pushed (4 blocked
by the `canLearnMove` level gate) and **209 survived** into the final moveset. Role-move DELIVERY works
(`chooseMoveset` seeds fixed moves first + skips status moves in dedup; `adjustMoveset` protects
`importantMoves`). So this is **not** a delivery bug.

## The real (minor) defect

`teamAudit.recordSlot` computes `rolesFilled` from `detectFeatures(chosenMon)` — the mon's **species
potential** (what it *could* do), not what its final moveset/ability actually **delivers**. So a mon
shows "fills hazardSetter" whenever it *can* learn a hazard, even when it runs none. Measured: 82 slots
tagged (potential) hazard setter at high sophistication, but only 36 actually receive a hazard move
(the rest are redundant potential setters — 26 teams carry ≥2). This made the decision log read as
"roles are cosmetic / hazard setters get no hazards" when delivery is in fact fine.

## Fix

Make `rolesFilled` (and the audit generally) report **delivered** roles — detect on the resolved
member (actual moveset + ability), so the log is trustworthy. Low severity (observability only; no
effect on generated teams). The genuine *team* problem it exposed — teams carrying 2+ redundant hazard
setters when the recipe wants one — is handled by **T-123** (role-max dedup / re-role the excess).
Regression test: a mon tagged with a role in the audit actually delivers it (runs the role move / has
the role ability).
