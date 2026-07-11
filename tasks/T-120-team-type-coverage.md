---
id: T-120
title: Global type coverage & type selection for unrestricted trainers
status: proposed
type: feature
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-083, T-107, T-119, docs/adr/ADR-016.md]
priority: medium
blocked-by: [T-107]
---

# T-120 — Global type coverage & type selection

## Context

When a trainer has **no type restriction** (the Rival, most non-gym/E4 trainers), the team should still
be sensible about **type coverage** — offensive coverage across the roster and a non-degenerate
defensive typing spread — rather than only tier + archetype-fit + family-dedup (today's selection).
Gym leaders / Elite Four are type-locked so this does not apply to them; it is specifically the
**unrestricted** trainers where the engine currently does nothing to steer typing.

Owner note (2026-07-11): "cuando no hay restricciones de tipos hay que evaluar coverage global y
selección de tipos." A fine-tuning layer, to add if/when we polish unrestricted teams.

## Plan (to design when picked up)

- Add a coverage-aware term to the (unrestricted) selection: prefer candidates that improve the team's
  offensive coverage / patch a shared weakness, as a soft weight alongside archetype-fit (T-107) — never
  overriding the tier budget or restrictions.
- Gate by sophistication (early trainers stay loose; endgame teams get coherent coverage).
- Deterministic; measured via the T-117 decision log.

Acceptance criteria (draft):
- [ ] Unrestricted high-sophistication teams show improved offensive/defensive type coverage vs. today.
- [ ] Type-locked trainers (gyms/E4) unaffected; tier budget + restrictions never violated.
- [ ] Determinism green; `npm test` green.

## Progress log

- **2026-07-11** — Created (owner fine-tuning request). The engine does family-dedup + type restrictions
  but no global coverage optimisation for unrestricted trainers; this adds it.

## Outcome
