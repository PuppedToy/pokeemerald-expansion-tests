---
id: T-289
title: Remove Rockruff-Own-Tempo and Gimmighoul-Roaming from the obtainable pool
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md, T-060, T-063]
blocked-by: []
---

# T-289 — Remove Rockruff-Own-Tempo and Gimmighoul-Roaming from the obtainable pool

## Context

First child of the T-277 epic; see `randomizer/docs/families-and-forms.md` for the ruleset and ADR-026 for
the model. Owner decision, taken while resolving the epic's hard calls (M15 and the Lycanroc row):

> *"Lycanroc: pensaba que habíamos eliminado own tempo del juego. Si no, lo eliminamos y ya no
> converge."* … *"Chest y roaming son muy distintos como pokemon. Dicho esto, estoy tentado a quitar
> el roaming de la pool y dejar solo el chest. A nadie le va a importar."*

Both species existed only to create a **second path into an evolution that was already reachable**,
and each sat in its own dedup group, so one run could place the plain form *and* the variant — two
Rockruff, or two Gimmighoul. Nothing is lost by removing them: the plain Rockruff already branches
into all three Lycanroc (candy → Midday, moon stone → Midnight, dusk stone → Dusk, which is also
T-060's one-candy-branch convention) and Gholdengo is still reached from Gimmighoul-Chest at level 40.

The removals matter beyond tidiness: they take the dex's convergent evolutions from four down to
**one — Mothim**, which is the only place ADR-026's "a convergence point inherits from all its
pre-evolutions" rule can ever fire. That makes T-278 markedly simpler to write and to test.

## Plan

Add both ids to `parser.REMOVED_SPECIES`, and drop the now-dead `OWN_TEMPO` / `ROAMING` entries from
`POKE_FORMS` — each suffix belonged to exactly one species, so leaving them would keep minting
per-form families that can never be populated.

Acceptance criteria:
- [x] Neither species is parsed into the pokédex.
- [x] The plain Rockruff still reaches all three Lycanroc; Gholdengo still reaches from Chest.
- [x] Mothim is the only convergent evolution left in the dex.
- [x] `OWN_TEMPO` and `ROAMING` are gone from `POKE_FORMS`, and no surviving species carries either.
- [x] Failing-first regression test (`__tests__/unit/removedConvergenceForms.test.js`).
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-14** — Implemented TDD. New `__tests__/unit/removedConvergenceForms.test.js` confirmed
  **RED** first (5 of 7 failing: both species present, Lycanroc and Gholdengo still convergent, both
  suffixes still in `POKE_FORMS`), then **GREEN**. Changes: the two ids added to `REMOVED_SPECIES`
  (`parser.js`), `POKE_FORM_OWN_TEMPO` / `POKE_FORM_ROAMING` and their `POKE_FORMS` entries deleted
  (`constants.js`), and the `COSMETIC_FORM_SUFFIXES` comment in `modules/utils.js` corrected — it
  cited both suffixes as "functional forms that stay their own families".
  Left deliberately untouched: `__tests__/unit/familyGroup.test.js:35-38` still asserts
  `getFamilyGroup('P_FAMILY_ROCKRUFF_OWN_TEMPO')` returns itself. The assertion is still true —
  `getFamilyGroup` is pure string manipulation over `COSMETIC_FORM_SUFFIXES`, which never contained
  either suffix — and it still guards ARTISAN, so weakening or rewriting it would buy nothing. The two
  family names in it are simply unreachable now.
  Full suite green: 2530 passed (was 2523), no regressions.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
