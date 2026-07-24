---
id: T-196
title: Make the preset "Overwrite" button read as unsafe (orange + confirm)
status: in-progress
type: fix
created: 2026-07-24
updated: 2026-07-24
target-version: 0.6.0
links: [docs/adr/ADR-021-config-presets.md, tasks/T-192-config-presets.md]
blocked-by: []
---

# T-196 — Make the preset "Overwrite" button read as unsafe (orange + confirm)

## Context

Reported UX issue on the T-192 presets UI (ADR-021): in the "Save preset" flow, each of the
user's own presets shows an **Overwrite** button styled green (`btn-emerald`) — the same colour
the UI uses for safe/positive actions (Apply, Download ROM). Overwriting silently replaces a saved
preset's config with the current settings via `PUT /api/presets/:id` and fires immediately on click
with no confirmation. Green + no-confirm signals "safe" for what is actually a lossy, one-click
destructive action.

## Plan

Two scoped changes in the frontend, no backend/API change:

1. **Recolour** the Overwrite button off the "safe" green onto an orange caution style. `btn-emerald`
   is shared (Apply, Download ROM), so introduce a dedicated `.btn-warn` class rather than editing
   `.btn-emerald`. Only the `mode==='save'` owner card uses it (`frontend/js/presets.js`).
2. **Confirm before overwriting**, mirroring the existing Delete `confirm(...)` guard in the same
   `onBodyClick` handler.

Acceptance criteria:
- [ ] The Overwrite button no longer carries `btn-emerald`; it uses `.btn-warn` (orange).
- [ ] Clicking Overwrite prompts for confirmation; cancelling issues no `PUT`; confirming saves.
- [ ] New/updated frontend tests cover both (button class + confirm cancel/proceed); full suite green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-24** — Task created from a UX report (green Overwrite button + no confirmation). Located
  the button markup (`frontend/js/presets.js:67`), the dispatch (`:324`), and the existing Delete
  confirm pattern (`:337`). Confirmed `btn-emerald` is shared with Apply/Download ROM, so a dedicated
  `.btn-warn` class is the scoped fix. Baseline frontend suite: 136 pass.
- **2026-07-24** — TDD. Red: added `confirm` support to the DOM stub (`frontend/__tests__/helpers/dom-env.js`
  — `confirms` capture + `setConfirm()`), plus two tests in `frontend/__tests__/presets.test.js` (button
  uses `btn-warn` not `btn-emerald`; overwrite prompts, cancel → no PUT, confirm → PUT). Watched both
  fail for the right reason. Green: `presets.js:67` `btn-emerald`→`btn-warn`; `presets.js:324` wraps
  `doSave(id)` in a `confirm(...)` guard; new `.btn-warn` (orange, `--obs-orange`) in `components.css`.
  Full frontend suite: **138 pass, 0 fail**. Note: `presets.js`/CSS are static ESM served directly (app.js
  imports `initPresets`), not part of `randomizer.bundle.js`, so no `build.js` rebuild is required.
  Colour decision: used orange as requested; the theme's dedicated warning accent is amber (`--obs-yellow`),
  offered to the owner as a one-line alternative. Awaiting the owner's manual test before closing.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
