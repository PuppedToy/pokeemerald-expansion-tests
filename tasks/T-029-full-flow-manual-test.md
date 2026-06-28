---
id: T-029
title: End-to-end manual test of the full ROM-delivery flow
status: done
type: chore
created: 2026-06-24
updated: 2026-06-28
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

_Verified by the owner on production (2026-06-28) + agent smoke. `[x]` = checked; `[ ]` → moved to
[T-031](T-031-remaining-e2e-edge-checks-and-frontend-polish.md) (unit-test-covered or deferred, not blockers)._

### Accounts
- [x] Register → verification link (console) → "verified ✓" → login. **Owner-verified on prod.**
- [x] Cannot generate while unverified (403 gate). _Agent smoke._
- [ ] Forgot password → reset → login with new password. → T-031 (unit-tested).

### ROM ownership
- [x] Upload a real (USA, Europe) Emerald → "ROM verified ✓". **Owner-verified on prod.**
- [x] Non-Emerald / wrong file rejected with a clear error. _Agent smoke (400)._

### Generate → build → download (the happy path)
- [x] **Generate** → docs + auto-started real build → live ETA → **download a real 32 MB ROM**.
      **Owner-verified on prod** (agent also ran the full produce→download e2e).
- [x] Single-use download: request purged + file gone afterwards. _Agent e2e (status→no active request)._
- [ ] Run types nuzlocke / soul-link (multi-ROM); fast vs slow classification. → T-031 (unit-tested).

### Resilience & limits / Errors → all moved to T-031 (unit-test-covered; not manually re-checked on box)
- [ ] one-active-per-user · reload recovery · restart recovery · 48 h TTL · invalid-token & rate-limit errors.

### Deferred frontend polish (from T-028) → T-031
- [ ] Email-on-ready opt-in checkbox (ETA ≥ 2 min) · "Regenerate docs" on reload.

## Acceptance criteria
- [x] The **core build-dependent happy path is validated on the deployed box** (owner-confirmed:
      register → verify → login → upload Emerald → Generate → download a real 32 MB ROM). The three
      integration defects found en route were filed (B-004, B-005, B-006) each with a regression test.
- [x] Remaining edge flows + deferred polish tracked in [T-031](T-031-remaining-e2e-edge-checks-and-frontend-polish.md)
      (they are unit-test-covered or not-yet-built; none block the live feature).

## Progress log

- **2026-06-24** — Created. Home of the deferred end-to-end verification for the whole backend epic.
- **2026-06-28** — **Owner ran the full flow on the live site and confirmed it works** (register →
  verify → login → upload real Emerald → Generate → download a real ROM). Agent had already run the
  produce→build→download e2e on the box. Closed for the core happy path; remaining edge flows + the two
  deferred frontend-polish items moved to [T-031](T-031-remaining-e2e-edge-checks-and-frontend-polish.md).

## Outcome

The core production end-to-end is **validated by the owner** on `https://pokemon-emerald-cut.com`:
register → email verify → login → upload a (USA, Europe) Emerald → Generate → real 32 MB ROM built and
downloaded. Three integration defects were found and fixed during deploy validation (B-004 env_file
comments, B-005 bundle-schema keys, B-006 auth body-parser), each with a regression test. **Not
exhaustively re-checked manually on the box** (but unit-test-covered): forgot/reset, multi-ROM run
types, fast/slow preemption, one-active-per-user, reload/restart recovery, 48 h TTL, error/rate-limit
paths — plus the two not-yet-built UI polish items. All of these are tracked in **T-031** (none block
the live feature). **No CHANGELOG line yet:** verification email still uses the dev console transport,
so the feature is owner-usable but not fully public until Brevo is wired (T-019) — the release line lands then.
