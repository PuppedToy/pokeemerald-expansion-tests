---
id: T-059
title: Wattson gives an Ability Patch after New Mauville instead of two scrolls
status: in-progress
type: feature
created: 2026-07-05
updated: 2026-07-05
target-version: 0.6.0
links: [data/maps/MauvilleCity/scripts.inc]
blocked-by: []
---

# T-059 — Wattson gives an Ability Patch after New Mauville instead of two scrolls

## Context

When the player returns to Wattson after clearing New Mauville
(`VAR_NEW_MAUVILLE_STATE == 2`), he currently hands over two Kubfu evolution
items — `ITEM_SCROLL_OF_DARKNESS` and `ITEM_SCROLL_OF_WATERS`. Those scrolls are
of little use in this game's progression. We want this milestone reward to be a
single **Ability Patch** instead.

This is a hand-edited **static** map script — the randomizer/item pipeline does
not touch `MauvilleCity/scripts.inc` (no `RAND_` anchors), so the change is a
direct edit and will not be overwritten by a run. Reward-rebalance sibling of
[T-056](T-056-rival-rewards-rebalance.md).

## Plan

In `MauvilleCity_EventScript_CompletedNewMauville` replace the two
`giveitem`/`goto_if_eq …ShowBagIsFull` scroll blocks with a single
`giveitem ITEM_ABILITY_PATCH` block. Keep the gating flag
(`FLAG_GOT_TM_THUNDERBOLT_FROM_WATTSON`) and both dialogue lines — the text is
generic ("you've earned it!") and does not name the item.

Acceptance criteria:
- [x] `MauvilleCity_EventScript_CompletedNewMauville` gives exactly one item, `ITEM_ABILITY_PATCH`.
- [x] No `ITEM_SCROLL_OF_DARKNESS` / `ITEM_SCROLL_OF_WATERS` remain in the Wattson reward path.
- [x] Bag-full path still falls through to `Common_EventScript_ShowBagIsFull`, and the reward is still one-time (flag guarded).
- [x] CHANGELOG.brooktec.md `[Unreleased]` gets a line for this change.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-05** — Task created. Investigation confirmed the reward is a static script (lines 427-436 of `MauvilleCity/scripts.inc`); randomizer does not target it. `ITEM_ABILITY_PATCH = 80`.
- **2026-07-05** — Implemented: replaced the two scroll `giveitem` blocks with a single `giveitem ITEM_ABILITY_PATCH` in `MauvilleCity_EventScript_CompletedNewMauville`. Dialogue text untouched (generic). CHANGELOG `[Unreleased] → Changed` line added. `check-tracker` OK. No local ROM build possible (no GBA toolchain); needs a manual in-game test on a builder/CI ROM before closing.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
