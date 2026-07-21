---
id: T-175
title: Pay Day / Make It Rain / Gold Rush pay a flat trainer-only reward (no scaling)
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 0.6.0
links: [T-173, T-174]
blocked-by: []
---

# T-175 — Pay Day / Make It Rain / Gold Rush pay a flat trainer-only reward (no scaling)

## Context

Part of closing every infinite-money faucet (after Pickup T-173 and Honey Gather T-174). The
coin-scattering moves (Pay Day, Make It Rain, G-Max Gold Rush) all accumulate into a single
`gPaydayMoney` (`+= level * 5` for `MOVE_EFFECT_PAYDAY`, `+= level * 100` for
`MOVE_EFFECT_CONFUSE_PAY_DAY_SIDE`) and pay out once at the end of battle in `Cmd_givepaydaymoney`.
Because it scales with level and stacks with every use, it is a grindable money source — especially in
repeatable wild battles.

Owner decision: in **wild** battles it pays **$0**; in **trainer** battles it pays a **flat $125**,
independent of the user's level and of how many times a coin move is used. Flat $125, with no Amulet
Coin / Happy Hour multiplier applied to it.

## Plan

Single change at the payout site (`Cmd_givepaydaymoney`, `src/battle_script_commands.c`) — the one
place all three moves funnel through, so all three are covered at once:

- Compute `bonusMoney = (gBattleTypeFlags & BATTLE_TYPE_TRAINER) ? 125 : 0` instead of
  `gPaydayMoney * moneyMultiplier`.
- Keep `gPaydayMoney != 0` as the "a coin move was used this battle" gate; only add money and print the
  reward string when `bonusMoney != 0` (so wild battles pay nothing and show no reward message).
- Leave the in-battle "Coins were scattered everywhere!" move effect/animation untouched (cosmetic).

Acceptance criteria:
- [ ] Pay Day / Make It Rain / Gold Rush give **$0** at the end of a wild battle.
- [ ] They give a flat **$125** at the end of a trainer battle, regardless of the user's level and of
      how many times the move was used that battle.
- [ ] The in-battle behavior of the moves (damage, "coins scattered" message, Make It Rain's Sp. Atk
      drop) is unchanged; existing tests still pass.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Confirmed all three coin moves share `gPaydayMoney` and the single
  `Cmd_givepaydaymoney` payout, so one edit covers them. Existing move tests
  (`move_effect_secondary/pay_day.c`, `move_effects_combined/make_it_rain.c`) only assert the in-battle
  scatter message / stat drop, not the payout, so they are unaffected. The end-of-battle payout runs
  after `end2` and is not reachable by the battle-test harness, so it is verified by review + manual
  ROM test (no local GBA toolchain).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
