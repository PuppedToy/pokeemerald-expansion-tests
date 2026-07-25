---
id: T-200
title: Auto-nickname pool selection, global uniqueness & low-pool warning + separate trades/gifts naming
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-068, T-070, T-194, T-201]
blocked-by: []
---

# T-200 — Auto-nickname pool selection, global uniqueness & low-pool warning + separate trades/gifts naming

## Context

Builds on the existing auto-nickname feature — [T-068](T-068-starter-nicknames.md) (starter-extra nicknames)
and [T-070](T-070-location-based-nicknames.md) (location-based nicknames) — which both consume the single
shared `nicknames` config (one name pool, `differentPerGender`, `lockGenderPerRoute`, sharing switches).
The owner raised **one new config option** plus **three behavioural questions ("dudas")** about how the
name pools are consumed. This task answers each against the current code and implements the agreed behaviour.

Follow-up display work (nicknames shown in the viewer + capture/uncapture nickname state) is split into a
separate task, [T-201](T-201-docs-nickname-display-and-capture-state.md), **whose definition must be revisited
in light of this task's output** (per owner request).

### Findings from the current code (the answers to the three "dudas")

Read `randomizer/modules/starterNames.js`, `randomizer/modules/locationNames.js`,
`randomizer/generate.js` (`attachStarterNaming` / `attachLocationNaming`), `randomizer/data/encounterLocations.js`,
`frontend/js/config-form.js` (Nicknames section).

- **Duda 1 — pool used when "auto-nickname every Pokémon by location" is ON but "lock gender per route" is
  OFF.** *Current behaviour does NOT match the expectation.* `buildLocationNaming` flips a 50/50 coin and
  draws from the **gendered** pools (`female ∪ both` or `male ∪ both`) whenever `differentPerGender` is on;
  `lockGenderPerRoute` only controls whether that gender is *forced in-game*. So without the lock a route can
  get a gendered name ("John") on a Pokémon of the other gender. **Expected:** without the lock, draw **only
  from the unisex ("both") pool** (no gender mismatch is possible), and add an inline message in the config
  explaining this.
- **Duda 2 — behaviour when the pool has fewer names than entities to rename.** *Current behaviour already
  matches the expectation.* Names are drawn **without replacement** (a `used` set); when a pool is exhausted
  the remaining entities get `nickname: null` → no auto-nickname (vanilla). A name never repeats within a
  sharing group. → lock this in with explicit regression tests.
- **Duda 3 — is a name guaranteed unique across the WHOLE game, drawn permanently from the pool?** *No, not
  today.* `buildStarterNaming` and `buildLocationNaming` keep **independent** `used` sets (and are decorrelated
  by `LOCATION_SALT`), so the same name can be a starter AND a route name. Town trades ([T-194](T-194-randomized-town-trades.md))
  are not auto-named at all. **Expected:** one shared without-replacement draw per sharing group across every
  auto-named entity, and a **live low-pool warning** in the config UI when the feeding pool(s) cannot cover
  the number of nameable entities.

## Plan

Four cohesive pieces. All randomizer-core logic is pure/seeded → TDD (Red→Green) in `randomizer/__tests__`.

### A. Extra config — separate "trades & gifts" naming toggle
New sub-option under **Nicknames**: **"Random name for trades and gifts"** (config key
`nicknames.autoTradesGifts`, **default ON**), shown only when auto-nickname is on. Gifts and town trades are
pulled OUT of the wild/route bucket into their own bucket controlled by this switch (same gender logic).
- Categorise `encounterLocations.js` into buckets: `wildRoutes`, `statics`, `gifts` (keep map keys; tag each).
- Add town-trade "locations" (T-194 relocated trade NPCs) to the gifts/trades bucket.
- `buildLocationNaming` (or a small refactor) honours `autoLocation` for wild-routes + statics and
  `autoTradesGifts` for gifts + trades independently.
- **C-engine note:** wild/scripted-wild/gift already have hooks (T-070). Town trades may give the mon through
  a different give-path — naming them in-ROM may need a new hook (**builder-only compile**, cannot verify
  locally; mirror the gift hook). Scope the in-ROM trade naming carefully; the JS/bundle/warning logic must
  land regardless.

### B. Duda 1 — "both"-only pool without gender lock
When names are gendered (`differentPerGender`) but the relevant lock is OFF, draw the affected bucket's names
**only from the `both` pool**. Add an inline config message stating that turning the lock off restricts naming
to the unisex pool. (When `differentPerGender` is OFF there is a single merged pool — no change.)

### C. Duda 2 — pool exhaustion (already correct → lock it in)
Explicit tests: exhausted pool ⇒ later entities `null`; no name ever repeats within a group.

