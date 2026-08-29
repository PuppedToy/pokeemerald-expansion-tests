---
id: T-286
title: Give Meltan an evolution into Melmetal
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-060, randomizer/docs/families-and-forms.md]
blocked-by: []
---

# T-286 — Give Meltan an evolution into Melmetal

## Context

Owner: *"Meltan: es una familia conjunta. Crear evo de meltan -> melmetal."*

Officially Melmetal comes from 400 Meltan Candy in Pokémon GO, a mechanic with no equivalent here, so
the expansion ships Meltan with no `.evolutions` at all — two separate non-evolving Mythicals sharing
a family label. The randomizer treated them as two unrelated obtainables: Melmetal could be handed out
with no line behind it, and Meltan's mutations reached nothing.

## Plan

`EVOLUTION({EVO_LEVEL, 40, SPECIES_MELMETAL})` on Meltan — a plain candy evolution, the convention
T-060 set for a single-branch line. The randomizer rerolls the level every run, so 40 is only the
source default.

Acceptance criteria:
- [x] The source declares the evolution; Melmetal still evolves into nothing.
- [x] Melmetal inherits from Meltan and from nothing else; Meltan is the line's base form.
- [x] Both classify as the two-stage line they now are.
- [x] One dedup group, so G1 offers one of them per run.
- [x] No second convergence point is created.
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] **Base ROM rebuild** — a source change the injector cannot express.
- [ ] Owner manually tests a built ROM and confirms.

## Progress log

- **2026-08-14** — Implemented TDD; `__tests__/unit/meltanMelmetalLine.test.js` (7) red on 4 first.
  The owner delegated the method for Mothim's stone explicitly but said nothing about Meltan's, so I
  took the routine call: candy, matching T-060's one-candy-branch convention, rather than inventing a
  stone requirement for a Mythical that has no in-world stone story.
  Full suite green: 2698 passed. **The ROM does not change until the base is rebuilt.**

## Outcome
