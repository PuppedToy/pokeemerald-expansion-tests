---
id: T-240
title: "Base+injection Phase 3 — inject level-up learnsets + teachable/TM-HM compatibility (Group B)"
status: proposed
type: feature
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-238, T-237, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-238, T-237]
---

# T-240 — Inject learnsets + TM/tutor compatibility (Group B)

## Context
First variable-length migration. Uses the T-237 fixed-capacity layout (B1) or repoint (B2). Teachable
learnsets ARE the TM/HM+tutor compatibility source (no per-species bitfield). See
[strategy Group B](../docs/base-plus-injection-strategy.md#group-b--variable-length-inject-via-reserved-capacityfree-space).

## Plan
Inject level-up learnsets and teachable learnsets into their reserved-capacity slots (or repoint). Verify
INV-BYTES on the corpus after each.

Acceptance criteria:
- [ ] Level-up learnsets injected; INV-BYTES green on the corpus.
- [ ] Teachable/TM-HM+tutor compat injected; INV-BYTES green.

## Progress log
- **2026-07-27** — Created (Phase 3).

## Outcome
