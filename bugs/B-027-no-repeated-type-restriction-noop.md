---
id: B-027
title: NO_REPEATED_TYPE restriction was a no-op (read parsedTypes off the team-member wrapper)
status: fixed
severity: medium
created: 2026-07-12
updated: 2026-07-12
found-in: Unreleased
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/trainerSelector.test.js
links: [T-106, T-128]
---

# B-027 — The no-repeated-type restriction never fired

## Symptom

Trainers carrying `TRAINER_RESTRICTION_NO_REPEATED_TYPE` (every rival appearance and Wally) could still
field several mons of the same type. Surfaced while implementing Wally's reverse-order team (T-106):
his authoritative Victory Road team came out with three Psychic mons (Mega Gardevoir + Slowbro +
Meowstic) despite the restriction.

## Root cause

`modules/trainerSelector.js`, the restriction filter:

```js
const selectedTypes = new Set(team.map(p => p.parsedTypes).flat());
filteredLooseList = filteredLooseList.filter(p => !p.parsedTypes.some(t => selectedTypes.has(t)));
```

`team` holds resolved **team-member wrappers** (`{ pokemon, item, ability, moves, ... }`), so
`p.parsedTypes` on a wrapper is `undefined`. `selectedTypes` therefore collapsed to `{ undefined }`
and the `.filter` never excluded anything — the restriction was a silent no-op for its whole lifetime.
(The candidate side, line 291, correctly reads `p.parsedTypes` on the raw candidate poke.)

## Fix

Read the type list through the wrapper: `team.map(p => (p.pokemon || p).parsedTypes || []).flat()`.
Raw pokes (unit-test fixtures) still work via the `|| p` fallback.

## Regression test

`randomizer/__tests__/unit/trainerSelector.test.js` → `describe('createChooser — NO_REPEATED_TYPE
restriction (B-027)')`: a Psychic/Fairy team member must exclude a Water/Psychic candidate (shared
Psychic) and admit a pure-Fire one. Verified RED before the fix (the shared-type candidate was picked),
GREEN after.

## Blast radius

Fixing it changes the resolved teams of all 17 trainers that declare the restriction (rival May/Brendan
appearances + Wally) — they now genuinely avoid repeated types, as always intended. Cross-ROM
determinism preserved.
