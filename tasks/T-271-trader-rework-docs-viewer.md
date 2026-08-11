---
id: T-271
title: Show the 15 traders in the docs — several trades per route, learned TMs and perfect IVs
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-08-11
updated: 2026-08-11
target-version: 0.9.0
links: [T-269, T-270]
blocked-by: [T-269]
---

# T-271 — Show the 15 traders in the docs — several trades per route, learned TMs and perfect IVs

## Context

The viewer renders a town trade as a sub-card on the **wanted** species' encounter tile, keyed by
route id: `entry.trade` (one per route) and, in the nuzlocke tracker, a trade/undo button keyed by
`data-trade-route`. With [T-269](T-269-trader-rework-pipeline.md) the wanted species can sit on any
earlier route and **two traders can want species from the same route**, so the one-trade-per-route
assumption breaks. The gift also carries facts the player cannot see anywhere else — which TMs it
already knows and how many IVs are perfect.

## Plan

1. Attach trades to the encounter entry of the **wanted species' own map** (from the run's
   `wildPlan`), as a **list** (`entry.trades`), in the single home shared by both writers
   (`writerDocs.js` for the bundle path, `writer.js` for the analyze path).
2. Viewer (`frontend/template.html`): render one trade sub-card per trade on the tile, adding the
   trader's city, the learned TM moves and the "N IVs at 31" line; the tracker's trade/undo button
   keys off the trade id instead of the route id.
3. `frontend/js/config-form.js`: the auto-nickname bucket count (`NAMEABLE_TRADES_GIFTS`) follows the
   15 trades; `randomizer/tradeNameWriter.js` + `modules/locationNames.js` name all 15.
4. `randomizer/docs/trades.md` — the design reference for the reworked traders (pool derivation, the
   quality rule, TM/IV grants, uniqueness), linked from the table in `CLAUDE.md`.
5. Rebuild the browser bundle (`node build.js`) — the docs are built client-side.

Acceptance criteria:
- [x] Every one of the 15 trades shows on its wanted species' encounter tile, including two on one
      route.
- [x] Each trade card names the city, the offered mon + level, its learned TMs and its perfect-IV
      count.
- [x] The tracker's trade / undo trade still swaps the right captured mon with several trades in play.
- [x] Auto-nicknames cover the 15 trades with no collisions.
- [x] `randomizer/docs/trades.md` exists and is linked from `CLAUDE.md`; `cd randomizer && npm test`
      green; bundle rebuilt.

## Progress log

- **2026-08-11** — Task created (planned together with T-269/T-270).

- **2026-08-11** — Docs + viewer done; randomizer (2438), frontend (232), backend (240) and the
  Playwright docs specs all green.
  - `docsMapOrder.attachTradesToMaps()` is the one home for "which encounter entry does a trade show
    on": the map its WANTED mon is caught on (`wantedMapId`), as a LIST — both writer paths call it, so
    the analyze path and the served docs agree. `entry.trade` → `entry.trades` in the redactor too.
  - The card now shows the town, the gift + level, **the TMs it knows** and **how many IVs are
    perfect**; a route that two traders want from renders both cards.
  - The tracker is keyed by **trade id** everywhere (`docTradeState/docTrade/docUndoTrade`, the
    buttons, the PC modal) — routes stopped being unique keys the moment traders could share one. A
    traded entry is matched back to its trade through `store.trades[key].tradeId`.
  - `NAMEABLE_TRADES_GIFTS` 14 → 25 (10 gift maps + 15 traders), with the frontend drift test importing
    `TRADERS`.
  - **Found and fixed a real SSOT break while doing it:** the visual-test docs fixture had its own copy
    of `computeTrades` and never passed the move database, so every gift in the fixture arrived with no
    TMs. `computeTrades` is exported from `generate.js` now and the fixture calls it — the fixture makes
    the same decision the app does (including growing the mega pool).
  - New Playwright case: all 15 trade cards render, none twice, every town named, with TM and IV lines.
    `npm run shoot --only docs` reports no horizontal overflow at any of the 5 viewports.
  - Note for the owner: the docs-encounters **pixel baselines** legitimately changed (the card grew two
    lines and there are more of them). CI does not run the visual suite; refresh the baselines with
    `npm run visual:update` next time you review the shots in an environment where they are valid.

## Outcome

<!-- Filled when closing. -->
