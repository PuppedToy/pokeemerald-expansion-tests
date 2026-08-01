---
id: T-239
title: "Base+injection Phase 3 — inject Group A (fixed-size: stats/moves/evos/wild/starters/TM/prices/items)"
status: in-progress
type: feature
created: 2026-07-27
updated: 2026-08-01
target-version: 0.7.0
links: [T-229, T-238, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-238]
---

# T-239 — Inject Group A (fixed-size)

## Context
First migration batch — the low-risk fixed-offset overwrites. See
[strategy Group A](../docs/base-plus-injection-strategy.md#group-a--fixed-size-overwrite-no-base-change-do-first-lowest-risk).

## Plan
Migrate one output at a time behind T-238's registry entry `group-a-fixed`, each an isolated step, then
prove INV-BYTES on the corpus (GATE-3, T-233). **The compile path is the reference**: every module
mirrors its writer's *decision rule*, not just its values — where a writer only rewrites logged fields,
the injector writes only those fields, or the ROMs differ.

Shared infrastructure first (decided 2026-08-01, before code):

| File | Responsibility |
|---|---|
| `randomizer/injector/gameConstants.js` | `#define NAME value` constant headers (species / moves / items / abilities / types) → name→number, with alias + `(NAME + 1)` support. Every module needs numeric ids; the bundle speaks names. |
| `randomizer/injector/structLayout.js` | the struct field offsets the modules write (`SpeciesInfo`, `MoveInfo` bit-fields, `Item.price`, `WildPokemon`, `Evolution`/`EvolutionParam`) **plus base anchors**: canonical values read back from the base ROM (Bulbasaur 45/49/49/45/65/65 GRASS/POISON, Pound 40/100/NORMAL/PHYSICAL…). A layout drift (upstream sync, config flag) fails loudly here instead of corrupting a ROM. |

Then the outputs, in order:

1. **Species** — stats/types/abilities from the rebalance `log` (mirrors `pokemonWriter.editSpeciesFile`),
   and `itemCommon`/`itemRare` → `ITEM_NONE` for **every** species (T-077 `stripWildHeldItems`).
2. **Moves** — power/accuracy/type/category, log-driven (`moveWriter.editMovesFile`); packed bit-fields,
   so `rom.writeBits` read-modify-write.
3. **Evolutions** — level `param` and the stone `IF_MIN_LEVEL` arg, keyed by **target** species like
   `evoLevelWriter` (its regexes rewrite every entry pointing at a target, and skip conditional
   `EVO_LEVEL` tuples — the injector skips entries whose `params` pointer is non-null for the same reason).
4. **Wild encounters** — the `u16 species` of each slot, tables located by the generated
   `<base_label>_<Type>Mons` symbols; reuses `writer.distributeSpeciesAcrossSlots` so the plan→slot
   mapping has one home. Legacy (pre-T-162, no `wildPlan`) bundles: the `replacementLog` mapping.
5. **Item prices** — `gItemsInfo[item].price`, reusing `itemPriceWriter.resolvePrices`/`targetPriceFor`.
6. **TM→move** — `gTMHMItemMoveIds[].moveId`. **Needs a base change** (see the audit below).
7. **Route/mail items** — the mail-mint hidden items in the route `map.json`s (compiled map BG events).

Base audit, done before coding (the reason step 6 is last):

- `FOREACH_TM` in `include/constants/tms_hms.h` feeds three things. The `enum TMHMItemId`
  (`ITEM_TM_<MOVE> = ITEM_TM<n>`) and `GetItemTMHMIndex()` are **position-based**, so they compile
  identically for any TM list. `gTMHMItemMoveIds[]`'s `itemId` column is likewise always
  `ITEM_TM01, TM02, …`; only its `moveId` column moves → injectable.
- But `GetItemTMHMMoveId(item)` is an **inline switch that bakes the move ids into code** (3 callers:
  `src/item.c` `GetItemDescription`, `src/item_icon.c`, `src/party_menu.c`). Injecting only the table
  would leave those three reading the base's TMs — and would differ from `compile()` byte-wise anyway.
  Fix: make it read the table (`GetTMHMMoveId(GetItemTMHMIndex(item))`), which is what every other
  consumer already does. One line, behaviour-preserving, and it invalidates the golden base → rebuild +
  re-snapshot the corpus (as T-234…T-237 each did).
- No other `ITEM_TM_<MOVE>` / `ENUM_TM_HM_<MOVE>` use exists in `src/` or `data/`, so nothing else in
  the base depends on *which* moves the TM list holds.
- `gStarterMon` (listed under Group A in the strategy) belongs to the `trades-starters-nicknames`
  registry entry → **T-242**, not here.

Acceptance criteria:
- [ ] Each Group-A output injected; `inject(base,bundle)` == `compile(bundle)` on the full corpus (INV-BYTES).
- [ ] Each migration is an isolated, revertible step (failure localizes to one output).

## Progress log
- **2026-07-27** — Created (Phase 3).
- **2026-08-01** — Started. Branch `feature/T-239-inject-group-a-fixed` off `feature/T-238-…` (T-238's
  injector skeleton is not on master yet; the batch is manually tested together). Plan + base audit
  above written before any code: read each Group-A writer to find its *decision rule*, and read
  `include/` to find what the TM macro bakes into code. Two findings changed the plan — the TM base
  refactor (step 6) and starters belonging to T-242.

## Outcome
