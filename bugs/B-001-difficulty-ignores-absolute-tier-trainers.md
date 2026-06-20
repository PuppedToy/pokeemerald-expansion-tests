---
id: B-001
title: Frontend difficulty has no effect on trainers whose slots use absoluteTier (Flannery onward)
status: fixed
severity: major
created: 2026-06-20
updated: 2026-06-20
found-in: 0.1.0
fixed-in: 0.1.0
regression-test: randomizer/__tests__/unit/presets.test.js
links: [tasks/T-012-difficulty-affects-absolute-tier.md]
---

# B-001 — Frontend difficulty has no effect on trainers whose slots use absoluteTier

## Symptom

Changing the difficulty slider (1–13) in the frontend only changes the teams of trainers whose
slots use `contextualTier`. Trainers whose slots use `absoluteTier` are identical at every
difficulty. Because the boss/gym progression switches from `contextualTier` to `absoluteTier` at
Mt. Chimney / Flannery (badge 4), **difficulty does nothing from Flannery onward** — including
Norman, Winona, Tate & Liza, Juan, the entire Elite Four, and Champion Steven.

**Reproduction (pipeline, no source mutation):** build trainer teams at difficulty 1 vs 13 with the
same item seed and compare slot tiers per trainer:
- Result: **0 of 121** `absoluteTier` trainers change; only `contextualTier` trainers (64) change.
- Boss split classification (`randomizer/presets.js`): contextual = rival/grunts, Roxanne, Brawly,
  Wattson; absolute = Tabitha/Maxie Chimney, Flannery, Norman, Winona, Tate & Liza, Archie, Juan,
  Sidney/Phoebe/Glacia/Drake, Champion Steven.

Expected: difficulty should scale the teams of all non-exempt trainers across the whole game.

## Root cause

`applyTransform` in [randomizer/presets.js](../randomizer/presets.js) (the difficulty transform
applied per trainer in [randomizer/modules/trainersModule.js](../randomizer/modules/trainersModule.js))
builds its list of shiftable slots **only** from `contextualTier`:

```js
.map((s, i) => ({ i, idx: TIER_SEQ.indexOf(s.contextualTier?.[0]) }))
.filter(x => x.idx !== -1 && !result[x.i].isMega)
```

A slot with `absoluteTier` (and no `contextualTier`) yields `indexOf(undefined) === -1`, so it is
filtered out and never shifted. The trainer selector then picks by the unshifted
`p.rating.tier` ([trainerSelector.js:172-173](../randomizer/modules/trainerSelector.js)), so the
team is identical at every difficulty. The function's own comment lists the intended skips as
"isMega, special, oneOf" — it does **not** mention `absoluteTier`, indicating this is an oversight,
not a deliberate design. No test pins the absolute-tier-skipping behavior.

Design note (confirmed with the stakeholder): later trainers use `absoluteTier` (rather than
contextual) deliberately — past a point, contextual tiers stop adding value because Pokémon
learnsets open up — but they were still meant to scale with difficulty. The intended exception is
`evolutionTier` slots (the rival's / Wally's / some of Steven's "weak now, evolves with the trainer"
Pokémon), which must never be shifted by difficulty; mega slots stay fixed.

## Fix

Tracked in [T-012](../tasks/T-012-difficulty-affects-absolute-tier.md). In `randomizer/presets.js`,
`applyTransform` now treats a **single-element** `absoluteTier` as a shiftable "primary tier" exactly
like `contextualTier` (helpers `primaryTierIdx`/`shiftSlotTier`). `isMega` slots (megas stay fixed —
also covers every multi-tier absolute range, which are all mega slots) and any slot carrying
`evolutionTier` (rival/Wally/Steven progressive mons) are skipped.

This is the standard behaviour of `applyTransform` (no flag), so it corrects **both** uses of the
function:
1. **Difficulty** (`runTrainersModule`) — the slider now scales absolute-tier trainers.
2. **Non-boss derivation** (`easyTransform`/`getNonBossTeam`) — generic late-game trainers are now
   the proper 2-shift-down of the boss team (stakeholder-approved; see the related observation below).

Regression tests: `randomizer/__tests__/unit/presets.test.js` →
"applyTransform — absoluteTier & evolutionTier (B-001)" (single-tier absolute shift up/down, mixed
ranking, fallback, evolutionTier-skip, mega-skip) and
"getNonBossPreset — absolute-split derivation is 2-shift-down (B-001)". Verified FAIL before the fix,
PASS after.

Empirical (same seed): difficulty 1 vs 13 → absolute-tier trainers changing went from **0/121 →
118/121**; FLANNERY boss fair `UU,UU,UU,RU,RU,MEGA` → diff 8 nudges up; generic PostFlannery now
`UU,RU,RU,RU,RU,MEGA` (2-shift-down of the leader). Champion absolutes scale; mega/special fixed.

Stakeholder manually verified low vs high difficulty — marked `fixed`.

### Related observation (now ALSO addressed — stakeholder-approved)
Originally flagged separately: the same `absoluteTier`-skip meant the non-boss derivation didn't
2-tier-down absolute slots, so late-game generic trainers matched the leader's tiers instead of being
weaker. The stakeholder approved fixing this together (it shares the root cause), so the unified
`applyTransform` change addresses it: generic late-game trainers are now properly weaker than the
boss, and difficulty raises the boss and its route trainers together.
