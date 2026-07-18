---
id: T-150
title: Bosses use Mega OU from the start (UU merges into OU for bosses)
status: in-progress
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [randomizer/presets.js]
blocked-by: []
---

# T-150 — Bosses use Mega OU from the start

## Context

Today the story-progression mega gate is the same for bosses and normal trainers: Mega
UU up to & incl. Flannery, Mega OU post-Flannery … Tate & Liza, Mega Ubers post-Tate & Liza
(see `bossMega` in [randomizer/presets.js](../randomizer/presets.js)). The owner wants **bosses**
(Wattson included) to have more mega variety early: they may pick **Mega OU from the start**
(UU merges into OU), while **Mega Ubers stays 100% restricted** until the existing breakpoint.
A boss picking an OU mega early is fine; a boss picking an Ubers mega early is not.

**Normal trainers keep the current breakpoints** (UU → OU → Ubers).

Finding: a boss's mega slot is `bossMega(TIER_X)` embedded in its SPLIT's `fair` array;
normal trainers get their mega tier from a *separate* `getNonBossPreset(id, TIER_X)` argument
(`trainers.js`), so the two are independent — changing the boss side can't bleed into normal
trainers. Exactly 3 splits use `bossMega(TIER_UU)`: **WATTSON, FLANNERY, MAXIE_CHIMNEY**.
`bossMega(TIER_OU)` is a strict superset of `bossMega(TIER_UU)` (mega ≤OU vs ≤UU; base ≤UU vs
≤RU), so widening can only add options — existing favourites (e.g. Mega Manectric) stay valid.
(MAXIE_CHIMNEY's boss is dead data after T-148; changed for uniformity.)

## Plan

Change the 3 `bossMega(TIER_UU)` → `bossMega(TIER_OU)` (WATTSON, FLANNERY, MAXIE_CHIMNEY).
Leave the `bossMega(TIER_OU)` and `bossMega(TIER_UBERS)` splits and every `getNonBossPreset`
call untouched.

Acceptance criteria:
- [ ] `getBossPreset('WATTSON'|'FLANNERY')` yield a mega slot whose window includes TIER_OU (was ≤UU).
- [ ] No `bossMega(TIER_UU)` remains; `bossMega(TIER_UBERS)` splits unchanged (Ubers still gated).
- [ ] Non-boss teams (`getNonBossPreset('WATTSON', TIER_UU)`) still cap megas at UU.
- [ ] Regression test added; `cd randomizer && npm test` green.
- [ ] Owner manual-tests the batch build.

## Progress log

- **2026-07-18** — Task created. Owner-validated spec: bosses OU from the start (UU→OU),
  Ubers breakpoint unchanged; normal trainers unchanged. Located the 3 `bossMega(TIER_UU)`
  splits (WATTSON, FLANNERY, MAXIE_CHIMNEY) and confirmed boss vs non-boss mega tiers are
  driven by independent inputs.

## Outcome

<!-- Filled when closing. -->
