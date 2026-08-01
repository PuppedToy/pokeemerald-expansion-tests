---
id: T-243
title: "Base+injection Phase 3 — inject data-driven rewards/items/settings + feature-toggle setvars"
status: proposed
type: feature
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-238, T-234, T-235, T-236, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-238, T-234, T-235, T-236]
---

# T-243 — Inject the Phase-2 data-driven outputs + toggles

## Context
Inject the outputs that Phase 2 turned into data (rewards T-235, item placement T-236, settings struct
T-234) plus the Group-D feature toggles (Run&Bun, Steven-tag — patch the `setvar` operands). See
[strategy Groups C/D](../docs/base-plus-injection-strategy.md#group-c--currently-map-script--define-must-be-redesigned-to-data-driven-in-the-base).

## Plan
Inject the reward/static/item-placement tables + settings struct; patch the setvar operands for the mode
toggles at their T-232 offsets. Verify INV-BYTES on the corpus after each.

Acceptance criteria:
- [ ] Rewards + static + item-placement tables injected; INV-BYTES green.
- [ ] Settings struct (money, relearn price) injected; INV-BYTES green.
- [ ] Run&Bun + Steven-tag toggles injected via setvar patch; INV-BYTES green.

## Progress log
- **2026-07-27** — Created (Phase 3).

## Outcome
