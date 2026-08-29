---
id: T-278
title: Inherit mutations along the evolution edge, not the family string
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-289, docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md, randomizer/docs/families-and-forms.md, B-069]
blocked-by: []
---

# T-278 — Inherit mutations along the evolution edge, not the family string

## Context

The keystone of the T-277 epic and the fix for all three symptoms the owner reported. See ADR-026 for
the model and `randomizer/docs/families-and-forms.md` for the ruleset.

`rebalancer.js` kept **one mutation log per `family` string** and replayed the whole accumulated log
onto every later member of that family, in dex order. Three consequences, all reported:

1. **Siblings inherited each other** (34 families). Eevee's eight branches picked up whatever the
   earlier ones rolled; Cascoon inherited Silcoon *and Beautifly*.
2. **A cross-family evolution inherited nothing** (14 species) — Weezing-Galar sits in
   `P_FAMILY_KOFFING_GALAR`, so Koffing's mutations never reached it.
3. **A form parked in the base line's family inherited a line it does not belong to** (12 species) —
   Perrserker took Meowth's and Persian's; Cursola took plain Corsola's.

The stale `@TODO` at the top of `rebalancer.js` described symptom 3 exactly ("Meowth +20 def should
not carry alolan and galar meowth"), unactioned since the file was written.

## Plan

New `randomizer/evoGraph.js` — the directed evolution graph built from `evolutions[]`, with the
queries the rest of the epic needs (parents, children, first/final stage, forward and backward
reachability, base forms). Then rebalance inheritance keyed by **species** instead of family: a mon
replays each direct parent's full log and nothing else; several parents stack (D0).

Acceptance criteria:
- [x] `evoGraph.js` builds edges from `evolutions[]`, ignores targets filtered out of the run, and
      terminates on cycles and self-edges.
- [x] Siblings never inherit from each other.
- [x] A cross-family evolution inherits from its real pre-evolution.
- [x] A convergence point stacks every pre-evolution (D0).
- [x] Inheritance stays cumulative down a line (Raichu carries Pichu through Pikachu).
- [x] B-069's guarantee survives, re-expressed for the species-keyed store.
- [x] Failing-first regression tests.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-14** — Implemented TDD across two new suites: `__tests__/unit/evoGraph.test.js` (12) and
  `__tests__/unit/inheritanceByEdge.test.js` (12, confirmed **RED 12/12** before the change).
  Design notes worth keeping:
  · A parent's stored log already contains what IT inherited, so replaying only the direct parents
    gives the whole line cumulatively — no ancestor walk, and Raichu still gets Pichu through Pikachu.
  · Parse order is topological for every evolution edge in this dex (verified in T-277, 0 exceptions),
    so the existing single-pass rebalance loop needs no reordering. That keeps the RNG-stream churn to
    the changed replay set alone.
  · A mon that fails its `balanceChance` roll must still record what it carries, or its own evolutions
    would inherit nothing and the line would break at the first unmutated member.
  · `resetFamilyTracking` renamed to `resetInheritance`, with the old name kept as an alias export so
    B-069's regression test and the pipeline mocks keep working under the name they were written with.
- **2026-08-14** — Spec change to `generationRepeatability.test.js` (B-069), logged per the TDD rule.
  Two of its tests asserted the OLD model's behaviour and could not survive verbatim:
  · The pair it used, `[MACHOP, MACHAMP]`, is not a parent/child edge (Machoke sits between) — under
    the old family key they shared a log, under the new one they do not. Both tests now run the real
    `MACHOP → MACHOKE → MACHAMP` line with the parents the graph would supply.
  · **The original leak is gone by construction, and the test now pins that.** The old store was keyed
    by family and *appended*, so replaying a dex doubled every log — that was B-069's failure mode.
    The new store is keyed by species and *overwrites*, so re-running the same dex rewrites each entry
    before its evolution reads it. The test that asserted divergence-on-repeat now asserts equality,
    with a comment so a future change back to an appending store fails there.
  · The reset is still necessary and still guarded, by a sharper test: a second run over a **different**
    dex leaks, because a species run 2 does not rebalance leaves its run-1 log behind for its evolution
    to inherit. First attempt at that test was flaky — running both halves under the same seed made the
    stale parent's entries coincide with what the child rolled for itself. Fixed by seeding run 1
    separately and asserting the exact property (the child's log *starts with* the stale parent's
    entries) instead of comparing lengths.
- **2026-08-14** — Verified against the real 1228-species dex: Cursola ← Corsola-Galar (was plain
  Corsola), Weezing-Galar ← Koffing (was nothing), Perrserker ← Meowth-Galar (was Meowth+Persian),
  Vaporeon/Jolteon ← Eevee only, Cascoon ← Wurmple only, Mothim ← all three Burmy cloaks stacked, and
  Mothim is the dex's only convergence point. Full suite green: 2555 passed.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
