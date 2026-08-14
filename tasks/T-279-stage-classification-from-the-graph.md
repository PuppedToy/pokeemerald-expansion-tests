---
id: T-279
title: Classify evolution stages from the graph instead of the family tree index
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-278, docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md, randomizer/docs/families-and-forms.md]
blocked-by: [T-278]
---

# T-279 — Classify evolution stages from the graph instead of the family tree index

## Context

Second child of the T-277 epic. `parser.getEvolutionType` decided a species' stage purely by its
**position inside `evoTree[its own family]`**: no tree ⇒ `EVO_TYPE_SOLO`, index 0 ⇒ `LC`, in the
stage-1 array ⇒ `NFE`, anything else ⇒ `LAST`. Correct only while the family string agrees with the
evolution graph — and on 20 edges it does not.

`evolutionData.type` decides which slots a mon may fill: `wildModule` fills wild/starter/reward slots
by `isLC` and `=== EVO_TYPE_SOLO`, and `evoLevelWriter` picks its stage adjustment from it. So the
misclassifications were not cosmetic — they put real stage-2s into "non-evolving mon" slots.

## Plan

New `randomizer/evoStages.js`: `classifyStages(pokemonList)` returns a lookup from species id to
`EVO_TYPE_*`, derived from in/out-degree plus the longest path through the mon (which is what the
`_OF_2` / `_OF_3` half of the vocabulary means, and what `evoLevelWriter` and the starter
`lineLength` specs still need).

Acceptance criteria:
- [x] Stage comes from degree; line length from the longest path through the species.
- [x] Megas keep `EVO_TYPE_MEGA`; an unknown id falls back to `SOLO` instead of throwing.
- [x] The pipeline classifies after ALL gens are parsed, not inside the per-gen loop.
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-14** — Implemented TDD; `__tests__/unit/stageClassification.test.js` (17) red first.
  Had to move classification **out of the per-gen parse loop**: a species' stage is a property of the
  whole graph, so it cannot be decided while later gens are unparsed. `parseBaseData` now collects
  every gen into `rawPokes` and classifies once. (In practice no evolution edge crosses a gen file —
  a regional form is declared in its base's gen — but relying on that was luck, not design.)
- **2026-08-14** — Verified against the real dex: **19 of 1228 species reclassified**, every one an
  improvement.
  · The four false non-evolving mons are stage-2s again: Sirfetch'd, Weezing-Galar, Overqwil, Cursola
    (`SOLO → LAST_OF_2`). They can no longer be dropped into solo slots.
  · The Mime Jr. line is 3 stages, as it always was in the data: Mime Jr. `LC_OF_2 → LC_OF_3`,
    Mr. Mime-Galar `LC_OF_2 → NFE_OF_3`, Mr. Rime `LAST_OF_2 → LAST_OF_3`. Same for the Hisui Goomy
    arm and for Obstagoon.
  · Five battle-only forms stop pretending to be evolutions: Cherrim-Sunshine, both Darmanitan-Zen,
    Aegislash-Blade and Palafin-Hero (`LAST_OF_* → SOLO`). They only carried a stage because they sat
    in a family that had a tree.
  · Basculin Red/Blue-Striped `LAST_OF_2 → SOLO` — they evolve into nothing.
  · **Found beyond the audit: Flapple and Appletun were `NFE_OF_3`** — the old model believed they
    could still evolve, because Applin's third branch (Dipplin → Hydrapple) makes the family tree
    3 deep and they sat in its stage-1 array. They are finals: `LAST_OF_2`.
  Full suite green: 2572 passed.
- **2026-08-14** — Note: the code commit landed before this file and the changelog line (a `cd` slip
  put them outside the repo root); both were added in the follow-up commit, not amended, so the
  history stays honest about the order.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
