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
- **2026-07-22** — Owner review feedback (config UI) addressed: (1) **Move mutation** was nested inside
  the *Pokémon mutations* category — extracted into its **own** `config-category` (`data-cat="move-mutation"`,
  collapsed by default) between *Pokémon mutations* and *Evolution levels*. (2) *Difficulty* laid its
  sliders bare in the category body — now wrapped in a `card-glass` box like the other categories (T-186
  polish). (3) The T-186 difficulty sliders (`nonBossQualitySlider`, boss/non-boss team size) rendered as
  native ranges — gave them the shared `.slider` class so they match *General Pokémon quality*; and the
  `.slider` style now paints its **filled (left) portion orange** via a `--fill` custom property set by a
  new `_paintSliders()` (on `_syncUI` + a per-slider `input` listener). Verified: frontend suite 101 green
  + new structural tests (T-187 section placement, T-186 box + `.slider`); headless desktop screenshot of
  the config screen confirms the section placement, the difficulty box, and the orange slider fill. No
  bundle rebuild needed (config-form.js + CSS are served directly, not in the worker bundle).
- **2026-07-22** — Owner review feedback (structure/consistency): restructured *Move mutation* to mirror
  *Pokémon mutations* — **basic** = master toggle + per-move gate **slider** (`moveMutationChance`) + four
  on/off field toggles (`mutatePower/mutateAccuracy/mutateType/mutateCategory`, default on); **Advanced**
  = the four per-field chances. `moveMutator.mutateMove` now honours the toggles (a field that is off is
  skipped without drawing RNG, like `rebalancer`'s category blocks); toggles threaded via pokedexModule +
  both `toModuleConfig`s + DEFAULTS. **Standardised all mutation probabilities to whole percent (0–100)**:
  the pokemon Advanced `mutationProbs` inputs were 0..1 — now shown ×100 as percents while the stored
  config stays a 0..1 fraction (engine contract preserved; `moveRatingDeviation` kept as a raw 0–2 spread
  factor via a `percent:false` flag). Verified: randomizer 1557 green (+5 toggle tests), frontend 104 green
  (+ round-trip now covers the toggles with word-boundary matching, + structure/percent tests); headless
  desktop screenshot with the section expanded confirms the basic/advanced split, the gate slider, and the
  pokemon Advanced showing 70/60/10/… percents (spread stays 0.2). Docs updated.
- **2026-07-22** — Bugfix (T-186 slider polish, owner-reported): the difficulty tick labels used
  `justify-content: space-between`, which drifts asymmetric ticks because tick boxes have unequal widths —
  the "-2 Default" label sat left of the thumb. Replaced with absolute positioning at each tick's exact
  value % (anchored to the native thumb travel: 9px … calc(100% − 9px), thumb width 18px; first/last
  edge-anchored to avoid clipping). Headless measurement: the "-2" tick centre is now 2px from the thumb
  centre at value −2 (was visibly off); clip screenshot confirms both sliders' ticks line up.
- **2026-07-22** — Move cards grid (owner-reported): move cards inherited the shared `.grid`
  `minmax(220px,1fr)` and got squeezed very narrow. Gave `#moves-cards` its own
  `repeat(auto-fill, minmax(min(400px,100%), 1fr))` (mirrors the roster-list pattern) — a ~400px column
  floor, packs as many as fit, the single column stretches to full width when only one fits, and
  collapses to full width on mobile via `min(400px,100%)`. Shared `.grid` (pokedex etc.) untouched.
  Verified with a rebuilt docs fixture + `shoot.mjs` across all five viewports: desktop shows the wider
  multi-column layout, phone-sm is a single full-width card, no horizontal overflow anywhere.
- **2026-07-22** — Category icons (owner request): replaced the Physical/Special/Status text chips with
  the **real in-game category icon**. `generateAssets.js` now also embeds `graphics/interface/category_icons.png`
  (the game's 16×48 sheet, three 16×16 frames physical/special/status — order confirmed from the summary
  screen's `StartSpriteAnim(sprite, category)`) into `assets.json`. Template: a `catIcon(category)` helper
  renders a `.cat-icon` span sliced from the sheet via `background-position` (the sheet URI is set once on
  `:root --cat-sheet`), with a `data-tooltip` of the category name. Used in the moves-card category cell
  (mutated → dimmed old icon + new) and added to the left of the type on every learnset/teachable line in
  the pokemon modal (same tooltip). Verified: DOM check (847 icons on the Moves screen, 59 in a modal,
  `--cat-sheet` resolved, correct background-position per category, tooltips present) + screenshots of the
  Moves screen and a modal learnset line show the real icons rendering crisply.
- **2026-07-22** — Category-icon + card polish (owner feedback): (1) move-card grid floor 400px → 350px
  (more columns, less wasted width). (2) move-card content now fills the card (`#moves-cards .meta`
  justify-center + inner block `width:100%`) so `text-align:center` truly centres instead of hugging
  the left. (3) The "green box" around the icon was the game PNG's palette index 0 (a light-green the
  game treats as transparent but which ships without a tRNS chunk) — `generateAssets` now injects a
  tRNS marking index 0 transparent (pure-buffer, own CRC32, no deps), so the icon renders on a
  transparent background. Icon enlarged to 22px and `vertical-align:middle` to line up with the type
  chip (modal lines centre it via the list-item flex). Verified on both the Moves screen and the
  pokemon modal: 3 columns, centred content, no green box, icons aligned with the type chips.
- **2026-07-22** — Category icon sizing (owner feedback: icon looked tiny vs the type chip): decoding the
  sheet showed the art fills only the middle **12×11** of each 16×16 frame (transparent padding), so a
  frame-sized icon rendered a much smaller circle. Reworked `.cat-icon` to CROP to the 12×11 art
  (background-position offset by the 2px/3px art origin) and scale it to the `.type` chip height via a
  single `--cat-scale` knob, keeping the art's 12:11 ratio (no distortion). Measured: the icon box is now
  24.8px tall — exactly the type chip — width 27px. Verified on the Moves screen and modal.
- **2026-07-22** — Modal move-name colour (owner feedback): the learnset/teachable move names in the
  pokemon modal now take the move's own buffed/nerfed/adjusted colour (`getFullPokeLogColor(m)` on the
  `<b>`), matching the move cards — white when unchanged, green/red/amber when mutated. The learnset
  replacement decoration dropped its own colour wrapper (kept the dashed old + strong new) so the new
  name inherits the move-mutation colour; the replacement itself stays flagged by the left ⭐️/🔧 icon.
  Verified on a mutation-on fixture: e.g. Tackle/Vine Whip (type-changed → adjusted amber), Seed Bomb
  (nerf red), Sweet Scent/Power Whip (amber), unchanged moves white.
- **2026-07-22** — Category icon a touch too tall at chip height; dropped `--cat-scale` 2.25 → 2.0 so the
  icon is ~22px (a hair under the 24.8px type chip), which reads better next to it.
- **2026-07-22** — Modal line vertical alignment (owner feedback): measuring showed the icon/name/Lv all
  centred, but the **type chip** sat ~3px high — its card-only `margin-bottom:6px` shifts it up inside the
  `align-items:center` flex list-item. Fixed with `.list-item .type{ margin-top:0; margin-bottom:0; }`;
  now icon, chip, name and Lv share one centre line (measured centreY identical for all four).
- **2026-07-22** — Moves screen: moved the category icon to the LEFT of the type chip (was right), to
  match the pokemon modal's order (category → type). One-line swap in the move-card markup; verified.

## Outcome

<!-- Filled when closing. -->
