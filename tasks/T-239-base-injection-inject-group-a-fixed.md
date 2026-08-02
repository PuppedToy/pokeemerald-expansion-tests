---
id: T-239
title: "Base+injection Phase 3 — inject Group A (fixed-size: stats/moves/evos/wild/starters/TM/prices/items)"
status: in-progress
type: feature
created: 2026-07-27
updated: 2026-08-02
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

- **2026-08-01 — ALL SIX WRITERS DONE (local): 9 new files, 77 new tests, suite 1960 + backend 214 green.**
  Every file RED-first. What was built and the decisions inside it:
  - **`gameConstants.js`** — the base's `include/constants/*.h` as name→number (`#define` *and* `enum`,
    since move categories / evolution methods / conditions are enums). Alias chains and `(NAME + 1)`
    arithmetic resolve; a value that depends on build config (`(I_PRICE >= GEN_9) ? …`) and a name defined
    twice in two `#if` arms are **refused**, not guessed. Same rule as offsets from the `.map`: the ids
    live in the base, never re-typed here (an upstream sync renumbers species — ADR-012).
  - **`structLayout.js`** — the field offsets, declared from the headers and **verified against the base's
    own data** before any write: Bulbasaur 45/49/49/45/65/65 GRASS/POISON OVERGROW/-/CHLOROPHYLL,
    Miraidon (id 1401 — the anchor that proves the *stride*, not just the offsets), Pound/Ember/Growl/
    Psychic, Poké Ball 200 / Master Ball 1000. Strides are derived (`size / entryCount`, needs the
    `.sym`). `SpeciesInfo.evolutions` sits past the `#if P_GENDER_DIFFERENCES` / `P_FOOTPRINTS` /
    `OW_POKEMON_OBJECT_EVENTS` block, so it is **found**, not declared: the only pointer in Bulbasaur's
    struct whose target decodes as `{EVO_LEVEL, 16, SPECIES_IVYSAUR}` + sentinel. Two candidates → throw.
  - **`context.js`** — constants + layout + the anchor check, once per ROM. A base the layout doesn't
    match stops all six writers before the first byte.
  - **The six writers.** Each mirrors its writer's *decision rule*, which is the part that decides
    INV-BYTES:
    - `species` — stats/types/abilities only when the rebalance **log** names that target (the writer
      rewrites a line only then); `MON_TYPES(t)` fills both slots; a non-type config token (B-010) leaves
      the base's byte alone, because the writer emits it verbatim; held items zeroed for **every** species
      (T-077), not just the bundle's.
    - `moves` — power/accuracy/type/category, log-driven; all four are bit-fields in one word shared with
      `target`, so RMW with per-bit ownership (a test pins that the neighbours survive).
    - `evolutions` — reuses `buildEvoLevelMapFromParams` over the same `BANNED_SPECIES_FOR_PICKING`-filtered
      list writer.js builds; target-keyed and global like the regexes, plain tuples only (`params == NULL`),
      stones only in the exact single-`IF_MIN_LEVEL` shape.
    - `wildEncounters` — runs `writer.applyWildPlanToEncounters` (or `substituteWildSpecies` for a
      pre-T-162 bundle) over the base JSON and writes only the `u16 species` that differ. Each generated
      `<base_label>_<Type>Mons` array is **proved** by matching the ROM's bytes against the base JSON
      (species *and* levels), so a time-of-day infix, a name collision or a map from another build fails
      loudly. Exercised against the real 128-map JSON.
    - `itemPrices` — runs `itemPriceWriter.patchPricesInContent` over the base's `items.h` and injects the
      diff, which inherits the writer's narrower-than-obvious rule for free (numeric `.price` lines only,
      so Serious Mint's ternary is untouched).
    - `tmMoves` — the `moveId` column only, after checking the `itemId` column is `ITEM_TM01, TM02, …`
      (the table is indexed, so a wrong index teaches the wrong machine).
  - **`modules/groupAFixed.js`** + the registry entry flipped to `migrated`, required **lazily** so
    `require('injector')` (mode switch, offset-map CLI) doesn't drag writer.js's import graph in.
  - **`backend/build/golden-corpus/parity.mjs`** — the GATE-3 harness: inject every frozen bundle and diff
    against `manifest.json` (which already holds the compile-path hashes), `--explain` rebuilding the
    mismatching bundle through the compile path and printing the differing regions with their owning
    symbol. Refuses to be read as a pass while modules are pending unless `--allow-pending`.
  - **One base change was unavoidable** (audited before coding, see the Plan): `GetItemTMHMMoveId()` in
    `include/item.h` was an inline switch generated from `FOREACH_TM` — the TM list compiled into *code*,
    in 3 callers. It now reads `gTMHMItemMoveIds`, which every other consumer already did. Behaviour
    identical (index 0 is the `{ITEM_NONE, MOVE_NONE}` failsafe = the old `default`). **This changes the
    base ROM, so the golden base + corpus must be re-snapshotted before parity means anything.**
  - **Two Group-A rows of the strategy table were wrong and are fixed there:** the starter trio belongs to
    T-242's registry entry, and route/mail items stopped being map data when T-236 moved placement into
    `gItemPicks` — `writer.js`'s mail-mint loop matches **0** tokens under `data/maps/**` today (logged as
    dead code in [[T-247]], not fixed here).
  - **Hazard found while writing `evolutions`:** if the base folded two identical
    `CONDITIONS({IF_MIN_LEVEL, n})` literals into one object and their targets want different levels, the
    output is not injectable byte-for-byte at all. The module refuses before writing anything instead of
    mis-levelling one of them; whether the real base folds them is on the validation checklist below.
  - T-238's registry-state tests were updated (the board advanced: T-239 migrated, four pending) and the
    backend's no-op parity test now drives the wiring with an explicit all-pending module set — plus a new
    one asserting that a base lacking the Group-A tables fails loudly. Both noted as deliberate
    specification changes, not weakened tests.
  - No changelog line: internal infrastructure, nothing user-visible yet (same call as T-232/T-238).
