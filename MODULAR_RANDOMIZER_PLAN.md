# Modular Randomizer Plan

## Context

The current randomizer is a monolithic Node.js pipeline (`randomizer/index.js` → `writer.js`) that runs all four randomization domains in a single locked sequence. Modularizing into four independent units enables:

- **Batch generation**: produce N ROMs where configurable subsets share the same Pokédex, trainers, or starters
- **Nuzlocke re-runs**: same Pokédex + Trainers + Starters, fresh Wild per run
- **Soul-link**: a configuration template layered on top of batch generation (not a separate mode)
- **Web frontend**: a future site sends a config JSON to a server and receives artifacts back
- **Versioning & trust**: every artifact carries a `schemaVersion` so the server can reject stale ones

---

## Files Critical to This Work

| File | Size | Role |
|------|------|------|
| `randomizer/index.js` | ~850 lines | Main orchestrator — parsing + rating + rebalance + calls writer |
| `randomizer/writer.js` | ~1,900 lines | Output orchestrator — TMs, items, trainers, wild, starters, HTML viewer |
| `randomizer/rating.js` | ~3,000 lines | Scoring engine — `rateMove`, `ratePokemon`, `chooseMoveset` |
| `randomizer/rebalancer.js` | ~450 lines | Probabilistic stat/type/move mutations |
| `randomizer/trainers.js` | ~5,200 lines | All trainer team definitions + team assembly |
| `randomizer/wild.js` | ~664 lines | Wild encounter tier rules + route definitions |
| `randomizer/tmRandomizer.js` | ~188 lines | Randomizes which move is in each TM slot |
| `randomizer/itemRandomizer.js` | ~543 lines | Randomizes item drops at ~40 world locations |
| `randomizer/teachableExpander.js` | ~320 lines | Builds per-Pokémon TM teachable lists |
| `randomizer/constants.js` | ~448 lines | Tier thresholds, BST limits, banned lists |
| `randomizer/presets.js` | ~436 lines | Difficulty presets + trainer tier assignments |
| `randomizer/config.json` | 3 bytes | User-facing feel settings |

---

## Phase 0 — Testing Infrastructure ✅

Every `Math.random()` call routes through `rng.random()`. Tests call `rng.seed(N)` for determinism.

Files updated: `rebalancer.js`, `writer.js`, `tmRandomizer.js`, `itemRandomizer.js`, `teachableExpander.js`, `rating.js`, `trainers.js`, `evoLevelWriter.js`.

Jest test suite: `randomizer/package.json` → `npm test`.

```
randomizer/__tests__/
  unit/
    rateMove.test.js          ✅ 24 tests
    rebalancer.test.js        ✅ 8 tests
    rebalancerConfig.test.js  ✅ 3 tests
    teachableExpander.test.js ✅ 9 tests
    config.test.js            ✅ 34 tests
  fixtures/
    miniMoves.js, miniPokes.js, miniAbilities.js
```

---

## Phase 1 — Config System ✅

`config.json` holds **feel settings** — things an end user tweaks. Not a pipeline control file.

### Config Schema (`randomizer/config.json`)

```json
{
  "seed": null,
  "difficulty": "fair",
  "rebalance": true,
  "balanceChance": 0.2,
  "numROMs": 1,
  "sharedModules": 4
}
```

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `seed` | `integer \| null` | `null` | `null` = auto-generate. Same seed = identical output. |
| `difficulty` | `"easy" \| "fair" \| "hard"` | `"fair"` | Maps to `presets.js` tier transform logic |
| `rebalance` | `boolean` | `true` | Whether to run `rebalancer.js` mutations |
| `balanceChance` | `float 0–1` | `0.2` | Fraction of Pokémon that get rebalanced. `0` = none. |
| `numROMs` | `integer ≥ 1` | `1` | Number of ROMs to generate in one batch |
| `sharedModules` | `1 \| 2 \| 3 \| 4` | `4` | Which modules are shared across all ROMs — see Batch section |

`mode` was removed. Nuzlocke and soul-link are configuration templates (see Batch section), not pipeline modes.

CLI flags `--difficulty=`, `--no-balance`, `--seed=`, `--balance-chance=` remain as overrides.

