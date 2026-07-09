---
id: T-098
title: Research — historic VGC doubles teams (gen 6–7) → cited reference docs
status: proposed
type: docs
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083]
blocked-by: []
---

# T-098 — Research — historic VGC doubles teams (gen 6–7) → cited reference docs

## Context

To rebuild teambuilding with "personality" we need a grounded understanding of how strong doubles
teams are actually built. Scope: **gens with megas** — VGC 2014–2019 (gen 6 XY/ORAS, gen 7
SM/USUM). We prefer **6v6** insight but VGC is 4v4; capture 4v4-specific caveats explicitly and
extract what generalizes. Owner chose **exhaustive + adversarially verified** research depth, so
this runs as a multi-agent workflow with source-citation and cross-checking. All research is saved
in-repo so it is never lost and can be referenced by later tasks.

## Plan

- Run a research workflow (fan-out search → deep-read → adversarial verify → synthesize) over
  reputable sources (Smogon/Nugget Bridge/Trainer Tower archives, VGC circuit reports, notable team
  reports) for landmark gen 6–7 doubles teams.
- For each team, capture: archetype, core, key moves/abilities/items, synergies, anti-synergies,
  how it wins, and cited sources. Flag 4v4-vs-6v6 differences.
- Save under `docs/research/doubles/` (one file per team or per cluster) + an index; add the index
  to `docs/INDEX.md`.
- Produce a short "what we may have missed" list of moves/abilities/synergies to feed T-100/T-095/T-096.

Acceptance criteria:
- [ ] A cited, verified corpus of landmark gen 6–7 doubles teams saved under `docs/research/doubles/`.
- [ ] Each team has archetype + synergy/anti-synergy analysis with sources.
- [ ] 4v4-vs-6v6 caveats captured explicitly.
- [ ] Index added to `docs/INDEX.md`.
- [ ] A gaps list handed to T-100.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Depth = exhaustive + verified (owner decision) → execute via a
  multi-agent research workflow.

## Outcome

<!-- Filled when closing. -->
