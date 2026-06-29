---
id: B-011
title: A generated run is lost on reload when no build is in flight (e.g. after email verification)
status: fixing          # open | fixing | fixed | wont-fix
severity: major
created: 2026-06-29
updated: 2026-06-29
found-in: 0.4.0
fixed-in:
regression-test:        # blocked: no frontend test harness yet — to be written under T-036, then closed
links: [T-034, T-036]
---

# B-011 — A generated run is lost on reload when no build is in flight

## Symptom

Reproduction (the real-world path the owner hit):
1. Logged out, generate a run (Randomizer → step 3, docs ready).
2. Register an account → "Verify your email" is shown (correct).
3. Open the verification link → land on `verify.html`, click "Back to Emerald Cut" (or reload `/`).
4. Click **Randomizer** → the wizard shows the empty **step-1 config form**. The generated run is gone.

Expected: the generated run survives the reload — clicking Randomizer shows the completed run
(step 3, docs + ROM status), so verifying your email never costs you the run.

## Root cause

The run's bundle IS persisted in IndexedDB (`idbSet('bundle', …)`), and nothing deletes it. But the
app only **restores** it on load when `state.activeRequest` exists — `account.js`'s `initAccount`
calls the app's `onRecover` (jump to step 3 + reload the bundle) **only** inside
`if (state?.activeRequest)`. After email verification there is no active build yet (no ROM uploaded,
nothing queued), so the restore path never runs and the wizard stays on step 1 — the run looks lost
even though its bundle is sitting in IndexedDB.

## Fix

`account.js` `initAccount` now restores a stored run whenever **either** an active build exists **or**
a bundle is in IndexedDB. With no active build it sets `lastBundle` from storage, calls `onRecover`
(without switching tabs) so the step-3 view is ready under the Randomizer tab, and renders the ROM
row via `reevaluateDelivery()`. `app.js`'s `onRecover({ switchTab })` restores `currentBundle`/
`currentConfig` from IndexedDB and shows step 3; it only jumps to the Randomizer tab when there's an
in-flight build (kept the original behaviour for that case).

Regression test: the frontend (`app.js`/`account.js`) has no automated harness in this repo (only
`randomizer/` + `backend/` are unit-tested). Verified manually against the repro above; the bug
stays `fixing` until the owner confirms.
