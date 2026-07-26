---
id: T-227
title: Fix config-form flex gap never applying (display toggle wiped inline flex)
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-226]
blocked-by: []
---

# T-227 — Config-form option spacing never applied (flex gap wiped)

## Context

Owner reported the mutation / move option toggles are still cramped despite T-226 bumping the container
`gap`. Root cause (latent, pre-dates T-226): the reveal logic does `element.style.display = ''` to show
`#mutation-categories` / `#move-mutation-categories` / `#evo-tuning`. Those containers declare their flex
layout **inline** (`style="display:flex;flex-direction:column;gap:..."`), and setting `.style.display = ''`
**removes the inline `display` property** → the element is no longer a flex container → `gap` is ignored.
So the T-226 `gap:20→32` change had no visible effect; the options were always spaced only by the default
block flow + `.toggle-desc` margin.

## Plan

In the sync method, restore the flex display explicitly for the three inline-flex containers:
`style.display = cond ? 'flex' : 'none'` (not `''`). This keeps the flex layout — and its `gap` — when shown.
(Containers styled by a CSS class, e.g. `.field`, are unaffected: `''` correctly falls back to the class.)

Acceptance criteria:
- [ ] `#mutation-categories`, `#move-mutation-categories`, `#evo-tuning` toggle to `'flex'` (not `''`), so the
      `gap` between options actually renders.
- [ ] Guard test pins this so the regression can't return; frontend suite green; `shoot` no overflow.
- [ ] Owner confirms the options now have air between them on the live site.

## Progress log

- **2026-07-26** — Diagnosed via the served file: `gap:32px` WAS deployed but ineffective because the sync
  cleared the inline `display:flex`. Fixed the three inline-flex containers to restore `'flex'` on show.

## Outcome

<!-- Filled when closing. -->
