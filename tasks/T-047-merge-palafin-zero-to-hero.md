---
id: T-047
title: Merge the orphaned Palafin Zero-to-Hero rating branch into master
status: done
type: feature
created: 2026-07-02
updated: 2026-07-02
target-version: 0.6.0
links: []
blocked-by: []
---

# T-047 — Merge the orphaned Palafin Zero-to-Hero branch

## Context

`palafin-zero-to-hero-rating` (local + origin, tip `422802ec`) was never merged and is now **166
commits behind** master (merge-base `9e00e42`). It carries two commits:
1. `3c57247e` — Palafin Zero-to-Hero special-case rating + moveset rule (also adds the Wishiwashi
   Schooling rating special-case constants/logic).
2. `422802ec` — Wishiwashi special-case tests + extend trainer TM bags.

Goal: land this work on master **without breaking anything and without duplicating code**.

Investigation (before touching anything):
- Master has **no** Palafin/Wishiwashi rating logic in `rating.js`/`pokedexModule.js`/`constants.js`
  (grep-confirmed) → that logic is genuinely new, not a duplicate.
- Master independently added Wishiwashi bits: `SCHOOLING` in `rebalancer.js` BANNED_ABILITIES
  (actually pre-existing at the merge-base; `rebalancer.js` is unchanged base→master) and
  `SPECIES_WISHIWASHI_SCHOOL` in `wildModule.js` BANNED_SPECIES_FOR_PICKING.
- Expected conflicts: `wildModule.js` banned list (master added WISHIWASHI_SCHOOL; branch removes
  FINIZEN + PALAFIN_ZERO), and the `writer.js`/`writerDocs.js` import regions (overlap with the
  T-044 `typeMainColors`/`TEMPLATE_COLORS` edits). `rating.js`/`pokedexModule.js` may drift.

## Plan

Integration-branch approach (keep master clean until verified):
1. Branch `feature/T-047-merge-palafin` off master; merge the palafin branch in.
2. Resolve conflicts **combining** both sides (never dropping master's evolution nor the palafin
   logic; never re-adding what master already has):
   - `wildModule.js`: keep `WISHIWASHI_SCHOOL` + `PALAFIN_HERO` banned; unban `PALAFIN_ZERO` +
     `FINIZEN` (branch intent).
   - `writer.js`/`writerDocs.js`: keep the T-044 imports/logic **and** add the palafin
     imports/`palafinEffectivePoke`/`battlePoke` usage.
   - `rebalancer.js`: keep `SCHOOLING`, add `ZERO_TO_HERO`.
   - `rating.js`/`pokedexModule.js`/`constants.js`: apply the branch's additive logic onto current code.
3. Run the full randomizer suite (the branch ships `palafin.test.js`, `wildModule.test.js` additions
   and fixtures — these validate the merge). Green before considering done.

Acceptance criteria:
- [x] Palafin Zero placeable & rated as Hero; Palafin Hero + Wishiwashi School stay banned from picking.
- [x] No duplicated logic (master's existing Wishiwashi bans reused, not re-added).
- [x] `cd randomizer && npm test` green (including the branch's new palafin/wishiwashi tests).
- [x] T-044 (boss colours) and other recent work intact after the merge.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-02** — Merged `palafin-zero-to-hero-rating` into `feature/T-047-merge-palafin`. Of the
  branch-touched files, **all auto-merged cleanly except 3** (writer.js, writerDocs.js,
  wildModule.test.js). Resolutions: (a) writer/writerDocs imports — kept the T-044 lines
  (`typeMainColors`, `resolveRewardMegaStone`, `displayNameToItemConst`) **and** added
  `palafinEffectivePoke`; (b) the moveset region — kept **both** master's `selCtx` (T-013) block and
  the branch's `battlePoke` block, and every rater call now uses `battlePoke` + passes `selCtx`
  (the multi-line call sites had auto-merged both; only the single-line `adjustMoveset` in
  writerDocs needed the combine); (c) wildModule.test.js — kept master's `resolveRewardMegaStone` /
  `rewardMegaStones` describes **and** the branch's Palafin banned-list describe. No duplication: the
  banned list auto-resolved to `WISHIWASHI_SCHOOL`+`PALAFIN_HERO` banned, `PALAFIN_ZERO`+`FINIZEN`
  unbanned (branch intent); `rebalancer.js` kept pre-existing `SCHOOLING` + added `ZERO_TO_HERO`;
  rating/pokedex/constants logic is net-new. Verified: randomizer **523 pass** (37 suites — new
  palafin.test.js + wishiwashi.test.js run), backend 94, frontend 14; `analyze.js` runs the full
  pipeline end-to-end (Palafin + T-044 colours coexist). Awaiting owner review before merging to master.
- **2026-07-02** — Task created after investigating the orphan branch (see Context). Chose an
  integration-branch merge (not a raw merge on master, not a hand-port) so the branch history is
  preserved, master stays clean until tests pass, and the branch's own tests validate the result.

## Outcome

Landed the orphaned `palafin-zero-to-hero-rating` (166 commits stale) on master via an integration
branch. Palafin Zero is now placeable and rated/moved as its battle-only Hero form
(`palafinEffectivePoke` + `battlePoke` in both writers), Finizen is placeable, and Palafin Hero +
Wishiwashi School stay banned from picking; `ZERO_TO_HERO` joins `SCHOOLING` in the rebalancer ban
list. Wishiwashi Schooling rating special-case and its tests came along in the same branch.

Only 3 of the branch-touched files conflicted (writer.js, writerDocs.js, wildModule.test.js), all
resolved by **combining** both sides — the T-044 imports/logic kept alongside the palafin additions,
master's `selCtx` (T-013) kept alongside `battlePoke`, and both test suites' describes kept. No code
duplicated (master's pre-existing Wishiwashi bans reused). Verified: randomizer 523 / backend 94 /
frontend 14 green, plus a full `analyze.js` end-to-end run. No follow-ups.
