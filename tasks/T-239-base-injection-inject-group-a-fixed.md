---
id: T-239
title: "Base+injection Phase 3 — inject Group A (fixed-size: stats/moves/evos/wild/starters/TM/prices/items)"
status: proposed
type: feature
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-238, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-238]
---

# T-239 — Inject Group A (fixed-size)

## Context
First migration batch — the low-risk fixed-offset overwrites. See
[strategy Group A](../docs/base-plus-injection-strategy.md#group-a--fixed-size-overwrite-no-base-change-do-first-lowest-risk).

## Plan
Migrate, one at a time (verifying INV-BYTES via T-233 after each): base stats/types/abilities/held items,
move power/acc/type/category (bitfield RMW), evolution levels, wild species, starter trio, TM→move table,
item prices, route/mail items. Old writer stays available behind the switch until each is green.

Acceptance criteria:
- [ ] Each Group-A output injected; `inject(base,bundle)` == `compile(bundle)` on the full corpus (INV-BYTES).
- [ ] Each migration is an isolated, revertible step (failure localizes to one output).

## Progress log
- **2026-07-27** — Created (Phase 3).

## Outcome
