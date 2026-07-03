---
id: T-052
title: Configurable randomization options — batch 1 (categorized settings)
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-03
updated: 2026-07-03
target-version: 0.6.0
links: [docs/adr/ADR-009-frontend-test-harness-zero-dep.md, docs/adr/ADR-011-trainer-colour-ssot.md]
blocked-by: []
---

# T-052 — Configurable randomization options — batch 1 (categorized settings)

## Context

Today the randomizer exposes only a handful of knobs in the frontend (`run type`, `difficulty`,
`rebalance` on/off, `balance chance`, `seed`, `show exact positions`). Almost every other
behaviour is hardcoded. This task begins turning hardcoded randomization behaviour into
user-facing options, and reorganizes the settings UI into **categories**, removing the single
generic "Advanced" block and scoping an Advanced sub-panel only to the categories that need it.

Cross-cutting requirements (apply to **every** option added here):
- Each option has a frontend control; toggling/changing it changes the randomization output.
- Every option round-trips through **import/export config** (Save/Load, `frontend/js/session.js`)
  and the **localStorage "remember last config"** (`STORAGE_KEY = 'lastConfig'`, `storage.js`).
- Any new UI component is **responsive** (a `@media (max-width:600px)` layer + ≥44px tap targets,
  per ADR-009 / the `responsive.test.js` guards).
- All new options are **documented** (see Step 13). Most options have **no ROM-build impact** — the
  one exception is **reward money** (Step 12), which patches C source at build time.

### Config plumbing (verified — the path every option follows)

`config-form.js` (UI + `getConfig`/`setConfig` + localStorage + Save/Load)
→ `app.js` (`reviewRowsHtml` summary + worker post)
→ `randomizer-worker.cjs` `toModuleConfig()`
→ `randomizer/generate.js` `runGeneration(cfg, mcfg)` — the SSOT shared with `backend/generator.js`
   and the determinism tests
→ module (`modules/*.js`, `rebalancer.js`, `evoLevelWriter.js`, `wildModule.js`, `trainers.js`)
→ `bundle` (`bundle.config` is a copy of `cfg`; `mcfg` is not serialized)
→ ROM writer (`writer.js` / `make.js`) — a **dumb applier**: `make.js` reads only
   `bundle.config.seed`; `writer.js` consumes only generated data arrays.

Key facts that shape the steps:
- `startersModule` and `wildModule` currently receive **no config** — extra-starter changes must
  thread `mcfg` into `generate.js`'s calls to them.
- `bundleSchema.js` allow-lists `config` **without validating its fields** — new `config` keys need
  no schema change (only new top-level bundle keys / new filesystem-path fields would).
- After changing any `randomizer/*.js` consumed by the browser, the esbuild bundle must be rebuilt:
  `node build.js` (regenerates `frontend/js/randomizer.bundle.js` + `frontend/data/base-data.json`).
- `backend/generator.js` is a transitional artifact (marked for deletion) and already lags (missing
  `showExactPositions`); the **browser worker is the live path**. Mirror new knobs there only where
  cheap; the determinism test imports `generate.js` directly.
- All randomizer RNG is one seeded mulberry32 stream (`rng.js`) seeded once at `generate.js:351`
  (`rng.seed(cfg.seed)`). **Changing any knob that alters the number/order of `rng.random()` draws
  changes the whole downstream ROM for a given seed** — expected (different config ⇒ different ROM),
  but call it out in tests/docs.

### Decisions taken with the user (2026-07-03)
- **Settings UX:** accordion of collapsible categories; remove the generic "Advanced"; only
  **Mutations** and **Evolution levels** get a scoped Advanced sub-panel; `seed` +
  `show exact positions` move into a small **General** category.
