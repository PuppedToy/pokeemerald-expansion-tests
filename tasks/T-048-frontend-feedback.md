---
id: T-048
title: Frontend feedback section — submit form + placeholder lists
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-02
updated: 2026-07-02
target-version: 0.6.0
links: []               # follows existing backend patterns (T-021/T-023/T-025); no new ADR
blocked-by: []
---

# T-048 — Frontend feedback section — submit form + placeholder lists

## Context

Users want a place to send feedback (feature requests, bug reports, other) from the app. Logged-in
users submit free text; the submission is stored in the DB with the author and a timestamp so the
owner can **download and analyse it later, by hand** (nothing automatic). The same page also shows
two (initially empty) curated lists — "Most requested features" and "Known bugs" — that will be
filled manually in the future.

Persistence, auth and the HTTP layer reuse the established backend patterns (SQLite repo +
dependency-injected handler behind `requireAuth`, per T-021/T-023/T-025) and the static-frontend
module pattern (per T-028/T-034), so no new ADR is warranted.

## Plan

**Backend**
- New `feedback` table (`db/index.js` migration): `id, user_id → users(id), category, message, created_at`.
- `db/feedback.js` — `createFeedbackRepo(db)` with `create`, `get`, `all()` (joined with the author's
  email, newest-first), `deleteForUser`. Export `FEEDBACK_CATEGORIES = ['feature','bug','other']`.
- `feedback/handlers.js` + `feedback/routes.js` — `POST /api/feedback` behind `requireAuth` + a modest
  per-IP rate limit; validate category + non-empty/bounded message; store with `user_id` + `created_at`.
- Wire `feedback` into account deletion (`auth/routes.js`) so the FK doesn't block user deletion
  (optional param → existing tests unaffected).
- `scripts/export-feedback.mjs` — read-only dump of all feedback to JSON (the manual "download").

**Frontend**
- New top-nav tab **Feedback** + `#tab-feedback` section in `index.html`.
- `js/feedback.js` (dependency-injected: `getAuthState`, `onAuthChange`, `api`, `onRequestLogin`):
  logged-in → interactive form (3 radio options, "Feature request" default, textarea, submit →
  `POST /api/feedback` → "Your message has been sent. Thanks for the feedback!"); logged-out →
  non-interactive form + "You must be logged in to send feedback."
- Two placeholder lists in tabs ("Most requested features" / "Known bugs") each reading
  "No requests have been processed yet. Coming soon!"
- `account.js` exposes `getAuthState`, `onAuthChange`, `api`; `app.js` wires `initFeedback`.
- Responsive CSS reusing `radio-card` + `subtabs` patterns.

**TDD**: backend `node --test` (repo + handler + FK-on-delete), frontend `node --test` DOM-stub
(logged-out lock, logged-in submit, category switch, empty-message guard, auth-change re-render),
plus a structural guard that `index.html` ships the tab/section/placeholders.

Acceptance criteria:
- [x] Logged-in user can submit feedback; row stored with author + timestamp; success message shown.
- [x] Logged-out user sees a non-interactive form with the "must be logged in" notice.
- [x] Feedback page shows two tabbed, empty lists with the "Coming soon" placeholder.
- [x] Category defaults to "Feature request"; "Bug Report" and "Other" also selectable & stored.
- [x] Whole page is responsive (reuses the ≤600px layer).
- [x] Feedback is retrievable for manual analysis (export script), and account deletion still works.
- [x] `cd backend && npm test` and `cd frontend && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-02** — Task created. Explored backend (SQLite repos + DI handlers behind `requireAuth`,
  account-deletion FK cascade) and frontend (static ESM modules, `account.js` auth state, zero-dep
  DOM-stub tests). Chose to mirror those patterns; no new ADR. Starting TDD.
- **2026-07-02** — Implemented (TDD, red→green). **Backend:** `feedback` table + index in
  `db/index.js`; `db/feedback.js` repo (`create`/`get`/`all`/`deleteForUser`, `FEEDBACK_CATEGORIES`);
  `feedback/handlers.js` (validates category + trims/bounds message, defaults `feature`);
  `feedback/routes.js` (`POST /api/feedback` behind `requireAuth` + 10/min per-IP limit + 64kb JSON);
  wired into `server.js` and the account-deletion cascade (`auth/routes.js`, optional param so old
  tests are unaffected). `scripts/export-feedback.mjs` for the manual JSON/CSV dump. Updated
  `db.test.js`'s table-set assertion (deliberate schema change). **Frontend:** new Feedback nav tab +
  `#tab-feedback` section (form mount + two empty tabbed lists with a "coming soon" placeholder);
  `js/feedback.js` (DI: auth-gated interactive vs. locked form, category radios, submit → thank-you);
  `account.js` now exports `getAuthState`/`onAuthChange`/`api` and emits auth changes from
  `updateNavAccount`; `app.js` wires `initFeedback`. CSS in `layout.css`/`components.css` reusing
  `radio-card` + `subtabs`, responsive (added `.feedback-wrap` to the ≤600px padding layer).
  **Tests:** backend 106 pass (12 new feedback: repo, handler, route+JWT, FK-on-delete); frontend
  21 pass (5 DOM-stub behaviours + 2 structural guards); randomizer 523 pass (untouched). Verified
  at runtime: booted the server, register→login→submit (feature+bug)→401 gate→400 invalid category
  all correct, and `export-feedback.mjs` dumped both rows with author + ISO timestamp. UI copy is in
  English to match the rest of the app (spec copy was given in Spanish). **Awaiting manual test +
  user OK before closing.**
