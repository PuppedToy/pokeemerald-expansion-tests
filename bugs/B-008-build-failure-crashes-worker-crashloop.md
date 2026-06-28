---
id: B-008
title: A failed ROM build crashes the backend and crash-loops the site (502)
status: fixed
severity: critical
created: 2026-06-28
updated: 2026-06-28
found-in: 0.3.0
fixed-in: 0.4.0
regression-test: backend/__tests__/queue.test.js
links: [T-031, B-009]
---

# B-008 — A failed ROM build crashes the backend and crash-loops the site (502)

## Symptom

The live site went fully down (502, Caddy with no upstream). The app container was stuck in
`Restarting (1) 2 seconds ago`. A real ROM build had failed (see [B-009](B-009-deploy-ships-host-tool-binaries.md) —
`make` died on a host-compiled tool binary), and instead of that single build being marked failed,
the **whole backend process died** and then **crash-looped**: every restart re-ran the same broken
build and crashed again. Recovered crash log: `debug/20260628-crash-mapjson/app-crashloop.log`
(the `Error: make.js exited with code 1` stack repeats ~9×).

## Root cause

The build worker's daemon loop did not contain build failures:

- `advanceOneRom` set the request to `building`, then `await buildRom(...)` with **no try/catch**.
  When `buildRom` rejected (make failed), the rejection propagated out of `runOnce` and out of the
  `start()` loop's async IIFE → **unhandled promise rejection** → Node terminated the process.
- The request was left in `building` (it never reached a terminal state). Startup recovery
  (`runOnStartup`) re-queues every `building`/`paused` request on boot, so the next container start
  re-ran the exact same failing build → crash → restart → **infinite loop**.

The state machine already had the right destination — `failed` is a terminal, non-blocking state and
`building -> failed` is a legal transition — but nothing ever moved the request there.

## Fix

`backend/queue/scheduler.js`:
- `advanceOneRom` wraps `buildRom` in try/catch: on failure it logs and `setState(id, 'failed')` and
  returns — the request reaches a terminal state, the worker keeps serving other jobs, and recovery
  will not re-run it (recovery only re-queues `building`/`paused`).
- `start()`'s loop gained a last-resort try/catch so any unexpected error (DB, etc.) can never kill
  the daemon; a request left mid-flight is cleaned by recovery on the next boot.

Regression test (`backend/__tests__/queue.test.js`): "a failing build marks the request failed and
does not crash the worker (B-008)" and "the worker keeps serving other jobs after one build fails
(B-008)". Both FAIL before the fix (the rejection propagates out of `runOnce`/`drain`) and PASS after.
Backend suite 85/85.

Operational note: the live incident was contained by hand before the code fix shipped — the stuck
request `d8d76f1d-…` was moved `building -> failed` directly in the prod DB and the site restored.
The code fix prevents recurrence; deploy is owner-gated.
