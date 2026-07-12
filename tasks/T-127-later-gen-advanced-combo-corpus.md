---
id: T-127
title: Later-gen advanced-combo corpus (Gen 8/9/Champions) — mechanic-filtered
status: proposed
type: docs
created: 2026-07-11
updated: 2026-07-11
target-version: 0.9.0
links: [T-083, T-121, T-102, T-124]
priority: low
---

# T-127 — Later-gen advanced-combo corpus (mechanic-filtered)

## Context

Our corpus is Gen 6-7 (the megas era that matches the decomp). But strategy evolved: **terrains** (a
gimmick we're adding manually for Wattson), Archaludon + **Electro Shot** in rain, and other combos /
support moves / archetypes were introduced in Gen 8-9. We want those — but ONLY the parts that don't
depend on mechanics our game lacks.

This is a **fine-tuning task for AFTER singles + doubles are complete** (owner). Do it once the base
engine (singles + doubles recipes, gimmicks, seeds) is settled, so it slots in as an enrichment layer.

## Plan

- Research advanced **singles, doubles (6v6) AND VGC** teams from **Gen 8, Gen 9, and Pokémon
  Champions** (adversarially verified, like T-098/099/121).
- **Filter out everything tied to mechanics we don't use:** **Z-Moves, Dynamax/Gigantamax,
  Terastalization.** Keep only strategies/combos/support/archetypes that do NOT interact with those.
- **Pokémon Champions is a key source:** its mechanics are current, it uses **only megas** (no Z/
  Dynamax/Tera), so its metagame is the closest to ours. Caveat: Champions has **megas not yet in our
  decomp** — flag/skip mons we can't represent.
- Distil: new **gimmicks** (terrains — electric/grassy/psychic/misty), new **combos** (Electro Shot +
  rain, terrain + Seed items, terrain-boosted STAB, Neuroforce, etc.), new **support moves**, and any
  new **archetypes** — each mapped to how it feeds the engine (a gimmick recipe + detector + completion
  rule + seed / item, like weather).
- Extend `docs/research/corpus.json` + `rating-decisions.md`; owner-validate each conclusion before it
  ships (meta-analysis clause).

> **Meta-analysis validation (owner-gated).** Everything derived here is owner-validated before
> implementation. Distances from generational mechanics must be reasoned explicitly (what survives
> without Z/Dynamax/Tera).

Acceptance criteria:
- [ ] A verified later-gen (8/9/Champions) corpus, mechanic-filtered (no Z/Dynamax/Tera dependence).
- [ ] Derived gimmicks/combos/support/archetypes mapped to engine hooks, owner-validated.
- [ ] Terrains formalised as a gimmick family (generalising the manual Wattson electric-terrain).

## Progress log

- **2026-07-11** — Created (owner). Deferred to post-singles+doubles fine-tuning. Motivated by terrains
  (Wattson, added manually now) and Gen-8/9 combos (Archaludon/Electro Shot rain) absent from the Gen
  6-7 corpus. Champions is the cleanest later-gen source (megas-only, no Z/Dynamax/Tera).

## Outcome
