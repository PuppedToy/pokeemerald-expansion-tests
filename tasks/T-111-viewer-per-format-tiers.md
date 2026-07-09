---
id: T-111
title: Viewer — surface singles/doubles tiers per Pokémon (mixed shows both)
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-097]
blocked-by: [T-097]
---

# T-111 — Viewer — surface singles/doubles tiers per Pokémon (mixed shows both)

## Context

Pokémon viability differs by format; the generated docs viewer should reflect it. The doubles
rating/tier fields (T-097) already flow into `output/pokes.js` automatically; this task adds the UI.
For a `singles` run show the singles tier; `doubles` → doubles tier; `mixed` → both.

## Plan

- Add per-format tier display to the viewer (Pokédex list + detail modal), driven by the run's
  `battleFormat`: single tier for pure runs, both tiers (labelled) for mixed.
- Reuse the existing tier rendering/colour system; label clearly (e.g. "Tier (S): OU / Tier (D): UU").
- Keep it responsive (existing mobile constraints).
- Frontend/docs tests where the harness allows.

Acceptance criteria:
- [ ] Viewer shows the correct tier(s) per run format; mixed shows both, labelled.
- [ ] No horizontal-scroll/responsive regressions.
- [ ] Relevant tests green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
