---
id: T-285
title: Dedup per superfamily — one obtainable per dev block per run (G1)
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-063, T-157, T-185, docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md, randomizer/docs/families-and-forms.md]
blocked-by: []
---

# T-285 — Dedup per superfamily — one obtainable per dev block per run (G1)

## Context

Owner rule G1, and the one that made the rest of the epic small:

> *"el dedup clause hace que el jugador solo pueda obtener 1 en general de la superfamilia, aunque
> sean familias independientes. Es la regla general y ayuda mucho porque es invariable en todos los
> casos."*

`getFamilyGroup` already had the right shape — collapse a form family to its base by stripping the
suffix — but its list, `COSMETIC_FORM_SUFFIXES`, was **deliberately a subset** of `POKE_FORMS`:
T-063 decision #1 held regional forms out as "genuinely different Pokémon", so each kept its own
obtainable slot and a single run could offer Meowth, Meowth-Alola *and* Meowth-Galar.

They are different Pokémon, and after T-278 they still are — three separate families that inherit
nothing from each other. Being a different Pokémon and being worth a second slot in the same run are
different questions, and G1 answers the second with one invariant rule.

This is what let the epic drop its whole per-case dedup pass: the decision sheet's Batch 4 was 56 rows
of "may a run offer both of these", and G1 replaces all of it.

## Plan

Derive the strip list from `POKE_FORMS` instead of restating a curated subset, so a new form suffix
can never silently escape the dedup again. `groupedFamilies` (T-185's Greninja override) still wins.

Acceptance criteria:
- [x] Every suffix the parser can append collapses to its dev block.
- [x] The three Meowth lines share one slot; Koffing yields Weezing **or** Weezing-Galar.
- [x] Cosmetic and T-157 sets still collapse (regression).
- [x] Explicit overrides still win over the strip.
- [x] Unrelated blocks stay apart.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

- **2026-08-14** — Spec change to `__tests__/unit/familyGroup.test.js`, logged per the TDD rule.
  Three of its cases asserted T-063 decision #1 verbatim — "regional forms stay distinct (out of
  scope)", "functional forms stay distinct", and "a form and a regional variant do not share a group".
  ADR-026 supersedes that decision, so the file was rewritten to the new rule rather than deleted:
  every cosmetic assertion it had is kept as regression cover, the regional ones now assert the
  collapse, and a new case walks `POKE_FORMS` so no future suffix can escape. Red 12 of 26 first.
  The Own Tempo / Roaming cases went away with T-289, which removed their only species; ARTISAN is the
  last functional suffix and now collapses too.
- **2026-08-14** — Verified on the real dex: **584 families → 541 dedup groups**, 43 families now
  sharing a slot with their block (the 11 regional lines and their evolutions, plus ARTISAN). Full
  suite green: 2626 passed.
- **2026-08-14** — Note for T-284: this leaves `poke.family` with almost no behavioural consumer left.
  Every remaining read outside the parser goes through `getFamilyGroup` for dedup, except
  `teachableExpander.js`, which still keys `megaEvoTree` by family and so can still bleed a mega's
  teachables across sibling branches — the T-281 fix did not reach it. That is T-284's remaining work,
  alongside making the string itself reflect the component so the docs group the evolution chain right.

## Outcome