- **Money:** museum/Space-Center grunts are **derived from the boss value** as `round(boss × 2/3)`
  (museum grunt 2 = that `+ $50`), which reproduces today's exact `$2000 / $2050` at the default
  boss `$3000`. Only **Normal / Boss / Gym** are configurable; **E4 ($10k)** and **Champion ($50k)**
  stay fixed. (Verified real defaults: normal **$250** (not $500), boss $3000, gym $5000; museum/space
  are flat literals, not a %, in `src/battle_script_commands.c` `GetTrainerMoneyToGive`.)
- **Evolution levels:** expose *all* numbers — scalars (enable, min, max, deviation, 3 stage
  spacings) at top level; the per-tier tables (10 base ranges, 9 pre-evo modifiers) under Advanced.
- **Extra starters:** per-slot category from an **expanded vocabulary** (see Step 11); unlimited
  add/remove; default preset reproduces today's 9.
- **Aqua/Magma slot 5 default = Random** — a deliberate behaviour change (today it is a fixed
  Flying/Fighting 5th type).

### Source-of-truth references (do not restate; link)
- Gym/E4 type counts: `randomizer/constants.js:97-98` (`TRAINER_*_KEEP_TYPE_AMOUNT`), logic
  `randomizer/trainers.js:603-650`, table `trainers.js:4301-4315`.
- Aqua/Magma types: `randomizer/trainers.js:73-87`; cosmetic mirror `trainerColors.js:88-91`.
- Reward money: `src/battle_script_commands.c` `GetTrainerMoneyToGive` (~8256-8333);
  ids in `include/constants/opponents.h`.
- Mutation knobs: `randomizer/rebalancer.js:5-16` (constants), gate `:157-163`, stats `:167-191`,
  types `:193-221`, abilities `:223-257`, learnsets `:259-357` (type-driven) + `:359-432` (random);
  invoked `modules/pokedexModule.js:173-176`.
- Evolution levels: `randomizer/evoLevelWriter.js` + `randomizer/constants.js:257-301`.
- Extra starters: `randomizer/modules/wildModule.js:116-257`; written `writer.js:270-285` →
  `src/starter_choose.c`.

## Plan

Approach: implement each option as a **vertical slice** — frontend control → config round-trip →
worker/`generate.js` threading → randomizer consumption → tests → (docs at the end). Do the UI
categorization first so each new option slots into its category. Keep the full suite green after
every step (`cd randomizer && npm test`; frontend `node --test`; backend `npm test`). Rebuild the
browser bundle (`node build.js`) whenever a browser-consumed `randomizer/*.js` changes.

TDD is mandatory: for each algorithm change, write the failing test first (Red), then implement
(Green). New defaults must reproduce **today's behaviour** (regression-safety), so a "defaults ⇒
unchanged output" test is part of most steps.

### Global acceptance criteria
- [x] Every new option is present in the frontend, changes randomizer output when changed, and
      round-trips through Save/Load **and** localStorage.
- [x] With all new options left at their defaults, generated bundles are **byte-identical** (per
      seed) to pre-task output for the non-money paths (regression + determinism tests).
- [x] New UI components have a ≤600px responsive layer and ≥44px tap targets; `responsive.test.js`
      and the other structural guards pass.
- [x] `cd randomizer && npm test`, frontend `node --test`, and `backend` tests all green.
- [x] Every option documented (Step 12); `docs/INDEX.md` updated; `CHANGELOG.brooktec.md`
      `[Unreleased]` gains the user-visible lines.
- [x] No SSOT violations; no randomizer-generated files committed; browser bundle rebuilt.

---

### Step 1 — Settings categorization (accordion) + General section
Refactor `frontend/js/config-form.js` from one flat page into an **accordion of collapsible
category sections**. Remove the single generic "Advanced" collapsible. Add a **General** category
holding `seed` + `show exact positions`. Create empty scoped-Advanced sub-panels inside the
**Pokémon mutations** and **Evolution levels** categories (filled in later steps). No randomization
behaviour change in this step.
- Categories (order): Run type · Difficulty · Pokémon mutations · Evolution levels ·
  Trainers & bosses · Rewards · Starters · General.
