---
id: T-050
title: Absorb expansion 1.13.3 bugfixes (incl. Endure)
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-03
updated: 2026-07-03
target-version: 0.6.0
links: [T-049, B-018, docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md, docs/upstream-bugfix-sync.md]
blocked-by: []
---

# T-050 — Absorb expansion 1.13.3 bugfixes (incl. Endure)

## Context

First hop of the upstream bugfix-sync campaign ([ADR-012](../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md),
procedure & ledger in [docs/upstream-bugfix-sync.md](../docs/upstream-bugfix-sync.md)). We are on
expansion 1.13.2; 1.13.3 is the immediate next patch and is **bugfix-only**. It carries the trigger
fix, **Endure lasting forever** (PR #7838 → [B-018](../bugs/B-018-endure-persists-whole-battle.md)),
plus ~15 other battle-mechanic fixes and a minor-fix tail. The T-049 audit found **no sensitive-file
changes** in 1.13.3, so this hop is low-risk.

## Plan

Follow the per-version procedure in the runbook. Cherry-pick `-x` only the bugfix commits (all of
1.13.3 by policy), take each fix's `test/battle/**` test with it, escalate anything unexpected.
Because 1.13.3 is 100% bugfix and touches no sensitive file, a **wholesale merge of `expansion/1.13.3`
is an owner-approvable shortcut** (ADR-012) — decide at execution.

Acceptance criteria:
- [x] RHH remote added (read-only) and `expansion/1.13.3` fetched.
- [x] 1.13.3 commits enumerated and classified; sensitive-file screen run (found 4 sensitive-touching commits — see log).
- [ ] Endure fix (#7838) cherry-picked with its `endure.c` test case.
- [ ] `test/battle/move_effect/endure.c` **FAILS before, PASSES after** → close B-018 (regression-test rule).
- [ ] Remaining 1.13.3 bugfixes taken (or 1.13.3 merged wholesale, if owner approves the shortcut).
- [ ] `make check` green.
- [ ] Ledger updated (frontier → 1.13.3; taken/skipped/deferred recorded) in `docs/upstream-bugfix-sync.md`.
- [ ] `CHANGELOG.brooktec.md` line added (Endure fix is user-visible).

## Progress log

<!-- Append-only. -->

- **2026-07-03** — Task created from T-049. Not started; no git state changed yet (RHH remote not
  added). First execution step is the read-only RHH fetch.
- **2026-07-03** — Started (analysis phase). Added read-only `RHH` remote, fetched
  `expansion/1.13.2`+`1.13.3`. Enumerated **138 non-merge commits** in `1.13.2..1.13.3`.
  - **Endure fix = `d2e8afa13a` "Fixes Endure lasting forever" (#7838)** → touches only
    `src/battle_main.c` (+1, the missing per-turn reset) and `test/battle/move_effect/endure.c`
    (+23, the regression case). **Non-sensitive, clean, test bundled** → safe pick; this is B-018's fix.
  - Sensitive-file screen flagged 4 commits (correcting the changelog-level T-049 audit, which missed
    them):
    - `95d98305dd` (#7881, Krabby/Kingler follower sprites) → `species_info/gen_1_families.h`:
      **feature + sensitive → SKIP.**
    - `b4041535cf` (#8007) + `90c3a8cb2c` (#7976), Battle Dome fixes → Dome pre-battle-room map
      script: genuine bugfixes on a sensitive `data/maps/` path → **ESCALATE**.
    - `d1d5435487` (#2196, "improve undefined map assembler messages") → 3 harbor map scripts:
      tooling, not a gameplay fix → **SKIP** (recommended).
  - Remaining ~133 commits are battle-engine/QoL fixes touching no sensitive file → takeable.
  - **Blocker:** this machine has **no GBA toolchain** (no DEVKITARM / arm-none-eabi-gcc; agbcc not
    built) → cannot run `make check` → cannot verify `endure.c` fail-before/pass-after or close B-018
    here. Cherry-pick + verification must run on the builder machine. Paused pending owner direction
    on (a) where to build/verify and (b) the two Battle Dome escalations.

## Outcome

<!-- Filled when closing: commits taken, B-018 closed, frontier advanced. -->
