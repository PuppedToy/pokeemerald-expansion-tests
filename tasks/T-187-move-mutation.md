---
id: T-187
title: Move mutation — mutate move power/accuracy/type/category before pokemon, surfaced in docs and written to ROM
status: in-progress
type: feature
created: 2026-07-22
updated: 2026-07-22
target-version: 0.6.0
links: []
blocked-by: []
---

# T-187 — Move mutation

## Context

New feature requested by the owner: an optional randomization step that mutates **move** stats
(power, accuracy, type, category), mirroring the existing pokemon mutation/rebalance system as
closely as possible. It must run **before** pokemon randomization so that pokemon (and trainers and
wild encounters, which all read move data) see the mutated moves; be surfaced in the viewer with the
same buff/nerf/adjusted treatment pokemon get; and be written to the built ROM.

Sources of truth to mirror (do not restate — see the code):
- Pokemon mutation algorithm, gates, log emission, family propagation: `randomizer/rebalancer.js`.
- `LOG_TYPE_*` constants: `randomizer/constants.js` (BUFF/NERF/ADJUSTMENT).
- Config UI pattern (master toggle + revealed children + declarative prob fields): `frontend/js/config-form.js`
  (the `#rebalance` card at ~1109-1172 and `MUTATION_PROB_FIELDS` at ~31-59).
- Config threading (dual adapters): `frontend/js/randomizer-worker.cjs` `toModuleConfig` and
  `backend/generator.js` `toModuleConfig`; core `randomizer/generate.js`; CLI `randomizer/config.js`.
- Insertion site: `randomizer/modules/pokedexModule.js` `runPokedexModule`, after the `allPokes`
  clone and before `expandAllTeachables`/`ratePokemon`/`balancePokemon`.
- Viewer render pattern: `frontend/template.html` — `.dashed` (CSS), `getLogColor`,
  `getFullPokeLogColor`/`getFullPokeLogIcon`, `getLogIcon`, `buildLog`, the `change-chips` filter row,
  `renderMoves`, and the modal builders `buildLearnsetList`/`buildTeachablesList`.
- Move data read-only today: `src/data/moves_info.h` is parsed (`randomizer/parser.js`
  `parseMovesFile`/`parseMoveStat`) and never written back — a new writer is required.
- Browser bundle rebuild: root `build.js` (`node build.js`) regenerates
  `frontend/js/randomizer.bundle.js`; without it the client-side Worker won't see `randomizer/` edits.

Owner decisions (2026-07-22):
- Power/accuracy jumps: base **±5 with a stacking repeat-gate** (same mechanism as pokemon stats,
  magnitude 5 → ±5, ±10, ±15…). Clamp power to [5, 250], accuracy to [10, 100] (never 0). Direction 50/50.
- Move change-log rendered **inline in the move card** (the moves screen has no modal).

## Plan

A new module `randomizer/moveMutator.js` produces, per eligible move, a `log` array of
`{type, target, oldValue, value}` entries (same shape pokemon use) and mutates the move object in
place on a **clone** of `baseData.moves`. Wired via a new master config `mutateMoves` (default OFF)
plus per-field probabilities. Runs inside `runPokedexModule` before pokemon rating/rebalance. Viewer
extended to render move buff/nerf/adjusted (name badge + per-field strikethrough + inline change-log +
filter chips), and the pokemon modal move-lines decorated. A new `randomizer/moveWriter.js` rewrites
mutated fields in `src/data/moves_info.h`, invoked from the build path with a restore hook.

Mutation semantics (mirrors pokemon; magnitudes per owner decision):
- **Gate** (`moveMutationChance`, default 0.10): per-move eligibility. If it fails, the move is untouched (empty log).
- **Power** (`movePowerChance`, default 0.70) — only if the move is **not** status. ±5 base, stacking
  repeat-gate, clamp [5, 250]. ↑ = BUFF, ↓ = NERF.
- **Accuracy** (`moveAccuracyChance`, default 0.50) — only if accuracy ≠ 0. ±5 base, stacking
  repeat-gate, clamp [10, 100] (never 0). ↑ = BUFF, ↓ = NERF.
- **Type** (`moveTypeChance`, default 0.10) — pick uniformly among real battle types excluding the
  current type and NONE/STELLAR/MYSTERY. Always ADJUSTMENT.
- **Category** (`moveCategoryChance`, default 0.10) — only if not status. Flip Physical↔Special
  (never Status). Always ADJUSTMENT.
- Overall classification (name badge / filter): all-BUFF → buffed, all-NERF → nerfed, else adjusted;
  empty log → unchanged. (`.every()` rule, identical to pokemon.)
- Feature OFF draws **zero** RNG → existing seeds/outputs byte-identical.

Acceptance criteria:
- [ ] `randomizer/moveMutator.js` mutates a clone of the moves map; gate + per-field rolls independent;
      status moves never get power/category; acc-0 moves never get accuracy; clamps enforced; each
      changed field emits a correct `{type,target,oldValue,value}` log entry. (unit tests)
