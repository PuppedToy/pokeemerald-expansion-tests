---
id: T-201
title: Docs viewer — show auto-nicknames everywhere + tie the nickname to the capture state
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-068, T-069, T-070, T-194, T-200]
blocked-by: []
---

# T-201 — Docs viewer: show auto-nicknames everywhere + tie the nickname to the capture state

## Context

Follow-up to [T-200](T-200-auto-nickname-pools-uniqueness-warnings.md) (and the deferred
[T-069](T-069-starter-nickname-viewer-docs.md)). Once the auto-nickname assignment (starters + wild + statics
+ gifts + trades) is correct and globally unique, **surface those nicknames in the generated documentation
viewer** and make them behave with the viewer's capture/fainted state.

> **DEFINITION UNDER REVIEW.** Per owner request, this task's exact scope (which nickname data reaches the
> viewer, and the precise hook points) must be **revisited once T-200 lands**, because T-200 changes how/where
> the naming is computed and unified. Do NOT start until the owner validates T-200 and re-confirms this file.
> The exact viewer file:line hook points are being mapped during T-200 investigation and will be filled here
> before implementation.

## Plan

The viewer already tracks a per-Pokémon **captured / fainted** state (localStorage). This task shows the
assigned auto-nickname (from the T-200 naming artifacts) at every place a captured Pokémon is displayed, and
binds the nickname to the capture toggle.

### Display surfaces (owner spec)
1. **PC tab** — under each box Pokémon's species name show its nickname (e.g. `Kubfu` with `John` beneath).
   Both alive and fainted mons.
2. **Pokémon modal — "IN BOX" line** — replace the plain "IN BOX" with `<Nickname> is in box`
   (or `<Species> is in box` when it has no nickname), followed by `[Edit nickname]` and `[Mark fainted]`.
3. **Pokémon modal — Family section** — where it lists "Family pokémon in box:", render each as
   `Nickname (Species)`, e.g. `John (Kubfu)`.
4. **Pokémon modal — fainted** — `<Nickname> is fainted` (or `<Species> is fainted` with no nickname).
5. **Encounters box/tiles** — once a tile is captured (green/blue), show the nickname under the species name,
   as in the PC tab. Consequence: **auto-named extra starters already carry their name when the docs open**;
   an auto-named *main* starter shows its name only **after the starter is selected**.

### Capture-bound nickname behaviour (owner spec)
- The auto-nickname is applied to a Pokémon **only when it is marked captured**. **Un-capturing removes** the
  auto-nickname; **re-capturing re-applies** it.
- If the user **edited** the nickname and then un-captured, the **user's edited name is remembered** and
  restored on re-capture (persist the user override separately from the auto value).

