---
id: T-268
title: List Route 116 after the Roxanne reward in the docs
status: done            # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-11
updated: 2026-08-11
target-version: 0.9.0
links: []
blocked-by: []
---

# T-268 — List Route 116 after the Roxanne reward in the docs

## Context

The docs' encounter list follows the player's progression. Route 116 sat **before** the
`Roxanne Reward` entry (it comes straight after Route 115 in `wild.js`'s data order, and the
Roxanne reward is spliced in right after it), but the player only reaches Route 116 once Roxanne
is beaten — so the list showed a route the player cannot visit yet inside the pre-gym block.

The order is built twice — `writer.js` (analyze path, `out.html`) and `writerDocs.js` (bundle
path, the served docs) — from two copies of the same insertion table.

## Plan

1. Extract the shared insertion table into `randomizer/docsMapOrder.js` (`applyDocMapOrder`) so
   both writers order the docs from one place — verbatim move first, no behaviour change.
2. Red: unit test asserting `Roxanne Reward` follows Route 115 and Route 116 follows the reward.
3. Green: anchor the Roxanne reward on `MAP_ROUTE115` and re-insert Route 116 after
   `BOSS_ROXANNE_REWARD`.
4. Rebuild the browser bundle (`node build.js`) — the docs are built client-side too.

Acceptance criteria:
- [x] Docs encounter order reads `… Route 115 → Roxanne Reward → Route 116 → Route 106 …`.
- [x] `writer.js` and `writerDocs.js` share one ordering module (no second copy of the table).
- [x] Every other anchor (Brawly, Wattson, the Route 114 group, statics, legendaries) unchanged.
- [x] `cd randomizer && npm test` green.
- [x] Owner sees Route 116 after the Roxanne reward in a generated doc. — **waived**: the owner
      accepted the change on the test evidence without generating a doc (see Outcome).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-11** — Task created. Located the duplicated insertion table (`writer.js:797`,
  `writerDocs.js:348`); the trainer list already orders Route 116 after Roxanne, only the
  encounter-map list was wrong.

- **2026-08-11** — Moved the table verbatim into `randomizer/docsMapOrder.js` and wired both writers
  to it. Red on the new `__tests__/unit/docsMapOrder.test.js` (Route 115 → Route 116 instead of
  → Roxanne), green after anchoring the reward on `MAP_ROUTE115` and re-inserting Route 116 after
  `BOSS_ROXANNE_REWARD` (same `extractMap` treatment the statics already had). Added a guard so a
  null entry (map absent from `wild.js`) is skipped instead of pushed into the list. `wild.js` data
  order untouched — reordering it would move the wild plan's template keys. Suite green (199 suites,
  2344 tests); `node build.js` rebuilt the browser bundle so the client-side docs match.

- **2026-08-11** — Owner: this did not need the extra machinery. Correct — Route 116 already follows
  Route 115 in `wild.js`, so splicing the reward after Route 115 lands it between the two on its own.
  Dropped the `extractMap('MAP_ROUTE116')` + `afterMap: 'BOSS_ROXANNE_REWARD'` pair; the whole fix is
  one anchor (`MAP_ROUTE116` → `MAP_ROUTE115`). Same output, tests unchanged and still green.
  Also checked the alternative of reordering `wild.js` itself: it would not have fixed anything (a
  reward is spliced right after its anchor, so it would have travelled with the route) and it is not
  docs-only — `buildWildPlan` sweeps `maps` in array order and draws from the RNG as it goes, so
  moving an entry there changes which species land on which route.

- **2026-08-11** — Closed on the owner's explicit instruction ("asumo que está bien así que cierra"),
  without a doc generated from a run — the acceptance is the unit test plus the owner's call. The
  shared-module extraction stayed in after being offered for revert.

## Outcome

Shipped: the docs' encounter list now reads **Route 115 → Roxanne Reward → Route 116 → Route 106**.
The whole behaviour change is one anchor in the insertion table (`MAP_ROUTE116` → `MAP_ROUTE115`);
Route 116 already followed Route 115 in `wild.js`'s order, so the reward slotting in ahead of it is
all it took.

Deviations from the plan: step 3's "re-insert Route 116 after `BOSS_ROXANNE_REWARD`" was built and
then removed as unnecessary machinery (owner call, logged above) — the anchor alone is equivalent.
The plan's step 1 (extraction into `randomizer/docsMapOrder.js`) was not required by the fix; it
stayed because it kills the 30-line table duplicated across `writer.js`/`writerDocs.js` and gives
`__tests__/unit/docsMapOrder.test.js` a seam that does not need the whole pipeline. `applyDocMapOrder`
also skips null entries now, so a map missing from `wild.js` no longer pushes a hole into the docs.

`wild.js`'s map order was deliberately left alone: `buildWildPlan` sweeps it in array order while
drawing from the RNG, so reordering it would change which species land on which route — and it would
not have fixed the docs anyway, since each reward is spliced right after its own anchor.

No follow-ups spawned.
