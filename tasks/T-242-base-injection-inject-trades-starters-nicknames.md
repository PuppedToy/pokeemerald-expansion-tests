---
id: T-242
title: "Base+injection Phase 3 — inject trades + extra starters + nickname tables (Group B)"
status: proposed
type: feature
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-238, T-237, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-238, T-237]
---

# T-242 — Inject trades + extra starters + nicknames

## Context
Remaining Group-B outputs: in-game trades (scalar fields + the new accepted/base-form arrays + pointers),
extra starters (`sStarterExtraMon` + nickname/gender arrays, variable count), and the location/trade/
starter nickname string tables. See
[strategy Group B](../docs/base-plus-injection-strategy.md#group-b--variable-length-inject-via-reserved-capacityfree-space).

## Plan
Inject each into its reserved-capacity layout (or repoint). Verify INV-BYTES on the corpus after each.

Acceptance criteria:
- [ ] Trades injected (scalars + accepted/base arrays + pointers); INV-BYTES green.
- [ ] Extra starters injected; INV-BYTES green.
- [ ] Location/trade/starter nickname tables injected; INV-BYTES green.

## Progress log
- **2026-07-27** — Created (Phase 3).

## Outcome
