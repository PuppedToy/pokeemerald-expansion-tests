---
id: B-049
title: ROM build fails "excess elements" when a ROM has ≠9 extra starters and no starter naming
status: fixed           # open | fixing | fixed | wont-fix
severity: critical      # critical | major | minor
created: 2026-07-24
updated: 2026-07-24
found-in: 0.6.0
fixed-in: 0.6.0
regression-test: randomizer/__tests__/unit/starterNameWriter.test.js  # describe('applyStarterChoose (B-049)')
links: [T-068]
---

# B-049 — Starter extra arrays desync from STARTER_EXTRA_COUNT → build break

## Symptom

`make.js --bundle` (the `/api/produce` ROM build) fails at compile:

```
src/starter_choose.c:150:5: error: excess elements in array initializer [-Werror]
src/starter_choose.c:163:5: error: excess elements in array initializer [-Werror]
make: *** [Makefile:405: build/modern/src/starter_choose.o] Error 1
```

Reproduces with any bundle whose per-ROM extra-starter count ≠ 9 (the committed `STARTER_EXTRA_COUNT`
default) AND that carries no `starterNaming` (e.g. the naming feature off). Observed on the build box
with bundle `2d04bded-…` (8 extra starters, `starterNaming: null`). Other bundles (count 9, or with
naming) built fine, so it was intermittent.

## Root cause

`randomizer/writer.js` always rewrote `#define STARTER_EXTRA_COUNT` and the `sStarterExtraMon[]` species
array to the ROM's actual extra count, but only rewrote the `sStarterExtraNicknames[]` / `sStarterExtraGenders[]`
arrays **inside `if (starterNaming) { … }`**. When a ROM had ≠9 extra starters and no naming, the name/gender
arrays kept their committed 9-element defaults under an `[8]`-sized `#define` → C "excess elements". The
comment claimed the committed defaults were safe without naming — true only when the count stayed 9.

## Fix

Extracted `applyStarterChoose(fileContent, extraStarters, starterNaming)` into
`randomizer/starterNameWriter.js`: it rewrites the species array, the `#define`, AND the name/gender arrays
**together**, always resizing every array to `extraStarters.length` (default-filled when `starterNaming`
is null). `writer.js` now calls it unconditionally (guard removed; dead template consts dropped). The
count and all three arrays can no longer drift.

Regression test `describe('applyStarterChoose (B-049)')` in `randomizer/__tests__/unit/starterNameWriter.test.js`
asserts that with null naming + a count of 8 every array resizes to 8 (matching the `#define`) — verified
to FAIL with the old guarded behavior and PASS after the fix. End-to-end: the failing bundle now builds on
the box (EXIT=0, ROM produced).
