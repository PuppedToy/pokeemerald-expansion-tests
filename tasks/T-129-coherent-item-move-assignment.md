---
id: T-129
title: Coherent item + move co-assignment for trainer mons
status: proposed
type: fix
created: 2026-07-13
updated: 2026-07-13
target-version: 0.8.0
links: [T-117]
blocked-by: []
---

# T-129 — Coherent item + move co-assignment

## Context

Review feedback on `tasks/assets/T-128/run-2585940843`: Champion Steven's Solgaleo resolved to
**Choice Specs + Stealth Rock** (a Choice item locked onto a hazard-setting status move — never done
competitively), and **Choice Specs + Metal Burst** (equally incoherent). The item and the moveset are
currently chosen in separate steps (`chooseMoveset` then a bag-item rating pass in
`modules/resolveTrainerTeam.js`), so the item can contradict the moves (e.g. a Choice item on a set
built around status/utility moves).

## Plan

Diagnose the item↔move assignment with a critical eye and make them coherent:
- Trace how `chooseMoveset` and the bag-item selection interact today; identify why a Choice item lands
  on a status/utility set (and Metal Burst — a damage-reflect move — pairs with Choice Specs).
- Decide whether item and moves should be chosen **together** (co-optimised) or whether item selection
  should veto/adjust incoherent pairings (e.g. no Choice item unless the set is ≥3 attacking moves of one
  split; Assault Vest only with 0 status moves; etc.).
- Keep it data-driven and tested; do not special-case single species.

Acceptance criteria:
- [ ] No Choice item (Band/Specs/Scarf) on a set that is not overwhelmingly attacking / is locked to a
      status move; documented rule.
- [ ] The Steven-Solgaleo case (and Metal Burst) no longer produces the incoherent pairing.
- [ ] Unit test(s) covering the incoherent combinations that must not occur.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. -->

## Outcome
