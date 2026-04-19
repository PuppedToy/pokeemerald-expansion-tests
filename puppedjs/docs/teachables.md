# Per-Run TM Teachable Expansion

## Why it exists

The TM list is randomized each run, but `teachable_learnsets.h` (generated once by `make_teachables.py`) only reflects the base game's TM set. Without expansion, most of the randomized TM pool has zero pokemon that can learn it, making the TM system brittle and narrow. This feature rebuilds each pokemon's teachable list at runtime so it reflects the actual TMs in the current game.

## How it works (per pokemon)

Runs in `buildRunTeachables()` inside `puppedjs/teachableExpander.js`, orchestrated by `expandAllTeachables()`. Called twice per pipeline run:
1. In `index.js` after assembly, using the pre-randomization TM pool (for rating/moveset selection).
2. In `writer.js` after TM randomization, using the freshly randomized pool — this second pass is the one that produces the data written to `teachable_learnsets.h`.

**Inputs:**
- `poke.teachables` — the official teachable list from `teachable_learnsets.h`
- `tmPool` — the Set of `MOVE_*` IDs in this run's TM list (from `tms_hms.h`)
- `moves` — the full moves dictionary (for type lookup)

**Step 1 — Partition existing teachables:**
- `officialTMs` = moves in both `poke.teachables` AND `tmPool` (not HMs) — these the pokemon officially knows and have a TM this run
- `hmMoves` = moves in `HM_MOVES` constant — always preserved unchanged
- `oldTeachables` = moves in `poke.teachables` that are NOT in `tmPool` and NOT HMs — the pokemon used to have a TM for these, but this run's TM pool doesn't include that move

**Step 2 — Random expansion:**
Loop through the remaining TMs (in `tmPool`, not already in `officialTMs`, not HMs) in shuffled order. For each TM:

```
isSameType = poke.parsedTypes includes move.type
chance = isSameType
  ? max(0, SAME_TYPE_TM_BASE_CHANCE  - totalLearned) / 100   // starts at 100%
  : max(0, DIFFERENT_TYPE_TM_BASE_CHANCE - totalLearned) / 100  // starts at 35%

if chance > 0 and random() < chance → add to newTeachables, increment totalLearned
```

`totalLearned` starts at `officialTMs.length` and increments with every TM added (same-type or not), so the chance decreases globally. The different-type chance hits 0 when `totalLearned == 35`, meaning at most 35 total TMs can be learned before different-type expansion stops.

**Constants** (defined at top of `puppedjs/teachableExpander.js`):
- `SAME_TYPE_TM_BASE_CHANCE = 100`
- `DIFFERENT_TYPE_TM_BASE_CHANCE = 35`

**Step 3 — Output fields set on poke:**
| Field | Contents |
|-------|----------|
| `poke.teachables` | Final list: `[...officialTMs, ...newTeachables, ...hmMoves]` |
| `poke.newTeachables` | Only the randomly-added TMs for this run |
| `poke.oldTeachables` | TMs the pokemon used to have, but no TM for that move exists this run |

## Game file write-back

`editTeachableLearnsets()` in `puppedjs/pokemonWriter.js` rewrites `src/data/pokemon/teachable_learnsets.h` using the updated `poke.teachables`. It scans for `static const u16 sXxxTeachableLearnset[]` arrays, matches each to its pokemon by `poke.teachableLearnset`, and replaces the array body with the new move list.

**Important:** `analyze.js` is for HTML analysis only — it writes the file then immediately runs `git restore src/`. The game is never compiled from the modified file. To get expanded teachables in-game, use `randomize_and_make.sh`, which runs `index.js` → `make` → `git reset --hard` in that order.

## How the game reads teachables at runtime

`src/pokemon.c` (`GetSpeciesTeachableLearnset` / `CanMonLearnTMHM`, lines ~5643–5677) reads `gSpeciesInfo[species].teachableLearnset`, which points to the array defined in `teachable_learnsets.h`. The check is a simple linear scan: `if (teachableLearnset[i] == move)`. The array must contain the exact `MOVE_*` constant value written into `tms_hms.h` for that TM slot; there is no fuzzy matching.

## Why teachable_learnsets.h must be the last file touched before make

The Makefile contains this rule:
```makefile
TEACHABLE_DEPS := $(ALL_LEARNABLES_JSON) $(shell find data/ -type f -name '*.inc') \
    $(INCLUDE_DIRS)/constants/tms_hms.h $(INCLUDE_DIRS)/config/pokemon.h $(C_SUBDIR)/pokemon.c
$(DATA_SRC_SUBDIR)/pokemon/teachable_learnsets.h: $(TEACHABLE_DEPS)
    python3 $(LEARNSET_HELPERS_DIR)/make_teachables.py $<
```

If **any** dep in `TEACHABLE_DEPS` has a newer timestamp than `teachable_learnsets.h`, Make calls `make_teachables.py` to regenerate the file — **wiping the expanded teachables**.

Two deps were found to be newer in practice:

**1. `data/**/*.inc` files** — `writer.js` writes to many `data/maps/**/scripts.inc` files (gym trainers, route items, mega trainer assignments). Originally `savePokemonData` ran early in `writer.js`; those `.inc` writes happened later, making them newer. Fix: `savePokemonData` is now called **last** in `writer.js`, after all `data/` writes.

