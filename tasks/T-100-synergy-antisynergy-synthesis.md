---
id: T-100
title: Synthesize a synergy / anti-synergy catalog and cross-check the current rating/combo logic
status: done
type: docs
created: 2026-07-09
updated: 2026-07-10
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
- [x] A structured synergy/anti-synergy catalog exists (24 synergies + 21 anti-synergies), indexed in `docs/INDEX.md`.
- [x] A gap report vs. the current combo logic is produced (`docs/research/rating-gaps.md`, 17 findings) linked to the consuming tasks.
- [x] No silent scope creep: gaps are explicit follow-ups (see the log), not silent edits.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Synthesised from the verified corpus (workflow `wf_28696c06-bcd`). Wrote
  `docs/research/synergies-antisynergies.md` (24 synergies + 21 anti-synergies),
  `docs/research/team-archetypes.md` (5 singles + 8 doubles archetypes → seed for T-101/T-102), and
  `docs/research/rating-gaps.md` (17 findings, each citing real `rating.js` code). Notable actionable
  gaps to hand off: **Aurora Veil rated 0 in `statusList` while Light/Reflect are 7.5 — a likely
  singles bug** → file a bug; **Fake Out** has no doubles floor despite being on nearly every VGC
  champion team → T-095; spread SpA/Speed drops (Snarl/Icy Wind) penalised not rewarded → T-094/095;
  hazards over-valued in doubles → T-094; priority/terrain/trap/Regenerator/Unaware/Contrary abilities
  under-valued → T-096; Trick-Room speed inversion + weather-pairing → T-097. Closed on green (docs).

## Outcome

Shipped the synergy/anti-synergy catalog, the archetype notes (seed for T-101/T-102), and a 17-item
rating-gap report that drives concrete refinements in T-094/095/096/097 and at least one singles bug
(Aurora Veil). Follow-ups are explicit in the log; no silent rating changes made here.
