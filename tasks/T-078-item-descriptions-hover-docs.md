---
id: T-078
title: Show item descriptions on hover in generated docs (held items + trainer rewards)
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-09
updated: 2026-07-09
target-version: 0.6.0
links: []
blocked-by: []
---

# T-078 — Show item descriptions on hover in generated docs (held items + trainer rewards)

## Context

The docs viewer already surfaces hover tooltips (via the `data-tooltip` attribute + CSS
`::after`) for abilities, moves and natures on trainer cards. Held items (`.rm-item`) and
trainer rewards (`.reward-item`) render with no tooltip, so hovering them shows nothing.

We want item descriptions to appear on hover for both held items and rewards. Item names/
descriptions live in the C decomp at `src/data/items.h` (`.name = ITEM_NAME("…")`,
`.description = COMPOUND_STRING(…)`). No item metadata is injected into docs today.

Both the held-item value (`member.item`) and reward strings reach the DOM as display NAMES
(e.g. `"Choice Scarf"`, produced by `writerDocs.itemIdToName`/hardcoded trainer defs), not
`ITEM_*` ids — so the injected description map must be keyed by display name.

## Plan

TDD (randomizer Jest suite):
1. Add `parseItemsFile(text)` to `randomizer/parser.js` (modelled on `parseMovesFile`/
   `parseAbilitiesFile`): parse `src/data/items.h` into a `{ [name]: description }` map,
   handling multi-line `COMPOUND_STRING` and shared-const `.description` pointers via the
   existing `joinStringSegments` / `parseDescriptionConsts` helpers.
2. Thread it through the base-data pipeline: `parseBaseData()` → `items`; surface on the
   pokedex artifact (`runPokedexModule` return) and in `build.js` `serializable` (so the
   browser bundle's base-data.json carries it).
3. Inject `const itemsData` into the doc in BOTH runtimes: Node (`randomizer/writer.js`, +
   write `output/items.js`) and browser (`frontend/js/app.js` `buildDocHtml`), replacing a new
   `<script src="items.js"></script>` placeholder in `frontend/template.html`. Add
   `TEMPLATE_ITEMS_REPLACEMENT` to `randomizer/constants.js`.
4. Consume in the template: add `data-tooltip` to `.rm-item` (held items) and `.reference-item`/
   reward entries, looking up `itemsData[name]`. For `TM <Move>` rewards, fall back to the move
   description (already available via `movesData`). Only attach a tooltip when a description is
   found.
5. Rebuild the browser bundle + base data (`node build.js`).

Acceptance criteria:
- [x] `parseItemsFile` returns descriptions for known items (e.g. Choice Scarf, Leftovers,
      Power Herb) — unit-tested.
- [x] `itemsData` is injected by both the Node (`out.html`) and browser (`buildDocHtml`) paths.
- [x] Held-item spans and reward entries carry `data-tooltip` with the item's description; TM
      rewards show the move description.
- [x] Entries with no known description get no tooltip (no empty bubble).
- [x] `cd randomizer && npm test` and `cd frontend && node --test` green.
- [x] Manual: hover a held item and a reward in the generated docs → description shows.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Mapped the tooltip mechanism (`data-tooltip` + CSS `::after`),
  the two doc-build runtimes (`writer.js` / `app.js buildDocHtml`) and the item-description
  source (`src/data/items.h`). Confirmed items reach the DOM as display names → description map
  must be name-keyed.
- **2026-07-09** — Implemented. TDD Red→Green: `parseItemsFile` (parser.js) → name→description map
  (777 items), unit-tested. Threaded through `parseBaseData`/`runPokedexModule` (+ `items.json`
  cache) and `build.js` `serializable`; injected as `const itemsData` in both runtimes (writer.js
  → out.html + output/items.js; app.js `buildDocHtml`; fixture builder). Template: added the
  `items.js` placeholder, a name-keyed `itemRewardTooltip` helper (item description, or the taught
  move's description for `TM <Move>` rewards) and wired `data-tooltip` onto `.rm-item` + reward
  entries (only when a description exists). Rebuilt base-data + bundle. Playwright regression in
  `visual-tests/interaction.spec.mjs` (held item carries a non-empty tooltip). Randomizer (774) +
  frontend (50) suites green. Pending: manual hover check in the generated docs.

- **2026-07-09** — Follow-up (user feedback): the reward-chip tooltip clipped off the left because
  reward chips sit in the narrow left rail and the shared tooltip is centred. Added a left-anchored
  override `.reward-item[data-tooltip]::after { left:0; right:auto; transform:none; }` so it starts at
  the chip and grows only rightward. Structural guard in `frontend/__tests__/docs-tooltip.test.js`.

## Outcome

Shipped: item descriptions parsed from `src/data/items.h` (`parseItemsFile`, name-keyed) and injected
as `itemsData` in both doc runtimes (Node `writer.js` → out.html, browser `buildDocHtml`). Held items
and trainer rewards now show a hover tooltip; TM rewards show the taught move's description; entries
with no known description get no tooltip. Follow-up: reward-chip tooltips left-anchored so they no
longer clip off the left rail. Validated in production (pokemon-emerald-cut.com).
