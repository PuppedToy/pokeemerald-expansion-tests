---
id: T-130
title: Decision-log auditability — surface sophistication, dropped modifiers, and unmet gimmicks
status: proposed
type: feature
created: 2026-07-13
updated: 2026-07-13
target-version: 0.8.0
links: [T-117, T-131]
blocked-by: []
---

# T-130 — Make the team-building decision log fully auditable

## Context

Review feedback on `tasks/assets/T-128/run-2585940843/decision-log.txt`. The log records the final
identity and per-slot picks but hides WHY things happen, so a reviewer can't tell an intended drop from a
bug:
- **Roxanne** (sophistication 0.07): `final identity: hyper_offense (emergent, +weather)` yet
  `below engine threshold — no archetype steering`. Amaura surfaced a weather possibility that was then
  dropped (below `BIAS_MIN_SOPH` = 0.15), but the log never says it was dropped — it reads as if weather
  is part of the identity.
- **Brawly** (sophistication 0.17): `final identity: hyper_offense`. What does sophistication mean here,
  and how exactly did it steer the picks (bias strength = BIAS_STRENGTH × soph)? Not shown.
- Weather/gimmicks that fail to materialise leave no trace of WHY (see T-131).

## Plan

Enrich the decision log (`writer.js`/`writerDocs.js` audit hooks + `modules/archetype*`) so every
non-obvious decision is explained:
- Show the sophistication value AND its effect: below `BIAS_MIN_SOPH` → "no steering (pile of mons)";
  above → the bias strength applied and which slots it actually moved.
- When an emergent modifier (e.g. `+weather`) is DROPPED (below threshold, no setter, no abuser), log
  the drop and the reason — don't print it as part of the final identity.
- Record why a requested gimmick did / didn't materialise (feeds T-131's weather auditing).

Acceptance criteria:
- [ ] The log distinguishes "steered" vs "tier-random pile" and states the sophistication + bias applied.
- [ ] A dropped modifier is logged as dropped, with its reason (not shown as an active identity trait).
- [ ] Roxanne's `+weather` case reads unambiguously (surfaced by Amaura, dropped because below threshold).
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. -->

## Outcome
