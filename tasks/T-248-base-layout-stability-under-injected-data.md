---
id: T-248
title: "Make the base's ROM layout independent of the data it carries (B-057) — decide with a measurement"
status: proposed        # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-02
updated: 2026-08-02
target-version: 0.7.0
links: [B-057, T-239, T-228, docs/base-plus-injection-strategy.md, docs/adr/ADR-022-base-plus-injection-architecture.md]
blocked-by: []          # nothing blocks it; it must land BEFORE T-244
---

# T-248 — Make the base's layout independent of the data it carries

## Context

[B-057](../bugs/B-057-compile-layout-drifts-with-injected-data.md), found by T-239's GATE-3 run: a
compiled ROM is not laid out like the base. One `const u16` element in `gStarterExtraMon` changing value
adds 4 bytes of generated code and moves 41,382 of 48,406 symbols. So `inject(base, bundle)` can never be
byte-identical to `compile(bundle)`, and hash equality — the check ADR-022 chose *because* it needs no
judgement — is unavailable to every Phase-3 module.

Phase 3 proceeds without it: `parity.mjs --compile-each --by-symbol` compares each written table's data
using each build's own `.map`, which is what verified T-239 (12/12 corpus ROMs). That check proves *what
the injector wrote is right*; it cannot prove *nothing was left unwritten*, because it only looks where
the injector wrote. That blind spot is harmless while modules are knowingly pending — and becomes the
whole question at [T-244](T-244-base-injection-decommission-old-maker.md), when the compile path is
removed and "is anything still missing?" is what a gate has to answer.

Hence: not urgent, not optional. **Before T-244.**

## Plan

Decide with a number, not a guess. The measurement is cheap; only adopting the fix is not.

1. **The 10-minute experiment.** On the build box, in an isolated tree: build the base, flip `LTO=0`
   (see [T-228](T-228-analysis-rom-build-time-optimization.md), which already weighs that flag), change
   one `gStarterExtraMon` element, rebuild, and diff the two `.map`s. Either the symbols stop moving or
   they don't — that single fact decides whether option 1 below is even available.
2. **Record the cost alongside it:** ROM size (the 32 MB ceiling is GATE-1's budget — 7.96 MB free today)
   and build time, since that is what `LTO=0` trades away.
3. **Then choose:**
   - *Layout stabilised by `LTO=0`, cost acceptable* → adopt it, rebuild the base, re-snapshot the
     corpus, restore hash equality as the Phase-3/4 gate.
   - *`LTO=0` doesn't stabilise it, or costs too much* → isolate the injectable tables so codegen cannot
     react to them (their own translation unit / section), and re-measure.
   - *Neither is worth it* → keep per-table verification and close the coverage gap another way: compare
     **every** symbol's content between the injected and compiled ROMs (tolerating pointer fields, which
     differ by address), so "nothing was left unwritten" is still machine-checked at T-244.
4. Whatever is chosen, add the **INV-LAYOUT regression check** B-057 asks for: compile one corpus bundle
   and assert every symbol sits where the base's `.map` puts it. That is the test that would have caught
   this in Phase 2, and it is the bug's `regression-test` field.

Acceptance criteria:
- [ ] The experiment is run and its result recorded here (does `LTO=0` stabilise the layout? ROM size and
      build-time delta).
- [ ] A decision is taken and written down, with the reasoning — including "keep per-table verification"
      if that is the outcome.
- [ ] An INV-LAYOUT check exists and fails on a deliberately perturbed build (falsifiability verified).
- [ ] B-057 is closed or explicitly re-scoped to what remains.
- [ ] Whatever the choice, the injection gate is documented in one place
      (`randomizer/docs/injection.md`) and the strategy doc agrees with it.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-02** — Created out of T-239's GATE-3 run (see [[B-057]] for the bisection that found it).
  Deliberately scheduled *before* T-244 rather than immediately: it blocks nothing in T-240–T-243, and
  the decision is better made with the size/build-time numbers in hand.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
