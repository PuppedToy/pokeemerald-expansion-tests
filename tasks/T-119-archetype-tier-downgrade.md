---
id: T-119
title: Archetype-driven tier downgrade within budget (fill a needed role by downgrading, never upgrading)
status: proposed
type: feature
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-083, T-107, T-118, docs/adr/ADR-016.md]
priority: high
blocked-by: [T-107]
---

# T-119 — Archetype-driven tier downgrade within budget

## Context

Part of the teambuilding algorithm is **adjusting members so the team actually fits its crystallised
archetype + gimmicks**. The T-107 engine biases picks and injects role moves, but it only ever picks
**within** each slot's tier budget — it cannot go and fetch a role-filler that does not exist in budget.

Owner scenario (2026-07-11): a **Dark-type Elite Four** with budget ~[1 legend, 1 uber, 2 OU, 2 UU].
If Dark has no **hazard setter** inside that budget and the nearest one is RU, it is worth
**downgrading a UU slot to RU** to fill the role the archetype needs.

## Decision / invariants (owner-stated)

- **NEVER exceed the budget.** A slot's tier is a hard ceiling — the engine may only ever go **DOWN**,
  never up.
- **Downgrade only within teambuilding restrictions.** The restriction set is per-trainer: an Elite
  Four member is **type-locked** (a Dark E4's downgraded pick must still be Dark); the **Rival has no
  type restriction**. Also respect family-dedup, at-most-one-mega, ID-locks, exemptions.
- Prefer the **least-costly downgrade** (downgrade the lowest-value slot / smallest tier drop that
  fills the role), and only when a crystallised archetype/gimmick role is genuinely unfilled in budget.

## Plan (to design when picked up)

- In the completion/refinement phase (ADR-016 §2.4-2.5): detect structure roles the crystallised
  identity needs that **no in-budget candidate can fill** (given tier + type + dedup).
- Choose a slot to downgrade (lowest-priority / smallest necessary tier drop) and re-select it for the
  missing role, from the lower tier, still honouring all restrictions.
- Deterministic (per-slot reseed) + measured with the T-117 decision log (a downgrade shows as a slot
  note: "downgraded UU→RU to fill hazardSetter for the Dark E4").
- Gate by sophistication (a low-soph trainer doesn't chase perfect role coverage).

Acceptance criteria (draft):
- [ ] A crystallised role unfilled in budget triggers a downgrade of a permissible slot to fill it.
- [ ] Never exceeds the budget; respects type-lock (E4) / no-restriction (rival) + dedup/mega/ID-locks.
- [ ] Decision log surfaces each downgrade; determinism green; `npm test` green.

## Progress log

- **2026-07-11** — Created (owner fine-tuning request). The engine currently has no role-driven tier
  downgrade; this adds it. Independent of the immediate entry-condition tuning.

## Outcome
