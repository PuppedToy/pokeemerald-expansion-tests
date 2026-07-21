---
id: T-177
title: Secret Base battles give no money
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 0.6.0
links: [T-176]
blocked-by: []
---

# T-177 — Secret Base battles give no money

## Context

Follow-up to the money-faucet cleanup (T-173..T-176). The money audit flagged Secret Base battles as a
repeatable prize-money source: `GetTrainerMoneyToGive` (`src/battle_script_commands.c`) returns
`20 * secretBase->party.levels[0] * moneyMultiplier` for `TRAINER_SECRET_BASE`. Owner wants this
removed.

## Plan

In `GetTrainerMoneyToGive`, return `0` for the `TRAINER_SECRET_BASE` case instead of the level-scaled
amount. All other trainer rewards (the T-052 configurable prize tiers) are untouched.

Acceptance criteria:
- [ ] Winning a Secret Base battle grants ¥0.
- [ ] Regular trainer / gym / E4 / Champion prize money is unchanged.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created and implemented: `GetTrainerMoneyToGive` returns 0 for
  `TRAINER_SECRET_BASE`. Not reachable by the battle-test harness (post-battle payout + Secret Base
  setup), so verified by review + manual ROM test (no local GBA toolchain).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
