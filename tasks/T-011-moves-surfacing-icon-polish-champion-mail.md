---
id: T-011
title: Moves TM/description surfacing + icon & tooltip polish + champion victory mail
status: done
type: feature
created: 2026-06-20
updated: 2026-06-20
target-version: 0.1.0
links: [tasks/T-007-mail-notifications.md, tasks/T-004-docs-overhaul.md, tasks/T-006-docs-obsidian-polish.md]
blocked-by: []
---

# T-011 — Moves TM/description surfacing + icon & tooltip polish + champion victory mail

## Context

A miscellaneous batch of viewer (generated-docs) improvements requested by the user. Touches three
layers:

- **Pipeline (`randomizer/`, TDD):** move descriptions are currently mis-parsed (the multi-line
  `.description = COMPOUND_STRING(...)` in `src/data/moves_info.h` is read one line at a time by
  `parseMovesFile`, yielding garbage), and moves carry no TM number. Both are derived data that must
  be produced by the pipeline so they reach the docs via `runPokedexModule` (browser path through
  `frontend/js/randomizer.bundle.js`, and the Node `analyze.js`/`writer.js` path).
- **Viewer template (`frontend/template.html`, not TDD):** Moves tab UI, Pokédex-modal hover,
  icon/tooltip polish, and the Mail engine (T-007) victory mail.
- **Assets (`frontend/assets/`):** new `pokeball.png` (source already at `frontend/aseprite/pokeball.png`),
  re-embedded by `build.js`/`generateAssets.js` into `frontend/data/assets.json` (gitignored).

The `getIcon(name, fallback)` mechanism (T-006) renders `frontend/assets/<name>.png` with an emoji
fallback. TM numbering is `tmList` from `runPokedexModule` (`tmList[0]` = TM01, move names without the
`MOVE_` prefix; 95 TM slots, HMs excluded). The champion is `FLAG_IS_CHAMPION` /
`TRAINER_CHAMPION_STEVEN`, the last `bossCaps` entry (`randomizer/bossCaps.js`).

## Plan

### A. Pipeline (TDD — write the failing test first)

1. **Move descriptions** — fix `parseMovesFile` (`randomizer/parser.js`) to capture a multi-line
   `.description = COMPOUND_STRING("..." "...")` block: read until the closing `)`, concatenate the
   string segments, normalise `\n` to spaces. Single-line descriptions keep working. Unit test with a
   multi-line fixture move.
2. **TM numbers** — in `runPokedexModule` (`randomizer/modules/pokedexModule.js`), after `tmList` is
   built, annotate each move with its 1-based TM number (`moves['MOVE_X'].tm = N`) for moves present
   in `tmList`; leave non-TM moves without a `tm` field. Unit/integration test asserting a known TM
   move gets the right number and a non-TM move gets none.

### B. Moves tab (`frontend/template.html`)

3. **"TMs only" filter** — a toggle next to `#move-search`; when on, `renderMoves` shows only moves
   with a `tm` field.
4. **TM label** — moves with a `tm` show a `TM{NN}` badge (zero-padded) on the card.
5. **Description on card** — render `move.description` on each move card (when present).

### C. Pokédex modal (`frontend/template.html`)

6. **Hover description** — `buildLearnsetList` / `buildTeachablesList` rows get `title="<description>"`
   so hovering a move shows its description (native tooltip; resilient, no extra JS).

### D. Icons & tooltips (`frontend/template.html`)

7. **Star unification** — replace the three literal `⭐️` "added/new" markers (added learnset move
   ~L1427, new teachable ~L1452, added ability ~L954), the `✦` legendary glyph (~L1328), and the `✨`
   sparkle (~L683) with `getIcon('star', …)`. Leave the `buffed`/BST-up indicator (`buffed.png`) as-is.
8. **Captured tick → pokéball** — add `frontend/assets/pokeball.png` (from `aseprite/`); the Encounters
   "Captured" control (~L1303–1306) renders `getIcon('pokeball', …)` instead of `✓`, tooltip
   "Mark as captured".
9. **Delayed tooltip** — the clock control (~L1299) tooltip → "Mark as delayed".
10. **Fainted tooltip** — every grave/fainted control (~L1291 Encounters, ~L2685/2691 box modal,
    box-faint buttons) tooltip → "Mark as fainted".