**2. `tools/learnset_helpers/build/all_learnables.json`** — this intermediate file is built by Make on demand (when it doesn't exist, or after `make clean`). When Make needs to build it at the start of the `make -j` run, its timestamp becomes NOW — newer than `teachable_learnsets.h`, which was written seconds earlier by `node`. This is impossible to fix purely in JS.

**The definitive fix:** the Makefile rule was changed to only run `make_teachables.py` if the file doesn't exist yet:
```makefile
$(DATA_SRC_SUBDIR)/pokemon/teachable_learnsets.h: $(TEACHABLE_DEPS)
    @test -f $@ || python3 $(LEARNSET_HELPERS_DIR)/make_teachables.py $<
```

Since `teachable_learnsets.h` is committed to the repo, it's always present. Make will never regenerate it during a normal build — it only runs `make_teachables.py` on a completely fresh checkout that lacks the file. The JS pipeline owns the file's content; `git reset --hard` at the end of each run restores the base game data.

A `touch` approach (setting the file's timestamp newer than `all_learnables.json`) was tried first but failed: `all_learnables.json` is built by Make ON DEMAND during `make -j`, giving it a timestamp that is always newer than any `touch` applied before Make starts.

## Two-pass architecture and docs/game sync

`expandAllTeachables` runs twice per pipeline invocation:

1. **Pass 1** — in `index.js`, immediately after pokemon assembly, using the **pre-randomization** TM pool. This feeds `ratePokemon()` and `chooseMoveset()` so move selection reflects this run's actual TM availability.
2. **Pass 2** — in `writer.js`, after `tmRandomizer` has written the final `tms_hms.h`. This pass overwrites the pass-1 results and produces the `poke.teachables` values that are (a) written to `teachable_learnsets.h` for compilation and (b) embedded in `pokes.js` for the HTML viewer.

**Critical consequence:** The HTML viewer (`out.html`) and the compiled ROM are always generated from the same pipeline run — they both come from pass 2. If the HTML and the ROM are from **different runs** (e.g. one directory generates docs, another generates the ROM), a move shown in the HTML with ⭐️ may not be in the compiled game's teachable array. Always compare docs and ROM from the same `randomize_and_make.sh` invocation.

## Verifying the feature ran correctly

Check the `[TEACHABLE-DEBUG]` and `[TEACHABLE-TIMESTAMP-*]` lines in the run log:

```
[TEACHABLE-DEBUG] expandAllTeachables done: 1203 pokemon processed, 1203 gained new teachables, N total new moves added.
[TEACHABLE-DEBUG] expandAllTeachables done: 1187 pokemon processed, 1187 gained new teachables, N total new moves added.
[TEACHABLE-DEBUG] editTeachableLearnsets: 1101 arrays found, 1076 matched to pokemon, 1076 successfully replaced.
[TEACHABLE-TIMESTAMP-OK] teachable_learnsets.h (...) is newer than all TEACHABLE_DEPS. Make will NOT regenerate it.
```

- Two `expandAllTeachables` lines = both passes ran (pass 1 in `index.js`, pass 2 in `writer.js`).
- `editTeachableLearnsets` line: "successfully replaced" should equal "matched". Any "REPLACE FAILED" means a string-replace mismatch — investigate line-ending or whitespace differences.
- The ~25 unmatched arrays (1101 found, 1076 matched) are learnsets for species not in this run's list — expected.
- `TEACHABLE-TIMESTAMP-OK` = `teachable_learnsets.h` is newer than all TEACHABLE_DEPS; `make_teachables.py` will not fire.
- `TEACHABLE-TIMESTAMP-WARNING` = lists exactly which dep is newer — the `touch` in the shell script should prevent this, but if seen, it identifies the culprit.
- `TEACHABLE-MISMATCH` in `error_log.txt` = a C array name was matched to a pokemon whose ID doesn't contain the expected species fragment. False positives expected for Alola/regional forms (e.g. `sRattataAlolaTeachableLearnset` → `SPECIES_RATTATA_ALOLA`). Any other mismatch is a real data swap.
- `TEACHABLE-DUPE` in `error_log.txt` = two pokemon share the same `teachableLearnset` array name. Expected for megas, forms, and regional variants that share the base species array. Not a bug.

## --all-tms mode

When `--all-tms` is passed (`tmPool === null`), `buildRunTeachables` returns immediately without modifying teachables. `newTeachables` and `oldTeachables` are not set on the poke object. The template handles this gracefully with `|| []` guards.

## HTML viewer display

In `buildTeachablesList()` (`puppedjs/output/template.html`):
- Moves in `newTeachables` are shown with a ⭐️ prefix
- If `oldTeachables` is non-empty, a greyed-out **"No TM this run:"** section is appended listing those moves at reduced opacity

## Expected TM count per pokemon

A typical pokemon with ~20 official TMs and a mix of types will end up with roughly 30–40 TMs this run:
- Same-type TMs are very likely to be added (starts at ~80% after 20 official TMs)
- Different-type TMs are added until `totalLearned` reaches 35, which caps that expansion at ~15 more
- Pokemon with more same-type coverage in the TM pool will learn more total TMs
