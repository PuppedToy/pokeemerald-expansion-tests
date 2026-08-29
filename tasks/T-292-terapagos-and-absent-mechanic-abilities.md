---
id: T-292
title: Rate the Terastal abilities 0 and place the Terapagos form the player can own
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, randomizer/docs/families-and-forms.md, T-141]
blocked-by: []
---

# T-292 — Rate the Terastal abilities 0 and place the Terapagos form the player can own

## Context

Owner decision from the T-277 ruleset: *"la terastalización no existe así que es como si no tuviese
habilidad (rating 0 a la habilidad de terapagos)"*.

Two defects, both found while reading the engine for the T-277 audit:

1. **Terastal abilities are rated as if the mechanic existed.** `Tera Shift` carries `aiRating = 10`
   in `src/data/abilities.h`, and the rater takes the C rating at face value — so Terapagos' tier is
   inflated by something this base cannot do. Same for `Tera Shell` and `Teraform Zero`.
2. **The ban list was inverted.** `BANNED_SPECIES_FOR_PICKING` held `TERAPAGOS_NORMAL` and
   `TERAPAGOS_STELLAR`, i.e. it banned the form the player actually catches and left the in-battle
   `TERAPAGOS_TERASTAL` placeable.

**T-293 folded into this task.** It was going to ban the other battle-only states the audit found
placeable, but the owner's rulings emptied it: Necrozma-Ultra stays (Ultra Burst is a real gimmick in
this base, so the player can reach it), Eternatus-Eternamax stays (its BST bans it in practice), and
Xerneas-Active disappears with the cosmetic collapse in T-291. Terapagos was the only real one.

## Plan

A new `ABSENT_MECHANIC_ABILITIES` map in `rating.js`, applied in **both** formats — that is what
separates it from T-141's `SINGLES_ABILITY_CORRECTIONS`, where an ally-only ability is dead in singles
but alive in doubles. An absent mechanic is dead everywhere. Then swap the Terapagos ban entries.

Acceptance criteria:
- [x] Tera Shift / Tera Shell / Teraform Zero rate 0 in singles and doubles.
- [x] The correction is narrow — an ordinary ability keeps its aiRating, and T-141's abilities keep
      their doubles value.
- [x] `TERAPAGOS_NORMAL` is placeable; `TERAPAGOS_TERASTAL` and `_STELLAR` are banned.
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

- **2026-08-14** — Implemented TDD; `__tests__/unit/absentMechanicAbilities.test.js` red on the three
  abilities. Deliberately did **not** extend `SINGLES_ABILITY_CORRECTIONS`: its comment calls itself
  "the only sanctioned singles rating change" and its members are singles-only for a reason. Mixing an
  absent mechanic into it would have hidden that these are dead in doubles too. Separate map, applied
  in both rating functions.
  Also swept for other Terastal-dependent abilities on in-dex mons: `TERA_SHELL` (Terapagos-Terastal)
  and `TERAFORM_ZERO` (Terapagos-Stellar) are the only two, both on now-banned forms, but they are
  corrected anyway so a future re-enable cannot resurrect the inflation.
  Full suite green: 2612 passed.
- **2026-08-14** — T-293 absorbed here rather than shipped empty; recorded in the epic table.

## Outcome
