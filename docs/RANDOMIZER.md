# Randomizer Architecture

## Responsibility split

| Layer | Responsibility |
|-------|---------------|
| **Browser (frontend)** | All randomization: Pokédex, trainer teams, starters, wild encounters, docs |
| **Backend (Node/Express)** | Static file serving + future ROM compilation (Phase H) |

The backend **never runs randomizer code**. It only serves `frontend/` (including pre-built
assets) and will eventually receive a finished bundle to compile ROMs from.

---

## Pre-cook build step

```
node build.js
```

Runs once after any change to base game source files (`.h` species/learnset/moves).

**What it produces:**

| Output | Size | Purpose |
|--------|------|---------|
| `frontend/data/base-data.json` | ~4 MB | Parsed game data (species, moves, learnsets, abilities). Fetched by the browser once. |
| `frontend/js/randomizer.bundle.js` | ~500 KB | All randomizer modules bundled into a browser IIFE via esbuild. |

`base-data.json` contains the output of `parseBaseData()` from `randomizer/modules/pokedexModule.js` —
the deterministic parse of `.h` source files with no RNG. It is JSON-serializable (no Sets, no file paths).

---

## Web Worker pipeline

The browser spawns `randomizer.bundle.js` as a classic Web Worker.

```
Main thread                          Worker (randomizer.bundle.js)
──────────────────────────────────   ──────────────────────────────────────────
postMessage({ type:'generate',  →   fetch /data/base-data.json (once, cached)
             config })               rng.seed(config.seed)
                                     runPokedexModule(config, baseData)
                                     runTrainersModule(pokedex, config)
                                     runStartersModule(pokedex.pokes)
                                     runWildModule(pokedex.pokes, starters, wildData)
  ← postMessage({ type:'progress' }) [repeat above per ROM for nuzlocke/soullink]
                                     writerDocs(pokedex, trainers, starters, wild, baseSeed?)
  ← postMessage({ type:'done',       → { trainersResultsSimplified, wildPokes }
                  bundle })          bundle assembled and returned
```

Progress messages: `{ type: 'progress', pct: 0–100, step: '...' }`
Done message: `{ type: 'done', bundle: { ... } }`
Error message: `{ type: 'error', message: '...' }`

---

## Module responsibilities

| Module | File | Side effects in browser |
|--------|------|------------------------|
| `runPokedexModule` | `randomizer/modules/pokedexModule.js` | None — reads from `baseData` parameter |
| `runTrainersModule` | `randomizer/modules/trainersModule.js` | None — `randomizeItems()` skips file writes (IS_NODE guard) |
| `runStartersModule` | `randomizer/modules/startersModule.js` | None |
| `runWildModule` | `randomizer/modules/wildModule.js` | None |
| `writerDocs` | `randomizer/writerDocs.js` | None — pure computation, returns data directly |

### `parseBaseData` vs `runPokedexModule`

`parseBaseData()` reads `.h` source files and returns raw parsed objects. It is called by:
- `node build.js` (pre-cook, Node only)
- `analyze.js` and `make.js` indirectly via `runPokedexModule(config)` with no `baseData` arg (Node fallback)

`runPokedexModule(config, baseData)` applies RNG transforms (TM randomization, stat rebalancing,
contextual ratings). When `baseData` is null it calls `parseBaseData()` internally (Node fallback).

### `writerDocs` vs `writer`

`writer.js` writes game source files (trainers.party, wild_encounters.json, etc.) and produces
the HTML viewer. Used by `make.js` and `analyze.js` for full ROM production.

`writerDocs.js` performs the same trainer resolution and wildPokes assembly but returns the data
directly without any file I/O. Used by the browser Worker and `backend/generator.js`.

---

## Session bundle schema (v2)

```jsonc
{
  "formatVersion": 2,
  "generatedAt": "ISO timestamp",
  "sessionId": "uuid",
  "config": { "runType", "seed", "difficulty", "rebalance", ... },
  "sharedData": {
    "pokedex": { ... } | null,
    "trainers": { ... } | null,
    "starters": { ... } | null,
    "players": [ { playerIndex, starters, ... } ]  // soul-link only
  },
  "roms": [
    {
      "romIndex": 0,
      "playerIndex": 0,  // soul-link only
      "artifacts": {
        "pokedex":  "shared" | "global" | "player-N" | { ... },
        "trainers": "shared" | "global" | "player-N" | { ... },
        "starters": "shared" | "global" | "player-N" | { ... },
        "wild":     { extraStarters, gymRewards, staticRewards, replacementLog, foundMegaEvos, ... }
      },
      "docs": {
        "trainersResultsSimplified": { ... },
        "wildPokes": [ ... ]
      }
    }
  ]
}
```

Sentinels `"shared"` / `"global"` / `"player-N"` are resolved to the actual artifact object
at ZIP generation time via `resolveArtifact()` in `frontend/js/session.js`.

---

## Shared trainer determinism (Phase J)

When trainers are shared across ROMs, tier-based Pokémon choices must be identical.
`writerDocs` accepts a `baseRngSeed` parameter. When non-null, the RNG is reseeded at
the start of each trainer slot:

```js
const slotSeed = (baseRngSeed ^ Math.imul(djb2Hash(trainer.id + ':' + slotIndex), 0x9E3779B9)) >>> 0;
rng.seed(slotSeed);
```

This makes each slot's RNG state independent of how many calls the previous slot made
(encounter slots consume variable RNG via moveset/IV selection).

The `baseSeed` to pass:
- Shared nuzlocke: `cfg.seed`
- Per-player soul-link: `(cfg.seed ^ (playerIndex * 0x9E3779B9)) >>> 0`
- Per-ROM trainers: `null` (existing variable-RNG behaviour)

---

## CLI tools

### `analyze.js`

Quick randomization health check. Runs the full pipeline, writes game source files,
generates `randomizer/output/out.html`, then restores source files.

Aborts before running if `data/` has uncommitted changes (guard against silent data loss).

### `make.js`

Full ROM production pipeline.

```
--randomize   Run the randomizer, then compile the ROM(s)
--bundle=...  Compile ROM(s) from a pre-generated bundle (skip randomization)
--seed=N      Fix the RNG seed
--difficulty  easy | fair | hard
--no-balance  Skip stat rebalancing
--debug       Level 5 teams, useful for fast testing
--clean       Clean build before compiling
```

Bundle mode resolves trainer-sharing-aware ROM seeds via `resolveRomSeed(rom, seed)`,
matching the seed logic used by the browser Worker and `backend/generator.js`.

---

## Adding a new run type

1. Add a new `runType` value to the config form (`frontend/js/config-form.js`).
2. Add a `generate<RunType>` handler in `frontend/js/randomizer-worker.js`.
3. Add the same handler in `backend/generator.js` (for the transitional server-side path).
4. Update `make.js` bundle mode if the new run type has a new sharing pattern.
5. Add a review renderer case in `renderReview()` in `frontend/js/app.js`.
