---
id: T-115
title: Surface each trainer's battle type (Single/Double) in the generated docs viewer
status: done
type: feature
created: 2026-07-10
updated: 2026-07-15
target-version: 0.7.0
links: [T-083, T-087, docs/adr/ADR-014.md]
blocked-by: []
---

# T-115 — Surface each trainer's battle type (Single/Double) in the generated docs viewer

## Context

Owner feedback while testing Group 1 in PRO: the generated docs viewer does not show whether a
trainer battle is single or double, so in a **Mixed** run you can't tell which fights are which. The
data already exists — `battleType` rides on `docs.trainersResultsSimplified` (T-087) and is injected
into the viewer's `trainersData` (`randomizer/writer.js` spreads `{...trainerData}`; the browser
doc-builder uses the same `docs`) — it just wasn't rendered.

## Plan

Render the battle type on the trainer card in the viewer template
([frontend/template.html](../frontend/template.html)) — the one home for both the Node `out.html`
path and the browser doc-builder. Show a "Double Battle" badge on doubles trainers (its absence = a
single battle), which makes Mixed runs legible at a glance without cluttering single/doubles runs.

Acceptance criteria:
- [x] Trainers fought as doubles show a clear "Double Battle" badge in the docs viewer; singles show none.
- [x] Driven by `trainer.battleType` (no new data plumbing needed).
- [x] Structural guard test on the template; frontend `node --test` green.
- [ ] Confirmed visually in a Mixed-run doc at the T-092 checkpoint.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-10** — Created from owner PRO feedback. Implemented on `feature/T-115-docs-battle-type-badge`:
  added a `.roster-battletype` chip (CSS) and a `${trainer.battleType === 'doubles' ? …}` badge in the
  `.roster-facts` block of `frontend/template.html`. Confirmed `battleType` reaches the viewer via the
  existing `{...trainerData}` spread (both out.html and browser paths); the stale committed
  `output/trainers.js` predates T-087 and refreshes on the next run. Structural guard
  `docs-battle-type.test.js` added. Frontend suite green. Kept `in-progress` for the visual confirm at
  T-092.

## Outcome

Each trainer's battle type (Single/Double) surfaced in the docs viewer via the trainerData spread (out.html + browser); docs-battle-type.test.js guard. Frontend green. Owner-validated 2026-07-15. Closed.
