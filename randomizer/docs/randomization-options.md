# Randomization options (frontend → pipeline)

The frontend config form (`frontend/js/config-form.js`) is organized into collapsible **categories**.
Each option round-trips through **Save/Load** (`frontend/js/session.js`) and the **"remember last
config"** localStorage key `lastConfig` (`frontend/js/storage.js`), and flows:

`config-form.js` → `app.js` → `randomizer-worker.cjs` `toModuleConfig()` →
`randomizer/generate.js` `runGeneration(cfg, mcfg)` → module → `bundle` → ROM writer.

**RNG caveat:** all randomization draws from one seeded stream (`randomizer/rng.js`, seeded once at
`generate.js` from `cfg.seed`). Any option that changes the *number or order* of draws changes the
whole downstream ROM for a given seed — expected (different config ⇒ different ROM). Options are
designed so that **their default values reproduce the previous behaviour byte-identically** (the two
exceptions are called out below).

This batch (T-052) has **no ROM-build impact except Rewards/money** (Step 9), which patches C source
at build time.

## Categories & options

### Pokémon mutations
Master toggle = `rebalance`; `balanceChance` (0.2) is the per-Pokémon gate. Four category toggles,
all default **on** (SoT: `randomizer/rebalancer.js`, invoked `modules/pokedexModule.js`):

| Config key | Default | Effect |
|---|---|---|
| `mutateStats` | on | ±10 base-stat shifts (stats block). |
| `mutateAbilities` | on | swap one ability (ban-list respected). |
| `mutateTypes` | on | change/add a type; **also drives** the type-change learnset edit (step 1). |
| `mutateLearnsets` | on | the independent random learnset pass (step 2). |

**Advanced** (`mutationProbs`, each falls back to its `rebalancer.js` constant): `statBalanceChance`
0.7, `buffStatChance` 0.6, `repeatStatChance` 0.5, `typeBalanceChance` 0.1, `monotypeBalanceChance`
0.1, `abilityBalanceChance` 0.1, `learnsetBalanceChance` 0.2, `changeTypeMoveFromOldChance` 0.9,
`changeTypeMoveFromOtherChance` 0.05, `moveInsertChance` 0.5, `moveRatingDeviation` 0.2.

### Evolution levels
Enable + tuning (SoT: `randomizer/evoLevelWriter.js` + `constants.js` `EVO_LEVEL_*`; gated in
`generate.js makePokedex`).

| Config key (`evoLevels.*`) | Default | Effect |
|---|---|---|
| `enabled` | true | off = keep base-game evolution levels untouched. |
| `min` / `max` | 5 / 65 | hard clamps on the computed level. |
| `deviation` | 0.05 | ± random spread. |
| `stageAdjustments.{lcOf2,lcOf3,nfeOf3}` | 0 / −0.10 / +0.10 | per-stage spacing (fraction). |
| **Advanced** `baseRanges` | per target tier (10) | base level range by the evolution *target's* tier. |
| **Advanced** `preEvoModifiers` | per holder tier (9) | fraction added by the *evolving* Pokémon's own tier. |

### Trainers & bosses
SoT: `randomizer/trainers.js` `getTrainersData` (threaded via `runTrainersModule`).

| Config key | Default | Effect |
|---|---|---|
| `gymsTypeChanged` | 2 (of 8) | how many gym leaders get a randomized type theme (internally `keep = 8 − changed`). |
| `e4TypeChanged` | 2 (of 4) | how many Elite Four get a randomized type theme (internally `keep = 4 − changed`). |
| `championTypeChangeChance` | 0.05 | probability (0‑1) the champion (Steven) also gets a randomized type; otherwise he keeps Steel. All Steven battles (Granite Cave, partner, champion) run the resulting type. |
| `aquaTypes` | Water, Dark, Poison, Ice, **Random** | Team Aqua's 5 type slots (main, secondary, other 1‑3); each a type or `RANDOM`. |
| `magmaTypes` | Fire, Ground, Rock, Grass, **Random** | Team Magma's 5 type slots. |

**Unified boss type pool (T-076).** The 13 typed bosses (8 gyms + 4 E4 + champion) share one pool.
Fixed bosses keep their canonical type; the pool is every type *not* claimed by a fixed boss; each
changed boss draws from that pool, excluding only its own canonical (so "changed" always differs). A
type freed by a changed boss in one group is therefore claimable by any other changed boss — e.g. if
Roxanne changes off Rock, another gym or an E4 can take Rock; when the champion changes, its Steel
joins the pool (and is otherwise reserved from gyms/E4).

*Behaviour change:* the Aqua/Magma **5th slot default is now `RANDOM`** (was a fixed
Flying/Fighting). The main+secondary also drive the docs card colours (`trainerColors.js`).

### Rewards (money) — ROM-build; CI/builder-verified
SoT: `src/battle_script_commands.c` `GetTrainerMoneyToGive` (committed `#define`s), patched at build
time by `randomizer/moneyWriter.js` (called from `make.js buildOneRom`; reverted by the post-build
`git checkout -- src/`). Carried in `bundle.config.money` (not a module knob).

| Config key (`money.*`) | Default | Effect |
|---|---|---|
| `normal` | 250 | regular trainer prize. |
| `boss` | 3000 | rivals/admins/Steven/Wally, etc. |
| `gym` | 5000 | gym leaders. |

