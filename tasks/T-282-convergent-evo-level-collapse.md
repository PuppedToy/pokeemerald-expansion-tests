---
id: T-282
title: Give a converging evolution one gate level, so the docs and the ROM agree
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-289, B-062]
blocked-by: []
---

# T-282 — Give a converging evolution one gate level, so the docs and the ROM agree

## Context

Fifth child of the T-277 epic; independent of the graph work.

`applyEvoLevels` rolls a gate level **per holder**, but stores it in maps keyed by **target species** —
and both consumers apply those maps by target across every entry that points at it: the text writer's
`patchEvoLevelInContent` / `patchStoneMinLevelInContent` are global regexes on the species name, and
`injector/modules/evolutions.js` is keyed by species id (it already *refuses* rather than guess when
two names for one id disagree).

So the last holder processed won in the ROM, while every holder's in-memory `evo.param` / `evo.minLevel`
kept its own roll — and that is what the docs serialise. Reproduced on a real run during the T-277
audit: Burmy-Plant's Mothim gate read **18 in the docs and 20 in the ROM**. Same class of defect as
B-062.

## Plan

The ROM cannot hold two gates for one target, so the pipeline must agree with what the cartridge can
store: collapse every entry pointing at a target to **one** level — the lowest rolled, so the gate is
reachable from whichever pre-evolution the player actually has. Draws no RNG; the rolls already
happened.

Acceptance criteria:
- [x] Every holder of a converging target ends up with the same gate, across seeds.
- [x] The shared gate is the lowest of the rolls.
- [x] The maps the writer and the injector consume agree with the evo entries.
- [x] A single-holder target is untouched.
- [x] The B-067 stone-availability floor still applies after the collapse.
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

- **2026-08-14** — Implemented TDD; `__tests__/unit/convergentEvoLevels.test.js` red on the five seed
  cases and the map-agreement case.
  Considered making the ROM carry a gate per holder instead, and rejected it: the injector walks
  evolution arrays that the base ROM may have folded between species, which is why it already throws
  on a shared `CONDITIONS()` object rather than guess. Agreeing on one level is the only option that
  is injectable *and* keeps the docs honest.
  The collapse is exported as `collapseConvergentGates` so the "lowest wins" rule is unit-tested with
  pinned levels rather than through whatever a seed happens to roll — the first version of that test
  passed by luck.
  Ordering matters: the collapse runs **before** the B-067 stone floor, so a shared gate under the
  floor is still raised to it. Full suite green: 2604 passed.
- **2026-08-14** — After T-289 the dex has exactly one convergence point (Mothim), so this is a no-op
  everywhere else; it stays general because T-287 will make all three Burmy cloaks point at the same
  Mothim species id.

## Outcome
