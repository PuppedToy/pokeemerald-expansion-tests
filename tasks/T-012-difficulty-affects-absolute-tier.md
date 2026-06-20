---
id: T-012
title: Difficulty must scale absolute-tier trainers (fix B-001), keeping evolutionTier & megas fixed
status: done
type: fix
created: 2026-06-20
updated: 2026-06-20
target-version: 0.1.0
links: [bugs/B-001-difficulty-ignores-absolute-tier-trainers.md]
blocked-by: []
---

# T-012 — Difficulty must scale absolute-tier trainers (fix B-001)

## Context

See [B-001](../bugs/B-001-difficulty-ignores-absolute-tier-trainers.md). The difficulty transform
`applyTransform` (`randomizer/presets.js`, applied per trainer in `runTrainersModule`) only shifts
slots that have `contextualTier`, so every trainer built with `absoluteTier` ignores difficulty —
i.e. from Mt. Chimney / Flannery (badge 4) through the Elite Four and Champion.

Stakeholder intent (confirmed):
- Difficulty should scale **all non-exempt trainers**, including `absoluteTier` ones.
- **Exception:** `evolutionTier` slots (rival / Wally / some Steven "weak-now, evolves-later"
  Pokémon) must never be shifted by difficulty.
- **Mega slots stay fixed** (`isMega`) — unchanged from today's behavior.

Investigation findings that scope the fix:
- All `evolutionTier` slots currently sit on already-exempt trainers (`TRAINER_WALLY_*`, `MAY_*`,
  `BRENDAN_*`, `TRAINER_STEVEN`); we still add an explicit `evolutionTier` guard so the protection
  is intentional, not incidental.
- Every **multi-tier** `absoluteTier` slot is an `isMega` slot (the `ABSOLUTE_POKEDEF_*_MEGA`
  range defs). There are **no** non-mega multi-tier absolute slots, so keeping megas fixed also
  removes all multi-tier ambiguity — the only absolute slots we shift are **single-tier**.

## Plan

Extend `applyTransform` so a slot's "primary tier" can come from `contextualTier[0]` **or** a
single-element `absoluteTier`, and shift whichever the slot uses. Concretely:
- Eligibility (the ranked top/bottom-N selection) includes a slot when it has a primary tier in
  `TIER_SEQ` **and** is not `isMega` and not `evolutionTier`. Primary tier =
  `contextualTier[0]` if present, else `absoluteTier[0]` when `absoluteTier.length === 1`.
- When shifting a selected slot: shift `contextualTier` if present (unchanged), else shift the
  single-element `absoluteTier`. Apply the same to its `fallback[]` entries.
- `contextualTier` behavior is unchanged. `isMega` slots remain skipped (megas fixed, covers all
  multi-tier ranges). `evolutionTier` slots are now explicitly skipped.

Keep the change confined to `randomizer/presets.js` (`applyTransform`). No selector/trainers/data
changes needed — the selector already filters by `absoluteTier`.

## Acceptance criteria
- [x] A unit regression test (annotated B-001) shows `applyTransform` shifts a single-tier
      `absoluteTier` slot up/down — FAILS before the fix, PASSES after.
- [x] `applyTransform` does NOT shift `isMega` slots or any slot carrying `evolutionTier`
      (covered by tests).
- [x] Existing `applyTransform` / preset tests stay green (contextualTier behavior unchanged).
- [x] Empirical end-to-end: building trainer teams at difficulty 1 vs 13 now changes
      `absoluteTier` trainers (Flannery → Champion included), while `evolutionTier` (exempt
      rival/Wally/Steven) and mega slots stay identical.
- [x] **(scope expanded, stakeholder-approved)** Non-boss derivation 2-shift-down now applies to
      absolute splits too: generic late-game trainers are weaker than the boss (test:
      `getNonBossPreset — absolute-split derivation is 2-shift-down`).
- [x] `cd randomizer && npm test` green; `node scripts/check-tracker.mjs` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-20** — Task created from B-001. Investigation (diff=1 vs diff=13, same item seed):
  0/121 absolute-tier trainers change, 64 contextual change. Boss splits switch contextual→absolute
  at Mt. Chimney/Flannery. Confirmed with stakeholder: scale all non-exempt incl. absolute; never
  shift `evolutionTier`; keep megas fixed. Confirmed all multi-tier absolute slots are mega slots
  (no non-mega multi-tier), so the fix only shifts single-tier absolute — no remaining ambiguity.
