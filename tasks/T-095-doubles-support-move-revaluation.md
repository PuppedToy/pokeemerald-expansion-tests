---
id: T-095
title: Doubles re-valuation of support/gimmick moves (Follow Me, Rage Powder, Trick Room…)
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-093, T-094]
blocked-by: [T-094]
---

# T-095 — Doubles re-valuation of support/gimmick moves (Follow Me, Rage Powder, Trick Room…)

## Context

Many moves parked near-zero in singles (`statusList` in `rating.js:521-773`) are strong in doubles:
`FOLLOW_ME`, `RAGE_POWDER`, `HELPING_HAND`, `WIDE_GUARD`, `QUICK_GUARD`, `ALLY_SWITCH`, `AFTER_YOU`,
`COACHING`, `DECORATE`, `TRICK_ROOM`, plus Protect-family nuance and redirection support. This task
gives them an independent doubles score. Per ADR-015; informed by the Group 2B research (T-100).

## Plan

- Build a doubles override table (or per-move doubles branch) that assigns proper doubles values to
  the support/gimmick moves above, feeding `ratingDoubles` / the doubles `rateMoveForAPokemon`.
- Keep singles values exactly as they are.
- Cross-reference the synergy/anti-synergy catalog (T-100) so nothing important is missed
  (e.g. Fake Out, Follow Me + spread partner, Trick Room + slow abusers).
- Tests: each re-valued move has a materially higher doubles score than singles; singles unchanged.

Acceptance criteria:
- [ ] The doubles-support move set is re-valued for doubles (independent scores), singles untouched.
- [ ] Re-valuation is justified against the research catalog (T-100) where available.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
