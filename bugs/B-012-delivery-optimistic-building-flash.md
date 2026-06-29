---
id: B-012
title: Delivery panel flashes "Building your ROM" before the server confirms (then flips to "Queued")
status: fixed
severity: minor
created: 2026-06-29
updated: 2026-06-29
found-in: 0.4.0
fixed-in: 0.4.0
regression-test: frontend/__tests__/account.test.js  # "optimistic submit state is neutral, not a false Building flash"
links: [T-035, T-031, T-036]
---

# B-012 — Delivery panel optimistically shows "Building" before the server confirms

## Symptom

On **Generate** (eligible user), the generation screen briefly shows the **Building** state — a spinning
gear, "your ROM is building below" / "Starting your ROM build…" — and then, after a moment, flips to
**ROM queued**. Reported as "it said it was building my ROM, and after I navigated a bit it says ROM
queued". The build itself is fine; only the transient UI is wrong (it claims building while the run is
really just being submitted / queued).

## Root cause

`reevaluateDelivery()` rendered an **optimistic** row in the *building* style (`setRomRow('building', …)`
+ `setHeadline('building')`) **before** calling `POST /api/produce`. That optimistic state is visible
for the whole duration of the ~32 MB bundle upload (a second or more), and the server frequently
**queues** the run rather than building it immediately (multi-ROM "slow" runs, or the single serial
builder is busy). So the UI showed Building, then the first real status (`renderRom`) corrected it to
Queued — a visible Building → Queued regression. Nothing was wrong server-side (builds completed
`code=0`; the churn between states seen while debugging was the owner actively
generating/downloading/cancelling, plus fast warm-cache builds).

## Fix

The optimistic pre-`produce` render is now **neutral**: "Submitting your run…" in the *queued* style
(clock, no gear, no "building" headline). The real state (`renderRom` from the produce response +
polling) then shows queued or building accurately, so the UI never claims building before the server does.

Regression test: closed **fixed** in 0.4.0 with the frontend harness (T-036, ADR-009).
`frontend/__tests__/account.test.js` → "optimistic submit state is neutral, not a false Building flash"
asserts the optimistic `rom-status` row is `status-item queued` with "Submitting your run…" and **no**
gear / "Building" text. Verified to **FAIL** against the pre-fix code (which set `status-item building`
+ "Starting your ROM build…") and **PASS** after.
