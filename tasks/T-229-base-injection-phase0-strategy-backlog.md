---
id: T-229
title: "Base+injection Phase 0 — strategy doc, ADR and full task backlog"
status: done
type: chore
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-054, docs/base-plus-injection-strategy.md, docs/base-plus-injection-viability.md, docs/adr/ADR-022-base-plus-injection-architecture.md]
blocked-by: []
---

# T-229 — Base+injection Phase 0: strategy, ADR, backlog

## Context
Phase 0 of the base+injection migration (owner-approved direction). Turn the viability analysis
([T-054](T-054-binary-injection-randomizer-viability.md), [viability doc](../docs/base-plus-injection-viability.md))
into an ordered, point-by-point execution plan and a complete task backlog. Decision recorded in
[ADR-022](../docs/adr/ADR-022-base-plus-injection-architecture.md).

## Plan
Write the execution strategy (per-output injection action + required base refactors + the two
verification invariants + go/no-go gates), draft the ADR, and create the Phase 1–5 task files.

Acceptance criteria:
- [x] Strategy doc with per-output injection action + refactor, invariants, gates → [strategy](../docs/base-plus-injection-strategy.md).
- [x] ADR-022 recorded (proposed, accepted-pending GATE-1).
- [x] Full task backlog created (T-230..T-246) with dependencies.
- [x] Owner reviewed + approved the direction and sequencing (greenlit executing Phase 1).

## Progress log
- **2026-07-27** — Wrote strategy doc + ADR-022 + backlog (T-230..T-246). Key refinements over the raw
  plan: free-space audit is a Phase-1 gate (GATE-1); two distinct invariants (INV-BEHAVIOR for the Phase-2
  refactor where bytes legitimately move, INV-BYTES for Phase-3 injection = inject==compile); build
  determinism must be established first (GATE-2); added a golden-master bundle corpus and a runtime
  compile-vs-inject switch for staged rollout/rollback.

## Outcome
Phase 0 delivered and approved: strategy doc + ADR-022 (now accepted, GATE-1 cleared) + backlog
T-230..T-246. Phase 1 (the safety net) then executed and closed: T-232 (GATE-1: ~8.33 MB free → GO),
T-231 (GATE-2: build byte-reproducible → whole-ROM sha256), T-230 (10-bundle golden-master corpus +
manifest), T-233 (verify-corpus skill, full-corpus ALL PASS 12/12). Ready for Phase 2 (patch-friendly base
refactor). No changelog line (internal planning).