### Trade action in the viewer (owner spec, added 2026-07-25)
A tradeable Pokémon (a town-trade *wanted/accepted* species, from [T-194](T-194-randomized-town-trades.md))
can be **traded** in the docs, which changes it into the trade's *offered* species — **with a different
auto-nickname** (the T-200 `tradeNaming` for that trade, distinct from the wanted mon's own location name).
- In the trade box, the tradeable Pokémon shows a **`trade`** button (text only, **no icon**); once traded it
  shows an **`undo trade`** button (text only, no icon). Present in **both the modal and the encounters box**.
- Trading swaps the displayed species → the offered species and applies that trade's nickname; **undo trade**
  reverts to the wanted species and its own (location) nickname. This is a capture-like state (persisted) that
  interacts with the capture/fainted + edited-nickname rules above.
- This is docs/viewer-only; the in-ROM application of the trade nickname is [T-202](T-202-in-rom-town-trade-nickname-hook.md).

### Implementation increments (finalised after T-200)
1. **Pipeline → viewer data.** Inject a `nicknamesData` blob into the docs template — `{ starters:
   rom.artifacts.starterNaming, locations: rom.artifacts.locationNaming, trades: rom.artifacts.tradeNaming,
   tradesInfo: rom.artifacts.trades }`. `buildDocHtml(template, rom, …)` (app.js ~233) and `writer.js`
   (~805-916) both have the full `rom`, so **no generation reorder is needed** (naming is already on
   `rom.artifacts` by HTML-build time). New `<script src="nicknames.js">` placeholder in `template.html`.
2. **Viewer nickname resolver + store.** A per-`routeId|slot` (and starter-slot / trade-id) resolver that maps
   a captured entry → its auto-nickname from `nicknamesData`; a new namespaced localStorage `nicknames_v1`
   holding `{ nickname, userEdited }` written on capture (see capture-bound rules), cleared on Reset (:3752).
3. **Display surfaces** (1-5 above) read the resolver: PC cell, modal IN BOX / family / fainted, encounters tile.
4. **Edit / capture binding**: `[Edit nickname]` override; auto applied on capture, removed on un-capture,
   user override remembered; starters (extra on load, main after selection).
5. **Trade action**: `trade` / `undo trade` text buttons (no icons) in the trade box (modal + encounters) that
   swap the mon to the offered species + its trade nickname, reversible.
6. Playwright/interaction coverage; no horizontal overflow; suites green.

### Acceptance criteria
- [x] All five display surfaces show nickname vs species per the rules above (with/without nickname).
- [x] `[Edit nickname]` persists a user override; `[Mark fainted]` toggles fainted; both survive reload.
- [x] Auto-nickname is present only while captured; un-capture clears it; re-capture restores auto (or the
      user override if one was set).
- [x] Auto-named extra starters show a name on load; auto-named main starter shows one only after selection.
- [x] Trade / undo-trade buttons (no icons) in the trade box (modal + encounters) swap species + nickname and revert.
- [x] Visual/interaction tests (Playwright) cover the surfaces; no horizontal overflow; suites green.
- [x] **Owner manually validated** the viewer (2026-07-25).

## Viewer hook-point map (investigation 2026-07-25)

Reference for implementation (subject to revision after T-200). All refs in `frontend/template.html` unless noted.

- **Headline:** *no nickname data reaches the viewer today.* The `starterNaming` / `locationNaming` artifacts
  are consumed only by the C writers; nothing is injected into the docs HTML. T-069 (thread naming into
  `writerDocs` → `rom.docs` → template) is **unbuilt**. So this task needs BOTH the pipeline wiring AND a new
  viewer-side capture→nickname state model.
- **Pipeline wiring needed:** `randomizer/writerDocs.js` returns only
  `{ trainersResultsSimplified, viewerTrainers, wildPokes, typeColors }`; injection happens in
  `frontend/js/app.js` `buildDocHtml` (~233-265) and `randomizer/writer.js` (~805-916). Naming is attached
  in `generate.js` **after** `computeRomDocs` (docs at :257/:425, naming at :261-262/:429-430) — the order must
  be fixed to thread naming into the docs pass (T-069's noted blocker).
- **Display surfaces:**
  1. PC tab — `renderPC` cell markup, `template.html:3696-3713` (species name span at :3711; `pcName` at :3695).
  2. Modal "IN BOX" — `window.docBoxSectionHTML`, :3602-3634; the "IN BOX" string at :3613; `[Mark fainted]`
     button already built at :3612. Modal injects it at :2422 (`showPokemonModal` at :2219).
  3. Family "Family Pokémon in box:" — same fn, alive branch :3615-3616 (`nm(alive.currentSpecies)` at :3616).
  4. Fainted line — same fn, :3617-3618 (already renders "`<Species> is fainted`" → swap in nickname).
  5. Encounters tiles — render loop :2058-2113 (species name `.nz-poke-name` at :2099); capture tinting via
     `applyLocVisuals` :2925-2960 (name sync point at :2960).
- **Capture / fainted state model (net-new nickname store):**
  - localStorage `nuzlocke_v1` (namespaced via `nsKey()` :1441): `nzState.locations[routeId] = { selected, delayed, fainted }`.
  - Toggle handlers — **capture/un-capture** `handleSelectChange(routeId, slot, checked)` :3080-3097 (the hook
    to assign auto-nickname on capture / clear on un-capture); **faint** `handleFaintChange` :3068-3078;
    modal→faint bridge `window.docSetFainted` :3648-3653.
  - Derived box membership: `capturedEntries()` :3276-3291 (entry key `routeId+'|'+slot`), `boxMembers()` :3292,
    `docBoxList` :3598, `docFaintedList` :3599.
  - **No per-Pokémon nickname store exists.** Design: a new namespaced key (e.g. `nicknames_v1`) mapping
    `routeId|slot` → `{ nickname, userEdited }`; write auto on capture unless a `userEdited` entry exists;
    clear the auto-only entry on un-capture; add the key to the Reset clear-list at :3752-3758.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed), blocked by T-200. Owner captured the full display + capture-state
  spec (above). Definition explicitly to be revisited after T-200 lands. Investigated + recorded the viewer
  hook-point map (above); key finding: no nickname data reaches the viewer today (T-069 unbuilt), so this task
  needs pipeline threading + a new viewer-side nickname store.
- **2026-07-25** — Definition revised in light of T-200 (as flagged): added the **Trade action in the viewer**
  section (`trade` / `undo trade` text buttons in the trade box, modal + encounters, no icons) — trading swaps
  the mon to the trade's offered species and applies its distinct T-200 `tradeNaming`. Owner chose "docs first":
  the in-ROM trade nickname hook is split out as [T-202](T-202-in-rom-town-trade-nickname-hook.md).
- **2026-07-25** — T-200 landed → set **in-progress** (branch `feature/T-201-docs-nickname-display-and-capture-state`
  off master), finalised the plan into 6 increments + acceptance criteria.
- **2026-07-25** — **Increment 1 done (pipeline → viewer data).** The auto-nickname assignments now reach the
  viewer as a `nicknamesData` blob `{ starters, locations, trades, tradesInfo }`. No generation reorder was
  needed — `buildDocHtml(template, rom, …)` (`frontend/js/app.js`) and `writer(...)` (`randomizer/writer.js`,
  new `locationNaming`/`tradeNaming` params threaded from `make.js`) both have the full `rom` at HTML-build
  time. New `nicknames.js` placeholder in `frontend/template.html` + `TEMPLATE_NICKNAMES_REPLACEMENT` in
  `constants.js`. Structural test `frontend/__tests__/nicknames-viewer-data.test.js`. Suites green (frontend
  162, randomizer 1670).
- **2026-07-25** — **Increments 2-4 done (resolver/store + PC & modal display + edit).** In
  `frontend/template.html`: (2) a nickname resolver — `autoNickname(entry)` maps a captured entry to its baked
  name (STARTER_EXTRA by position, wild/static/gift by MAP id, traded → trade name), `resolveNickname` lets a
  USER edit win and be remembered across un-capture; overrides + trade state live in the existing `store`
  (MAIL_KEY, so Reset clears them). Because only CAPTURED entries reach the resolver, a name shows only while
  captured (un-capture drops it, re-capture restores). (3) Display: PC cell shows the name under the species
  (`.pc-nick`); modal IN BOX line → "`<name|species> is in box`" + **Edit nickname** + Mark fainted; family →
  "`John (Kubfu)`"; fainted → "`<name|species> is fainted`". (4) `docEditNickname` prompt (sanitised to 12
  chars / [A-Za-z0-9 ]; blank clears back to auto). Fixture builder (`visual-tests/fixtures/build-doc-sample.cjs`)
  mirrors the injection + gained a `NICK_JSON` env to build a nickname-enabled fixture; verified `nicknamesData`
  populates end-to-end. Interaction spec: 11/11 relevant pass (modal/encounters/PC/faint) — the 1 failure is the
  pre-existing B-052 seed-drift (B-024 evolution-mail precondition), not this work.
  **Remaining:** encounters-tile name (inc. 3b), trade / undo-trade buttons (inc. 5), main-starter-after-select
  (spec 5), and nickname-specific Playwright tests (inc. 6). Uncommitted on the branch.
- **2026-07-25** — **Increments 3b + 5 + 6 done — T-201 functionally complete.**
  • **Encounters tile (3b):** a `.nz-poke-nick` under each tile's species name, populated by `applyLocVisuals`
    for captured (green/blue) slots via the window-exposed `docResolveNickname`.
  • **Trade action (5):** `store.trades[encounterKey]` marks a traded encounter; `capturedEntries` then shows
    the OFFERED species and `autoNickname` returns the trade's name. `trade` / `undo trade` text buttons (no
    icon) in both the modal IN BOX row and the encounters trade card (updated live by `applyLocVisuals`);
    `docTrade`/`docUndoTrade`/`docTradeState`/`docTileSpecies` bridge the separate script blocks; a de-captured
    encounter drops its trade (reconcileEvo). Encounters tile shows the offered species after trading.
  • **Main starter (spec 5):** `autoNickname` maps the `STARTERS` route → `nicknamesData.starters.starter`; its
    box entry only exists once a starter is picked, so the name appears only after selection.
  • **Bug found + fixed:** `renderPC` (a separate script block) called the bare `resolveNickname` (out of scope)
    → it must go through `window.docResolveNickname`; without the fix the PC grid broke whenever a mon was boxed.
  • **Tests (6):** `visual-tests/nicknames.spec.mjs` (4 desktop tests: capture→tile+PC name; un/re-capture;
    modal IN BOX + Edit; trade→offered+trade-name→undo) over a `NICK_JSON` fixture (`npm run fixture:nick`).
  All green: randomizer 1670, backend 177, frontend 162, interaction 7/7 relevant (the 1 fail is B-052 drift),
  nicknames 4/4, `npm run shoot` no overflow. Awaiting owner manual validation, then close + merge.
