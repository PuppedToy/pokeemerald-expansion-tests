---
id: T-192
title: Config presets (My / Official / Community) with publish, likes, views, search
status: in-progress
type: feature
created: 2026-07-22
updated: 2026-07-22
target-version: 0.6.0
links: [docs/adr/ADR-021-config-presets.md]
blocked-by: []
---

# T-192 — Config presets (My / Official / Community)

## Context

Config lived only in the browser (Save = download JSON, Load = re-import, Reset = defaults) — nothing
named, reusable across devices, or shareable. This task adds named presets persisted per user with
three scopes and social discovery. Design and decisions: [ADR-021](../docs/adr/ADR-021-config-presets.md).
Plan file: `~/.claude/plans/lively-orbiting-fox.md` (approved).

## Plan

Replace the config button row (drop **Save** + **Reset to defaults**; keep **Load** renamed to
**Load from bundle** in orange; add a green **Load Preset**), move **Save Preset** next to **Review**,
and add a DB-backed presets system: `presets` + `preset_likes` + `preset_views` tables, a repo/router
(pattern: `feedback`), `deriveTags`, per-user CRUD + publish + like + unique-view, paginated
list/search/filter/sort for Community, `ADMIN_EMAILS` admin (official presets + moderation), and a
new `frontend/js/presets.js` modal with My / Official / Community tabs. Balanced is a synthetic
Official card derived from `DEFAULTS`. Responsive throughout.

Acceptance criteria:
- [x] Config row: no Save/Reset; green **Load Preset** then orange **Load from bundle**; **Save Preset** sits next to **Review**.
- [x] `presets`, `preset_likes`, `preset_views` tables + indexes migrate idempotently; `db.test.js` table list updated.
- [x] Backend CRUD + publish/unpublish + like toggle + unique-per-user view, all auth/owner/admin-gated (401/403 enforced).
- [x] Tags auto-derived from config on every write (never user-set) and returned by the API.
- [x] Community list: search + format/mode/wild filters + sort (relevance/views/likes) + date window (week/month/year[def]/all), paginated 5/page in SQL.
- [x] `ADMIN_EMAILS` gates official-preset creation and admin unpublish/delete; `GET /api/me` returns `isAdmin`.
- [x] Account deletion clears likes/views (decrementing counters) + presets before the user.
- [x] Modal with My (default) / Official / Community tabs; owner vs non-owner card actions; Apply sets the config; view-detail reuses `reviewRowsHtml`.
- [x] Official tab shows the synthetic **Balanced** (from `DEFAULTS`) + any official rows.
- [x] Responsive (≤600px): modal full-width, cards 1-col, filters stacked, tap targets ≥44px, with tests.
- [x] `cd backend && npm test`, `cd frontend && npm test`, `cd randomizer && npm test` all green; `node scripts/check-tracker.mjs` clean.
- [ ] Owner manual-tests the flow end-to-end and confirms it's OK (close gate).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-22** — Task created. Explored backend (SQLite `node:sqlite`, repo pattern, JWT auth, `feedback` as template) and frontend (vanilla JS, Obsidian kit, single auth modal to clone, `DEFAULTS`/`getConfig`/`setConfig`). Owner decisions: auto-derived tags, `ADMIN_EMAILS` admin, unique-per-user views, admin-unpublish moderation. Wrote ADR-021. Branch `feature/T-192-config-presets`.
- **2026-07-23** — Implemented end-to-end.
  - **Backend:** migration adds `presets` (+ derived `tag_*`, stored generated `relevance`, denormalized `likes`/`views`, indexes), `preset_likes`, `preset_views`. New repos (`db/presets.js`, `db/presetLikes.js`, `db/presetViews.js`), `presets/tags.js` (`deriveTags`), `presets/handlers.js`, `presets/routes.js`, `auth/admin.js` (`ADMIN_EMAILS`). `GET /api/me` now returns `isAdmin`; account-deletion cascade clears likes/views (decrementing counters) + presets. 30 new tests in `presets.test.js`; `db.test.js` table list updated.
  - **Frontend:** removed Save + Reset (and the now-dead `resetToDefaults()`), green **Load Preset** + orange **Load from bundle**, **Save Preset** next to Review. New `js/presets.js` (modal with My/Official/Community tabs, cards, pagination, save/overwrite, edit/delete/publish, like, view-detail via `reviewRowsHtml`, community search/filter/sort/date). Synthetic **Balanced** derived live from `DEFAULTS`. `applyExternalConfig()` + exported `DEFAULTS` on `ConfigForm`. Presets CSS + ≤600px mobile layer. Tests: `presets.test.js` (18) + responsive assertions; updated the two spec-changed config-form tests (Save/Reset removal).
  - **Green:** backend 168, frontend 135, randomizer 1574; `check-tracker` OK. Manual testing by the owner still pending (not closing).
