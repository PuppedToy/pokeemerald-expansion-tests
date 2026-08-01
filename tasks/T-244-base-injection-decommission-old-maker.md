---
id: T-244
title: "Base+injection Phase 4 — decommission the old compile-per-user maker, clean up"
status: proposed
type: refactor
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-239, T-240, T-241, T-242, T-243, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-239, T-240, T-241, T-242, T-243]
---

# T-244 — Decommission the old maker

## Context
Once every module injects with INV-BYTES parity, remove the source-edit writers and the per-user compile
path; the injector becomes the only generator. See [strategy Phase 4](../docs/base-plus-injection-strategy.md#phased-task-map).

## Plan
Remove the source-text-edit writer code and the compile branch of the switch; simplify
`make.js`/`writer.js` (keep only base-build + injector). Re-run the full corpus via injection-only and
confirm identical output. Update the never-commit list / docs as needed.

Acceptance criteria:
- [ ] Old compile-per-user path + source-edit writers removed; injector is the sole generator.
- [ ] Full corpus produces output identical to the post-Phase-2 golden master (injection-only).
- [ ] Dead code/docs cleaned; `cd randomizer && npm test` green.

## Progress log
- **2026-07-27** — Created (Phase 4).

## Outcome
