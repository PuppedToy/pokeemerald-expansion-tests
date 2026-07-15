---
id: B-032
title: Trick Room seed base 'balance' silently dropped for doubles trainers
status: fixed
severity: minor
created: 2026-07-15
updated: 2026-07-15
found-in: 0.7.0
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/archetypePicker.test.js
links: [T-141, T-137]
---

# B-032 — Trick Room seed base 'balance' silently dropped for doubles trainers

## Symptom

Doubles Tate & Liza (the Trick Room seed, `TRICK_ROOM = { base: 'balance', ... }` in
`modules/trainerSeeds.js`) never apply their base-archetype recipe. Only the `trick_room` gimmick
structure steers the team; the balanced base's slots (Intimidate/Tailwind/win-condition — and, post-T-141,
the `dedicatedSupport` slot) are lost.

## Root cause

`resolveIdentity` (`modules/archetypePicker.js`) uses the seed base id verbatim
(`baseId = seed.base`). The balanced base is `'balance'` in `data/archetypes/singles.json` but
`'balance_dual_mode'` in `doubles.json`. For a doubles trainer, `combinedStructure`'s
`baseArchetypes.find(a => a.id === 'balance')` returns undefined → the base structure is `[]` and only
the gimmick structure is merged. Silent (non-crashing) degradation. `bulky_offense` / `hyper_offense`
exist in both models, so only the Trick Room seed (the only one using `balance`) is affected.

## Fix

Resolve a seed base against the ACTIVE model in `resolveIdentity`: if the seed's base id is absent, map
it to the format-equivalent (`balance ↔ balance_dual_mode`) so the base recipe is applied.

## Regression test

`resolveIdentity(team, doublesModel, {}, { base: 'balance', gimmicks: ['trick_room'] })` must yield
`baseId === 'balance_dual_mode'` (was `'balance'`, which no doubles base matches). FAILS before the fix,
PASSES after.
