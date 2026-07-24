---
id: B-050
title: Liking a Recommended preset never fills the heart — official list omits likedByMe
status: fixing          # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-07-24
updated: 2026-07-24
found-in: 0.6.0
fixed-in:               # version that ships the fix (set when fixed)
regression-test: backend/__tests__/presets.test.js  # test('B-050: ...')
links: [T-192, ADR-021]
---

# B-050 — Like on a Recommended preset never marks as liked (official list omits likedByMe)

## Symptom

On the config-presets screen, clicking **Like** on a Recommended (`official`) preset — e.g. the
built-in **Balanced** — does not fill the heart. The button flickers (list shows `Loading…` then
repaints) and reverts to `♡ Like` with no feedback. Reloading the page still shows it not-liked.

Expected: the heart fills (`♥ Liked`) and stays liked across re-render and reload, like it already
does for **Community** presets.

Reproduce:
1. Log in, open Load Preset → **Recommended** tab.
2. Click **Like** on Balanced.
3. Button flashes and returns to `♡ Like`. Reload → still `♡ Like`.

## Root cause

The like itself persists correctly server-side (`POST /presets/:id/like` → `presetLikes.toggle`
writes the join row and the counter). The defect is on read-back: `handleList` in
`backend/presets/handlers.js` never computes the viewer's liked set for the `scope=official`
branch (lines 85-88), so every Recommended preset is shaped through `toPublic` with the default
`likedByMe = false` — regardless of what the user has actually liked.

The `community` branch (line 103) does it right: it builds `presetLikes.likedSet(ids, viewerId)`
and passes `likedByMe` into `toPublic`. The `official` branch was simply missing that step. The
frontend's like state is driven solely by `item.likedByMe` from the list re-fetch
(`frontend/js/presets.js`), so an always-false value makes the heart revert on every render and
reload. `handleGet` (detail) computes `likedByMe` correctly, so only the Recommended *list* was
affected.

## Fix

`handleList` in `backend/presets/handlers.js`, `scope === 'official'` branch: now builds
`presetLikes.likedSet(ids, viewerId)` for a logged-in viewer and passes `likedByMe` into `toPublic`,
exactly as the `community` branch does. Purely additive; unauthenticated callers still get an empty
set (`likedByMe: false`). No frontend change needed — the like handler already re-renders from the
list, which now returns the correct state.

Regression test: `test('B-050: scope=official list reports likedByMe for the viewer's likes')` in
`backend/__tests__/presets.test.js` — likes a `kind='official'` preset as another user, then asserts
`scope=official` returns `likedByMe:true` for it and `false` for an unliked one. Verified to FAIL
before the fix (`false !== true`) and PASS after. Full backend suite green (175/175).
