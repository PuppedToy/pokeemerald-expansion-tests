---
id: T-273
title: Make the deploy decide by itself whether the base ROM must be rebuilt
status: in-progress     # proposed | in-progress | done | abandoned
type: chore             # feature | fix | refactor | docs | chore
created: 2026-08-12
updated: 2026-08-12
target-version: 0.9.0
links: [B-074, docs/dev-deploy-workflow.md, docs/base-rom-provisioning.md, randomizer/docs/injection.md]
blocked-by: []
---

# T-273 — Make the deploy decide by itself whether the base ROM must be rebuilt

## Context

Since T-244 every delivered ROM is **injected** into the box's prebuilt `base/pokeemerald.{gba,map,sym}`,
which `update.sh` deliberately does not carry. So a deploy ships the sources but not the artifact those
sources compile into, and the two silently drift: on 2026-08-11 the 15-trader rework (T-269/T-270, map +
`include/constants/trade.h` + `src/`) reached the box while its base stayed the one built on 2026-08-09,
whose `gIngameTrades` is a fixed 4-entry / 512 B table against a source that now declares 15. Nothing in the
deploy said a word; the owner had to notice and ask.

Today the only evidence of what a base was built from is its **mtime**, read by hand. That is not a check —
it cannot be compared to anything, so the deploy has no way to branch on it.

## Plan

Give the base a **provenance stamp** and make the deploy branch on it, so the two paths are real:

1. `scripts/base-state.mjs` — the single home of two things: which paths compile into the base ROM
   (classified by **exclusion**: an unrecognised path counts as base-relevant, so a new source directory can
   never be missed silently), and the **fingerprint** — a content hash of exactly those paths in the tree.
   CLI: compare the local fingerprint against the box's stamp → `in-sync` (0) / `rebuild-required` (10);
   `--json` for the skill, `--print-fingerprint` for the shell scripts.
2. `deploy/update.sh` — writes `backend/data/deployed.json` (rsync-excluded, box-persistent) after a
   successful deploy: the fingerprint of the tree the box now holds. Also warns when the base is stale.
3. `deploy/build-base.sh` — refuses to stamp a base built from a tree that is not the one we have
   (compares `deployed.json` against the local fingerprint), and on success writes
   `base/BASE_BUILD.json` = `{ fingerprint, commit, builtAt, romSha256 }`.
4. `.claude/skills/deploy/SKILL.md` — the orchestration: preconditions → base-state verdict → **path 1**
   (app-only change: `update.sh`, verify) or **path 2** (base-relevant change: `update.sh` then
   `build-base.sh`, verify the stamp moved) → honest report. Checks for in-flight builds before recreating
   the container, because both paths kill them (one user build died that way on 2026-08-12).

Acceptance criteria:
- [ ] `node scripts/base-state.mjs` prints a verdict and exits 0 (in sync) / 10 (rebuild required), and
      names the files and commits that made it decide.
- [ ] The classifier is covered by tests, including the fail-safe (unknown path → base-relevant), and the
      suite runs in `update.sh`'s preflight.
- [ ] A successful `build-base.sh` leaves `base/BASE_BUILD.json` on the box; `base-state.mjs` then reports
      `in-sync` with no arguments.
- [ ] `build-base.sh` aborts when the box's tree is not the local one (no more stamping a lie).
- [ ] The deploy skill has two real paths and never needs the owner to say "rebuild the base".
- [ ] Deploy docs describe the decision, not a rule of thumb the owner has to remember.

## Progress log

- **2026-08-12** — Task created. Found while answering "¿has hecho deploy con los cambios de mapa y todo?":
  the box's base is from 08-09 (4-entry `gIngameTrades`, 512 B, `sizeExact`) while the deployed source
  declares 15 trades, so `verifyTradeTable()` refuses every build — and the only build attempted since was
  killed by the container recreate, so nothing had surfaced it yet.
- **2026-08-12** — Implemented. `scripts/base-state.mjs` (classifier + fingerprint + verdict + the box
  read), 13 tests, wired into `update.sh` (preflight suite, inline verdict, end-of-run warning, writes
  `backend/data/deployed.json`), `build-base.sh` (refuses to stamp a tree the box is not holding, writes
  `base/BASE_BUILD.json` only after the smoke-inject passes, then self-checks with `base-state.mjs`), the
  `/deploy` skill and the two deploy docs.
  Verified live, not just by unit test: `node scripts/base-state.mjs` → `rebuild-required` (no stamp yet,
  exit 10); `deploy/build-base.sh` → refused with exit 1 because the box carries no deploy marker yet;
  `deploy/update.sh --dry-run` → new preflight suite runs, the verdict prints inline and the stale-base
  warning fires. The `in-sync` path is covered by unit tests and will get its live proof on the first real
  path-2 deploy (nothing on the box has a stamp until then).
  Decisions worth recording: the fingerprint hashes **git blob ids**, not mtimes or a commit range, so it is
  immune to rebases/merges and equal for identical trees; classification is by **exclusion** so an unknown
  path costs one rebuild instead of risking a silent mismatch; and only **one** new skill was added — a
  second one for the base rebuild alone would have been a wrapper around a single command, which the deploy
  skill already documents.

- **2026-08-12** — First real path-2 run. `update.sh` shipped clean (marker written, the new end-of-run
  stale-base warning fired), and `build-base.sh` then **failed at the assembler**: the 15-trader rework had
  never compiled (B-075, duplicate `MauvilleCity_PokemonCenter_1F_EventScript_Trader`). So the very first use
  of this task's machinery surfaced a critical defect that had been invisible for a day — the base could not
  be rebuilt, which is why injection kept refusing.
  Two corrections came out of it: the skill now runs the long scripts under `set -o pipefail` (a `| tee |
  tail` pipeline reported the failed build as "exit code 0"), and the new
  `scripts/__tests__/asm-duplicate-labels.test.mjs` guard runs in `update.sh`'s preflight, so a tree that
  cannot assemble is now caught in a second rather than 20 minutes into a base build. §4's "base-state MUST
  print in-sync" is what would have caught the bogus success anyway; the pipefail fix just makes the failure
  loud at the right moment.
  The base rebuild is blocked on the B-075 fix reaching the box, i.e. on the owner's push (the deploy gate).

- **2026-08-12** — Path 2 completed. With B-075 fixed the tree assembled and the base built clean, but the
  script's smoke test rejected it over a **frozen** corpus bundle whose trade ids predate the rework
  (`INGAME_TRADE_SEEDOT`) and, because it installs before proving, left the box with **no base** → B-076.
  Validated the rejected artifacts by hand instead: generated a bundle with the current pipeline into a
  scratch dir, `git checkout -- src/ include/ data/maps/` (generation mutates them, injection refuses
  otherwise), injected against `base-rejected-…` → `✓ Injected 5 module(s)`, and notably
  `in-game trades: 15 of 15 entries`. Then moved it into `base/`, stamped it **only after checking the box's
  `deployed.json` fingerprint matched this tree** (the same invariant the script enforces), chowned, restarted.
  `node scripts/base-state.mjs` now prints **in-sync** for the first time — the machinery works end to end,
  including the part that refuses to stamp a lie.
  The base's `romSha256` (`7c5ca4dc8348…`) matches the client-artifact manifest from that build, so
  `base/client/` belongs to this exact base.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