### E. Champion victory mail (`frontend/template.html`, T-007 Mail engine)

11. When the boss with flag `FLAG_IS_CHAMPION` is defeated, generate one congratulatory mail
    (type `champion`): max priority (`TYPE_PRIORITY.champion = -1` so it sorts above all others),
    `star.png` badge, "Congratulations — you beat the game!" copy. New type wired into
    `TYPE_PRIORITY`/`TYPE_LABEL`/`TYPE_BADGE` and the render filter chips; excluded from the per-type
    mute list (you don't mute your victory). Idempotent (`addMail` id keyed by the champion flag);
    removed if the champion flag is un-defeated (existing `_gen`/`deleteMailsForFlag` flow).

## Acceptance criteria
- [x] `parseMovesFile` returns the full, human-readable description for multi-line and single-line moves; covered by a unit test that fails before the fix.
- [x] Each TM move in the pipeline output carries its correct 1-based TM number; non-TM moves carry none; covered by a test.
- [x] Moves tab has a "TMs only" filter that shows only TM moves; combines with the search box. (Also sorts by TM number when active, and shows each TM's in-world location — added per round-2 feedback.)
- [x] TM moves show a `TM{NN}` label and every move shows its description on its card.
- [x] Hovering a move in the Pokédex modal (learnset & teachables) shows its description. (Via the app's `data-tooltip` mechanism — native `title` did not surface.)
- [x] The `⭐️` added/new markers, the `✦` legendary glyph and the `✨` sparkle all render `star.png`.
- [x] Encounters "Captured" uses a pokéball icon with tooltip "Mark as captured"; clock tooltip is "Mark as delayed"; grave tooltip is "Mark as fainted" everywhere it appears.
- [x] Defeating Champion Steven adds a single max-priority victory mail with a star badge; it sorts to the top and is removed if the champion is un-marked.
- [ ] `cd randomizer && npm test` green; `node scripts/check-tracker.mjs` green; `node build.js` succeeds (bundle + assets re-embed); app (`index.html`) unaffected; docs stay self-contained.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-20** — Task created. Explored the data pipeline and template: descriptions are inline
  multi-line `COMPOUND_STRING` in `moves_info.h` (parseable — resolves the user's "if not available
  we'll have to get it"); TM numbers derive from `tmList`; icons via `getIcon`; `pokeball.png` source
  exists in `aseprite/`. Star scope confirmed with user: `⭐️` + `✦` + `✨` → `star.png`, `buffed.png`
  left alone. T-010 confirmed committed+merged by the user; starting on a fresh `feature/T-011` branch.
- **2026-06-20** — Implemented all 11 plan items.
  - **Pipeline (TDD, both red→green):** `parser.parseMovesFile` now resolves single-line, multi-line
    and shared-`static const`-pointer `.description`s (helpers `joinStringSegments` /
    `parseDescriptionConsts`); real-file check = 845/847 moves with clean descriptions, 0 garbage.
    `tmRandomizer.annotateTmNumbers(moves, tmList)` stamps 1-based TM numbers, called in
    `runPokedexModule` after `tmList` (browser + Node paths). New tests
    `parserMovesDescription.test.js`, `tmNumberAnnotation.test.js`; updated the `tmRandomizer` mock in
    `pokedexModule.test.js` (added `buildTMList`/`annotateTmNumbers` to match the real interface).
  - **Template:** Moves tab "TMs only" chip + per-card `TM{NN}` badge + description; modal move rows
    get a `title=` hover description (`escAttr`/`moveDescAttr`); `⭐️`/`✦`/`✨` visible markers →
    `getIcon('star',…)` (buffed left alone); Encounters captured control → `getIcon('pokeball',…)` +
    tooltip "Mark as captured"; clock tooltip "Mark as delayed"; grave tooltip "Mark as fainted"
    (Encounters + box modal). Added `frontend/assets/pokeball.png` (from `aseprite/`).
  - **Mail (T-007):** new `champion` type — `TYPE_PRIORITY.champion=-1` (sorts top), star badge,
    "Congratulations — you beat the game!"; generated on `FLAG_IS_CHAMPION` defeat; filterable (chip
    appears only once won) but not mutable; `reconcileEvo` keep-list updated so it isn't purged.
  - **Verification:** `node build.js` OK (22 assets — pokéball embedded); full suite 429 green;
    `check-tracker` OK; all 15 inline template scripts parse; generated a real doc (browser-mode, no
    source mutation — restored the incidental `data/maps` writes) and headless-loaded it (Chrome,
    0 console errors): confirmed TM labels (TM03/69/93), card descriptions, "TMs only" chip, 47
    modal hover-title rows, tooltips (captured 183 / delayed 183 / fainted 193), LEGENDARY badge as
    `<img>`, and the champion mail (title + `.mail-champion` row + Champion filter chip). Residual
    `⭐️`/`✦` in the DOM dump are JS fallback literals inside `<script>` text, not visible UI.
  - **Pending user manual test before closing.**
- **2026-06-20** — Round 2 (user feedback after first manual test):
  1. **TMs-only now sorts by TM number** — `renderMoves` orders the filtered list by `tm` when the
     chip is active (alphabetical otherwise).
  2. **TM location on cards** — each TM move shows a `location.png` icon + the in-world location
     (route + trainer), e.g. "Pick — Route 106", "Gym reward — Roxanne". Sourced from
     `randomizer/docs/tms.md` (SSOT) via new `randomizer/tmLocations.js` (`parseTmLocations`, TDD:
     `tmLocations.test.js`), folded into `baseData` by `parseBaseData`, serialized in `build.js`, and
     attached per-move in `runPokedexModule` (`move.tmLocation`). 95/95 TM moves get a location.
  3 & 4. **Tooltips fixed** — the app's tooltip mechanism is the styled `data-tooltip` CSS (used by
     ability/flag tooltips), NOT native `title` (which wasn't surfacing). Switched the modal move-row
     hover (`moveDescAttr` + removed-teachables row) and the Encounters capture/delay/faint controls +
     box-modal faint button from `title=` to `data-tooltip=`.
  - **Verification:** full suite 432 green; `node build.js` OK; regenerated a real doc and headless
    re-checked (0 console errors): TMs-only renders TM01→TM06 (95 cards); TM cards show the location
    icon + route/trainer string; 46 modal move rows + the three Encounters controls now use
    `data-tooltip` with 0 leftover native `title`. Incidental `data/maps` writes restored.
  - **Pending user manual test before closing.**

## Outcome

Shipped all 11 planned items plus four round-2 refinements, user-confirmed via manual test.

**Pipeline (TDD):** `parseMovesFile` resolves single/multi-line and shared-const move descriptions
(`joinStringSegments`/`parseDescriptionConsts`); `tmRandomizer.annotateTmNumbers` stamps 1-based TM
numbers; `tmLocations.parseTmLocations` parses the `randomizer/docs/tms.md` SSOT into per-slot
locations, folded into `baseData` (`parseBaseData` → `build.js` serializable) and attached to moves in
`runPokedexModule`. New tests: `parserMovesDescription`, `tmNumberAnnotation`, `tmLocations`; updated
the `tmRandomizer` mock in `pokedexModule.test.js`.

**Viewer (`frontend/template.html`):** Moves tab "TMs only" filter (sorts by TM number when active),
per-card `TM{NN}` badge + in-world location (icon + route/trainer) + description; modal move-row hover
descriptions; `⭐️`/`✦`/`✨` → `star.png`; Encounters captured control → Poké Ball icon
(`frontend/assets/pokeball.png`); capture/delay/fainted tooltips. Mail engine gained a max-priority
`champion` victory mail (star badge) on `FLAG_IS_CHAMPION` defeat.

**Deviations from plan:**
- Tooltips use the app's existing **`data-tooltip`** styled-CSS mechanism, not native `title` (the
  plan's "native tooltip" — `title` did not surface in this app, so they were switched in round 2).
- Added TM **location** display + **TM-number sort** for the "TMs only" view (round-2 user requests,
  not in the original plan).
- The Abilities nav `✨` was left as its own `abilities.png` icon (the `data-icon` swap already
  replaces it; it's the section's identity, not a decorative star).

**Follow-ups:** none. Known cosmetic note: TM location/description tooltips inherit the global
`data-tooltip` `white-space: nowrap` styling (single wide line), consistent with ability tooltips.
