---
id: T-095
title: Doubles re-valuation of support/gimmick moves (Follow Me, Rage Powder, Trick Room…)
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-10
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

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [x] The doubles-support move set is re-valued for doubles (independent scores), singles untouched.
- [~] Re-valuation is justified against the research catalog (T-100) where available. *(Initial pass
      now; the values get refined once the Group 2B research lands — noted in the code + ADR-015.)*
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Implemented on `feature/T-095-doubles-support-moves` (TDD, red→green). Added
  `DOUBLES_SUPPORT_RATINGS` in `rating.js` — a doubles floor `Math.max`'d into `rateMoveDoubles` for
  redirection (Follow Me/Rage Powder=7), ally buffs (Helping Hand=6, Decorate=6, After You=5,
  Coaching=4.5), team protection/positioning (Wide Guard=5, Quick Guard=4, Ally Switch=4), speed
  control (Trick Room=7, Tailwind=7.5) and self-protection (Protect/Detect/Spiky Shield/King's Shield/
  Baneful Bunker/Silk Trap=5.5). Singles `rateMove` untouched (`Math.max` only lifts the doubles side).
  Tests: `rateMoveDoublesSupport.test.js` (5 cases). Suite 823 pass / 1 skip. Values are an initial
  pass to be refined by the Group 2B research (T-100). Kept `in-progress`. Merged to master.

## Outcome

<!-- Filled when closing. -->
