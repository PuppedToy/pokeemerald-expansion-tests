---
id: T-183
title: Shedinja becomes a Dusk Stone evolution of Nincada
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 1.1.0
links: []
blocked-by: []
---

# T-183 — Shedinja becomes a Dusk Stone evolution of Nincada

## Context

Upstream, Shedinja appears through a special mechanic: when Nincada evolves into Ninjask, a second
Shedinja is spawned as a byproduct provided the player has a spare party slot **and** a spare Poké Ball
in the bag (`EVO_SPLIT_FROM_EVO` + `IF_BAG_ITEM_COUNT, ITEM_POKE_BALL`, gated by `P_SHEDINJA_BALL`). That
mechanic is opaque and does not fit the randomizer's evolution model, where every branch is a normal
level/stone evolution whose level is generated at randomization time (`evoLevelWriter.applyEvoLevels`).

The owner wants Shedinja obtained the same way as every other branched stone evolution in the game (e.g.
Kirlia→Gallade, Clamperl→Huntail, Burmy→Mothim): a fixed stone in the source data + an `IF_MIN_LEVEL`
gate that the randomizer rolls per run ("piedra + nivel generada en randomización").

## Plan

Turn Nincada into a branched evolution:
- `{EVO_LEVEL, 20, SPECIES_NINJASK}` — kept (randomizer already rolls this level).
- `{EVO_ITEM, ITEM_DUSK_STONE, SPECIES_SHEDINJA, CONDITIONS({IF_MIN_LEVEL, 25})}` — new stone branch.

Stone choice: **Dusk Stone**. Thematically it is the Ghost/Dark evolution stone (Murkrow→Honchkrow,
Misdreavus→Mismagius, Clamperl→Huntail already uses it in this very file), matching Shedinja's Bug/Ghost
typing and its eerie discarded-husk flavour. It is a one-line swap if the owner prefers another stone.

The randomizer needs **no logic change** — `parseEvo` already captures `IF_MIN_LEVEL`, `applyEvoLevels`
already generates a level for `method === 'ITEM'` stone evos and writes it back via
`patchStoneMinLevelInContent`. This is a data change guarded by a regression test.

Acceptance criteria:
- [ ] Nincada's source `.evolutions` evolves Shedinja via `EVO_ITEM` + `ITEM_DUSK_STONE` +
      `CONDITIONS({IF_MIN_LEVEL, N})`; no `EVO_SPLIT_FROM_EVO` / `ITEM_POKE_BALL` remains.
- [ ] Ninjask stays a plain `EVO_LEVEL` branch.
- [ ] Regression test (fails before the edit, passes after) asserting the real source structure, that the
      parser reads Shedinja as a stone evo, and that `applyEvoLevels` puts Ninjask in the level map and
      Shedinja in the stone map with a numeric min level.
- [ ] `cd randomizer && npm test` green.
- [ ] Owner manually confirms in-game (Dusk Stone on a level-N+ Nincada → Shedinja; level-up → Ninjask).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Investigated the mechanic end-to-end:
  - Engine spawn logic lives in `src/data/pokemon/species_info/gen_3_families.h` (Nincada `.evolutions`)
    with the byproduct handled generically in `src/evolution_scene.c` — no engine change needed, only data.
  - Randomizer already supports branched level+stone evos (Burmy→Wormadam/Mothim is the exact shape):
    `parser.parseEvo` captures `IF_MIN_LEVEL`; `evoLevelWriter.applyEvoLevels` rolls the level for
    `method==='ITEM'`; `patchStoneMinLevelInContent` writes it back. No randomizer logic change required.
  - No randomizer code references `SPLIT_FROM_EVO` / `ITEM_POKE_BALL`, so removing them from Nincada's
    data breaks nothing downstream.
- **2026-07-21** — Implemented (TDD). Added `randomizer/__tests__/unit/shedinjaStoneEvolution.test.js`;
  the two real-source assertions failed Red (source still had `EVO_SPLIT_FROM_EVO` + `ITEM_POKE_BALL`).
  Edited Nincada's `.evolutions` in `gen_3_families.h` to
  `{EVO_LEVEL, 20, SPECIES_NINJASK}, {EVO_ITEM, ITEM_DUSK_STONE, SPECIES_SHEDINJA, CONDITIONS({IF_MIN_LEVEL, 25})}`
  → Green. Full suite green (1465 passed, 20 skipped). `node build.js` regenerated the browser
  `base-data.json` without error; verified `evoTree[P_FAMILY_NINCADA]` = [NINCADA, [NINJASK, SHEDINJA]]
  and Nincada's parsed evolutions show the Dusk Stone stone branch. Left `P_SHEDINJA_BALL` untouched
  (still referenced by the generic byproduct code in `src/evolution_scene.c`; now inert for Nincada).
  Pending owner in-game playtest before close.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
