---
id: T-069
title: Surface starter nicknames & genders in the generated viewer docs
status: proposed        # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-07
updated: 2026-07-07
target-version: 0.6.0
links: [T-068]
blocked-by: []
---

# T-069 — Surface starter nicknames & genders in the generated viewer docs

## Context

T-068 added baked-in nicknames + genders for the starter-extra Pokémon (and optionally the main starter),
applied per-ROM at bundle time. The generated HTML viewer / docs still show only the species for the
`STARTER_EXTRA` entry — the assigned nickname and coin-gender are not surfaced, so players must check the
built ROM in-game to see them. Deferred from T-068 (see its progress log) as a viewer nicety, not part of
the ROM behavior or T-068's acceptance criteria.

## Plan

Approach in a few lines:
- Compute the per-ROM naming **before** the docs pass (today `attachStarterNaming` runs after
  `computeRomDocs`), and thread it into `randomizer/writerDocs.js` so the `STARTER_EXTRA` entry (and the
  main starter) can render `nickname` + gender.
- Render it in `frontend/template.html` (the viewer). The HTML template is exempt from TDD; cover the
  writerDocs data shape with a unit test.

Acceptance criteria:
- [ ] With nicknames on, the viewer shows each extra starter's nickname + gender (and the starter's, when included).
- [ ] With nicknames off, the docs are unchanged.
- [ ] `cd randomizer && npm test` green.

## Progress log

- **2026-07-07** — Spawned as the deferred follow-up when closing T-068.

## Outcome

<!-- Filled when closing. -->
