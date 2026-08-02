---
id: T-240
title: "Base+injection Phase 3 — inject level-up learnsets + teachable/TM-HM compatibility (Group B)"
status: proposed
type: feature
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-239, T-238, T-237, T-233, B-057, randomizer/docs/injection.md]
blocked-by: [T-239]
---

# T-240 — Inject learnsets + TM/tutor compatibility (Group B)

## Context
**Start by reading [T-239](T-239-base-injection-inject-group-a-fixed.md)'s progress log and
[injection.md](../randomizer/docs/injection.md).** The first migrated module paid for two rules this one
inherits — mirror the writer's *decision*, not just its values, and derive struct offsets/strides from the
base instead of declaring them — and it left the base, the offset map and the gate command in place.

First variable-length migration. Uses the T-237 fixed-capacity layout (B1) or repoint (B2). Teachable
learnsets ARE the TM/HM+tutor compatibility source (no per-species bitfield). See
[strategy Group B](../docs/base-plus-injection-strategy.md#group-b--variable-length-inject-via-reserved-capacityfree-space).

## Plan
Inject level-up learnsets and teachable learnsets into their reserved-capacity slots (or repoint). Run the
gate after each (the per-module checklist in [injection.md](../randomizer/docs/injection.md) has the
command; it is data equivalence per symbol, not sha256 — see [[B-057]] / [[T-248]]).

Acceptance criteria:
- [ ] Level-up learnsets injected; the gate is green on the whole corpus.
- [ ] Teachable/TM-HM+tutor compat injected; the gate is green.

## Progress log
- **2026-07-27** — Created (Phase 3).

## Outcome