- **2026-08-02 — READ-ONLY VALIDATION ON THE BOX (no rebuild, no re-snapshot; owner's call). One real
  bug found and fixed; the structural assumptions hold; the rest is blocked on a clean base.**
  Ran a throwaway container against `/opt/emerald-t237` (mounted read-only) with the injector overlaid
  from `/tmp`; nothing was written and the scratch was removed afterwards.
  - **First, an artefact problem:** that tree's `.map` and `.sym` were from **different builds** (every
    symbol 8 B apart — the `.sym` was T-238's, the `.map` newer). Regenerated the `.sym` from the tree's
    own `pokeemerald.elf` with the Makefile's rule → 95,794 symbols, addresses matching the `.map`.
  - **BUG (would have corrupted every ROM): `struct SpeciesInfo` is 260 B (0x104), not 196 B.** The
    `/*0xC4*/` in `include/pokemon.h` is upstream's stale comment; this base's config tail
    (`P_GENDER_DIFFERENCES` / `P_FOOTPRINTS` / `OW_POKEMON_OBJECT_EVENTS`) adds 64 B. Proved three ways:
    the stat runs of Bulbasaur/Ivysaur/Venusaur sit **260 B apart** at 0x66c4c4/0x66c5c8/0x66c6cc; the
    symbol is 396,500 B = 260 × 1525 (`NUM_SPECIES + 1`, so the array does have a SPECIES_EGG entry); and
    `gSpeciesInfo[0]` back-computes to 0x66c3c0 = exactly the `.map`'s address. Fixed by **deriving** the
    stride (`size / entry count`, trying `NUM_SPECIES + 1` then `NUM_SPECIES`) and deleting the declared
    constant — a stride is now as underivable-by-hand as an offset. The anchors caught this before a
    single byte was written, which is the whole reason they exist. The fixture ROMs also had to be
    re-spaced: at 260 B/entry gSpeciesInfo is ~390 KB and was overlapping the move table.
  - **Confirmed on real bytes:** the stat and type field offsets (the anchor search matches
    `stats + types` as one run); `gTMHMItemMoveIds` = 104 entries with the `{ITEM_NONE, MOVE_NONE}`
    failsafe and an `itemId` column of exactly ITEM_TM01…TM95 in order (the assumption the whole TM
    module indexes on); **all five modules READY**, with the Group-A entry matching **165** wild-table
    symbols — exactly the 165 tables in `wild_encounters.json`, i.e. one symbol per table.
  - **The generator does add a time-of-day infix** — the tables are `gRoute101_Morning_LandMons`, not
    `gRoute101_LandMons`. The optional-infix pattern written before this run matched all 165 with exactly
    one candidate each, so no code change was needed; good thing it was not anchored tighter.
  - Budget unchanged: 25,205,625 B / 32 MB = **75.12 %**, 7.96 MB free.
  - **What could NOT be validated, and why:** `/opt/emerald-t237/pokeemerald.gba` is **not the golden
    base any more** — it is a leftover corpus ROM (its TM table matches five corpus bundles; Miraidon's
    attack reads 75 vs the source's 85; Bulbasaur→Ivysaur is level 20 vs the base's 16). The repo-root
    `pokeemerald.gba/.map/.elf` are simply the *last build's* output, and the tree's generated sources
    (`tms_hms.h`, `wild_encounters.json`) had drifted with it. So the anchor pass, the wild/TM content
    match, the `.evolutions` field and the folded-`CONDITIONS()` question all need a clean base build.
    The injector refused to inject into it — which is the guard working, not a failure.
  - Two things the next step must do: build the base from a **clean** tree, and keep its
    `.gba` + `.map` + `.sym` (regenerated from the same ELF) in a directory corpus builds never
    overwrite — `base/`, which is where `resolveBasePaths()` already looks.
  - Diagnostic run only: the evolutions field is at **+0xA0** in this build (found by the level-agnostic
    fallback), so the strict resolver's mechanism works; the value it asserts (level 16) is what marks a
    ROM as "not the base".

  - **Still open — all of it box-side, none of it verifiable locally (no toolchain here):**
    1. Build the base from a **clean** tree on PRO (with the `include/item.h` change), keep
       `.gba`/`.map`/`.sym` under `base/` where corpus builds cannot overwrite them, then **re-snapshot
       the corpus** (build-and-hash.sh) → new golden base + `manifest.json`. Owner decision: it
       invalidates the current hashes.
    2. `buildOffsetMap.js` readiness on the new base + the ROM budget. *(Already answered against a
       corpus ROM on 2026-08-02: all five modules READY, 165 wild tables matched, 75.12 % budget.)*
    3. Confirm on the clean base: the anchors pass, `resolveEvolutionsOffset` finds exactly one
       candidate, the wild tables byte-match `wild_encounters.json`, the TM `moveId` column matches
       `tms_hms.h`, and **no** two stone evolutions share a folded `CONDITIONS()` object.
    4. `parity.mjs --allow-pending --explain` over the corpus: every differing region must belong to a
       still-pending module (T-240…T-243) — that is GATE-3 for Group A.

## Outcome
