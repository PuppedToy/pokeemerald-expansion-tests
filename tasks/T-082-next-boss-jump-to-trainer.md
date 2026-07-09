---
id: T-082
title: Clicking the "Next boss" top-bar stat jumps to that boss on the Trainers tab
status: done            # proposed | in-progress | done | abandoned
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
- [x] Clicking "Next boss" activates the Trainers section and scrolls that boss's card into view.
- [x] Works after progress changes (resolved live from `nz()` each click, so it advances).
- [x] Keyboard-accessible (focusable, Enter/Space) and visibly clickable.
- [x] Regression test drives it end-to-end in the docs fixture.
- [x] Docs interaction suite green.
- [x] Manual: click "Next boss" at a few progress points → lands on the right boss.

## Progress log

- **2026-07-09** — Task created (extra task before the PRO deploy). Mapped `bossCaps`
  (`{trainers[],label,…}`), `isBossDefeated`, and that `data-trainer-id` on cards matches the boss
  trainer ids, so the next boss resolves to a card to scroll to.
- **2026-07-09** — Implemented in the Mail-engine IIFE: `goToNextBoss()` finds the first undefeated
  `bossCaps` entry, clicks the existing `.nav a[data-target="trainers"]` link, then `scrollIntoView`
  the first `.trainer-card[data-trainer-id=…]` among that boss's trainers with a brief
  `.nz-boss-focus` flash. Wired `.tb-stat--boss` for click + Enter/Space (`role=button`, `tabindex`,
  `cursor:pointer`, hover/focus styling). Verified in the seed-42 fixture the next boss ("Rival –
  Route 103") resolves to a real card. Playwright regression in `interaction.spec.mjs`; docs suite +
  frontend suite (69) green. Pending: manual check at a few progress points.

- **2026-07-09** — Fix (user feedback): the jump switched tabs but didn't scroll to the boss —
  the nav-click triggered `applySectionScroll('trainers')`, whose `setTimeout(150ms)` settle pass
  re-scrolled to the *last defeated* trainer, overriding the jump. Replaced the nav-click + inline
  `scrollIntoView` with a dedicated `window.docGoToTrainer(trainerId)` (in the nav script) that
  activates the section and scrolls to the specific card using the same reflow-safe centering,
  bypassing the default section scroll entirely. Strengthened the regression test to defeat a
  far-down trainer first (so the two scroll targets differ) and assert the next boss ends up in the
  viewport — verified it FAILS on the old code and PASSES on the fix.

- **2026-07-09** — Fix 2 (user feedback): when the next boss is the rival, the jump went to the wrong
  card. A rival maps to 6 variant cards (Brendan/May × 3 starter counters); once a starter is picked,
  `applyStarterRivals` hides all but the matching one via inline `display:none`. `goToNextBoss` picked
  the first *existing* variant (a now-hidden Brendan card), so it scrolled nowhere. Now it prefers the
  first variant whose inline `style.display !== 'none'` (the visible one), falling back to the first
  existing if none is visible. `offsetParent` can't be used (the Trainers section may be inactive when
  clicked). Added a second regression test (pick a starter → assert the jump targets the visible rival
  variant, never the hidden first one); verified FAIL before, PASS after.

## Outcome

Shipped: the top-bar "Next boss" stat is a keyboard-accessible shortcut that activates the Trainers
section and scrolls the next boss's card into view (highlighted) via `window.docGoToTrainer`, which
bypasses the default "last defeated" auto-scroll. When the next boss is the rival it targets the
visible variant matching the chosen starter. Validated in production.
