---
id: T-204
title: Nerf Wattson's two bottom non-mega slots (RU → NU)
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-059, T-150, T-137, T-058]
blocked-by: []
---

# T-204 — Nerf Wattson's two bottom non-mega slots (RU → NU)

## Context

Wattson is currently overtuned: he fields a **mega before the player can obtain one**. To give the player
breathing room, nerf the **two bottom non-mega slots** of his team from **RU → NU**. Boss per-slot tiers live
in the `SPLITS` ladder in `randomizer/presets.js`. Related: [T-059](T-059-wattson-ability-patch-reward.md),
[T-137](T-137-emergent-electric-terrain.md) (Wattson's terrain gimmick), [T-150](T-150-boss-mega-ou-from-start.md),
[T-058](T-058-brawly-five-pokemon-bundle.md) (sibling gym-leader split-edit precedent).

### Findings from the current code
- Wattson split: `presets.js:360-371`, id `'WATTSON'` — `fair` = 5× `{ contextualTier:[TIER_RU] }`
  (`presets.js:364-368`) + a mega slot `bossMega(TIER_OU)` (`presets.js:369`). Boss team = `split.fair`
  (`getBossTeam` `presets.js:144-146`) via `getBossPreset('WATTSON')` (`presets.js:629-635`). Wiring:
  `trainers.js:70` (`WATTSON → FLAG_BADGE03_GET`), `TRAINER_WATTSON_1` (`trainers.js:2026`, `team` at `:2040`).
- The "two bottom non-mega slots" are the last two of the five identical RU entries → **`presets.js:367-368`**,
  change `TIER_RU` → `TIER_NU` (slot 6 is the mega, untouched).
- **Side-effect to resolve:** generic post-Wattson trainers reuse the same `fair` array —
  `genericTrainerTeamPostWattson = getNonBossPreset('WATTSON', TIER_UU, true)` (`trainers.js:335`) via
  `easyTransform`. Editing `presets.js:367-368` would also shift those generic teams. Decide whether that is
  acceptable or gate the NU change to the boss preset only (e.g. distinct slots, or a boss-only override).

## Plan

Change Wattson's bottom two non-mega slots RU → NU; resolve the generic post-Wattson side-effect (accept, or
scope to the boss). Pure/seeded → TDD.

Acceptance criteria:
- [x] Wattson's boss team draws its two lowest non-mega slots from NU (mega slot still OU).
- [x] The generic-post-Wattson side-effect is explicitly decided and reflected in a test — **owner chose: both
      shift** (boss + generic post-Wattson trainers ease). The shared `fair` edit propagates to both.
- [ ] Determinism per seed preserved; `cd randomizer && npm test` green; browser bundle rebuilt.
      *(suite green — 1693 passed; bundle rebuild deferred to the end of this batch.)*

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Located Wattson's `SPLITS` entry (`presets.js:360-371`); the two
  bottom RU slots are `:367-368`. Flagged the shared-`fair` side-effect on generic post-Wattson trainers
  (`trainers.js:335`) to resolve with the owner before implementing.
- **2026-07-25** — **Owner decision + implemented (in-progress), TDD Red→Green.** Confirmed both `getBossPreset`
  and `getNonBossPreset` resolve from the same `SPLITS` `fair` array (`presets.js:629-651`), so the split is
  shared by the boss and the ~9 generic post-Wattson trainers (`trainers.js:2052-2126`). **Owner chose to nerf
  both** (whole-area breathing room). Changed the two bottom non-mega slots `presets.js:367-368` `TIER_RU` →
  `TIER_NU` (team now 3× RU + 2× NU + mega OU). New test `randomizer/__tests__/unit/wattsonNerf.test.js`
  (Red: 0 NU → Green: 2 NU); full randomizer suite green (1693 passed, nothing else depended on the old
  5×RU shape). Bundle rebuild deferred to the batch end.

## Outcome

<!-- Filled when closing. -->
