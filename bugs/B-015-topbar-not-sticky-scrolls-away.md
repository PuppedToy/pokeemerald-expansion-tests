---
id: B-015
title: Top bar scrolls away instead of staying pinned
status: fixed           # open | fixing | fixed | wont-fix
severity: major
created: 2026-06-30
updated: 2026-06-30
found-in: 0.3.1
fixed-in: 0.3.1
regression-test: frontend/__tests__/topbar-sticky.test.js
links: [T-038]
---

# B-015 — Top bar scrolls away instead of staying pinned

## Symptom

In the generated doc viewer (shipped by T-038), the top bar (brand title + run stats)
is meant to stay pinned to the top while scrolling unless the user unpins it. In production
it disappears after scrolling down a little — it behaves like a normal static header.

Reproduce: open any tab in the viewer, scroll down → the top bar slides up out of view even
though it's pinned (📌).

Expected: pinned top bar stays fixed at the top on scroll; only un-pinning (📍) lets it scroll away.

## Root cause

`<body>` is `display:flex` (with `min-height:100vh`), so its single child `.app` is stretched
by the default `align-items:stretch` to the body's cross size — exactly `100vh`. `.app` is the
containing block of the `position:sticky` top bar. A sticky element only stays pinned within its
containing block's box; because `.app` is clamped to `100vh` (its content overflows it), once you
scroll past that box the sticky bar is carried out of view with it. The sticky CSS was correct; the
flex-stretched, height-clamped container was the problem.

## Fix

`.app { align-self: flex-start; min-height: 100vh; }` — `align-self:flex-start` stops the flex body
from stretching `.app` to `100vh`, so `.app` grows to its full content height (the sticky bar now
has the whole page to stick through); `min-height:100vh` keeps it filling the viewport on short
pages. The default-pinned `position:sticky;top:0` on `.topbar` (and the `topbar-unpinned → static`
override) are unchanged.

Regression test `frontend/__tests__/topbar-sticky.test.js` asserts (a) `.topbar` is `position:sticky`
and (b) `.app` carries `align-self:flex-start` so its sticky container can't be height-clamped.
Verified to FAIL before the fix (no `align-self` on `.app`) and PASS after. (A structural/CSS guard:
the project has no headless-browser harness, so true scroll behaviour is verified manually in the
deployed viewer.)
