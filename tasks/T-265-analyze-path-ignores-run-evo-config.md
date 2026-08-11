---
id: T-265
title: Make the analyze/randomize path honour the run's evolution config
status: proposed        # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-11
updated: 2026-08-11
target-version: 0.9.0
links: [T-264, B-067]
blocked-by: []
---

# T-265 — Make the analyze/randomize path honour the run's evolution config

## Context

Spun out of [T-264](T-264-stone-evo-min-level-legality.md). `randomizer/writer.js` calls

```js
await writeEvoLevels(pokemonList, { recompute: !docs, stoneUnlockLevel: … });
```

and never passes `evoConfig`, so when it recomputes (analyze/randomize mode, i.e. `node analyze.js` and
the decommissioned `--compile` reference path) `applyEvoLevels` falls back to its built-in defaults and
ignores the run's own `evoLevels` settings — min/max, deviation, stage adjustments, tier base ranges, the
T-066 final-stage delays. The bundle path is unaffected: it reads the levels already stored on
`evo.param` / `evo.minLevel`, which were rolled once with the real config at bundle-creation time.

T-264 threaded the B-067 stone-unlock floor through this same call and left the `evoConfig` gap alone
rather than half-fixing it. The consequence today is that `node analyze.js` output is not representative
of a real run's evolution levels, which quietly undermines it as an analysis tool — including the
`--no-balance --all-tms` Phase C comparison documented in CLAUDE.md.

## Plan

Thread the run's `evoLevels` config into the recompute path the same way the stone-unlock level now is.
`writer()` already receives `pokedexArtifact`; check whether the module config is reachable there too, or
whether it needs to be passed down from the caller (`randomizer/index.js` / `analyze.js`).

Acceptance criteria:

- [ ] `writeEvoLevels(..., { recompute: true })` receives and applies the run's `evoLevels` config.
- [ ] A unit test pins that a non-default `evoLevels` config changes the levels the recompute path writes
      (RED before the fix).
- [ ] The bundle path (`recompute: false`) is provably untouched — it must keep writing the stored levels
      verbatim, with no RNG.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-11** — Task created, spun out of T-264 while wiring the B-067 stone-unlock floor into
  `writer.js`. Not started.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
