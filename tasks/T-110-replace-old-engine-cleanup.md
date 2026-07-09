---
id: T-110
title: Integration — replace the old engine, remove dead slot/preset code, parity & diagnostics
status: proposed
type: refactor
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-108, T-109]
blocked-by: [T-108, T-109]
---

# T-110 — Integration — replace the old engine, remove dead slot/preset code, parity & diagnostics

## Context

Final 2C step: make the new engine the only path and delete the superseded fixed-slot machinery, per
the ADR-016 teardown plan. This is where we confirm singles output is not worse than the pre-epic
baseline and that diagnostics (degraded teams, short teams) still work.

## Plan

- Switch generation fully to the new engine; remove the dead `SPLITS`/slot tables and any
  now-unused selector/fallback code (keep what the new engine reuses).
- Re-point all trainer definitions to preferences; delete leftover POKEDEF slot arrays.
- Verify diagnostics still fire for degraded/short teams.
- Baseline comparison: generate singles output pre- vs post-rewrite for several seeds and review
  team quality (owner-facing report), ensuring no regressions in legality, level-appropriateness, or
  variety.
- Full suite green; update `randomizer/docs/` design references (trainer-determinism etc.).

Acceptance criteria:
- [ ] New engine is the only generation path; dead slot/preset code removed.
- [ ] Diagnostics for degraded/short teams still work.
- [ ] A singles pre/post quality comparison shows no regression (owner-reviewed).
- [ ] `randomizer/docs/` design references updated; `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
