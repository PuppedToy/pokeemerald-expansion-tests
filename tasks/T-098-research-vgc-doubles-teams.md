---
id: T-098
title: Research — historic VGC doubles teams (gen 6–7) → cited reference docs
status: done
type: docs
created: 2026-07-09
updated: 2026-07-10
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
- [x] A cited, verified corpus of 24 landmark gen 6–7 doubles teams (consolidated into
      `docs/research/vgc-doubles-teams.md` — one file rather than a `doubles/` subdir).
- [x] Each team has archetype + synergy/anti-synergy analysis with sources.
- [x] 4v4-vs-6v6 caveats captured (each team notes bring-6/pick-4 + its 4-mon core).
- [x] Index added to `docs/INDEX.md` (new "Research" section).
- [x] A gaps list handed to T-100 (`docs/research/rating-gaps.md`).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Depth = exhaustive + verified (owner decision) → execute via a
  multi-agent research workflow.
- **2026-07-10** — Ran the research workflow (run `wf_28696c06-bcd`, 21 agents, 0 errors, adversarially
  verified — it even caught + corrected an illegal Salamence "Levitate" set). Wrote
  `docs/research/vgc-doubles-teams.md` — 24 VGC teams, VGC 2014→2019 (Se Jun Park's Follow Me
  Pachirisu, Ogloza's no-Protect rain HO, Wolfe Glick 2016, the Big 6, Naoto Mizobuchi 2019 …).
  Generated deterministically by `scratchpad/gen-research-docs.cjs` from the verified corpus
  (`docs/research/corpus.json`). Deviation: one consolidated file, not a `doubles/` subdir. Closed
  on green (docs task).

## Outcome

Shipped a cited, adversarially-verified corpus of 24 landmark Gen 6-7 VGC doubles teams
(`docs/research/vgc-doubles-teams.md`) + raw `corpus.json`. Feeds the doubles rating refinements
(via T-100's gap list) and the doubles archetype model (T-102).
