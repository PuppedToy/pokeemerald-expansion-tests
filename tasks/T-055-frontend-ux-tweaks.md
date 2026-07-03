---
id: T-055
title: Frontend UX tweaks — docs "Defeated" placement + reset-options button
status: in-progress
type: feature
created: 2026-07-03
updated: 2026-07-03
target-version: 0.6.0
links: []
blocked-by: []
---

# T-055 — Frontend UX tweaks

## Context

Two small UX fixes reported while using the site:

1. In the generated docs, a trainer's **"Defeated"** toggle sat at the very bottom of the roster rail
   (a `margin-top:auto` in the T-038 Roster Sheet layout pushed it down), far from its reward.
2. The randomizer options form had no way to **reset every option to its default** — you had to clear
   storage or reload a default config by hand.

## Plan

- Docs: drop the `margin-top:auto` on `.roster-rail .nz-defeat-label` so the toggle sits directly under
  the reward (its base `.nz-defeat-label` styling already places it there).
- Options form: add a **Reset to defaults** button to the `.config-actions` bar; wire it to a new
  `ConfigForm.resetToDefaults()` that applies the canonical `DEFAULTS` (`setConfig(DEFAULTS)` + re-sync +
  save). Confirm before wiping the user's tuning.

Acceptance criteria:
- [x] Docs trainer card: the "Defeated" toggle renders right under the reward, not at the card bottom.
- [x] Options form has a "Reset to defaults" control that restores every option to `DEFAULTS`.
- [x] `resetToDefaults()` resets from the single `DEFAULTS` object (no duplicated default values).
- [x] Frontend `node --test` green (structural coverage added, per the ADR-009 form-test approach).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-03** — Task created + implemented. Removed the `margin-top:auto` push on the rail's defeat
  label (template.html); added `ConfigForm.resetToDefaults()` + a wired "Reset to defaults" button in
  the config actions bar (config-form.js) with a confirm; structural test added (config-form.test.js).
  Frontend suite green. Awaiting deploy + owner sign-off.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
