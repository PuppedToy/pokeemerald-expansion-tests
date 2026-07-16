---
id: T-073
title: Configurable shop item prices (mints, ability items, balls, TMs by pool)
status: done
type: feature            # feature | fix | refactor | docs | chore
created: 2026-07-07
updated: 2026-07-15
target-version: 0.6.0
links: [T-052]
blocked-by: []
---

# T-073 — Configurable shop item prices

## Context

Every town/city Mart in this repo sells: 3 balls (Ultra/Quick/Timer), the 20
non-neutral **mints**, **Ability Capsule**, **Ability Patch**, and — in larger
marts — **TMs**. Prices come natively from the `.price` field of each item in
`src/data/items.h`; there is currently **no** way to configure them (unlike
prize money, T-052). Because the game already reads `.price`, wiring is
data-only: patch `items.h` at build time (mirroring `randomizer/moneyWriter.js`)
and `make` bakes the prices into the ROM — **no C logic change needed**.

TMs are not categorised in `items.h`; the categories that exist are the
randomizer's **TM pools** (`randomizer/docs/tms.md` / `tmRandomizer.js`
`TM_RANGES`). Per owner decision (2026-07-07) TMs are priced **by pool** (10
categories); several pools may share a default price ("aunque algunas repitan
precio"). The 3 balls (not in the owner's original list, found at price 10) are
included per owner decision.

## Plan

**Config (`frontend/js/config-form.js`)** — new **Shop prices** subsection inside
the existing **Rewards** category. `DEFAULTS.prices` shape:
```
prices: {
  balls:   { ultra: 10, quick: 10, timer: 10 },
  mints:   { LONELY:250, NAUGHTY:250, BRAVE:250, LAX:250, MILD:250, RASH:250,
             QUIET:250, GENTLE:250, HASTY:250, NAIVE:250,          // 250 today
             BOLD:2000, IMPISH:2000, CALM:2000, CAREFUL:2000,
             RELAXED:2000, SASSY:2000,                              // 2000 today
             ADAMANT:3000, MODEST:3000, TIMID:3000, JOLLY:3000 },   // 3000 today
  abilityCapsule: 3000,
  abilityPatch:   5000,
  tms: { avgDmg:2500, avgStatus:2500, goodDmg:5000, goodStatus:5000,
         niche:3000, weather:3000, barriers:3000,
         strongDmg:10000, godlikeDmg:15000, godlikeStatus:15000 },
}
```
Mint/ability defaults are the **exact current `items.h` prices**. TM-pool defaults
are proposed (current per-TM prices don't map to pools); all are tunable in the UI.
`getConfig()`/`setConfig()`/event wiring like the money fields; rendered as tidy
sub-groups (Balls · Mints · Ability items · TMs by category).

**Writer (`randomizer/itemPriceWriter.js`, new)** — mirrors `moneyWriter.js`:
- `ITEM_PRICE_DEFAULTS` (same shape as above).
- Pure `patchPricesInContent(content, prices)`: line-scan `items.h`, track the
  current `[ITEM_X] =` block header, rewrite the block's `.price = \d+,` line for
  every targeted item. Mints → `ITEM_<NAME>_MINT`; balls → `ITEM_ULTRA/QUICK/TIMER_BALL`;
  ability items → `ITEM_ABILITY_CAPSULE/PATCH`; TMs → map `TM01..TM95` → pool
  (via `TM_RANGES` + weather 72–75) → `prices.tms[pool]`, writing all 95 `.price`s.
  HMs and `ITEM_SERIOUS_MINT` (config-gated ternary, not shop-stocked) are left untouched.
- `writeItemPrices(prices, { file })`: read → patch → write. Defaults reproduce
  the committed values (safe no-op when `prices` is undefined).
- Export `TM_RANGES` from `tmRandomizer.js` (or a shared pool-range map) as the SSOT
  for TM# → pool.

**ROM maker:** wire `await writeItemPrices(bundle.config?.prices)` into
`make.js buildOneRom` next to `writeMoney` (build-time patch; `restore()` already
reverts `src/`). `bundle.config` spreads the frontend config, so `prices` arrives
automatically. Add `src/data/items.h` to the CLAUDE.md never-commit/mutated list
for doc consistency.

Acceptance criteria:
- [ ] `patchPricesInContent` sets the exact `.price` for each of the 3 balls, 20
      mints, 2 ability items, and all 95 TMs by pool; leaves HMs and Serious Mint
      untouched (unit test, RED first).
- [ ] Defaults reproduce today's committed mint/ability prices (no diff when the
      config uses defaults for those items).
- [ ] Frontend: Rewards → Shop prices renders all fields with correct defaults and
      round-trips through get→set→get; `prices` reaches `bundle.config`.
- [ ] A built ROM reflects a changed price (owner manual-test on the builder).
- [ ] `cd randomizer && npm test` green; frontend config tests green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-07** — Task created. Mapped shops (all marts sell balls+20 mints+2
  ability items; larger marts + Ever Grande add TMs), current prices (mints
  250/2000/3000, Capsule 3000, Patch 5000, balls 10), and the writer pattern
  (`moneyWriter.js`). Owner decisions: TMs priced by the 10 randomizer pools;
  3 balls included (default 10). Prices need NO C logic change — items.h `.price`
  is read natively; only `items.h` is patched at build time.
- **2026-07-07** — Implemented (TDD). RED then GREEN in
  `__tests__/unit/itemPriceWriter.test.js` (14 tests): balls/mints/ability/TM-pool
  prices patched; HMs, Serious Mint (ternary) and non-target items untouched;
  defaults reproduce committed values; clamping; a real-`items.h` cross-check; and
  a SSOT guard proving `TM_POOL_RANGES` matches `tmRandomizer` `TM_RANGES`+weather.
  New `randomizer/itemPriceWriter.js` (line-scan patch, mirrors `moneyWriter.js`);
  exported `TM_RANGES`/`FIXED_TMS` from `tmRandomizer.js`. Wired
  `writeItemPrices(bundle.config?.prices)` into `make.js buildOneRom` next to
  `writeMoney`. Verified all 20 mint + 2 ability + 3 ball defaults equal the
  committed `items.h` prices (script). Frontend: "Shop prices" block inside the
  Rewards category (balls · 20 mints · ability items · 10 TM pools), `PRICE_DEFAULTS`
  mirror, `_readPrices`/`_setPrices`, delegated `#shop-prices` wiring. Tests:
  randomizer 736✓, frontend 49✓ (structural + round-trip). `prices` flows to
  `bundle.config` via the existing `config:{...cfg}` spread (no worker change — it's
  a build-time patch, exactly like `money`).
- **2026-07-07** — Decision: did NOT add `src/data/items.h` to CLAUDE.md's
  "generated files" list. That list is for files mutated during `analyze.js` runs;
  `items.h` (like `battle_script_commands.c`, the money target) is a build-time-only
  patch reverted by `make.js` restore(), and battle_script_commands.c is likewise
  absent from that list. Adding items.h would be inconsistent with the money writer.

## Outcome

Configurable shop prices (mints, ability items, balls, TMs by pool) as a build-time items.h patch flowing via bundle.config like money. randomizer + frontend suites green. Owner-validated 2026-07-15. Closed.
