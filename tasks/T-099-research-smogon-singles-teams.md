---
id: T-099
title: Research — historic Smogon singles teams (gen 6–7) → cited reference docs
status: done
type: docs
created: 2026-07-09
updated: 2026-07-10
target-version: 0.8.0
links: [T-083]
blocked-by: []
---

# T-099 — Research — historic Smogon singles teams (gen 6–7) → cited reference docs

## Context

The singles counterpart to [T-098](T-098-research-vgc-doubles-teams.md). Scope: gens with megas
(gen 6 ORAS OU, gen 7 SM/USUM OU), **6v6** singles — the format we most care about. Exhaustive +
adversarially verified. This grounds both the singles archetype model (T-101) and the sanity of the
current singles rating we intend to preserve.

## Plan

- Research workflow over reputable sources (Smogon OU analyses, sample teams, RMT hall-of-fame, viability
  rankings) for landmark gen 6–7 OU teams.
- Per team: archetype (hyper offense / balance / stall / weather / etc.), core, key sets,
  synergies/anti-synergies, win condition, sources.
- Save under `docs/research/singles/` + index; add to `docs/INDEX.md`.
- Feed a synergy/anti-synergy + gaps list into T-100.

Acceptance criteria:
- [x] A cited, verified corpus of 12 landmark gen 6–7 singles OU teams (`docs/research/singles-ou-teams.md`).
- [x] Each team has archetype + synergy/anti-synergy analysis with sources.
- [x] Index added to `docs/INDEX.md` (new "Research" section).
- [x] A gaps list handed to T-100 (`docs/research/rating-gaps.md`).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Depth = exhaustive + verified → multi-agent research workflow.
- **2026-07-10** — Produced by the same research workflow (`wf_28696c06-bcd`). Wrote
  `docs/research/singles-ou-teams.md` — 12 Gen 6-7 Smogon OU teams (Mega Medicham/Charizard-X HO,
  KeldTar bulky offense, Mega Sableye stall, Ash-Greninja balance, Manaphy/Pelipper rain, Kokolucha
  HO, Mega Aggron stall …), verified against Smogon sample teams / RMT / strategy dex. Consolidated
  into one file (not a `singles/` subdir). Closed on green (docs task).

## Outcome

Shipped a cited, verified corpus of 12 landmark Gen 6-7 Smogon OU singles teams
(`docs/research/singles-ou-teams.md`). Feeds the singles archetype model (T-101) and the synergy
catalog (T-100).
