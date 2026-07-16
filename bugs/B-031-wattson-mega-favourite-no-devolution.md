---
id: B-031
title: Wattson's Mega Manectric favourite has no devolution fallback (skips to any-eligible)
status: fixed
severity: minor
created: 2026-07-14
updated: 2026-07-14
found-in: 0.8.0
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/wattsonFavouriteChain.test.js
links: [T-137]
---

# B-031 — Wattson's Mega Manectric favourite has no devolution fallback

## Symptom

Wattson's favourite is Mega Manectric via `gymFavourite('SPECIES_MANECTRIC_MEGA')`, which expands to the
single-entry chain `['SPECIES_MANECTRIC_MEGA']`. When Mega Manectric can't claim the pool's mega slot (its
progression gate isn't met this run, or there is no mega slot), the chain has no middle rungs, so
`resolveFavourites` jumps straight to its implicit final fallback ("any eligible mon within the type
restriction"). Wattson should instead DEVOLVE:

    Mega Manectric  →  Manectric  →  Electrike  →  any eligible

i.e. keep the signature line before falling back to a random Electric mon.

## Root cause

`gymFavourite(sig) = [sig]` builds a one-element chain — correct for the other gym signatures (Nosepass,
Torkoal, Slaking, Kingdra are single non-mega species whose implicit final fallback is fine), but wrong for
Wattson, the only gym whose signature is a MEGA. A mega needs its base-form + pre-evo as explicit chain rungs
(cf. Brawly `['SPECIES_HARIYAMA','SPECIES_MAKUHITA']`, Winona `['SPECIES_ALTARIA_MEGA','SPECIES_ALTARIA',…]`).

## Fix

Give Wattson the explicit devolution chain
`favourite: ['SPECIES_MANECTRIC_MEGA', 'SPECIES_MANECTRIC', 'SPECIES_ELECTRIKE']`
(`randomizer/trainers.js`). The implicit final "any eligible" fallback in `resolveFavourites` handles the last
rung. Regression test `wattsonFavouriteChain.test.js` asserts the chain (FAILS on the old single-entry chain,
PASSES after).
