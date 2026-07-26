---
id: T-216
title: Beta gating + user surfaces (invite state, settings row, randomizer warning, docs message, BETA badge)
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-215, T-217]
blocked-by: [T-215]
---

# T-216 — Beta gating + user-facing surfaces (spec 2.1, 2.3, 2.4)

## Context

The user-facing half of the [T-215](T-215-beta-gated-onboarding-epic.md) beta gate: the `BETA` flag, the
per-user invite state, and every surface a normal (non-admin) user sees. Depends on the EPIC's decisions
D1–D5. The admin panel + batch algorithm are [T-217](T-217-beta-admin-invite-panel.md).

## Plan

### A. Backend — flag, state, gate (D1–D3)
- **`BETA` flag**: read `process.env.BETA === 'true'` in `backend/server.js` (near `:34-42`). Public
  `GET /api/config` → `{ beta }` (new tiny router near `:87-106`) so anonymous visitors get it at boot.
- **`invite_state` column** on `users` (D2): guarded `ALTER TABLE ... ADD COLUMN invite_state TEXT DEFAULT
  'pending'` (PRAGMA-guarded, `backend/db/index.js`); repo helpers in `backend/auth/users.js`
  (`setInviteState`, and read it in `get`/`findByEmail`). Grandfathering per D2.
- **`/api/me`** (`backend/auth/routes.js:88-102`): add `inviteState` (and, when `BETA`, `beta:true`). Derive the
  3 display states: `need_verify` if `!verified`; else `pending` / `accepted` from `invite_state`.
- **Gate the build (D1)**: a pending user's `POST /api/produce` still creates the request, but in the new
  non-swept `pending` state with `email_on_ready = 1` (auto). Implement as: `handleProduce`
  (`backend/produce/handlers.js`) sets state `pending` when `BETA` && user not accepted; the worker's
  `selectNext` (`backend/queue/scheduler.js:32-48`) skips `pending`; the sweeper already never touches active
  states. When `BETA` is off OR the user is accepted → normal `queued_<class>`.

### B. Frontend — surfaces
- **Settings `[BETA] Invited` row (2.1)**: a new `.settings-row` in `renderSettings` (`frontend/js/account.js:
  148-152`, after "Email verified" `:150`) showing one of: **"Need email validation"** (`!verified`),
  **"Pending"** (verified, not accepted), **"Accepted"** (accepted). Only shown when `beta` is true.
  (Name TBD — e.g. `[Beta] Access`.)
- **Randomizer warning (2.1)**: a banner at the top of the randomizer flow (not accepted + `beta`): "You can
  generate the documentation now, but building the ROM needs a beta invite — you'll be able to build once
  you're accepted." Wire off `state.inviteState` (`app.js`/`account.js`).
- **Build CTA gate (D5)**: add a branch in `reevaluateDelivery` (`account.js:383-412`, alongside the
  `!state.verified` branch `:400-407`) so a pending user's "Build" shows an *accepted-pending* message instead
  of a raw 403 — the produce still succeeds (creates the held `pending` request), and the row reads "Your ROM
  is prepared and queued — we'll email you when you're accepted and it's built. Please wait." (2.1). The
  email-on-ready checkbox is effectively forced on for pending runs.
- **BETA badge (2.4)**: a small "BETA" subscript to the right of the brand title
  (`frontend/index.html:19-22`; landing hero copy at `:96`), shown only when `beta` (toggle a `body.is-beta`
  class from the `/api/config` fetch, or render conditionally).

### C. BETA=false flush (2.3) — owner-triggered, but implement the behaviour
When `BETA` is off, the gate is bypassed everywhere (A/B above already check the flag). Additionally, on
startup with `BETA` off, **promote every `pending` request → `queued_<class>` in `created_at` order** (D6 in the
EPIC) so held ROMs start building in submission order regardless of ETA. (A one-shot promotion at boot +
whenever the flag reads false.) Users still `pending` in `users.invite_state` are treated as accepted while the
flag is off.

### D. Acceptance emails (per T-215 owner decision)
- Invited user **with** a prepared (`pending`) ROM: no separate "you're in" email — when their bundle finishes
  building, `backend/lifecycle/complete.js` (`:34-39`, the ready-email path) sends **one combined** email
  ("You're in + your ROM is ready", with the randomizer link) instead of the plain ready email. Detect this via
  a flag on the request (e.g. `was_pending` / invited-from-pending) set when the invite flips `pending →
  queued`. New template variant in `backend/email/templates.js`.
