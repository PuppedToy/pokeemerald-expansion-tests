---
id: T-238
title: "Base+injection Phase 3 — injector skeleton, .map offset loader, compile-vs-inject switch"
status: proposed
type: feature
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-232, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-232, T-233]
---

# T-238 — Injector skeleton + runtime switch

## Context
The core of Phase 3: a module that loads the base ROM + the T-232 offset map and offers write-at-offset /
repoint primitives, plus a **runtime compile-vs-inject switch** so migration is staged and reversible.
See [strategy Phase 3](../docs/base-plus-injection-strategy.md#phased-task-map).

## Plan
Build `randomizer/injector` (base loader, offset-map loader, fixed-offset writer, bit-field writer,
free-space allocator + repointer). Add a config/env switch selecting compile vs inject per build (default
compile until parity). No output modules migrated yet — just the framework + a no-op pass verified against
compile.

Acceptance criteria:
- [ ] Injector loads base + offset map; write/repoint primitives unit-tested.
- [ ] compile-vs-inject switch wired (default compile); rollback trivial.
- [ ] No-op inject reproduces the base byte-for-byte (INV-BYTES baseline).

## Progress log
- **2026-07-27** — Created (Phase 3).

## Outcome