**Implemented**: `config.js` exports `loadConfig / getConfig / resetConfig / parseCLIArgs`.  
**Wired**: `rebalancer.js` reads `getConfig().balanceChance` instead of a hardcoded literal.  
**Pending**: `index.js` still reads `process.argv` directly for `difficulty` and `noBalance` — this gets resolved in Phase 2 when `index.js` becomes a thin orchestrator.

---

## Phase 2 — Pipeline Modularization

### Four Modules

| # | Module | What it does | Consumes | Produces |
|---|--------|-------------|---------|---------|
| 1 | **Pokedex** | Parse source files, rate Pokémon, rebalance stats/types/moves, randomize TMs, expand teachables | Source files | `pokedex.json` |
| 2 | **Trainers** | Assign trainer teams (using pokedex ratings + TM pool), assign world items | `pokedex.json` | `trainers.json` |
| 3 | **Starters** | Pick 3 starter Pokémon (type-triangle rule, UU tier) | `pokedex.json` | `starters.json` |
| 4 | **Wild** | Assign wild encounters per route, pick gym-boss Pokémon rewards | `pokedex.json` | `wild.json` |

**Why TM randomization is in Module 1:** TMs determine which moves are teachable to each Pokémon, and teachable moves directly affect ratings (which Pokémon qualify for which trainer slots). Module 2 (trainers) needs final ratings, so TM randomization must complete before Module 2 starts. Module 1 is the natural home.

**Why this isn't two-pass teachables:** The old plan had a "pre-TM" rating pass (vanilla TM pool) and a "post-TM" re-expansion. With TMs now inside Module 1, there is a single pass: randomize TMs → expand teachables → rate. Simpler and still deterministic.

### Batch Generation and Shared Modules

`sharedModules` controls which modules are generated once and reused across all `numROMs` ROMs:

| `sharedModules` | Shared (generated once) | Per-ROM (regenerated N times) | Recommended for |
|---|---|---|---|
| `1` | — | Modules 1 + 2 + 3 + 4 | Fully independent runs |
| `2` | Module 1 | Modules 2 + 3 + 4 | Same Pokédex, different everything else |
| `3` | Modules 1 + 2 | Modules 3 + 4 | Same world, different starters + wild |
| `4` | Modules 1 + 2 + 3 | Module 4 | Nuzlocke (default): same world + starters, fresh wild each run |

**Nuzlocke**: use `sharedModules: 4` (default). Modules 1–3 are fixed; only wild changes per re-run.

**Soul-link**: a config template, not a special mode. Recommended: `numROMs: 2, sharedModules: 3` (both players get the same Pokédex + trainers, but each picks their own starters and gets their own wild). Players may also choose `sharedModules: 2` or `4` for different soul-link experiences.

### Orchestrator Logic (index.js after refactor)

```js
const config = loadConfig();
rng.seed(config.seed);

// Generate shared modules once
const sharedPokedex   = config.sharedModules >= 2 ? await runPokedexModule(config)    : null;
const sharedTrainers  = config.sharedModules >= 3 ? await runTrainersModule(sharedPokedex, config) : null;
const sharedStarters  = config.sharedModules >= 4 ? runStartersModule(sharedPokedex, config)       : null;

// Per-ROM loop
for (let i = 0; i < config.numROMs; i++) {
    const pokedex  = sharedPokedex   ?? await runPokedexModule(config);
    const trainers = sharedTrainers  ?? await runTrainersModule(pokedex, config);
    const starters = sharedStarters  ?? runStartersModule(pokedex, config);
    const wild     = await runWildModule(pokedex, config);
    await writeArtifactsToROM({ pokedex, trainers, starters, wild }, config, i);
}
```

### Artifact Schemas

**`pokedex.json`** — Module 1 output:
```json
{
  "schemaVersion": 1,
  "seed": 42,
  "generatedAt": "ISO timestamp",
  "difficulty": "fair",
  "rebalance": true,
  "pokes": [{ "id": "SPECIES_BULBASAUR", "baseHP": 45, "parsedTypes": ["GRASS","POISON"],
              "learnset": [], "teachables": [], "rating": {}, "contextualRatings": {} }],
  "moves": { "MOVE_TACKLE": { "power": 40, "type": "NORMAL" } },
  "abilities": { "ABILITY_OVERGROW": { "rating": 3 } },
  "evoTree": {},
  "tmList": ["WATER_PULSE", "FLAMETHROWER"],
  "tmPool": ["MOVE_WATER_PULSE", "MOVE_FLAMETHROWER"]
}
```