- Preserve all existing keys and their round-trip; `reviewRowsHtml` (`app.js`) still renders the
  current summary rows.
- Acceptance:
  - [ ] Existing options work unchanged; `getConfig()`/`setConfig()`/localStorage/Save-Load
        round-trip is intact (add a config round-trip `node --test`).
  - [ ] Accordion is responsive (≤600px layer, 44px targets); structural guards pass.
  - [ ] No generic "Advanced" block remains; General category exists.

### Step 2 — Gym & Elite-Four type-change counts
Expose "**Number of gyms with changed types**" (0–8, default 2) and "**Number of Elite Four with
changed types**" (0–4, default 2) under *Trainers & bosses*. Internally convert to the existing
*keep* constants: `keep = total − changed` (`TRAINER_GYM_LEADERS_KEEP_TYPE_AMOUNT`,
`TRAINER_E4_KEEP_TYPE_AMOUNT`). This step also **establishes the config-threading pattern**
(config key → `toModuleConfig` → `mcfg` → `runTrainersModule` → `getTrainersData`) reused by later
steps.
- Champion stays fixed Steel (unaffected).
- Acceptance:
  - [ ] Setting gyms/E4 changed to 0 keeps all canonical types; to max changes all; default 2/2
        reproduces today.
  - [ ] Values round-trip; validated (clamp/reject out-of-range).
  - [ ] Jest: given a seed, the number of changed gym/E4 themes equals the config value.

### Step 3 — Team Aqua types (5 selectors)
Under *Trainers & bosses*, add 5 selectors for Team Aqua: **main, secondary, other 1, other 2,
other 3**, each = a specific type or **Random**. Defaults: Water, Dark, Poison, Ice, **Random**
(slot 5 was fixed Flying — now Random by default). Populate `aquaTeamTypes[0..4]` from config before
trainer defs are built; "Random" draws from `POKEMON_TYPES` excluding already-chosen slots
(seed-deterministic). Keep the cosmetic mirror `trainerColors.js` `EVIL_TEAM_TYPES.aqua` in sync
(main+secondary). Build a reusable responsive **type-selector** component (shared with Step 4).
- Acceptance:
  - [ ] Each selector changes which mons Aqua trainers can field; Random resolves deterministically
        per seed and never duplicates a chosen slot.
  - [ ] Card colours follow main/secondary.
  - [ ] Round-trips; responsive; Jest covers specific + Random slots.

### Step 4 — Team Magma types (5 selectors)
Same as Step 3 for Team Magma. Defaults: Fire, Ground, Rock, Grass, **Random** (slot 5 was fixed
Fighting). Reuse the Step 3 component; keep `EVIL_TEAM_TYPES.magma` in sync.
- Acceptance: mirror of Step 3 for Magma.

