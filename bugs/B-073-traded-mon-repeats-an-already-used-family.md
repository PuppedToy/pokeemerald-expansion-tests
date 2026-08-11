---
id: B-073
title: A town trade offers a species whose family is already used elsewhere in the run
status: open            # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.9.0         # version where the bug was observed
fixed-in:               # version that ships the fix (set when fixed)
regression-test:        # REQUIRED to mark as fixed: path/to/test (named or annotated with this id)
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

<!-- Filled during the fix. The real cause, not the patch. -->

`randomizer/trades.js` (`offeredCandidates`) picks the offered mon from the WHOLE pokédex filtered
only by tier — it never consults `wild.alreadyChosenFamilies`, and it does not add its own picks to
that set either, so two trades can also collide with each other.

## Fix

<!-- What was changed and where (link commits/PR/task). The regression test reproduces the
     symptom: verified to FAIL before the fix and PASS after. No test, no `fixed` status. -->

Fixed as part of the trader rework — see [T-269](../tasks/T-269-trader-rework-pipeline.md).
