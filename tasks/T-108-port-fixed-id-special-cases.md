---
id: T-108
title: Engine — port fixed-ID / continuity / special cases into the new engine
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-106, T-107]
blocked-by: [T-107, T-106]
---

# T-108 — Engine — port fixed-ID / continuity / special cases into the new engine

## Context

The new preference engine must still honour the hard constraints the old system encoded: ID-locked
mons and continuity (rivals' starter-counter + kept mons, Steven's repeated fossils, player-starter
references), one-mega-per-team, family dedup, trainer restrictions (`NO_REPEATED_TYPE`,
`ALLOW_ONLY_TYPES/ABILITIES`), lead ordering (hazard setters / Illusion), and the difficulty knob.

## Plan

- Reimplement/port: `specific`/`oneOf`/`TRAINER_REPEAT_ID` continuity, starter-counter rival logic,
  Steven fossil pool + champion repeats, one-mega enforcement, family dedup, trainer restrictions,
  and lead ordering (`applyLeadLogic`) — as constraints layered over the preference generator.
- Preserve the global difficulty transform's intent (harder/easier) within the new model.
- Keep the exemptions (Wally/May/Brendan/Steven hand-tuned progression) working.
- Tests: rival keeps a consistent evolving team; Steven repeats his mons; one mega max; no dup family;
  restrictions honoured; leads ordered; difficulty shifts team strength.

Acceptance criteria:
- [ ] All fixed-ID/continuity/special-case behaviours reproduced under the new engine (tested).
- [ ] One-mega, family-dedup, restrictions and lead ordering preserved.
- [ ] Difficulty knob still shifts team strength as intended.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
