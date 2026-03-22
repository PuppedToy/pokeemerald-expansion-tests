# PuppedJS — Session Reference

## What This Is

A Node.js randomizer/rebalancer for a Pokémon Emerald romhack built on the `pokeemerald-expansion` base. It reads the game's C source files, processes all Pokémon/moves/abilities data, applies random rebalancing, then writes modified C files back and generates an HTML viewer.

## Entry Point & Flow

```
randomize_and_make.sh
  └─ node ./puppedjs/index.js     ← parses source, rebalances, writes game files + HTML
  └─ make -j                      ← compiles the ROM
  └─ git reset --hard             ← undoes all file changes (keeps the compiled ROM)
```

`randomize_and_make_for_debug.sh` exists too (presumably passes `--debug`).

## puppedjs/ File Map

| File | Role |
|---|---|
| `index.js` | Orchestrator: reads all source C files, builds Pokémon/move data, calls rebalancer, calls writer |
| `constants.js` | All shared constants (tiers, EVO types, template replacements, MEGA_TRAINERS list, etc.) |
| `rebalancer.js` | Randomly mutates stats/types/abilities/learnsets with configurable chances. Family-tracking propagates changes across evolutions |
| `rating.js` | Rates Pokémon (absolute score 0–10 + tier) and moves. Drives moveset selection for trainers |
| `writer.js` | Generates trainer C files, static replacement scripts, wildmon tables, and the HTML viewer |
| `pokemonWriter.js` | Writes per-species C data files back into `src/data/pokemon/species_info/` |
| `trainers.js` | Trainer definitions with restrictions (type, ability, mega, gym reward) |
| `wild.js` | Wild encounter tables per route |
| `items.js` | Item lists (plates, berries, etc.) used by rating |
| `constants.js` | `OUTPUT_DIR = 'output'`, `TEMPLATE_FILE = 'template.html'` |

## Data Sources Read (relative to repo root)

- `src/data/pokemon/species_info/gen_1…9_families.h` — base stats, types, abilities, evolutions
- `src/data/pokemon/level_up_learnsets/gen_1…9.h`
- `src/data/pokemon/teachable_learnsets.h`
- `src/data/abilities.h`
- `src/data/moves_info.h`
- `src/data/pokemon/form_change_tables.h` — mega evo stone mappings
- Various `data/maps/*/scripts.inc` — static event Pokémon (Regis, Mew, gym rewards)

## Output Files Written

- `puppedjs/output/out.html` — standalone viewer (template + inlined JS data)
- `puppedjs/output/pokes.js`, `moves.js`, `abilities.js`, `trainers.js`, `wildpokes.js` — data modules
- `puppedjs/pokes.json`, `moves.json`, `abilities.json`, `level_up_learnsets.json`, `teachable_learnsets.json`, `evoTree.json` — JSON snapshots
- Modified source C files (rolled back by `git reset --hard` after `make`)

## Tier System

Tiers assigned by `ratePokemon()` based on a 0–10 `absoluteRating` score:

| Tier | Threshold |
|---|---|
| GOD | ≥ 9.5 |
| LEGEND | ≥ 9 |
| PREMIUM | ≥ 8 |
| STRONG | ≥ 7 |
| AVERAGE | ≥ 6 |
| WEAK | ≥ 5 |
| BAD | < 5 |

BST thresholds (GOD=710, LEGEND=660, PREMIUM=600, STRONG=540, AVERAGE=480, WEAK=400) also feed into the rating.

## Rebalancer Behaviour

- `BALANCE_CHANCE = 0.2` — only 20% of Pokémon get random changes
- Stats: ±10 per roll, can stack, chance halves per stat changed
- Types, abilities, learnset moves each have separate small chances
- Family tracking: changes on a base form propagate to evolutions (same family key)
- `BANNED_ABILITIES` list prevents rebalancing form-locked abilities

## Skipped Pokémon

Families in `REMOVED_FAMILIES` (Unown, Arceus, Genesect, etc.) and species in `REMOVED_SPECIES` (cosplay/cap Pikachus, G-Max forms, Totem forms) are excluded from all processing.

## HTML Viewer

`output/template.html` is the source template. `writer.js` replaces placeholder `<script src="*.js">` tags with inline data to produce `out.html`. The viewer has tabs: Pokédex, Moves, Locations, Trainers, Abilities. Clicking any Pokémon card opens a modal with full detail.

**Known past bug (fixed):** Modal close-on-backdrop-click only worked on the right side of the screen. Root cause: `modalBg.addEventListener` was used but `.modal-bg` had `z-index:-1` inside an un-positioned parent, making it unreliable. Fixed by listening on `.modal` itself with `e.target === modal` guard.

## Special Cases

- **Starters**: Treecko/Torchic/Mudkip are hardcoded in `starter_choose.c`; extra starters (Bagon, Larvitar, etc.) are also defined there
- **Rayquaza**: Always uses its Mega rating regardless of evo state
- **Nidoran families**: Split into two custom families (`P_FAMILY_NIDORAN_M` / `_F`) via `CUSTOM_FAMILIES`
- **Mega trainers**: 21 hardcoded trainers across Routes 111–129 and Mt. Pyre that receive mega Pokémon (see `MEGA_TRAINERS` in constants)

## Running

```bash
# Full run (randomizes + compiles + resets git)
./randomize_and_make.sh

# Clean build
./randomize_and_make.sh clean

# Debug mode (passes --debug to index.js)
./randomize_and_make_for_debug.sh

# Just regenerate HTML/data without compiling
node ./puppedjs/index.js
```
