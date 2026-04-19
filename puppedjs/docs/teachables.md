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
