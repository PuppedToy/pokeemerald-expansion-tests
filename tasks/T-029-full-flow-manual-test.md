---
id: T-029
title: End-to-end manual test of the full ROM-delivery flow
status: proposed
type: chore
created: 2026-06-24
updated: 2026-06-24
target-version: 0.3.0
links: [T-018, T-019, T-021, T-022, T-025, T-028]
blocked-by: []
---

# T-029 — End-to-end manual test of the full ROM-delivery flow

## Context

The backend epic [T-018](T-018-backend-build-queue-produce.md) is implemented and unit-tested (67
backend tests), but the **full end-to-end flow has not been driven through the browser UI**. T-021,
T-022, T-025 and T-028 were closed with their e2e verification explicitly deferred **here**. This task
is that verification: a scripted manual pass over every flow, in every form.

Run it **locally with `FAKE_BUILD=1`** for everything except the real ROM compile, and again **on the
deployed Oracle box** ([T-019](T-019-infra-dockerized-build-server-deploy.md)) for the real build +
real email. A real **(USA, Europe) Pokémon Emerald** dump is needed for the ownership step.

## How to run locally

```bash
cd backend && PORT=3007 FAKE_BUILD=1 npm start   # email links print to this console
# open http://localhost:3007
```

## Manual flows (check each)

### Anonymous (no account)
- [ ] Configure → Review → **Generate** works with no login; docs **Download all (ZIP)** / per-ROM /
      Export run all download; the delivery panel shows the "log in to build your ROM" warning.

### Accounts
- [ ] Register (email + password ≥ 8) → verification link appears (dev: server console) → opening it
      shows "verified ✓".
- [ ] Login → `/api/me` reflects email + verified; topnav shows the account.
- [ ] Forgot password → reset link → set a new password → login with the new password works; the old
      password no longer works.
- [ ] Cannot generate a ROM while unverified (clear warning).

### ROM ownership
- [ ] Upload a real (USA, Europe) Emerald `.gba` → "ROM verified ✓"; `/api/me` `ownsValidRom: true`.
- [ ] Upload a non-Emerald / wrong file → rejected with a clear error; flag stays false.
- [ ] After validation the ROM is remembered (no re-upload on the next run).

### Generate → build → download (the happy path)
- [ ] Eligible user clicks **Generate**: docs download buttons appear **and** the build auto-starts
      (no separate button); delivery panel shows state + ETA, updating live.
- [ ] When ready: **Download ROM** delivers the zip; it is **single-use** — afterwards `/api/status`
      shows no active request (row purged) and the file is gone server-side.
- [ ] Run types: **default** (1 ROM), **nuzlocke** (N ROMs), **soul-link** (players × ROMs) each
      produce + deliver correctly.
- [ ] Fast vs slow classification: ≤ 2 ROMs = fast, > 2 = slow (observe ordering/ETA).

### Resilience & limits
- [ ] One active request per user: starting a second while one is active is refused.
- [ ] Reload mid-build → session + build status recover; a ready ROM is still downloadable.
- [ ] Restart the backend mid-build → the request is re-queued and completes (no dirty tree). *(real build)*
- [ ] Retention: a ready ROM is removed after 48 h. *(verify via a shortened TTL or DB inspection)*

### Errors / abuse
- [ ] Invalid/oversized upload, expired/invalid verify & reset tokens → clear, safe errors.
- [ ] Auth rate-limit kicks in under rapid repeated register/login.

### Deferred features to confirm once built (T-028 polish)
- [ ] Email-on-ready opt-in checkbox shown when initial ETA ≥ 2 min.
- [ ] "Regenerate docs" from the stored bundle on reload.

## Acceptance criteria
- [ ] Every flow above checked locally (FAKE_BUILD) and the build-dependent ones re-checked on the
      deployed box (T-019). Any defect found is filed as a `B-NNN` with a regression test before T-018 closes.

## Progress log

- **2026-06-24** — Created. Home of the deferred end-to-end verification for the whole backend epic.

## Outcome