**`trainers.json`** — Module 2 output:
```json
{
  "schemaVersion": 1,
  "seed": 42,
  "generatedAt": "ISO timestamp",
  "trainersData": [{ "id": "TRAINER_ROXANNE", "level": 14, "team": [] }],
  "itemAssignments": {},
  "replacementLog": { "SPECIES_REGIROCK": "SPECIES_STARMIE" }
}
```

**`starters.json`** — Module 3 output:
```json
{
  "schemaVersion": 1,
  "seed": 42,
  "generatedAt": "ISO timestamp",
  "starters": ["SPECIES_TREECKO", "SPECIES_TORCHIC", "SPECIES_MUDKIP"]
}
```

**`wild.json`** — Module 4 output:
```json
{
  "schemaVersion": 1,
  "seed": 42,
  "generatedAt": "ISO timestamp",
  "maps": [{ "id": "MAP_ROUTE101", "land": "SPECIES_SNEASEL", "old": "SPECIES_CATERPIE" }],
  "pokeRewards": { "SPECIES_GYM1_REWARD": "SPECIES_SCYTHER" }
}
```

Note: `pokedexSeed` was removed from Modules 2–4 artifacts. Soul-link integrity is enforced by the shared artifact itself, not by comparing seeds after the fact.

### Refactoring Steps (in order)

| Step | What changes | Risk | Validation |
|------|-------------|------|------------|
| **2a** ✅ | Add `numROMs` + `sharedModules` to `config.js` | Low | `config.test.js` passes |
| **2b** | Split `writer.js` into 4 runnable step functions that return artifact data | High | Existing tests pass; pipeline smoke test passes |
| **2c** | Create `modules/pokedexModule.js` wrapping index.js parse + rebalance + TMs | High | Snapshot test |
| **2d** | Create `modules/trainersModule.js` | Medium | Snapshot test |
| **2e** | Create `modules/startersModule.js` | Low | Unit test |
| **2f** | Create `modules/wildModule.js` | Medium | Snapshot test |
| **2g** | Create `writers/sourceWriter.js` (applies artifacts to ROM files) | Medium | `analyze_no_rebalance.js` produces same `out.html` |
| **2h** | Refactor `index.js` to thin batch orchestrator using config | Low | Full pipeline smoke test |

**Key risk in 2b**: `writer.js` is 1,900 lines with deeply interleaved state (`alreadyChosenFamilySet`, `tmList`, `pokemonList`). Strategy: extract each logical section into a named function that takes explicit inputs and returns data, before moving it to a module file.

---

## Phase 3 — Future Spec

### Frontend Randomizer App

**UI flows:**
- **New Run**: choose difficulty → rebalance toggle → seed (optional) → `numROMs` + `sharedModules` → Generate → download artifacts / ROM patch
- **Soul-Link**: recommended `numROMs: 2, sharedModules: 3` — UI explains what each player gets
- **Nuzlocke Re-Run**: load existing session (pre-computed Modules 1–3 artifacts) → regenerate only Module 4 with a new seed
- **Viewer**: upload artifact bundle → renders Pokédex, Trainers, Wild tables

**Data sent to server** (`POST /api/randomize`):
```json
{
  "config": { "seed": 42, "difficulty": "fair", "rebalance": true, "balanceChance": 0.2, "numROMs": 2, "sharedModules": 3 },
  "pokedexArtifact": null,
  "trainersArtifact": null
}
```

### Backend Generator Service

**Endpoints:**
- `POST /api/randomize` — run pipeline with provided config + optional pre-computed artifacts
- `GET /api/session/:id/artifacts` — retrieve session artifacts for sharing

**Validation:**
- JSON Schema validation on all `config` fields
- `schemaVersion` check: reject artifacts below `MIN_ARTIFACT_SCHEMA_VERSION`
- Rate limiting (~5–10s per full run)

---

## Verification Plan

1. `node analyze_no_rebalance.js` — produces `out.html` with correct data, no regressions
2. `node analyze.js` — full pipeline with rebalance runs without errors
3. `cd randomizer && npm test` — all tests pass
4. Batch test: `numROMs: 2, sharedModules: 3` → two different `wild.json` files, same `pokedex.json` + `trainers.json`
5. Seed test: run twice with same `seed` → identical artifacts
