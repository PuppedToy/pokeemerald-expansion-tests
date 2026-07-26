---
id: T-217
title: Beta admin invite panel — pending list, queue/ETA, balanced batch invite (25/75 lottery), user search
status: proposed        # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-215, T-216]
blocked-by: [T-215, T-216]
---

# T-217 — Beta admin invite panel + batch-selection algorithm (spec 2.2)

## Context

The admin half of the [T-215](T-215-beta-gated-onboarding-epic.md) beta gate: an **admin-only** panel to review
who's waiting and admit users in balanced batches. Depends on T-216's `invite_state` column, the `pending`
held-request state, and the `/api/me.isAdmin` gate (env `ADMIN_EMAILS`, `backend/auth/admin.js`). The batch
lottery is deliberately **not public**.

## Plan

### A. Admin-only backend (all behind `isAdminEmail`)
A new admin router (mirroring the preset-moderation admin gate), mounted near `backend/server.js:87-106`:
- `GET /api/admin/beta/overview` — counts + the pending list. For each **email-verified, `pending`** user:
  email, `created_at` (sign-up order), and **whether they have a held `pending` ROM request** (join `users` ↔
  `requests` on `user_id`, state `pending`) + that request's rom count. Plus queue status: current
  `building`/`queued_*` counts and the **global ETA** (reuse `backend/produce/eta.js` — `avgRomSecs` ×
  outstanding ROMs).
- `POST /api/admin/beta/invite` — body `{ count }`: runs the selection algorithm (below), sets the chosen
  users' `invite_state = accepted`, and **promotes their held `pending` requests → `queued_<class>` in
  `created_at` order** so the worker builds them in submission order. Returns who was invited + the resulting
  added-queue estimate (audit).
- `POST /api/admin/beta/accept` — body `{ email | userId }`: personally accept one user (search result action);
  same promotion of their held request.
- `GET /api/admin/beta/search?q=` — search users by email (paginated), with their invite/verify state + whether
  they have a held ROM, each with an "Accept" action.

### B. The batch-selection algorithm (not public)
Given a requested `count` N and a **queue budget of ≤ 1h of added build time** (from `avgRomSecs`):
1. Split the eligible pool (email-verified, `pending`) into **Pool A = has a held ROM** (inviting them adds
   `avgRomSecs × romsTotal` of build time each) and **Pool B = no held ROM** (no immediate build).
2. **Balance A vs B** so the sum of Pool-A picks' build time ≤ 1h: cap how many A-users enter this batch by the
   budget (`floor(3600s / avgRomSecs / avgRoms)`), fill the remainder of N from Pool B. If N can't be met within
   budget, invite fewer A + more B (log what was capped — no silent truncation).
3. **Lottery within each pool**: 25% of that pool's allocation goes to the **earliest sign-ups** (`created_at`
   ascending — a fairness floor for people who waited longest), 75% **random** among the rest. Deterministic
   only for testing (seedable RNG); production random.
4. Return the selection; the endpoint applies it (accept + promote).

### C. Admin frontend
- An **Admin** menu/tab visible only when `state.isAdmin`. It renders: the pending **count**, a **table**
  (email, waited-since, "has ROM ✓", per-user Accept), the **queue status + global ETA**, an **input for the
  next-batch size + Invite button**, and a **user search box** with per-result Accept. After an invite, show a
  summary (N invited, ~added queue). Poll/refresh the overview.

## Owner decisions + edge cases (2026-07-26)
- **Acceptance emails (per T-215):** the accept/invite action sends the **immediate "You're in! Start building a
  ROM"** email (randomizer link) **only** to invited users **without** a prepared ROM. Users **with** a prepared
  `pending` ROM get **no** email here — their combined "you're in + ready" email fires on build completion
  (T-216). So the invite endpoint branches on has-held-ROM.
- **Audit (KEEP 100%):** persist each invite batch (who/when/count/added-ETA) in a new table; the panel also
  shows a **list of accepted users (already in)** alongside the pending list.
- **Definition of "eligible"**: only `verified && pending` (not-yet-verified users are excluded from the
  lottery — they show as `need_verify`).
- **Held-ROM staleness**: a `pending` request persists indefinitely (never swept); confirm the bundle is still
  on disk before promoting; if somehow gone, mark for rebuild-on-return instead of failing.
- **Idempotency / races**: two admin clicks shouldn't double-invite; guard accept + promote in one transaction.

Acceptance criteria (finalise after D1–D5):
- [ ] Admin-only panel lists pending (verified) users with sign-up time + has-ROM flag + counts, a list of
      **accepted users (already in)**, and the queue status + global ETA. Non-admins get 403 / no menu.
      Invite batches are persisted (audit).
- [ ] Batch invite admits N users balanced so added build time ≤ ~1h, via the 25/75 (earliest / random) lottery
      within the with-ROM / without-ROM pools; accepted users' held ROMs promote to `queued` in submission
      order and start building. Lottery internals are not exposed to users.
- [ ] User search + personal Accept works.
- [ ] Backend tests cover the algorithm (budget cap, 25/75 split, promotion order — seeded RNG) + the admin-gate
      (403 for non-admins); frontend admin panel test; suites green.

## Progress log
- **2026-07-26** — Task created (proposed), blocked by T-215 + T-216. Designed the admin endpoints, the balanced
  25/75 batch lottery (Pool A = has-ROM vs Pool B = none, ≤1h budget), and the admin UI, grounded in the
  scheduler/ETA/admin-gate map. Do NOT start until the owner signs off the EPIC decisions + this algorithm.

## Outcome
<!-- Filled when closing. -->
