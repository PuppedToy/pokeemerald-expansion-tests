---
id: T-100
title: Synthesize a synergy / anti-synergy catalog and cross-check the current rating/combo logic
status: proposed
type: docs
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-098, T-099]
blocked-by: [T-098, T-099]
---

# T-100 — Synthesize a synergy / anti-synergy catalog and cross-check the current rating/combo logic

## Context

The research (T-098/T-099) produces raw team analyses; this task distills them into a structured,
referenceable catalog of synergies and anti-synergies (per format), and audits what the current
`rating.js` `comboList`/`antiComboList`/`computeComboBonus` already captures vs. what's missing.
This is the bridge from research to concrete rating/teambuilding changes.

## Plan

- Build `docs/research/synergies.md` (or JSON): each synergy/anti-synergy with the mons/moves/abilities
  involved, the format(s) it applies to, effect size, and source refs.
- Cross-check against `rating.js` `comboList` (`:289-402`), `antiComboList` (`:405-453`),
  `computeComboBonus` (`:2266-2883`); produce a gap report.
- Hand actionable gaps to T-095 (moves), T-096 (abilities), and the archetype models (T-101/T-102).
- Where a gap is clearly a singles rating bug/omission, file a task/bug rather than silently fixing.

Acceptance criteria:
- [ ] A structured synergy/anti-synergy catalog exists (per format, with sources), indexed in `docs/INDEX.md`.
- [ ] A gap report vs. the current combo logic is produced and linked to the consuming tasks.
- [ ] No silent scope creep: gaps become explicit follow-ups.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
