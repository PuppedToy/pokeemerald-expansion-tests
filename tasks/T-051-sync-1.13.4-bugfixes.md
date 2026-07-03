---
id: T-051
title: Absorb expansion 1.13.4 bugfixes
status: proposed        # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-03
updated: 2026-07-03
target-version: 0.6.0
links: [T-049, docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md, docs/upstream-bugfix-sync.md]
blocked-by: [T-050]
---

# T-051 — Absorb expansion 1.13.4 bugfixes

## Context

Second hop of the bugfix-sync campaign ([ADR-012](../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md),
runbook & ledger in [docs/upstream-bugfix-sync.md](../docs/upstream-bugfix-sync.md)). 1.13.4 is the
last patch of our current minor line and is **bugfix-only** (~65 fixes: Beat Up damage, Receiver /
Magician / Shell Trap, King's Rock vs flinch, Protosynthesis/Quark Drive recalculation, Berry Blender,
etc.). Completing it finishes the 1.13.x line before any feature release.

## Plan

Per-version procedure from the runbook. One caveat from the T-049 audit: **1.13.4 moves `*.party`
files to git-LFS** — a *tooling* change (git attributes), not a data-format change; the on-disk text
of `src/data/trainers.party` is unchanged, so the randomizer parser is unaffected, but the commit
touches a sensitive path. **Escalate** the LFS commit: decide whether to take it (and set up
`git-lfs` + adjust the writer/commit flow) or skip it and keep `.party` as plain text locally.

Acceptance criteria:
- [ ] `expansion/1.13.4` fetched; commits enumerated and classified.
- [ ] `.party`→LFS commit escalated to owner; decision recorded in the ledger.
- [ ] Safe 1.13.4 bugfixes cherry-picked `-x` with their tests.
- [ ] `make check` green (+ `npm test` + `analyze.js` only if the LFS/`.party` change is taken).
- [ ] Ledger updated (frontier → 1.13.4).
- [ ] `CHANGELOG.brooktec.md` line added if any user-visible fix landed.

## Progress log

<!-- Append-only. -->

- **2026-07-03** — Task created from T-049. Blocked by T-050 (do 1.13.3 first). Not started.

## Outcome

<!-- Filled when closing. -->