### Step 5 — Pokémon mutation category toggles (stats / abilities / types / learnsets)
Split the single mutation gate into **four independent enable toggles** under *Pokémon mutations*
(master "Enable mutations" = the existing `rebalance`; `balanceChance` stays as the global per-mon
gate slider). Wire `rebalancer.js` `balancePokemon()` to accept the four enables and guard each
block: stats (`:167-191`), abilities (`:223-257`), types (`:193-221`), learnsets. **Coupling to
respect:** the type-change-driven learnset edit (`:259-357`) belongs under the **Types** toggle
(it's a consequence of a type change); the independent random learnset pass (`:359-432`) belongs
under the **Learnsets** toggle. Document this in the UI hint.
- Acceptance:
  - [ ] Disabling a category removes exactly that mutation class; all four on with default probs
        reproduces today's output per seed.
  - [ ] Toggles round-trip; Jest per category (on/off).

### Step 6 — Pokémon mutation Advanced probabilities
In the *Pokémon mutations* → **Advanced** panel, expose every relevant probability/magnitude with
an inline explanation of what it does and its default:
- Stats: `STAT_BALANCE_CHANCE` (0.7), `BUFF_STAT_CHANCE` (0.6), `REPEAT_STAT_CHANCE` (0.5).
- Types: `TYPE_BALANCE_CHANCE` (0.1), `MONOTYPE_BALANCE_CHANCE` (0.1).
- Abilities: `ABILITY_BALANCE_CHANCE` (0.1).
- Learnsets: `LEARNSET_BALANCE_CHANCE` (0.2), `CHANGE_TYPE_MOVE_CHANCE_FROM_OLD_TYPE_CHANCE` (0.9),
  `CHANGE_TYPE_MOVE_CHANCE_FROM_OTHER_TYPE_CHANCE` (0.05, shared old-type-add & random-pass),
  `CHANGE_MOVE_INSERT_CHANCE` (0.5), `MOVE_RATING_DEVIATION` (0.2).
Thread these into `balancePokemon` (replacing the module-level consts with config-with-fallback).
Keep the `±10` stat step / clamps / `BANNED_ABILITIES` as non-exposed internals (note in docs).
- Acceptance:
  - [ ] Each probability, when changed, measurably shifts mutation frequency/magnitude (Jest with a
        fixed seed and extreme values 0 and 1).
  - [ ] Defaults reproduce today; Advanced panel responsive; values round-trip.

### Step 7 — Evolution levels: enable + scalar tuning
Add an *Evolution levels* category with an **enable toggle** (today `applyEvoLevels` is
unconditional) and scalar inputs: **min** (`EVO_LEVEL_MIN` 5), **max** (`EVO_LEVEL_MAX` 65),
**randomness** (`EVO_LEVEL_DEVIATION` 0.05), and the **3 stage spacings**
(`EVO_LEVEL_STAGE_ADJUSTMENTS`: LC_OF_2 0, LC_OF_3 −0.10, NFE_OF_3 +0.10). Thread config into
`evoLevelWriter.js`. Fix the stale `constants.js:287-289` comment (says 20%, values are 10%).
When disabled, keep base-game evolution levels untouched.
- Acceptance:
  - [ ] Toggling off leaves evolution levels at base; scalar changes shift computed levels within
        clamps; defaults reproduce today.
  - [ ] Round-trips; Jest on min/max/deviation/stage-spacing.

### Step 8 — Evolution levels: Advanced per-tier tables
In *Evolution levels* → **Advanced**, expose the full `EVO_LEVEL_BASE_RANGES` (10 target-tier
ranges) and `EVO_LEVEL_PRE_EVO_MODIFIERS` (9 pre-evo-tier ranges) as editable min/max pairs, with a
per-row explanation (target-tier drives *baseLevel*; holder-tier drives *modifier*). Thread into
`evoLevelWriter.js` with per-tier fallback to the constant defaults (backward-compatible bundles).
- Acceptance:
  - [ ] Editing a tier range changes only that tier's evolution levels; defaults reproduce today.
  - [ ] Table component responsive (horizontal scroll container, 44px targets); round-trips.

### Step 9 — Reward money: normal / boss / gym  *(ROM-build; CI-verified)*
Add a *Rewards* category with three money inputs: **Normal trainer** (default 250), **Boss** (3000),
**Gym leader** (5000). Museum grunts 1/2 and Space-Center grunts 5/6/7 are **derived** =
`round(boss × 2/3)` (museum 2 `+ $50`). Implementation:
1. Refactor `src/battle_script_commands.c` `GetTrainerMoneyToGive` to use committed `#define`s with
   the real defaults (so a plain `make` still builds) — e.g. `NORMAL_TRAINER_MONEY 250`,
   `BOSS_TRAINER_MONEY 3000`, `GYM_LEADER_MONEY 5000`; museum/space computed from the boss define.
2. New writer step (token/define-value patch, mirroring the `starter_choose.c` pattern in
   `writer.js`) reading `bundle.config` money values; called from `make.js` `buildOneRom` before
   `make`. Add `battle_script_commands.c` to `make.js`'s post-build **restore** list.
3. Carry the three values in `bundle.config` (frontend config) + add fallbacks (250/3000/5000) for
   old bundles; add to `randomizer/config.js` DEFAULTS for the CLI path.
- ⚠️ **Cannot be built/verified locally** (no GBA toolchain; `make check` runs only in CI/on the
  builder — see memory `project_no_gba_toolchain_ci_verifies`). TDD at the **writer** level (Jest:
  fixture C source → patch → assert emitted `#define` values incl. derived museum/space); the actual
  ROM compile is CI/owner-gated.
- Acceptance:
  - [ ] Writer patches the three defines + derived museum/space correctly (Jest); default boss 3000
        reproduces $2000/$2050/$2000.
  - [ ] Values round-trip; committed C still compiles with defaults (verified in CI).
  - [ ] `make.js` restores `battle_script_commands.c` after build.

### Step 10 — Extra starters: config-driven list + expanded categories
Replace the hardcoded 9-slot logic in `wildModule.js:116-257` (and its `< 9` loop caps) with a
**config-driven, unlimited list** of per-slot categories, threading `mcfg` into
`runWildModule`/`runStartersModule` from `generate.js`. Expose a *Starters* list with add/remove
rows; each row picks a category from an **expanded vocabulary** (user chose "add more variants"):
- Evolving-line categories by best-evolution tier: **LEGEND-line, UBERS-line, OU-line, UU-line,
  RU-line, NU-line, PU-line** (each = an `isLC` base whose family's best evo is that tier; UBERS-line
  keeps today's 3-evo→2-evo→any fallback chain).
- **Standalone (SOLO) early-game** (today's slot-4 NU non-evolving).
- Optional line-length filter on evolving categories (any / 3-evo / 2-evo).
Default preset reproduces today exactly: `[UBERS-line(3-evo), OU-line, UU-line, NU-solo,
RU-line ×5]` = 9. The writer already emits a dynamic count (`writer.js:282`), so `STARTER_EXTRA_COUNT`
and `sStarterExtraMon[]` auto-size — verify with a fixture test.
- Acceptance:
  - [ ] Adding/removing rows changes the number and identity of extra starters; each category's
        predicate matches the documented eligibility; family/type-diversity rules preserved.
  - [ ] Default preset reproduces today's 9 per seed; empty/edge lists handled gracefully.
  - [ ] List UI responsive; round-trips; Jest per category + count.

### Step 11 — Review summary + import/export hardening
Extend `app.js` `reviewRowsHtml` (Step-2 Review + Step-3 Run details) to summarize the new options,
and add one consolidated `node --test` proving a **full config with every new option** survives
`downloadConfig`→`readJsonFile`→`extractConfig`→`setConfig`→`getConfig` and localStorage unchanged.
Confirm `extractConfig` still accepts both raw config and full-bundle uploads.
- Acceptance:
  - [ ] Review/Run-details show the new options; full round-trip test green.

### Step 12 — Documentation
Add `randomizer/docs/randomization-options.md` documenting **every** option in this batch: its
frontend location/category, config key, default, exact algorithm effect (link the SoT lines), the
RNG-stream caveat, and the money ROM-build note. Link it from `docs/INDEX.md` (Guides). Add the
user-visible `CHANGELOG.brooktec.md` `[Unreleased]` lines. Update `randomizer/docs/` cross-refs if
needed (trainer-determinism note about aqua/magma types).
- Acceptance:
  - [ ] Doc exists, is linked in `docs/INDEX.md`, covers all options; changelog updated.

### Step 13 — Integration, bundle rebuild, full verification
Rebuild the browser bundle (`node build.js`); run the full suites (`randomizer` Jest, frontend
`node --test`, backend, `npm run test:determinism`); run `node scripts/check-tracker.mjs`; self
code-review the diff. Then **ask the user to manually test** the frontend end-to-end (each category,
Save/Load, localStorage persistence, a generate run) before the task can be closed.
- Acceptance:
  - [ ] All suites green; bundle rebuilt; determinism test green; tracker consistent.
  - [ ] User has manually tested and confirmed OK (required to close — per CLAUDE.md).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-03** — Task created. Researched the full config plumbing and all six algorithms
  (gym/E4 type counts, Aqua/Magma types, reward money, mutation probabilities, evolution levels,
  extra starters) with file:line SoT refs (captured in Context). Confirmed real money defaults
  (normal $250, not $500; museum/space are flat literals ≈66.7% of boss, no % formula). Agreed the
  four UX/scope decisions with the user (accordion + scoped Advanced; money ×2/3 preserve; evolution
  full-tables-under-Advanced; expanded starter vocabulary; Aqua/Magma slot-5 → Random default).
  Opened branch `feature/T-052-configurable-randomization-options` off `master` (no `develop`).
- **2026-07-03** — Steps 1–4 done (green: frontend `node --test` 30, `randomizer` Jest 537 + 1 skip).
  - Step 1: `config-form.js` refactored into a `.config-accordion` of collapsible categories (Run
    type · Difficulty · Pokémon mutations · [anchors] · General). Generic Advanced removed; seed +
    show-exact-positions relocated to **General**; Mutations keeps a scoped Advanced scaffold.
    Accordion CSS + ≤600px 44px layer; new `frontend/__tests__/config-form.test.js`.
  - Step 2: gym/E4 type-change counts. `getTrainersData(…, config)` computes keep = total − changed
    (fallback = historical constants → byte-identical no-config). Threaded config-form → worker
    `toModuleConfig` → `runTrainersModule` → `getTrainersData`. Spec-changed `trainersModule.test.js`
    (getTrainersData now 3-arg) + new `trainerTypeThemeCounts.test.js`.
  - Steps 3–4: Team Aqua/Magma 5-slot type themes. New `resolveTeamTypes()` (exported) resolves
    specific/RANDOM slots seed-deterministically, no rng when config absent (byte-identical).
    Arrays made `let`, re-resolved per `getTrainersData` call. Evil trainers tagged `evilThemeTypes`;
    `trainerColors.evilColors(team, override)` follows configured main/secondary (default = today's
    Water+Dark / Fire+Ground, regression test green). **Deliberate behaviour change:** slot-5
    frontend default is now **Random** (was fixed Flying/Fighting). Reusable `teamTypeSelectors`
    component + `.type-slot-grid` responsive CSS. Tests: `teamTypes.test.js`,
    `trainerTeamTypeColors.test.js`.

- **2026-07-03** — Steps 5–8 done (green: frontend 33, randomizer 554 + 1 skip).
  - Step 5: `balancePokemon(…, options)` gains 4 per-category enables (stats/abilities/types/learnsets),
    each gating its block; learnset step 1 (type-driven) lives under `mutateTypes`, step 2 under
    `mutateLearnsets`. Frontend 4 toggles under Mutations (hidden with the rest when rebalance off).
    `mutationToggles.test.js`.
  - Step 6: all 11 rebalancer probability constants exposed as `options.probs` (fallback = constants,
    byte-identical). `moveRatingDeviation` threaded through the learnset-insert helpers. Frontend
    Advanced panel generated from `MUTATION_PROB_FIELDS`. `mutationProbs.test.js`.
  - Steps 7–8: `evoLevelWriter.resolveEvoParams()` resolves min/max/deviation, the 3 stage spacings,
    and whole base-range / pre-evo-modifier tables (fallback = constants). `applyEvoLevels(list, cfg)`;
    `makePokedex` gates on `evoLevels.enabled`. Fixed the stale 10%/20% comment in constants.js.
    Frontend Evolution category: enable + scalars + Advanced tier tables. `evoLevelConfig.test.js`.

- **2026-07-03** — Steps 9–11 done (green: frontend 39, randomizer 569 + 1 skip).
  - Step 9: prize money. Refactored `src/battle_script_commands.c` `GetTrainerMoneyToGive` to use
    committed `#define`s (NORMAL/BOSS/GYM/ELITE_FOUR/CHAMPION + derived MUSEUM_SPACE = boss·2/3 and
    MUSEUM_2 = +50). New `randomizer/moneyWriter.js` patches the 3 tunables from `bundle.config.money`;
    wired into `make.js buildOneRom` (restored by existing `git checkout -- src/`). Money rides in
    `bundle.config` (not a module knob). `moneyWriter.test.js`. **ROM compile is CI/builder-only.**
  - Step 10: extra starters config-driven. New pure `pickExtraStartersFromSpecs(specs, ctx)` +
    `DEFAULT_EXTRA_STARTER_PRESET` (the 9) + `isDefaultStarterPreset`; the default preset delegates to
    the untouched legacy path (byte-identical, still covered by wildModule.test.js). `mcfg` threaded
    into `runWildModule` (all 3 generate paths). Expanded vocabulary: 7 tiers × line/solo × line-length.
    Frontend dynamic add/remove list. `extraStarterConfig.test.js`.
  - Step 11: `app.js reviewRowsHtml` summarizes all new options (Review + Run details). Consolidated
    `config-roundtrip.test.js` (full config survives JSON + extractConfig, raw & bundle forms).

- **2026-07-03** — Steps 12–13 done. Doc `randomizer/docs/randomization-options.md` written + linked
  in `docs/INDEX.md`; `CHANGELOG.brooktec.md [Unreleased]` Added section. Rebuilt the browser bundle
  (`node build.js`). Full sweep green: **randomizer** Jest 569 (+1 skip), **frontend** `node --test`
  39, **backend** 106, **determinism** (`RUN_DETERMINISM=1`) 1. Tracker OK. Generated artifacts
  (`randomizer.bundle.js`, `base-data.json`) confirmed gitignored. Visual smoke via `visual-tests`
  (`npm run shoot --only randomizer`): renders at all 5 viewports, **no horizontal overflow**, no
  load errors; desktop screenshot confirms the accordion + categories.
  **Awaiting the user's manual end-to-end test to close** (per CLAUDE.md — an agent never self-closes).

## Outcome

Shipped batch 1 of configurable randomization options. The settings form is now a collapsible
accordion of categories (generic "Advanced" removed; scoped Advanced only under Mutations &
Evolution; seed + show-exact-positions moved to General). New, fully round-tripping options: gym/E4
type-change counts; Team Aqua/Magma 5-slot type themes; four mutation category toggles + all 11
probability knobs; evolution-level enable + scalars + per-tier tables; trainer/boss/gym reward money
(derived museum/space); and an unlimited, category-driven extra-starter list. All documented in
`randomizer/docs/randomization-options.md`.

Verified green: randomizer Jest 569 (+1 skip), frontend `node --test` 39, backend 106, cross-ROM
determinism 1; visual smoke (5 viewports, no overflow). Defaults are byte-identical to the prior
pipeline.

Deviations / notes:
- **Aqua/Magma 5th slot default → Random** (was fixed Flying/Fighting) — deliberate, per the user.
- **Reward money** is the only ROM-build-affecting option (patches committed `#define`s in
  `src/battle_script_commands.c`); the C compile is verified by CI on the builder, not locally
  (no GBA toolchain). Museum/Space-Center derive as `round(boss·2/3)` (+$50 for museum-2), preserving
  today's $2000/$2050 at the default boss.
- **Extra starters:** the default preset delegates to the untouched legacy selector (byte-identical);
  custom lists use the new pure per-spec selector.

User approved ("Me encanta") and requested commit + merge to `master`. Merged locally via `--no-ff`;
push to origin remains owner-gated. No follow-up tasks spawned (further option batches are future work).
