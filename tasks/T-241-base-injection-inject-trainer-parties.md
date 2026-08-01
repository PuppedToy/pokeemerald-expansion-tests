---
id: T-241
title: "Base+injection Phase 3 — inject trainer parties + battle partners (Group B, biggest)"
status: proposed
type: feature
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-238, T-237, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-238, T-237]
---

# T-241 — Inject trainer parties + battle partners

## Context
The largest variable-length surface: 860 trainers, team size 1–6, ≤4 moves each; the compiled form is a
per-trainer party array referenced by pointer + partySize in `gTrainers[]`. See
[strategy Group B](../docs/base-plus-injection-strategy.md#group-b--variable-length-inject-via-reserved-capacityfree-space).

## Plan
Inject each trainer's party (species/item/ability/level/nature/IVs/moves) + the battle partners, using the
T-237 fixed-capacity party slots (or repoint + patch pointer/count). Verify INV-BYTES on the corpus.
Its own task due to scale and the battle-format ("Double Battle") flag living here.

Acceptance criteria:
- [ ] Trainer parties injected (incl. the battle-format flag); INV-BYTES green on the corpus.
- [ ] Battle partners injected; INV-BYTES green.

## Progress log
- **2026-07-27** — Created (Phase 3).

## Outcome
