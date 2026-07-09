---
id: T-112
title: Docs — reflect format-based tiers + battle-format behaviour
status: proposed
type: docs
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-097, T-111]
blocked-by: [T-097, T-111]
---

# T-112 — Docs — reflect format-based tiers + battle-format behaviour

## Context

Close the loop on documentation: the design references must explain the singles/doubles/mixed
behaviour, the per-format tiers, and how the new teambuilding engine + archetypes work, per the SSOT
rules (`randomizer/docs/` for pipeline design, indexed in `docs/INDEX.md`).

## Plan

- Update/author `randomizer/docs/` entries for: battle formats + Run & Bun, the dual rating +
  per-format tiers, and the archetype/preference teambuilding engine (link ADR-014/015/016, don't
  restate them).
- Update `docs/INDEX.md` and `randomizer/docs/randomization-options.md` for the new settings.
- Ensure no SSOT duplication (link, don't copy).

Acceptance criteria:
- [ ] Design docs cover formats, per-format tiers, and the new engine (linking the ADRs).
- [ ] `docs/INDEX.md` and `randomization-options.md` updated; new research docs indexed.
- [ ] `node scripts/check-tracker.mjs` green; no SSOT violations.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