- Invited user **without** a prepared ROM: the immediate "You're in! Start building" email is sent by the invite
  action itself (T-217), not here.

Acceptance criteria (finalise after D1–D5):
- [x] `BETA=true`: registering + verifying leaves a user `pending`; they can generate docs but a build creates a
      held `pending` request (NOT built, NEVER swept — persists indefinitely), with the "prepared, waiting for
      invite" messaging + auto email-on-ready.
- [x] Settings shows the 3-state invite row; the randomizer shows the not-yet-invited warning; the BETA badge
      shows in the top bar (and to anonymous visitors, via `/api/config`).
- [x] Accepted users (set by T-217) build normally; the pending held request flips to `queued` and builds.
- [x] `BETA=false` bypasses the gate everywhere and flushes held `pending` requests → `queued` in submission
      order.
- [x] Backend + frontend suites green (repo/handler/gate tests + a `/api/config` test + `/api/me` inviteState).
      *(All checked = code-complete + suites green; pending the owner's manual test before this task closes.)*

## Progress log
- **2026-07-26** — Task created (proposed), blocked by T-215 (needs D1–D5). Scoped the user-facing gate + all
  surfaces (settings row, randomizer warning, build CTA, BETA badge, flush behaviour) against the architecture
  map. Do NOT start until the owner signs off the EPIC decisions.
- **2026-07-26** — Implemented on `feature/T-216-beta-gating-and-surfaces` (owner signed off D1–D6).
  - **Backend gate (A)**: `BETA=process.env.BETA==='true'` in `server.js`; public `GET /api/config → {beta}`
    (new `backend/config/routes.js`, mounted before the auth-adjacent routers). `invite_state` column added
    to `users` via a PRAGMA-guarded `ensureColumn` in `db/index.js`, grandfathering all pre-existing rows to
    `accepted` (D2); `users` repo gains `setInviteState`; `/api/me` returns `inviteState`. New `pending`
    state is in `ACTIVE_STATES` (counts as the one active slot, so it can't be swept and blocks a 2nd run)
    but NOT in `selectNext` (never built) and NOT in the sweeper (never expires — persists indefinitely, D1).
    `handleProduce` holds a not-yet-accepted user's run in `pending` with `email_on_ready` forced on and
    returns `{held:true, eta:null}`; accepted users (and everyone when `BETA` off) build normally.
  - **Promotion + flush (C)**: `requests.promotePending(id, {welcome})` moves `pending → queued_<class>`.
    Startup flush in `server.js` promotes every held run when `BETA` is off (submission order via
    `findByStates` `ORDER BY created_at`). The invite (T-217) will call it with `welcome:true`.
  - **Combined email (D)**: new `requests.welcome_on_ready` column (guarded), set only by an invite-promotion
    (not the flush). `lifecycle/complete.js` sends `welcomeReady` ("you're in + ready") for those runs, plain
    `ready` otherwise. Added `welcome` + `welcomeReady` templates (`welcome` is used by T-217's no-ROM invite).
  - **Frontend surfaces (B)**: `account.js` fetches `/api/config` at boot into `betaMode` (exported
    `getBetaMode`); `applyBetaChrome()` reveals the BETA badge (`index.html` brand `<sup>`, hidden by default)
    + the randomizer "invite-only" notice. Settings gains a 3-state **Beta access** row (Verify email first /
    Pending invite / Accepted). New held ROM state (`categoryOf`→`held`, `renderRom` branch, `setHeadline`)
    shows "Prepared — waiting for your beta invite / never expires" and does NOT poll `/api/status`
    (nothing transitions until an invite). CSS for `.beta-badge`/`.beta-notice` in `components.css`.
  - **Tests**: `backend/__tests__/beta-gating.test.js` (13 — grandfather, hold, promote/flush, welcomeReady,
    `/api/config`), `/api/me inviteState` in `routing.test.js`, `frontend/__tests__/beta-surface.test.js`
    (6 — badge/notice reveal, 3 settings states, held no-poll). Backend 196 green, frontend 180 green.
    `BETA=true npm run shoot` → 75 screenshots, no horizontal overflow at any viewport.
  - **Pending**: owner manual test (register→verify→generate→build shows held; toggle `BETA=false` flushes).
    The combined-email trigger (`welcome:true`) is wired but only exercised once T-217's invite calls it.

## Outcome
<!-- Filled when closing. -->
