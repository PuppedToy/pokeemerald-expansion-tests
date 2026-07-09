---
id: B-023
title: Encounter tile click opens the base species modal instead of the evolved one
status: open            # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-07-09
updated: 2026-07-09
found-in: 0.6.0
fixed-in:
regression-test:
links: []
---

# B-023 — Encounter tile click opens the base species modal instead of the evolved one

## Symptom

In the generated docs (docs viewer), the Encounters tab shows an evolved Pokémon in green
once you mark a caught encounter as evolved (e.g. catch a Pichu on Route 102, evolve it to
Pikachu → Route 102 shows Pikachu in green). That green sprite/name is correct.

The bug: clicking that tile to inspect it opens the detail modal for the **base** species
(Pichu), not the **evolved** species (Pikachu). Expected: the modal shows the currently
displayed (evolved) species.

Reproduce: open a run's docs, go to Encounters, evolve a caught encounter (via Mail/PC flow),
return to Encounters, click the now-green evolved tile → modal shows the pre-evolution.

## Root cause

<!-- Filled during the fix. The real cause, not the patch. -->

## Fix

<!-- What was changed and where (link commits/PR/task). The regression test reproduces the
     symptom: verified to FAIL before the fix and PASS after. No test, no `fixed` status. -->
