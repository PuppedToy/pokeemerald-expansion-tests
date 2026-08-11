---
id: B-068
title: Trainers can still field a mon below its evolution level through paths checkValidEvo does not cover
status: fixed           # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.5.0         # version where the bug was observed
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/evoCheckClassification.test.js # + favouriteEvoLegality.test.js (the forced-species slots)
links: [B-067, T-264]
---

# B-068 — Trainers can still field a mon below its evolution level through paths checkValidEvo does not cover

## Symptom

Found while verifying [B-067](B-067-stone-evolutions-ignore-their-min-level.md): after that fix, a
sweep of seeds still turned up mons fielded below their own evolution level. These cases were present
before and after B-067's fix, byte-identical — a separate defect.

| Seed | Trainer | Level | Mon | Needs | Method |
|---|---|---|---|---|---|
| 3333 | `TRAINER_AUTUMN` | 36 | Weezing-Galar | 38 | ITEM (Moon Stone) |
| 2231547897 | `TRAINER_NORMAN_1` | 39 | Slaking | 50 | LEVEL |
| 3333 | `PARTNER_STEVEN` | 59 | Solgaleo | 65 | LEVEL |

Both `LEVEL` and `ITEM` cases appear, so this is not the method-vs-level confusion of B-067.

## Root cause

Three entry points, all of which reach the team without the evolution check ever being consulted.

**1. `checkValidEvo` trusted the classification instead of the data.** It returned `true` immediately
when `evolutionData.type === EVO_TYPE_SOLO` (or `isLC`), on the assumption that such a mon has no
pre-evolution to satisfy. A branch evolution that crosses families makes that label lie: Koffing sits in
`P_FAMILY_KOFFING` and evolves by level to Weezing and by Moon Stone to Weezing-Galar, but Weezing-Galar
sits in `P_FAMILY_KOFFING_GALAR`, so it is parsed as `EVO_TYPE_SOLO` / `isFinal` with no pre-evolution
recorded, and its stone gate was never checked. Every regional form reached by a branch out of another
family had the same hole.

**2. A named favourite is never level-checked.** `resolveFavourites`
(`randomizer/modules/favouriteClaim.js`) accepts a candidate on two conditions only — the species exists
and passes the trainer's type restriction — and emits it as a `{ specific: id }` slot. In
`trainerSelector.createChooser`, a `specific` slot fills `pokemonStrictList`, and `checkValidEvo` filters
**only `pokemonLooseList`**. Norman's template carries `favourite: ['SPECIES_SLAKING']`, so his level-39
appearance fielded a Slaking whose Vigoroth→Slaking step was level 50 that run;
`checkValidEvo(…, 39)` returned `false` the whole time and nobody asked it.

**3. One `TRAINER_REPEAT_ID` echo slot lacked `devolveToLevel`.** `PARTNER_STEVEN`'s legend slot
(`randomizer/trainers.js`) was the only such slot in the whole template file without the flag, with the
comment "no devolve — legends are solo-evo". They are not: Cosmoem→Solgaleo/Lunala, Poipole→Naganadel,
Kubfu→Urshifu and several more high-tier mons carry a pre-evolution — 9 in the audited run — so the
level-59 partner echoed the Champion's level-65 Solgaleo verbatim.

An earlier version of this file attributed case 3 to "a forced-species slot that survives
`devolveToLevel`". That was wrong: the slot was identified by matching the mon's index in the RESULT team
against the template array, and those two orders differ. Re-attributed by `pokeId`.

## Fix

**1.** `checkValidEvo` (`randomizer/modules/utils.js`) now walks the line from the mon down to a base
form, requiring one legal incoming evolution per stage, and decides "is this a base form?" by asking
whether anything in the run's pool actually evolves into it — not by reading the label. When nothing
does, it falls back to the label to keep the old conservative answer for a mon whose pre-evolution was
filtered out of the run. That fallback reads BOTH signals (`isLC` and the `EVO_TYPE_LC*` types), because
they can disagree — the `wildModule` fixture has a base form with `isLC: false` and
`type: EVO_TYPE_LC_OF_3`, and an earlier cut of the fix rejected it. Also fixed in passing: the
`MEGA_NO_BASE_FORM` guard sat *after* the dereference it was guarding, so it could never run.

**2.** A named favourite is now projected onto the most-evolved form of its line that is legal at the
trainer's level, reusing T-106's `devolveToLevel` — the same treatment recurring characters already get.
Norman at 39 fields **Vigoroth**, and the real Slaking once it is reachable, so an early boss shows its
signature *line* rather than losing its identity to a filler. The claim still consumes the slot of the
**named** species' tier, since that is the budget the trainer means to spend on its signature. Megas are
exempt: they are gated by the mega slot's own budget rules and that slot exists to field a mega.

**3.** `PARTNER_STEVEN`'s legend slot got `devolveToLevel: true`. `devolveToLevel` returns a mon unchanged
when it has no pre-evolution, so the flag is a no-op for the legends that really are solo. A structural
test now asserts the invariant for every `TRAINER_REPEAT_ID` slot in the template file rather than just
that one, so a future echo slot cannot omit it silently.

Regression tests verified RED before each fix and GREEN after:
`randomizer/__tests__/unit/evoCheckClassification.test.js` (entry point 1) and
`randomizer/__tests__/unit/favouriteEvoLegality.test.js` (entry points 2 and 3, including the
template-wide invariant). Across seven seeds, mons fielded below their evolution level: **0**.
