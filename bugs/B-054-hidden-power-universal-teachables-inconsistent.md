---
id: B-054
title: Hidden Power (and other universal moves) show inconsistently in teachable lists
status: fixing           # open | fixing | fixed | wont-fix
severity: minor          # critical | major | minor
created: 2026-07-26
updated: 2026-07-26
found-in: 0.6.0
fixed-in:                # set on close, once the owner confirms
regression-test: randomizer/__tests__/unit/universalTeachables.test.js
links: [T-207]
---

# B-054 — Hidden Power (and other universal moves) show inconsistently in teachable lists

## Symptom

In the generated docs, **Hidden Power does not appear** in the learnable-TM list of many Pokémon, even
though in-game **every** species can learn it. Whether it shows is effectively random per run: a Pokémon whose
type matches has it, others get it only when the TM-pool roll happens to include it (~half the roster). Same for
the other "near-universal" moves (Return, Frustration, Secret Power). Reported by the owner (T-207 item 5).

## Root cause

The ROM makes a small set of moves learnable by all species via `sUniversalMoves` (Hidden Power, Return,
Frustration, Secret Power, …). `tools/learnset_helpers/make_teachables.py` therefore **omits** those moves from
the per-species `sXTeachableLearnset[]` arrays and only lists them once in the header comment block
(`src/data/pokemon/teachable_learnsets.h`, "Near-universal moves found from sUniversalMoves:").

The randomizer's `parseTeachableFile` (`randomizer/parser.js`) only reads the per-species arrays, so
`teachable_learnsets.json` contains **zero** occurrences of these moves and `poke.teachables` never includes
them. They only reappear when `buildRunTeachables` (`randomizer/teachableExpander.js`) randomly rolls them out
of the TM pool — hence the inconsistency, and when rolled they were wrongly "starred" as newly-granted.

## Fix

- `randomizer/parser.js` — new `parseUniversalMoves()` parses the `sUniversalMoves` comment block.
- `randomizer/modules/pokedexModule.js` — parses the universal set and passes it to `expandAllTeachables`.
- `randomizer/teachableExpander.js` — `buildRunTeachables`/`expandAllTeachables` fold the universal moves that
  exist in the run's TM pool into each mon's base teachables, so they show consistently for every species and
  are never spuriously starred (and never leak in as greyed "old" moves). Moves not in the run's TM pool (e.g.
  Bide) are not injected.

Regression test `randomizer/__tests__/unit/universalTeachables.test.js`: asserts the universal moves are
present for every mon across many seeds and never starred/greyed. Verified **FAIL before** (Hidden Power landed
in `newTeachables`/absent depending on the roll) and **PASS after**. Fixed under [T-207](../tasks/T-207-hidden-power-teachable-list-inconsistency.md).