- **2026-07-02** — Replaced the two closed-padlock emojis (🔒) with the new `assets/locked.png`
  (owner-provided) rendered as a `px-icon`: the logged-out feedback lock note (`feedback.js`) and the
  "Log in and verify" ROM-status row (`account.js`, new `LOCK_ICO` constant). No open-padlock (🔓)
  emojis existed, so `assets/unlocked.png` is available but currently unused. Frontend suite still 21 ✓.
- **2026-07-02** — Merged `feature/T-048-frontend-feedback` into `master` (`--no-ff`, merge
  `18fbdb6010`). Owner pushed to `origin/master` and greenlit the deploy; ran `deploy/update.sh`:
  preflight (randomizer 523 / backend 106 / frontend 21 + tracker) green, bundle built, rsynced,
  Linux decomp tools rebuilt, container recreated, `health /api/me: 401` (expected). Live on
  https://pokemon-emerald-cut.com. Production smoke-test green (Feedback tab + section + placeholder,
  `/js/feedback.js` 200, `/assets/locked.png` & `/assets/unlocked.png` 200, `POST /api/feedback`
  without token → 401). **Awaiting owner's manual production test before closing.**
- **2026-07-02** — Owner manually tested in production: submitted a feature request and a bug report,
  then asked to verify them via the export tooling and delete them. Confirmed against the live DB
  (in-container `export-feedback.mjs`): id 1 `feature` "Feature request test." and id 2 `bug`
  "Bug request test." — both from `alcazar.sacris@gmail.com`, correctly differentiated by category
  with author + timestamps. Deleted both by id (`DELETED rows: 2`, `AFTER: []`), independently
  re-confirmed empty, and cleaned up the one-off script. Owner explicitly confirmed OK to close.

## Outcome

Shipped the Feedback section end-to-end and deployed to production (https://pokemon-emerald-cut.com).

**Backend:** `feedback` table (`db/index.js`) + repo (`db/feedback.js`, `FEEDBACK_CATEGORIES`);
`POST /api/feedback` behind `requireAuth` + a 10/min per-IP limit (`feedback/routes.js` +
`feedback/handlers.js`), wired into `server.js` and the account-deletion cascade (`auth/routes.js`,
optional param so prior tests are unaffected). `backend/scripts/export-feedback.mjs` provides the
manual JSON/CSV dump (also documented in CLAUDE.md Commands).

**Frontend:** Feedback nav tab + `#tab-feedback` section (auth-gated form + two empty tabbed lists
with a "coming soon" placeholder); `js/feedback.js` (DI); `account.js` now exports
`getAuthState`/`onAuthChange`/`api` and emits auth changes; `app.js` wires `initFeedback`. Responsive
CSS reusing `radio-card` + `subtabs`.

**Tests:** backend 106 (12 new), frontend 21 (7 new), randomizer 523 — all green; verified live in
prod (submit → store with author+date → retrieve/differentiate → targeted delete).

**Deviations from the plan:**
- UI copy is in **English** (spec copy was given in Spanish) to match the rest of the app.
- Added a **lock-icon** swap not in the original plan: replaced the two 🔒 emojis with the
  owner-provided `assets/locked.png` (`px-icon`); `assets/unlocked.png` also shipped.

**Follow-ups (deferred, not blocking):**
- `assets/unlocked.png` is deployed but currently **unused** — candidate to wire into the Settings
  "verified ✓" rows. No task opened yet; raise one if/when desired.
- The two curated lists are intentionally empty placeholders, to be filled by hand later from the
  exported feedback.
