---
id: T-050
title: Absorb expansion 1.13.3 bugfixes (incl. Endure)
status: abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-03
updated: 2026-07-15
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
plus ~15 other battle-mechanic fixes and a minor-fix tail. (The commit-level screen later found 4
commits touching sensitive files — sprites #7881, Dome #8007/#7976, tooling #2196 — correcting the
changelog-level audit; those are reverted on merge.)

## Plan

**Revised approach (2026-07-03, see log + ADR-012 amendment).** The Endure fix (the trigger) is
cherry-picked now on `feature/T-050-sync-1.13.3` — clean, minimal, shippable. The *rest* of 1.13.3 is
absorbed on the **builder** via **merge-then-revert** (`git merge expansion/1.13.3` + revert the 4
feature/sensitive commits), because a piecemeal-cherry-pick trial proved 1.13.3's internal
fix→refactor chain makes isolated picks mis-anchor, and nothing compiles on this machine.

Acceptance criteria:
- [x] RHH remote added (read-only) and `expansion/1.13.3` fetched; commits enumerated + sensitive-screened.
- [x] Endure #7838 cherry-picked (`a347e47b7a`) with its `endure.c` test — clean, non-sensitive.
- [x] Ledger + ADR-012 updated (two-track strategy; merge-then-revert for patch releases).
- [ ] **Builder:** `git merge expansion/1.13.3`, revert #7881 / #8007 / #7976 / #2196, resolve fork conflicts.
- [ ] `make check` green (CI or builder); `endure.c` FAILS before / PASSES after → **close B-018**.
- [ ] `expansion.h` advanced to 1.13.3; `CHANGELOG.brooktec.md` line added (Endure + 1.13.3 fixes).

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
- **2026-07-03** — Owner decisions: skip the two Battle Dome fixes (#8007/#7976); verify via **CI**
  (`.github/workflows/build.yml` runs `make -j check` on push) rather than locally — the C battle
  tests compile to a GBA ROM and run in mGBA, so there is no toolchain-free local path. Executed
  steps 1–3:
  - System files committed to `master` (`039ed351ff`).
  - Branch `feature/T-050-sync-1.13.3` created off master.
  - **Cherry-picked Endure `-x d2e8afa13a` → `a347e47b7a`, applied cleanly** (auto-merged
    `battle_main.c`, no conflict). Fix = `gDisableStructs[i].endured = FALSE;` added to
    `TurnValuesCleanUp()` (`src/battle_main.c`) — the exact per-turn reset missing per B-018's root
    cause; the same commit brings the `endure.c` regression case.
  - Skipped (per owner / policy): #8007, #7976 (Dome), #7881 (sprites), #2196 (tooling).
  - **Next:** owner pushes the branch → CI runs `make check`. To prove the iron rule: a test-only run
    (endure.c assertions without the fix) should FAIL, then the fix PASSES → then B-018 can close and
    the remaining ~133 safe fixes get taken in verifiable batches.
- **2026-07-03** — **Approach revised (owner delegated the decision).** Ran a piecemeal-cherry-pick
  trial for the rest of 1.13.3: 98 commits applied cleanly, but 7 real fixes were entangled with
  later 1.13.3 refactors already picked (Throat Spray moveend → `battle_util.c`, RNG enum, immunity
  heal fn), so isolated picks mis-anchor — and none of it compiles on this machine anyway. **Reset the
  branch back to Endure-only** (`git reset --hard f7b8756dc1`); dropped the 98 unverified picks.
  Decision: absorb the rest of 1.13.3 on the **builder** via **merge-then-revert** (merge the tag,
  revert the 4 feature/sensitive commits) — brings every fix in correct order, verified. Codified in
  the [ADR-012 amendment](../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md) (merge-then-revert
  = default for pure-bugfix patch releases; piecemeal only for feature `.0` releases). Branch now = 2
  commits over master (Endure fix + docs); the Endure fix is clean and ready to push→CI.

## Outcome

Abandoned 2026-07-15 (owner: not continuing the wholesale 1.13.3 bugfix-absorption effort). The standalone Endure fix was implemented on its own branch (2 commits over master) but is not being carried forward under this task; the broader sync is dropped.
