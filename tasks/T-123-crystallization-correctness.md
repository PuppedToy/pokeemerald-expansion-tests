---
id: T-123
title: Crystallization correctness — last-resort hyper, gimmick evidence, role-max dedup
status: proposed
type: feature
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-107, T-118, T-121]
priority: high
---

# T-123 — Crystallization correctness

## Context

The problem-2 analysis (audit over a 193-team generation) + owner reflections surfaced three
crystallization defects, all singles + doubles:

1. **Hyper offense is an attractor** — it is the plurality at every sophistication tier and over-wins
   because its recipe (2 setup sweepers + a hazard lead) is easy to satisfy. Owner: *"no tenemos que
   hacerlo caer en hyper hasta que el resto de slots estén descartados"* — hyper should be the
   **last-resort** base, chosen only when no other base fits.
2. **Gimmicks fire on thin evidence** — a weather setter alone is not a weather team (Juan: 1 Drizzle +
   1 Swift Swim → "weather"); screens saturates on any hyper team with a screen-capable support. A
   gimmick must have **enough evidence** (more of its defining roles) to crystallise.
3. **Role over-assignment vs recipe max** — a team can carry 2 mons tagged the same role when no
   crystallised archetype's recipe wants 2 (Phoebe: Annihilape + Haunter both hazard setters). When the
   count exceeds the recipe's `max` for that role, the system must **strip the role** from the excess
   mon(s) so it isn't double-delivered.

## Plan

- **(1) Last-resort hyper:** in `resolveIdentity`, prefer any non-hyper base that fits ≥ threshold; fall
  to `hyper_offense` only when it is the sole base over the bar (or all others are clearly worse).
- **(2) Gimmick evidence:** require a gimmick's fuller recipe (raise the effective bar — e.g. weather
  needs setter + ≥1 real abuser AND weather-synergy; screens needs a dedicated setter, not incidental).
  Coordinate with T-124 (a gimmick that crystallises must then be BUILT).
- **(3) Role-max dedup:** after crystallisation, cap each role's delivered count to the identity's
  recipe `max`; excess role-holders lose that role (and are re-roled toward an unmet slot).
- Measure every change with the T-117 decision log (distribution should flatten: less hyper, fewer
  incidental gimmicks, no impossible double-roles).

> **Meta-analysis validation (owner-gated).** The thresholds (how much evidence = a real gimmick, the
> last-resort ordering, role caps) are meta conclusions — validate with the owner before shipping.

Acceptance criteria:
- [ ] Hyper offense stops being the default attractor (distribution flattens across bases).
- [ ] Gimmicks require real evidence (no "weather" from a lone setter); measured via the decision log.
- [ ] No team delivers more of a role than its archetype recipe allows.
- [ ] Determinism gate green; `cd randomizer && npm test` green.

## Progress log

- **2026-07-11** — Created from the owner's problem-2 analysis (hyper-attractor, weather-thinness,
  Phoebe's double hazard setters).

## Outcome
