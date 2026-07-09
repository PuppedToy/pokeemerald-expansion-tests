---
id: T-081
title: Number-field validation in randomization settings (gym/E4 min-max + full review)
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-09
updated: 2026-07-09
target-version: 0.6.0
links: [T-052, T-076]
blocked-by: []
---

# T-081 — Number-field validation in randomization settings (gym/E4 min-max + full review)

## Context

In the randomization settings (`frontend/js/config-form.js`), the gym / Elite-Four type-change
count fields need enforced bounds — min 0, max 8 (gyms) / 4 (E4). They carry HTML `min`/`max`
and `getConfig()` clamps via `_intField`, but the fields don't visibly validate typed input, and
a review shows several number fields accept out-of-range values (negatives, absurd counts):
`nz-numroms`, `sl-numplayers`, `sl-roms-per-player` are read with `parseInt(...) || default`
(no clamp), and the evolution-level scalars are read with no clamp.

## Plan

`frontend/js/config-form.js`:
1. Add a generic live clamp: on `change`/blur for every `input[type=number]` with `min`/`max`,
   clamp the field's value into range (skipping empty inputs). This makes gym(0–8), E4(0–4),
   champion%(0–100), rewards, prices, numROMs, numPlayers, romsPerPlayer visibly self-validate.
2. Harden `getConfig()`: read `numROMs` [2–10], `numPlayers` [2–8], `romsPerPlayer` [1–10] via a
   clamped integer read instead of `parseInt || default`.
3. Bound the evolution-level scalar reads (min level ≥ 1, max ≥ min, deviation 0–1) and add
   sane `min`/`max` to the evo stage-adjustment inputs.
4. Ensure the seed input can't go negative.

Acceptance criteria:
- [ ] Gym field clamps to [0,8], E4 field to [0,4], in both the UI and `getConfig()`.
- [ ] `numROMs`/`numPlayers`/`romsPerPlayer` are clamped to their documented ranges in
      `getConfig()` (no negatives / absurd values pass through).
- [ ] All `input[type=number]` with `min`/`max` clamp typed out-of-range values on blur.
- [ ] No number field yields a negative where negatives are invalid.
- [ ] `cd frontend && node --test` green (existing + new validation assertions).
- [ ] Manual: typing 99 / -5 into gym, E4, #ROMs, #players clamps to the allowed range.

## Progress log

<!-- Append-only. -->

- **2026-07-09** — Task created. Reviewed `config-form.js`: gym/E4/champion/rewards/prices use
  `_intField` (clamped) already, but `numROMs`/`numPlayers`/`romsPerPlayer` use `parseInt ||
  default` (unclamped) and evo scalars use an unclamped `num()`. No live UI clamp exists.

## Outcome

<!-- Filled when closing. -->