- [ ] With `mutateMoves` off (default), the pipeline draws no extra RNG and output is unchanged. (unit test)
- [ ] Mutation runs in `runPokedexModule` before pokemon rating/rebalance; pokemon/trainers/wild see
      mutated move data; mutated moves ride along in `pokedex.moves` in the bundle. (integration test)
- [ ] Nuzlocke/soul-link: mutated moves shared iff the pokédex is shared ("Same Pokémon universe"). (test)
- [ ] Config: new `mutateMoves` master toggle (default OFF) reveals the five probability controls;
      threaded through both `toModuleConfig` adapters + CLI defaults; `randomizer.bundle.js` rebuilt.
- [ ] Viewer moves screen: name buffed/nerfed/adjusted badge + color; per-field power/accuracy/type/
      category strikethrough+new+color; inline change-log per card; buffed/nerfed/adjusted/unchanged
      filter chips. (manual/visual)
- [ ] Pokemon modal move-lines: single mutation icon (right of any existing ⭐️/🔧, else far-left);
      changed type/power/accuracy struck-through with new value+color. (manual/visual)
- [ ] `randomizer/moveWriter.js` rewrites only changed fields of mutated moves in `moves_info.h` with
      concrete values (flattening gen-conditionals for those fields only), untouched moves byte-identical;
      wired into the build path with a restore hook. (unit test on the writer)
- [ ] `cd randomizer && npm test` green; `randomizer/docs/` + `randomization-options.md` updated;
      `CHANGELOG.brooktec.md` `[Unreleased]` line added.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-22** — Task created. Scoped via 5 parallel code-exploration passes (pokemon mutation
  mechanism, move data pipeline + ROM-write gap, config threading + nuzlocke shared universe, viewer
  buff/nerf render, orchestration order + bundle shape). Key finding: moves are read-only today — a new
  `moves_info.h` writer is required (part 4 is greenfield plumbing). Owner resolved the two open
  decisions (±5 stacking; inline card log). Plan and acceptance criteria agreed.
- **2026-07-22** — Core + wiring + config done (TDD, all green). Added `randomizer/moveMutator.js`
  (`mutateMove`/`mutateAllMoves`: gate → independent per-field rolls; power/acc ±5 with a stacking
  repeat-gate, clamps power[5,250]/acc[10,100] never 0, no-op-after-clamp emits no entry; type uniform
  over `POKEMON_TYPES` minus current = ADJUSTMENT; category flips Phys↔Spec on non-status = ADJUSTMENT;
  log shape `{type,target,oldValue,value}` identical to pokemon). Wired into `pokedexModule.runPokedexModule`
  right after the `allPokes` clone: now also deep-clones `baseData.moves` (fixes latent cross-ROM leak of
  tm-number/location stamping) and, when `config.mutateMoves`, mutates + re-rates changed moves before TM
  annotation/rating/rebalance. Config threaded through `config.js` (DEFAULTS + `--mutate-moves`), both
  `toModuleConfig` adapters (browser worker + backend), and `config-form.js` (master toggle + 5 percent
  controls, reveal, wire, get/set, DEFAULTS). Tests: `__tests__/unit/moveMutator.test.js` (15) and
  `__tests__/unit/moveMutationPipeline.test.js` (6). Full suite: 130 suites / 1544 tests green.
  Remaining: viewer render (template.html), moves_info.h writer + build wiring, bundle rebuild, docs/changelog.
- **2026-07-22** — Viewer done (`frontend/template.html`): reusable move-mutation helpers
  (`moveChangeClass`/`moveNumCell`/`moveTypeCell`/`moveCatCell`/`buildMoveLog`, reusing the pokemon
  `getFullPokeLogIcon`/`getFullPokeLogColor`/`getLogColor`/`getLogIcon` since a move's `log` has the same
  shape). Moves screen: name buffed/nerfed/adjusted badge+colour, per-field struck power/accuracy/type/
  category, inline Change Log per card, and a "Changes" filter row (buffed/nerfed/adjusted/unmutated).
  Pokemon modal move-lines (`buildLearnsetList`/`buildTeachablesList`): one mutation icon to the right of
  any existing add/replace star (leftmost otherwise), struck type/power/accuracy. ROM writer done
  (`randomizer/moveWriter.js` `editMovesFile`/`saveMoveData`, unit-tested): rewrites only changed fields
  in `moves_info.h` with concrete values (flattening gen-conditionals), audit comment preserves the
  original; no-op when nothing mutated; wired into `writer.js` before `savePokemonData`; restore is the
  existing `git checkout -- src/`. Added a `MOVE_JSON` env hook to the visual-tests fixture builder.
  Verification: full randomizer suite 131/1552 green; frontend config tests 47 green + new T-187
  round-trip test; browser bundle rebuilt clean (`node build.js`); headless Playwright smoke on a
  mutation-on fixture — no JS errors, 847 move cards, 562 struck values, 562 change-log rows, 353 mutated
  moves, modal builders run on real pokes. Docs (`randomization-options.md`) + `CHANGELOG.brooktec.md`
  updated. Pending owner manual test before close.

## Outcome

<!-- Filled when closing. -->
