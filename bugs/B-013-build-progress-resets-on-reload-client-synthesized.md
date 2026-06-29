---
id: B-013
title: Build progress + ETA reset to zero on reload (computed client-side, not from the backend)
status: fixed
severity: major
created: 2026-06-29
updated: 2026-06-29
found-in: 0.4.0
fixed-in: 0.4.0
regression-test: backend/__tests__/produce.test.js  # buildProgress (server-derived); frontend render is manual
links: [T-035, T-031]
---

# B-013 — Build progress + ETA reset on reload (client-synthesized progress)

## Symptom

Generating a multi-ROM run (e.g. a 3-ROM nuzlocke) correctly showed "Building ROM 1 of 3 · ~10 min".
**On reload** it showed "ROM 1 of 3 · ~2 min" and the bar/ETA **restarted from zero** — it never
resumed the real progress. Owner's insight: the frontend should ask the backend how far along the
build is and render *that*, so it's consistent whether or not the page is reloaded — "el front no
debería hacer nada sin preguntar al back".

## Root cause

The progress bar and ETA countdown were **synthesized on the client**: `buildStartMs = Date.now()` was
captured when the browser first entered the building view and `buildEtaSec` from the ETA at that
instant, then a local timer animated `elapsed / buildEtaSec`. On reload, `buildStartMs` reset to *now*
→ the bar/ETA restarted from zero, and the captured ETA differed from the fresh one. Nothing was wrong
with the build; the client was just inventing the progress instead of reading it from the server.

## Fix

Make build progress + ETA **server-authoritative**, derived only from durable row state
(`roms_done`, `roms_total`, `state`, `updated_at`) — not any client clock — so they're identical
across reloads:

- Backend: `buildProgress(requests, id)` in `produce/eta.js` returns `{ progress, etaSecs }`. While a
  ROM is `building`, `updated_at` is when that ROM started (the scheduler stamps it), so the current
  ROM's fraction is `(now - updated_at) / avgRomSecs`. `GET /api/status` now returns `progress` (and
  the elapsed-adjusted `eta`).
- Frontend: the building view renders `info.progress`/`info.eta` from the server on every poll (eased
  by the CSS width transition); the client-side timer/`buildStartMs`/`buildEtaSec` are gone.
  `startPolling()` now fetches once immediately so a reload shows the real progress at once (no
  zero-flash) rather than waiting 3 s.

Regression test: `buildProgress` is unit-tested (backend/__tests__/produce.test.js — halfway through a
ROM → 50 %, queued → 0 %). The frontend render has no automated harness; verified manually.

Closed **fixed** in 0.4.0 (2026-06-29): the fix's core — server-derived progress/ETA — is exercised by
the `buildProgress` regression test (the function didn't exist before, so the old client-synthesized
behaviour had no equivalent server truth to assert; the new test pins the elapsed-from-`updated_at`
derivation). Owner verified the reload-consistency on the live site.