- **2026-07-23** — Owner feedback: (1) rename the "Official" scope, (2) recommended presets should have likes/views like the rest.
  - Renamed the display label **Official → "Recommended"** (tab, card badge, "Save as a Recommended preset"); internal token/DB `kind` stays `official`.
  - **Balanced is now a real seeded `official` row (no longer synthetic)** so it accumulates likes/views. New admin-only `POST /api/presets/official/balanced` idempotently upserts it (fixed id `official-balanced`) from the frontend's live `DEFAULTS` — created on first admin load, config/tags refreshed only when `DEFAULTS` change (name/description/likes/views preserved). Keeps `DEFAULTS` the config SSOT (server holds no copy). `handleLike` now allows liking any `official` preset even when unpublished; recommended/official cards show stats + a Like toggle (non-owner). Removed the frontend synthetic `balancedItem` + `__balanced__` special-cases. ADR-021 amended (pre-first-commit) accordingly.
  - Tests updated/added: backend seed-balanced (create/idempotent/refresh/admin-only) + like-official; frontend recommended-card (stats+like+badge, owner-CRUD) replacing the synthetic-card tests. Adjusted the `presets-modal` shoot screen to the Community tab (filter bar renders without login/seed).
  - **Green:** backend 172, frontend 135; re-ran `shoot` — no overflow.
  - **Visual (`visual-tests/`):** ran the autonomous `shoot` preview — **no horizontal overflow at any viewport** (phone-sm→desktop) for both the new config-button row and the presets modal; reviewed the PNGs (green Load Preset + orange Load from bundle; Official/Balanced card with tag chips; full-width, stacked on mobile). Registered a `presets-modal` screen in `screens.mjs`. The pixel-diff `visual` suite is **pre-drifted on this machine** (verified on clean master: `auth-modal`, `home@ipad-landscape`, `docs-*` already fail — font/Chromium/stale-docs drift, unrelated to T-192), so I did **not** bless machine-specific baselines. Baseline refresh needed on the canonical env for the intentional `randomizer` change + the new `presets-modal` screen (`cd visual-tests && npm run visual:update` after visual review).

- **2026-07-23** — Committed (`feat` + `merge` into master, owner-pushed) and **deployed to production** via `deploy/update.sh` (preflight all-green → rsync → tools rebuild → container recreate → health `/api/me` 401). Set `ADMIN_EMAILS=aalcazar@brooktec.com` (the sole admin) in the box's `deploy/.env` and documented it in `deploy/.env.example` (chore commit `db1c8f9`, still to be pushed by the owner). Verified live: `GET /api/presets?scope=community` → 200 `{items:[],…}` (presets tables migrated on the prod SQLite; idempotent), running container `printenv ADMIN_EMAILS` = the single admin, public HTTPS `GET /` → 200. Balanced seeds itself when the admin next loads the app. Task stays in-progress pending the owner's manual-test confirmation.

- **2026-07-23** — Admin curation follow-up: **promote/demote any preset to/from Recommended in place** (no recreate). Backend `presets.setKind` + admin-only `POST /presets/:id/recommend|/unrecommend` (ownership unchanged); frontend adds an admin-only **★ Make Recommended / Remove from Recommended** button on every card (hidden in save mode). Tests added (backend promote/demote + 403/404; frontend card toggle). Committed + owner-pushed to master.
- **2026-07-23** — Deployed to production (`deploy/update.sh`, preflight green → rsync → tools rebuild → recreate → health 401). Verified live: `POST /api/presets/:id/recommend` and `/unrecommend` return 401 unauthenticated (routes present = new code), `?scope=community` 200, `GET /` 200.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
