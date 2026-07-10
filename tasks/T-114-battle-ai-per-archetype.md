---
id: T-114
title: Battle AI tuned per team archetype / format (deferred)
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.9.0
links: [T-083]
blocked-by: [T-110]
---

# T-114 — Battle AI tuned per team archetype / format (deferred)

## Context

Explicitly deferred by the owner ("la IA... eso lo decidiremos después"). Once teams are
archetype-driven and format-aware, the trainer AI flags (`AI_FLAG_*` in `.party`) could be tuned to
serve each team's plan (e.g. a Trick Room team's AI shouldn't undermine the TR core; redirection
support should be used sensibly). Placeholder so the idea is tracked, not lost.

## Plan

- After Group 2 ships, evaluate which AI flags to assign per archetype/format and whether the
  expansion's AI supports the needed behaviours.
- Scope a concrete task then (this one may be split/superseded).

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [ ] Decision recorded on whether/how to tune AI per archetype/format.
- [ ] If pursued, AI flags assigned per team plan and verified in CI/builder battle tests.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created (deferred; revisit after T-110).

## Outcome

<!-- Filled when closing. -->