- **2026-06-20** — Implemented (TDD). Added the B-001 describe block to `presets.test.js` (5 RED
  cases + an isMega-skip + a no-mutation case), watched them fail. Fixed `applyTransform`:
  `primaryTierIdx`/`shiftSlotTier` helpers + an opt-in `opts.includeAbsolute`. `runTrainersModule`
  passes `{ includeAbsolute: true }`.
  - **Key decision — surgical/opt-in:** `applyTransform` is ALSO used by `easyTransform`/
    `getNonBossTeam` to derive non-boss preset teams ([trainers.js](../randomizer/trainers.js) L259-273).
    Making absolute always-shift would have changed the **fair/baseline** late-game generic teams
    (PostFlannery…PostJuan), which the stakeholder did not request. So absolute-shifting is opt-in and
    only the difficulty path uses it; `easyTransform` keeps default behaviour → baseline byte-identical
    (pinned by the `WITHOUT includeAbsolute … NOT shifted` test).
  - **Latent issue flagged (not fixed):** that same derivation gap means non-boss late-game generic
    teams aren't actually 2-tiers-below the boss at fair. Logged in B-001 "Related observation" for a
    separate decision.
  - **Verified:** presets 33/33; full suite 440 (one PRE-EXISTING flaky `startersModule` type-triangle
    fallback test — intermittent, imports no `presets`/`trainers`, so causally unrelated; passes on
    re-run). Empirical diff 1 vs 13: absolute trainers changing 0/121 → **118/121**; Flannery
    `RU,M,RU,RU,NU,NU`→`OU,M,OU,OU,UU,UU` (mega fixed); Champion absolutes scale, mega/special fixed.
  - **Pending stakeholder manual test before closing.**
- **2026-06-20** — Scope expanded with stakeholder approval. They confirmed the non-boss derivation
  should ALSO 2-shift-down absolute splits (generic late-game trainers weaker than the leader; e.g.
  Flannery's route → `UU,RU,RU,RU,RU,MEGA`) and that raising difficulty must lift the boss and its
  route trainers together. Since BOTH callers now want identical absolute handling, removed the
  opt-in `includeAbsolute` flag and made absolute-shifting the standard `applyTransform` behaviour
  (used by the difficulty path AND `easyTransform`). Updated tests accordingly (dropped the
  flag-default test; added a `getNonBossPreset` absolute-derivation test pinning UU×1/RU×4).
  - **Verified:** presets 33/33; full suite 440. Baseline: PostFlannery `RU,RU,UU,RU,RU,MEGA`
    (2-down), PostRoxanne unchanged. Difficulty 1 vs 13 still scales absolute (118/121); FLANNERY
    fair `UU,M,UU,UU,RU,RU` → diff 8 `UU,M,UU,UU,UU,RU`. The pre-existing flaky `startersModule`
    test remains intermittent (unrelated).
  - **Pending stakeholder manual test before closing.**

## Outcome

Fixed B-001 and the related baseline-derivation gap (both share the root cause). `applyTransform`
(`randomizer/presets.js`) now shifts single-tier `absoluteTier` slots exactly like `contextualTier`
(helpers `primaryTierIdx`/`shiftSlotTier`), skipping `isMega` (megas fixed; covers all multi-tier
absolute ranges) and `evolutionTier` (rival/Wally/Steven progressive mons). No flag — it's the
standard behaviour, so both the difficulty transform (`runTrainersModule`) and the non-boss
derivation (`easyTransform`/`getNonBossTeam`) are corrected.

Result: difficulty scales every non-exempt trainer across the whole game (Flannery → Champion
included); generic late-game trainers are now the proper 2-shift-down of their gym leader; raising
difficulty lifts a boss and its route trainers together.

Deviation from the original plan: scope expanded mid-task (stakeholder-approved) to also fix the
non-boss derivation, which let us drop the opt-in `includeAbsolute` flag in favour of unified
behaviour. Tests: `presets.test.js` B-001 describe + a `getNonBossPreset` absolute-derivation test
(FAIL before, PASS after); suite 440 green. User manually verified low vs high difficulty.

Follow-ups: none. (Note: a pre-existing, unrelated flaky `startersModule` type-triangle fallback
test remains intermittent — out of scope; candidate for its own bug if it bites.)
