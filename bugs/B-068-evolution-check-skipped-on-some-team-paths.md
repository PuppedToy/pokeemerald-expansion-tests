---
id: B-068
title: Trainers can still field a mon below its evolution level through paths checkValidEvo does not cover
status: open            # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.5.0         # version where the bug was observed
fixed-in:               # version that ships the fix (set when fixed)
regression-test:        # REQUIRED to mark as fixed: path/to/test (named or annotated with this id)
links: [B-067, T-264]
---

# B-068 — Trainers can still field a mon below its evolution level through paths checkValidEvo does not cover

## Symptom

Found while verifying [B-067](B-067-stone-evolutions-ignore-their-min-level.md): after that fix, a
sweep of four seeds (one generation per process) still turns up mons fielded below their own evolution
level. These cases are **present before and after B-067's fix, byte-identical** — a separate defect,
neither introduced nor addressed by it.

| Seed | Trainer | Level | Mon | Needs | Method |
|---|---|---|---|---|---|
| 3333 | `TRAINER_AUTUMN` | 36 | Weezing-Galar | 38 | ITEM (Moon Stone) |
| 3333 | `PARTNER_STEVEN` | 59 | Solgaleo | 65 | LEVEL |
| 2231547897 | `TRAINER_NORMAN_1` | 39 | Slaking | 50 | LEVEL |

Note both `LEVEL` and `ITEM` cases appear, so this is not the method-vs-level confusion of B-067.

## Root cause

<!-- Filled during the fix. The real cause, not the patch. -->

Two distinct entry points, one proven and one still open.

**1. `checkValidEvo`'s `EVO_TYPE_SOLO` shortcut (proven).** `randomizer/modules/utils.js` returns
`true` immediately when the candidate is classified solo or LC:

```js
if (devolvedForm.evolutionData.type === EVO_TYPE_SOLO || devolvedForm.evolutionData.isLC) return true;
```

A **cross-family branch evolution** makes that classification lie. Koffing sits in
`P_FAMILY_KOFFING` and evolves two ways — level to Weezing, Moon Stone to Weezing-Galar — but
Weezing-Galar sits in its own family, `P_FAMILY_KOFFING_GALAR`, and is therefore parsed as
`EVO_TYPE_SOLO` / `isFinal: true` with no pre-evolution recorded. `checkValidEvo` trusts that and never
looks at the Moon Stone gate, so Weezing-Galar is a legal pick for a trainer of any level. Every
regional form reached by a branch evolution out of another family is in the same position.

**2. A forced-species slot that survives devolution (open).** `PARTNER_STEVEN`'s Solgaleo comes from a
`{ special: TRAINER_REPEAT_ID, id: 'STEVEN_MEGA', devolveToLevel: true }` slot, and
`checkValidEvo(pokes, solgaleo, 59)` correctly returns `false`. `devolveToLevel` should have walked
Solgaleo down to Cosmoem (Cosmoem → Solgaleo is LEVEL 65 in that run, and Cosmoem *is* in the pool),
so something downstream of the slot re-forces the species. Not root-caused yet. Norman's Slaking is
probably the same shape (a signature ace) but was not traced.

## Fix

<!-- What was changed and where (link commits/PR/task). The regression test reproduces the
     symptom: verified to FAIL before the fix and PASS after. No test, no `fixed` status. -->

Not fixed. Deliberately left out of [T-264](../tasks/T-264-stone-evo-min-level-legality.md): the root
causes are different from B-067's, entry point 2 is not yet understood, and repairing the `SOLO`
shortcut changes the candidate pool for every trainer in the game (it should be measured on its own).
