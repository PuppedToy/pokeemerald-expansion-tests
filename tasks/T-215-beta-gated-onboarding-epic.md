---
id: T-215
title: EPIC — Beta gated onboarding (admit users in controlled batches before public launch)
status: proposed        # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-216, T-217, T-018, T-024, T-023]
blocked-by: []
---

# T-215 — EPIC: Beta gated onboarding

## Context

Before opening the app to everyone, the owner wants to admit users **gradually**: a `BETA=true` env flag turns
on an invite gate so that registering + verifying email is **not** enough to build ROMs — a user also needs to
be *accepted*. Docs generation stays free/anonymous; only **building** is gated. The owner admits users in
batches from an admin panel, balancing the queue so a batch never adds more than ~1h of build time.

This EPIC holds the **cross-cutting decisions** and splits the work into:
- [T-216](T-216-beta-gating-and-surfaces.md) — the gate itself + all user-facing surfaces (2.1, 2.3, 2.4).
- [T-217](T-217-beta-admin-invite-panel.md) — the admin invite panel + batch-selection algorithm (2.2).

Architecture map (grounding for both): current build path is `POST /api/produce`
(`backend/produce/routes.js:23-28`) gated by `requireAuth + requireVerified`; the two-tier worker
(`backend/queue/scheduler.js`) builds and the sweeper (`backend/lifecycle/sweeper.js`) purges finished runs at
48h. Admin is env-only (`backend/auth/admin.js`, `ADMIN_EMAILS` → `/api/me.isAdmin`). Users table
(`backend/db/index.js:35-42`) has **no** role/status column.

## Cross-cutting decisions (settle these before T-216/T-217 start)

### D1 — Where does a pending user's generated run live? (the retention crux)
A generated bundle exists client-side in IndexedDB (`account.js:378`, survives forever) and server-side **only
after `POST /api/produce`** creates a `requests` row + bundle file — which the sweeper deletes 48h after a run
reaches `ready`/`failed` (`sweeper.js:20-24`). Active states (`queued_*`/`building`/`paused`) are **never**
swept (`db/index.js:17`).

The spec (2.1/2.2) requires the server to **know which pending users already have a ROM ready to build** and to
**auto-build them in submission order on invite**. That is only possible if the pending run is stored
server-side. **Decision (recommended):** a pending user's Build **does** call `/api/produce`, but it creates the
request in a new **`pending` state** — an *active-like, never-swept* state that stores the bundle and records
submission order (`created_at`) but is **skipped by the worker's `selectNext`** (`scheduler.js:32-48`). Invite
flips `pending → queued_<class>`; the worker then builds it. This: (a) survives 48h (active-like), (b) gives the
admin panel the "has a ROM pending" signal, (c) preserves submission order, (d) needs no produce 403.
Auto-set `email_on_ready = 1` on these pending requests (2.1). *Confirm this model with the owner — the
alternative (hard-403 at produce, run stays client-only) can't satisfy "the system starts building on invite".*

### D2 — New per-user state
Add an `invite_state` to `users` (`need_verify` is derived from `verified`; store `pending` | `accepted`).
No migration framework exists (`db/index.js` is one `CREATE TABLE IF NOT EXISTS` blob) → needs a guarded
`ALTER TABLE users ADD COLUMN invite_state TEXT DEFAULT 'pending'` (SQLite has no `ADD COLUMN IF NOT EXISTS`;
guard via `PRAGMA table_info`). Existing rows default to `pending` (or `accepted` if we grandfather current
users — owner decision). When `BETA` is off, the gate is bypassed regardless of `invite_state`.

### D3 — How `BETA` reaches the browser
No `/api/config`/bootstrap endpoint exists; the only server→client channel is `/api/me` (login-only). The BETA
**badge + randomizer warning must show to anonymous visitors too**, so add a tiny **public** `GET /api/config`
→ `{ beta }` (new router near `backend/server.js:87-106`), fetched at boot. Also add `inviteState` to
`/api/me` for the Settings row + build gate (login-only, fine there).

### D4 — Who can invite? Admin reuse
Reuse `ADMIN_EMAILS`/`isAdminEmail` (`backend/auth/admin.js`) to gate the invite panel + its endpoints (a new
admin-only router). The *invitee allowlist* is the new `invite_state` column, not an env list.

### D5 — Enforcement stays paired
Every gate needs a backend point **and** a frontend mirror (like `requireVerified` at
`backend/auth/middleware.js:37-43` ↔ `account.js:400-407`) so a pending user sees a helpful CTA, never a raw
403. Keep the invite check as **middleware / scheduler state**, not inside `handleProduce` (which purges the
active request early, `handlers.js:19-23`).

## Additional things we may need (owner: keep / drop)
- **"You're in!" email** on acceptance (separate from the ready-email) so invited users know to come back.
- **Waitlist position** shown to pending users ("you're #N in line") — from `created_at` rank among pending.
- **Invite-batch audit** (who/when/how-many) for transparency + debugging the lottery.
- **Registration abuse cap** while gated (the pending pool can grow unbounded; a soft cap or captcha — likely
  out of scope, noted).
- **Grandfathering**: are the owner's own / existing accounts auto-`accepted`? (D2.)
- **BETA=false flush ordering** (2.3): flip every `pending` request → `queued_*` **in `created_at` order** so
  the historical submission order is honoured globally (not by ETA).

## Acceptance criteria (EPIC-level — the sub-tasks carry the detail)
- [ ] D1–D5 decided with the owner and recorded here.
- [ ] [T-216](T-216-beta-gating-and-surfaces.md) done: gate + settings status + randomizer warning + docs
      "prepared but not yet accepted" message + BETA badge + auto email-on-ready + BETA=false flush.
- [ ] [T-217](T-217-beta-admin-invite-panel.md) done: admin panel with pending/ROM-ready list + counts, queue
      status + ETA, batch-size + invite (balanced ≤1h, 25/75 lottery), personal accept, user search.
- [ ] `BETA=false` cleanly reverts to open onboarding (owner-triggered).

## Progress log
- **2026-07-26** — EPIC created (proposed). Mapped the auth/build/queue/admin architecture (see Context) and the
  retention crux (D1). Split into T-216 (gating + surfaces) and T-217 (admin panel + algorithm). Recorded the
  cross-cutting decisions D1–D5 + suggestions. **Awaiting owner sign-off on D1–D5 before the sub-tasks start.**

## Outcome
<!-- Filled when closing. -->
