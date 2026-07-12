---
id: T-122
title: Role-aware move selection — deliver the assigned role (fix B-026)
status: proposed
type: bug
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-107, T-118, B-026]
priority: critical
---

# T-122 — Role-aware move selection

## Context

**B-026:** the engine assigns roles but `chooseMoveset`/`adjustMoveset` drop the injected role move
(35/36 hazard injections never reach the final moveset). Until this is fixed the entire role system is
**cosmetic** — teams crystallise into archetypes but no mon actually delivers its role. This is the
prerequisite for every other teambuilding improvement (T-123…T-126).

## Plan

- **Hard-keep injected fixed moves.** A role move (107d) and `tryToHaveMove` pushed into
  `newTeamMember.moves` must ALWAYS survive into the final 4 (unless the mon can't legally learn it) —
  `chooseMoveset`/`adjustMoveset` must treat them as fixed slots, not soft preferences.
- **Role-aware prioritisation.** Feed the mon's assigned role (from the crystallised identity) into
  move selection so it prioritises role-appropriate move TYPES (hazard setter → a hazard move; pivot →
  a pivot move; cleric → recovery/Wish; screen setter → a screen; etc.), not just raw rating.
- Preserve determinism (per-slot reseed) and keep singles byte-identical below the sophistication gate.
- **Closes B-026** — regression test asserts an injected role/fixed move survives into the final
  moveset (fails before, passes after).
- Format-agnostic (singles + doubles).

Acceptance criteria:
- [ ] Injected role/`tryToHaveMove` moves are hard-kept in the final moveset (B-026 regression, red→green).
- [ ] Decision log: hazard setters actually run hazards; role-tagged mons deliver their role move.
- [ ] Determinism gate green; singles byte-identical below the soph gate; `cd randomizer && npm test` green.

## Progress log

- **2026-07-11** — Created from the problem-2 analysis (owner). B-026 confirmed by measurement
  (35/36 injected hazard moves dropped). Highest priority — roles are cosmetic until this lands.

## Outcome
