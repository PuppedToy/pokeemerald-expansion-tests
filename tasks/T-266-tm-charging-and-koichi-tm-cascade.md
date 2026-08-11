---
id: T-266
title: Charge TM teaches correctly and cascade the Route 104 south TM pick
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-11
updated: 2026-08-11
target-version: 0.9.0
links: [B-071, B-072]
blocked-by: []
---

# T-266 — Charge TM teaches correctly and cascade the Route 104 south TM pick

## Context

Both defects surfaced from one owner report against bundle `bundle-2231547897.json`: the Petalburg Woods
grunt cannot use Koichi's TMs, and Roxanne's level-13 team knows Water Pulse three times over.

- [B-072](../bugs/B-072-koichi-tm-pick-missing-from-bag-cascade.md) — `choice104TMs2` was never wired into
  the bag cascade.
- [B-071](../bugs/B-071-tm-teach-not-charged-for-over-level-move.md) — `chooseMoveset` never reported a TM
  teach whose move also sat higher in the mon's learnset, so the TM was neither spent nor did it activate
  its pick-pack link.

They are independent: B-072 is a content-wiring gap, B-071 an accounting defect in the rater. Fixed
together because they were diagnosed together and both change trainer teams, so they share one corpus
verification.

## Plan

TDD per bug, then reconcile the docs the fixes make stale.

Acceptance criteria:
- [x] `chooseMoveset` reports a TM teach whenever the move was not reachable by level-up, and still does
      not charge a move the mon could learn on its own.
- [x] The TM08-10 pick enters `petalwoodGruntBag()` as a linked pick-group and cascades forward.
- [x] A guard test fails if any future pick group is declared in `trainers.js` without a bag home.
- [x] `randomizer/docs/items.md` § Trainer Bag Cascade matches the code.
- [x] `cd randomizer && npm test` green.
- [ ] Owner manually verifies a fresh run: the Petalburg Woods trainers can roll Koichi's TMs, and no
      trainer teaches one bag unit of a TM to several Pokémon.

## Progress log

- **2026-08-11** — Task created off the owner's bundle report. Diagnosis first: confirmed the grunt's bag
  is `rival103Bag() + Eviolite + plates` with `TM_WHIRLWIND` as its only TM, and that a static scan of
  `trainers.js` finds `choice104TMs2` to be the sole pick group absent from every bag function. Confirmed
  Koichi is pre-woods content (Route 104 south, x=21 y=55, gated by `FLAG_DEFEATED_RIVAL_RUSTBORO`, set in
  Rustboro).
- **2026-08-11** — Chasing the owner's follow-up ("why does Roxanne's level-13 team know Water Pulse?")
  turned up the second, larger defect. Ruled out the first two hypotheses: it is **not** a duplicate TM
  (TM05 belongs to `choice104TMs`/Haley, not to Koichi) and it is **not** a broken level gate (the pool
  build and `injectableMove` both gate correctly; TMs are level-agnostic by design). The real cause is the
  level-blind guard feeding `tmsUsed`. Measured on the bundle: 28 uncharged teaches over 21 trainers, 7 of
  them overspending their own bag.
- **2026-08-11** — Red: `tmChargeOverLevelMove.test.js` (4 cases) and `tmPickCascade.test.js` (4 cases)
  written first; 4 failed for the right reasons against the unmodified code (`tmsUsed` empty; `TM_SLOT8`
  absent from the grunt/Roxanne/Brawly/Norman bags; `choice104TMs2` reported orphaned). Green after the
  two one-line production changes. Full suite: 2338 passed, 3 suites skipped (pre-existing), 0 failures.
- **2026-08-11** — Deliberately did **not** fold in the related-but-separate behaviour the diagnosis
  surfaced: a single mon can still hold two moves from one pick-pack (Roxanne's Clamperl has Water Pulse
  *and* Chilling Water), because T-133 locks a mon's moveset before consuming the link so it can never
  self-block. That is documented, deliberate, and out of scope here.

## Outcome

<!-- Filled when closing. -->