Museum grunts and Space-Center grunts **derive** from `boss`: `round(boss × 2/3)`, and the 2nd museum
grunt adds $50 — so at the defaults they stay $2000 / $2050. Elite Four ($10k) and Champion ($50k)
are fixed. **Not buildable locally** (no GBA toolchain); the C compile runs in CI / on the builder.

### Starters (extra starters)
An unlimited, ordered list; each slot picks by category (SoT: `randomizer/modules/wildModule.js`
`pickExtraStartersFromSpecs` / `DEFAULT_EXTRA_STARTER_PRESET`; threaded via `runWildModule`).
Default preset = today's 9 and routes to the legacy path (byte-identical).

Each slot = `{ tier, kind, lineLength }`:
- `tier` ∈ LEGEND, UBERS, OU, UU, RU, NU, PU.
- `kind` = `line` (an early/LC Pokémon whose family's best evolution is `tier`) or `solo` (a
  non-evolving Pokémon of `tier`, early-game).
- `lineLength` = `any` | `3` | `2` (prefer a 3- or 2-stage line; falls back to any).

Default: `UBERS·line·3`, `OU·line·3`, `UU·line·any`, `NU·solo`, then `RU·line·any` ×5.
Unsatisfiable slots are skipped; the written C count (`STARTER_EXTRA_COUNT`) auto-sizes.

### Wild encounters (T-162)
SoT: `randomizer/modules/wildModule.js` `buildWildPlan` + `randomizer/writer.js`
`applyWildPlanToEncounters` (see `wild-encounters.md`). Threaded via `runWildModule(..., mcfg)`.

| Config key | Default | Effect |
|---|---|---|
| `wildEncounterType` | `deterministic` | `deterministic` = 1 predictable species per zone/method; `classic` = several per zone (random which you meet). |
| `pokemonPerZone` | 5 | classic only — species per zone (**input 2–12**), capped per method (land ≤12, surf ≤5, old ≤2, good ≤3). Revealed by the classic box. `deterministic` ≡ classic with `pokemonPerZone` = 1 (both reduce to `buildWildPlan(perZone)`). |

Super rod and static/legendary encounters are unchanged in both modes. Changes the number/order of RNG
draws, so a given seed's whole ROM differs from the pre-T-162 output (expected).

### General
`seed` (blank = random). The old generic "Advanced" block was removed; Advanced sub-panels now live
only under **Pokémon mutations** and **Evolution levels**. `showExactPositions` moved to **Docs
visibility** (T-163).

### Docs visibility (T-163)
SoT: `randomizer/docsVisibility.js` (`normalizeDocsVisibility` + `redactWildPokes`) and the trainer
redaction in `writerDocs.js` `buildTrainersResultsSimplified`. A nested `docsVisibility` object of
toggles that redact **only what the generated docs reveal** — never the ROM. Redaction is baked at
generation time (the hidden data is absent from the produced HTML, like the `showExactPositions`
precedent), so it is applied to a **separate viewer copy** (`rom.docs.viewerTrainers` +
redacted `rom.docs.wildPokes`); the ROM-authoritative `trainersResultsSimplified` is never touched
(`writer.js` builds the ROM's parties from it verbatim). Threads `config-form.js` → both
`toModuleConfig`s → `generate.js` → `writerDocs`; `writerDocs` normalizes (fills defaults, migrates the
legacy top-level `showExactPositions`).

| Config key (`docsVisibility.*`) | Default | Effect on the docs |
|---|---|---|
| `showTrainers` | true | off = remove the Trainers tab + section; also hides encounter reward cards (gate). |
| `showBosses` / `showNonBosses` | true | off = drop boss / non-boss trainer cards. |
| `showHeldItems` / `showNatures` / `showMoves` / `showAbility` | true | off = strip that field from every team member. |
| `showRewards` | true | off = hide rewards everywhere (trainer cards + Encounters reward cards). |
| `showIVs` | **false** | on = render a compact IV line per member (net-new; off strips IVs from the docs entirely). |
| `showExactPositions` | false | off = docs show the pre-shuffle order (moved here from General). |
| `hidePokemon` + `hidePokemonCount` (1–5) | false / 1 | on = collapse the last N of every team into an "(and N other Pokémon)" box (capped at size−1). |
| `showWildEncounters` | true | off = Encounters tab keeps only starters, extra starters and gated rewards. |
| `showLegendaryStatic` / `showNonLegendaryStatic` | true | off = omit that static entry (removes its card **and** its Mail inbox entry). |
| `showSuperRod` | true | off = card shows "Super-Rod encounter 1…N" instead of the species. |
| `showGrass` / `showSurf` / `showDive` / `showGoodRod` / `showOldRod` | true | off = card shows only the count of distinct encounters for that method. |

Reward encounter cards are shown ⟺ `showTrainers && showBosses && showRewards`. Per-method placeholders
apply only when `showWildEncounters` is on; when it is off the wild zones are dropped wholesale (so
their species, and any static, are absent from the Mail too). All defaults reproduce today's docs (the
one tightening: `showIVs` now strips the IVs that were previously carried-but-never-rendered).

## Testing
Randomizer logic is Jest (`randomizer/__tests__/`): `mutationToggles`, `mutationProbs`,
`evoLevelConfig`, `teamTypes`, `trainerTypeThemeCounts`, `trainerTeamTypeColors`, `moneyWriter`,
`extraStarterConfig`. Frontend structure/round-trip is `node --test`
(`frontend/__tests__/config-form.test.js`, `config-roundtrip.test.js`) per ADR-009.