- **2026-07-25** — Owner validated the viewer and approved closing. Status → done, Outcome filled, changelog
  line added. Committed and merged to master.

## Outcome

Shipped the full auto-nickname display + capture/edit/trade behaviour in the generated docs viewer.
Owner-validated 2026-07-25. Closed.

- **Pipeline:** a `nicknamesData` blob (`{ starters, locations, trades, tradesInfo }`) is injected per ROM by
  both the browser path (`app.js` `buildDocHtml`) and the node/maker path (`writer.js`, new
  `locationNaming`/`tradeNaming` params from `make.js`); new `nicknames.js` template placeholder +
  `TEMPLATE_NICKNAMES_REPLACEMENT`. No generation reorder needed (naming is on `rom.artifacts` at HTML-build).
- **Viewer (`frontend/template.html`):** a resolver (`autoNickname`/`resolveNickname`, exposed as
  `window.docResolveNickname`) mapping a captured entry → its baked name (STARTER_EXTRA by position, main
  starter via the `STARTERS` route, wild/static/gift by MAP id, traded → trade name); user overrides + trade
  state persist in the existing `store` (so Reset clears them). Names show only while captured. Surfaces: PC
  cell, modal IN BOX ("`<name> is in box`") + Edit nickname, family ("`John (Kubfu)`"), fainted, encounters
  tile. Trade / undo-trade text buttons (modal + encounters) swap the mon to the offered species + its trade
  name and back.
- **Tests:** `visual-tests/nicknames.spec.mjs` (4 desktop interaction tests over a `NICK_JSON` fixture,
  `npm run fixture:nick`) + structural `frontend/__tests__/nicknames-viewer-data.test.js`. All suites green;
  no horizontal overflow.

Deviations / notes:
- Fixed a viewer bug found during the work: `renderPC` (a separate script block) called the bare
  `resolveNickname` — must route through `window.docResolveNickname`, else the PC grid broke with a boxed mon.
- In-ROM town-trade nickname application remains **T-202** (docs-only here, per the owner's "docs first").
- The pre-existing B-052 seed-drift (interaction B-024 evolution-mail precondition) is unrelated and still open.
