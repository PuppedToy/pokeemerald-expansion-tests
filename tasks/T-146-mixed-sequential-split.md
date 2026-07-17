---
id: T-146
title: Mixed sub-mode — first half of the game singles, second half doubles (breakpoint boss by singles %)
status: done
type: feature
created: 2026-07-17
updated: 2026-07-17
target-version: 0.8.0
links: [T-085, T-086, T-089, ADR-014, ADR-018]
blocked-by: []
---

# T-146 — Mixed sequential split (first-half singles / second-half doubles)

## Context

Owner (2026-07-17, TAREA 2). A new opt-in mixed sub-mode: the first part of the game is singles and the
rest doubles, switching at a boss whose position comes from the singles %. See ADR-018 §2.

## Plan

1. **Frontend** (`config-form.js`) — a new checkbox in `#mixed-panel`, `id="mixed-sequential-split"`,
   unchecked by default, with static help text ("On: first part of the game is singles, the rest doubles,
   switching at a boss. Off: singles & doubles are interleaved across the game."). Wire DEFAULTS, getConfig
   (`mixedSequentialSplit`), setConfig, `_wireEvents`. Forward the key in `randomizer-worker.cjs` +
   `backend/generator.js`; extend the round-trip test loop.
2. **`battleFormat.js`** — sequential branch when `battleFormat==='mixed' && mixedSequentialSplit`:
   - Boss spine = `bossCaps` `BOSS_CAP_TRAINERS` milestones ordered by representative `displayOrder`
     (excluding the 4 E4 milestones when Run & Bun). `singlesCount = round(fraction × numBosses)`; breakpoint
     = milestone[singlesCount]; `breakpointOrder` = its representative `displayOrder` (+∞ at 100% singles).
   - Assign each trainer: `tag` stays `tag`; E4/E4Doubles under RB keep the RB rule; else `displayOrder <
     breakpointOrder → singles`, else `doubles` (≥2-mon eligibility gate). Champion follows position.
     Tate & Liza NOT forced (no rule-8 ordering here).
3. **`modules/trainersModule.js`** — pass each trainer's `displayOrder` into `assignBattleTypes`.
4. **Run & Bun** — coexists; E4 excluded from the split + `numBosses`, governed by RB as today.

## Acceptance criteria

- [x] Frontend checkbox present (unchecked default) + help text; round-trip through worker + backend config.
- [x] Sequential split: all battles before the breakpoint boss are singles, breakpoint boss + after are
      doubles; breakpoint is a boss derived from `round(% × numBosses)`; unit-tested at several %.
- [x] Tate & Liza not forced to doubles in this mode; champion follows sequential position.
- [x] Run & Bun on: E4 excluded from the split (RB clones/choice intact), rest split sequentially; tested.
- [x] `cd randomizer && npm test` + frontend tests green; determinism gates intact.

## Progress log

- **2026-07-17** — Task created; design in ADR-018 §2 (owner-validated: % over bosses, champion follows
  position). Batched with T-145. Starting after T-145.
- **2026-07-17** — Implemented (Red→Green): sequential branch in `battleFormat.js` (bossCaps milestone
  spine by displayOrder; `singlesCount = round(fraction × numBosses)`; before→singles, breakpoint+after→
  doubles; champion/T&L by position; RB excludes the E4 from the split + count); `displayOrder` threaded via
  `trainersModule.js`; frontend checkbox + config plumbing (worker + backend) + round-trip test. Unit: 6 new
  sequential tests. E2E on the real generator (mixed 60% singles): 156 singles → 50 doubles → 3 tag,
  breakpoint = Maxie Magma Hideout (a boss), 0 singles after the first double. npm test 1190; frontend 78;
  backend 132; RUN_DETERMINISM gates 18/18. **Owner manually tested the half-doubles setting and confirmed
  it is correct (2026-07-17) → close.**

## Outcome

Shipped (owner-confirmed 2026-07-17). New opt-in mixed sub-mode `mixedSequentialSplit`: the game's first
part is single battles and the rest double battles, switching at the boss milestone at
`round(singlesPercent × numBosses)` (bossCaps spine ordered by displayOrder; before → singles, breakpoint
boss + after → doubles, ≥2-mon eligibility gate). Champion and Tate & Liza follow their sequential position
(no forcing — the ADR-014 rule-8 T&L-first ordering and the champion majority rule are proportional-only).
Run & Bun coexists: the four E4 keep their base-singles + `_DOUBLES`-clone treatment and are excluded from
the split and the boss count. Off by default (unchecked) → the ADR-014 interleaved proportional assignment
is unchanged. Design: ADR-018 §2. Follow-up ideas for the doubles support/item rating captured in T-147.