### D. Duda 3 — global uniqueness + live low-pool warning
- **Unify the draw:** one shared `used` set per sharing group across main starter (if `includeStarter`) +
  extra starters + wild routes + statics + gifts + trades. No auto-nickname repeats anywhere in a ROM.
  (Preserve determinism and the existing sharing-group matrix; document the new single-pass ordering.)
- **Nameable-entity counts:** compute and expose the counts the frontend needs — `wildRoutes`, `statics`,
  `gifts`, `trades`, `extraStarters` (+1 for the main starter when `includeStarter`). Persist them where the
  browser config form can read them (they depend on config: extra-starter count, which toggles are on).
- **Live warning (approximate, per owner's criterion):** total-needed = Σ enabled nameable categories; for the
  active pool configuration warn when an effective feeding pool < total-needed:
  - `differentPerGender` OFF → single pool < total ⇒ warn.
  - `differentPerGender` ON (+ lock where applicable) → `female ∪ both` < total OR `male ∪ both` < total ⇒ warn
    (worst case all entities land on one gender — the owner's "femenino+both < 10 or masculino+both < 10").
  - Any bucket with its gender-lock OFF collapses to `both` only → `both` < that bucket's count ⇒ warn.
  Message: "with this few names some Pokémon will be left unnamed" (exact copy TBD with owner).

Acceptance criteria:
- [x] `nicknames.autoTradesGifts` (default ON) gates gift + town-trade naming independently of `autoLocation`;
      round-trips through save/load/reset and forwards to the worker + backend generator. *(gift maps named
      in-ROM via the existing hook; trade naming attached to the bundle + validated — in-ROM trade application
      deferred, see below.)*
- [x] Duda 1: with the gender lock OFF, gendered configs draw route/gift names only from the `both` pool; an
      inline config message states this. Regression test proves the old gendered-pool leak is gone.
- [x] Duda 2: pool-exhaustion leaves later entities unnamed (`null`); no auto-nickname repeats within a group
      (regression tests, Red→Green).
- [x] Duda 3: a single shared draw makes every auto-nickname globally unique across starters + wild + statics
      + gifts + trades within a ROM; determinism per seed and the sharing-group matrix preserved.
- [x] Nameable-entity counts computed and available to the config form; live low-pool warning appears per the
      criterion above (unit-tested on the count/threshold logic + drift-guarded to the randomizer SSOT).
- [x] Feature-off bundle byte-identical (feature-off attaches nothing); `cd randomizer && npm test` (1670),
      `cd backend && npm test` (177), `cd frontend && npm test` (159), `node build.js` all green; owner
      validated the config UX (2026-07-25); the in-ROM town-trade nickname hook decided → split to T-202.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created and set in-progress (branch `feature/T-200-auto-nickname-pools-uniqueness-warnings`
  off master). Investigated the current auto-nickname code and answered the three dudas (see Context → Findings):
  Duda 1 needs a behaviour change (both-only without lock), Duda 2 is already correct (lock it in with tests),
  Duda 3 needs a unified global-uniqueness draw + a live low-pool warning. Extra config = a separate
  `autoTradesGifts` toggle. Plan A–D above. Starting TDD on the randomizer core.
- **2026-07-25** — **Increment 1 done (Duda 1 + Duda 2), TDD Red→Green.** `randomizer/modules/locationNames.js`:
  when `differentPerGender` is on but `lockGenderPerRoute` is off, names now come ONLY from the unisex `both`
  pool (gender null) instead of the gendered `gender ∪ both` pools — a gendered name can no longer land on a
  wrong-gender mon. **Deliberate spec change**: updated the existing test
  `randomizer/__tests__/unit/locationNames.test.js` ("differentPerGender WITHOUT lockGenderPerRoute …") to
  assert `both`-only (was asserting `/^[MFB]/`); added a Duda-2 exhaustion/no-repeat test for the lock-off path.
  Full randomizer suite green (1657 passed, 0 failed). NOTE the consequence to carry into Duda 3's warning:
  with the lock off, the effective pool shrinks to `both` only, so far fewer mons get names — the low-pool
  warning must account for it. Next: confirm the two config forks (below) before the Duda-3 unification + config A.
- **2026-07-25** — Config forks resolved by owner: (1) the new **"Random name for trades and gifts"** toggle
  (`autoTradesGifts`, default ON) is shown whenever **"Enable nicknames"** is on, independent of auto-location.
  (2) **Statics stay with wild routes** under the auto-location toggle. So the buckets are:
  `autoLocation` → wild routes + statics; `autoTradesGifts` → gym-reward gifts + fossils + town trades.
  Categorising `encounterLocations` into {wildRoutes, statics, gifts} + adding town-trade locations next.
- **2026-07-25** — Location categorisation (diffed `ENCOUNTER_LOCATIONS` vs `src/data/wild_encounters.json`).
  134 = **120 wild routes** + **14 non-wild**. Split of the 14: **4 statics** (`MAP_ANCIENT_TOMB`,
  `MAP_DESERT_RUINS`, `MAP_ISLAND_CAVE` = Regis, `MAP_SKY_PILLAR_TOP` = Rayquaza) and **10 gifts**
  (8 `*_GYM*` reward maps + `MAP_ROUTE119_WEATHER_INSTITUTE_2F` + `MAP_SLATEPORT_CITY_OCEANIC_MUSEUM_2F`).
  So `autoLocation` = 120 routes + 4 statics = **124** map keys; `autoTradesGifts` = **10** gift map keys + the
  **4** town trades. (Groudon/Kyogre + New Mauville etc. carry wild encounters → already counted as wild routes.)
- **2026-07-25** — **Scope finding — town trades are NOT map-keyed.** `randomizer/trades.js` identifies each of
  the 4 town trades by `ingameTradeId` (an `sIngameTrades[]` slot) + `routeMapId`, and the received mon comes
  through the **in-game trade give-path**, not `CreateWildMon` / `ScriptGiveMonParameterized`. So the existing
  MAP-keyed `location_nicknames` C table + hooks (T-070) do **not** reach traded mons. Consequences:
  (a) **docs** naming of trades (T-201) is trivial — the offered species is known per trade;
  (b) **in-ROM** naming of a traded mon needs a NEW hook on the trade give-path keyed by trade slot
  (builder-only compile) — heavier than gifts. Plan: the JS/bundle/warning + docs naming lands regardless;
  scope the in-ROM trade nickname as its own sub-step (may mirror the gift hook or be deferred if costly).
- **2026-07-25** — **Increment 2 done (Duda 3 core + config-A buckets), TDD Red→Green.** Landed the unified
  global-uniqueness draw + the bucket split:
  • `randomizer/data/encounterLocations.js` → categorised into `WILD_ROUTE_LOCATIONS` (120), `STATIC_LOCATIONS`
    (4), `GIFT_LOCATIONS` (10); `ENCOUNTER_LOCATIONS` byte-identical (derived union). New partition test.
  • `starterNames.js` + `locationNames.js` → thread an optional shared `usedByGroup` Set per sharing group;
    generalised location naming into `buildKeyedNaming` (+ `buildTradeNaming`, salted, id-keyed). Absent
    `usedByGroup` ⇒ identical behaviour (all 32 existing builder tests green). New `autoNamingGlobalUniqueness`
    test proves no repeat across starters+locations+trades (and the "without the shared set they collide" guard).
  • `generate.js` → new `attachAutoNaming` orchestrator: one shared `usedByGroup`, draw order
    starters→locations→trades. `attachLocationNaming` now gates `autoLocation` (wild+static) and
    `autoTradesGifts` (gifts, default ON) into the single `locationNaming` artifact; new `attachTradeNaming`
    attaches per-ROM `tradeNaming` (keyed by ingameTradeId). Updated the generate naming tests for the new
    gating (deliberate spec change) + new `generateAutoNaming` test.
  • `backend/build/bundleSchema.js` → generalised `validateLocationNaming`→`validateKeyedNaming`, now validates
    `tradeNaming` too (safe key + sanitised name). Backend tests +2.
  Config forwarding needs no change — worker + backend pass `nicknames` wholesale, so `autoTradesGifts` rides
  along. Suites: randomizer 1668 green, backend 177 green. Next: frontend toggle + Duda-1 message + live warning.
- **2026-07-25** — **Increment 3 done (frontend + live warning), TDD Red→Green.**
  • `frontend/js/config-form.js`: added the **Random name for trades and gifts** toggle (`autoTradesGifts`,
    default ON) with read/set wiring; updated the auto-location copy (gifts moved out); added the Duda-1
    **both-only note** (shown when different-per-gender is on but the lock is off); lock-gender is now enabled
    for ANY location bucket (auto-location OR trades&gifts). Pure exported `nicknamePoolWarning` +
    `nicknamePoolMessage` + a `#nickname-pool-warning` banner synced from `_syncUI`.
  • Tests: `frontend/__tests__/nickname-warning.test.js` (warning thresholds + a **drift-guard** importing the
    randomizer `encounterLocations` buckets + `TOWN_TRADES` so the frontend counts can't silently diverge);
    updated `config-form.test.js` + `config-roundtrip.test.js`. Frontend suite 155 green.
  • Rebuilt the browser bundle (`node build.js`) so the client-side worker carries the randomizer changes
    (bundle + base-data/sprites are gitignored → not committed). Added the `[Unreleased]` changelog line.
  All suites green: randomizer 1668, backend 177, frontend 155.
- **2026-07-25** — **Deferred sub-step (noted): in-ROM town-trade nickname hook.** Gifts are already named
  in-ROM (existing `ScriptGiveMonParameterized` hook, gift maps in the `locationNaming` C table). Town trades
  are NOT map-keyed and go through the trade give-path, so applying `tradeNaming` in-game needs a NEW C hook +
  a trade-nickname writer + make.js wiring — **builder-only compile, unverifiable locally** (same risk class as
  B-020/B-022). The `tradeNaming` artifact is already computed, globally-unique and in the bundle (feeds the
  T-201 docs). Decide with the owner whether to build the in-ROM trade hook now or ship trade names in the docs
  only for this version.
- **2026-07-25** — **Increment 4 (owner feedback on the warnings), TDD Red→Green.**
  • Moved both warning banners to sit **between the both|female|male tabs and the pool textareas** (container
    `#nickname-warnings`, repositioned above the single textarea when different-per-gender is off), instead of
    the top of the box.
  • Added a **second, independent warning**: names longer than 12 chars are listed with a note that they'll be
    **removed unless shortened**. Backed by making `normalizePool` (shared by all naming) **drop >12-char
    names** — so the claim is true end-to-end and over-length pool names can no longer reach the bundle and fail
    schema validation. Frontend `poolSize` now also ignores >12-char names so the low-pool count agrees.
  • New pure exports `overlongPoolNames` / `overlongMessage`; both warnings co-exist (one below the other).
  • Tests: randomizer `normalizePool` drop->12 (+ `MAX_NICKNAME_LENGTH` export); frontend over-length +
    placement. Rebuilt the bundle. Suites: randomizer 1670, backend 177, frontend 159 — all green.
- **2026-07-25** — Owner decision: **docs first.** The in-ROM town-trade nickname hook is split into
  [T-202](T-202-in-rom-town-trade-nickname-hook.md) (proposed, blocked by this). T-200 is now code-complete
  (all three suites green) and awaits owner in-config validation (the new toggle, the both-only note, the live
  low-pool warning). Not closing — this task has manually-testable config UI, so it stays in-progress until the
  owner confirms. Also: owner added a new docs requirement (trade / undo-trade buttons) → folded into T-201's
  definition (the "revisit T-201" step), not into this task.
- **2026-07-25** — Owner validated the config UX and approved closing. Filled Outcome, status → done. Committed
  and merged to master; branched T-201 to start the docs work.

## Outcome

Shipped the auto-nickname pool/uniqueness/config rework across the randomizer + backend + frontend (all JS
layers; the in-ROM town-trade hook is deferred to T-202). Owner-validated the config UX 2026-07-25. Closed.

- **Answers to the three dudas.** *Duda 1:* without the per-route gender lock, gendered configs now draw
  route/gift names **only from the unisex "Both" pool** (gender null) — a gendered name can no longer land on
  a wrong-gender mon; the config panel says so. *Duda 2:* pool exhaustion leaves the rest **unnamed** and a
  name **never repeats** (locked in with tests). *Duda 3:* a single shared per-group without-replacement draw
  makes every auto-nickname **globally unique** across starters + wild + statics + gifts + trades.
- **New config.** `nicknames.autoTradesGifts` (default ON, shown whenever nicknames are enabled) names gift
  NPCs + town trades independently of the by-location toggle. `encounterLocations` split into
  `WILD_ROUTE_LOCATIONS` (120) / `STATIC_LOCATIONS` (4) / `GIFT_LOCATIONS` (10); statics stay with wild routes.
- **Two live config warnings** (between the Both/Female/Male tabs and the textareas): a low-pool warning
  (counts drift-guarded to the randomizer SSOT) and an over-length warning listing names > 12 chars; the
  latter is backed by `normalizePool` now **dropping** > 12-char names (so they can't reach the bundle / fail
  schema validation).
- **Bundle/schema.** New per-ROM `tradeNaming` artifact (keyed by `ingameTradeId`), validated by a generalised
  `validateKeyedNaming` in `bundleSchema.js`.

**Key files:** `randomizer/modules/{starterNames,locationNames}.js` (shared `usedByGroup`, `buildKeyedNaming`,
`buildTradeNaming`, `normalizePool` length drop), `randomizer/generate.js` (`attachAutoNaming`),
`randomizer/data/encounterLocations.js` (buckets), `backend/build/bundleSchema.js`, `frontend/js/config-form.js`
(toggle, both-only note, `nicknamePoolWarning`/`overlongPoolNames` + banners).

**Deviations / deferrals:**
- In-ROM town-trade nickname application is **not** in this task — split to **T-202** (builder-only C hook).
  Gifts are named in-ROM via the existing hook; the `tradeNaming` data is computed + in the bundle (feeds docs).
- **Follow-ups spawned:** T-202 (in-ROM trade hook). **Revisit note honoured:** T-201's definition was updated
  in light of this output (viewer hook-point map + the new owner requirement: `trade` / `undo trade` buttons).
