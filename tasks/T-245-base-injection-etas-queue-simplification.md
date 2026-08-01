---
id: T-245
title: "Base+injection Phase 5 — recompute ETAs + simplify the build queue"
status: proposed
type: refactor
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-244, docs/adr/ADR-005-two-tier-preemptive-build-queue.md, docs/base-plus-injection-strategy.md]
blocked-by: [T-244]
---

# T-245 — New ETAs + queue simplification

## Context
Injection is seconds, not minutes, so the ETA model and the two-tier preemptive queue
([ADR-005](../docs/adr/ADR-005-two-tier-preemptive-build-queue.md)) are likely over-engineered now. See
[strategy Phase 5](../docs/base-plus-injection-strategy.md#phased-task-map).

## Plan
Measure real inject times; recompute/retire `AVG_ROM_SECS`; simplify or remove the queue/scheduler as the
new latency allows (superseding note to ADR-005 if the decision changes).

Acceptance criteria:
- [ ] Real inject latency measured; ETA model updated (or removed).
- [ ] Queue/scheduler simplified or retired; ADR-005 revisited via a superseding note if applicable.

## Progress log
- **2026-07-27** — Created (Phase 5).

## Outcome
