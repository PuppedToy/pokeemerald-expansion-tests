---
id: T-287
title: Point all three Burmy cloaks at the one Mothim, in the source
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, B-040, T-157, T-282, T-283, randomizer/docs/families-and-forms.md]
blocked-by: []
---

# T-287 — Point all three Burmy cloaks at the one Mothim, in the source

## Context

The owner's very first report of the epic:

> *"Burmy trash no muestra en las docs que evolucione a mothim por piedra + level, como hacen el resto
> de branching evolutions. Cada tipo de burmy evoluciona a un wormadan por candy y deben converger
> todos en el mismo mothim usando una piedra (elige la que consideres) + nivel."*

The source already had the right **shape** — candy → `WORMADAM_<cloak>`, Dawn Stone with
`CONDITIONS({IF_MIN_LEVEL, 25})` → Mothim — but Sandy pointed at `SPECIES_MOTHIM_SANDY` and Trash at
`SPECIES_MOTHIM_TRASH`. Those are byte-identical dupes B-040 removed from the pool, so the pipeline
papered over it with `EVOLUTION_TARGET_ALIASES`, remapping them to `MOTHIM_PLANT` after parsing.

**The alias only ever fixed the pipeline's view.** `injector/modules/evolutions.js` writes evolution
*levels*, never targets, so the cartridge kept sending Sandy and Trash Burmy to their own Mothim —
species the writer never touches, which therefore keep vanilla stats. A player evolving a Sandy Burmy
got a Mothim the guide had never described.

Owner chose the clean fix over letting T-283's macro write paper over it: *"Ve con la limpieza sí."*

## Plan

Name `SPECIES_MOTHIM_PLANT` in all three cloaks in `gen_4_families.h`, and delete the alias.

Acceptance criteria:
- [x] All three cloaks name `SPECIES_MOTHIM_PLANT` by Dawn Stone + `IF_MIN_LEVEL`.
- [x] Each cloak still evolves into its own Wormadam by candy.
- [x] `EVOLUTION_TARGET_ALIASES` is gone, pinned by a test.
- [x] The parsed graph is unchanged (the alias was already producing it), and Mothim is still the
      dex's only convergence point.
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] **Base ROM rebuild** — this is a source change the injector cannot express.
- [ ] Owner manually tests a built ROM and confirms.

## Progress log

- **2026-08-14** — Implemented TDD; `__tests__/unit/burmyMothimConvergence.test.js` (9) red on 5 first.
  Checked before editing that deliberate edits to `species_info/gen_*.h` are committed in this repo —
  the never-commit rule targets randomizer *output* (there is even a revert commit for it), not hand
  edits like "Level-gate all 57 stone evolutions".
- **2026-08-14** — Spec change to `__tests__/unit/burmyOgerponForms.test.js` (B-040's regression test),
  logged per the TDD rule. Its inline fixture fed `SPECIES_MOTHIM_SANDY` / `_TRASH` and asserted the
  parser remapped them — it was testing the alias. B-040's *guarantee* is untouched, but its mechanism
  moved from the parser to the source, so the fixture now mirrors the real source. The guarantee is
  still covered end to end: that the SOURCE says `MOTHIM_PLANT` is asserted by the new suite, and that
  the parser carries it through by the old one.
- **2026-08-14** — Full suite green: 2698 passed. **The ROM does not change until the base is rebuilt**
  — nothing in the injector writes evolution targets.

## Outcome
