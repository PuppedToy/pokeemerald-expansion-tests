---
id: T-082
title: Clicking the "Next boss" top-bar stat jumps to that boss on the Trainers tab
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-09
updated: 2026-07-09
target-version: 0.6.0
links: []
blocked-by: []
---

# T-082 — Clicking the "Next boss" top-bar stat jumps to that boss on the Trainers tab

## Context

The docs viewer top bar shows a **Next boss** stat (`#tb-boss`, inside `.tb-stat--boss`), driven by
`nextBossLabel()` over the injected `bossCaps` (each entry `{ order, flag, level, trainers[], label }`;
`isBossDefeated` checks `nzState.trainers`, keyed by the trainer cards' `data-trainer-id`). Today it's
read-only. It should be a shortcut: click it → go to the Trainers section and scroll to that boss.

## Plan

In `frontend/template.html` (docs viewer), inside the Mail-engine IIFE (which owns `bossCaps`, `nz`,
`isBossDefeated`):
1. Add `goToNextBoss()`: find the first undefeated `bossCaps` entry, activate the Trainers section
   (click the existing `.nav a[data-target="trainers"]` link), then `scrollIntoView` the first
   `.trainer-card[data-trainer-id=…]` among that boss's `trainers`, with a brief highlight flash.
2. Wire `.tb-stat--boss` (click + Enter/Space, `role="button"`, `tabindex`, `cursor:pointer`).
3. When all bosses are cleared, just switch to Trainers (nothing to scroll to).

Acceptance criteria:
- [ ] Clicking "Next boss" activates the Trainers section and scrolls that boss's card into view.
- [ ] Works after progress changes (defeating bosses advances which card it targets).
- [ ] Keyboard-accessible (focusable, Enter/Space) and visibly clickable.
- [ ] Regression test drives it end-to-end in the docs fixture.
- [ ] Docs interaction suite green.

## Progress log

- **2026-07-09** — Task created (extra task before the PRO deploy). Mapped `bossCaps`
  (`{trainers[],label,…}`), `isBossDefeated`, and that `data-trainer-id` on cards matches the boss
  trainer ids, so the next boss resolves to a card to scroll to.

## Outcome

<!-- Filled when closing. -->
