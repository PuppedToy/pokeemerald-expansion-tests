---
id: T-028
title: Frontend — login/explainer, dual-action download, status/ETA & "my ROMs"
status: in-progress
type: feature
created: 2026-06-21
updated: 2026-06-24
target-version: 0.3.0
links: [T-018, T-021, T-022, T-025]
blocked-by: [T-021, T-025]
---

# T-028 — Frontend — login/explainer, dual-action download, status/ETA & "my ROMs"

## Context

The browser side of the epic [T-018](T-018-backend-build-queue-produce.md). Docs stay anonymous;
ROM generation requires login + a verified account + a validated ROM. This wires the UI onto the
API (T-021 auth, T-022 validate, T-025 produce/status/download).

## Plan

- **Login/register/verify/forgot UI** + an **explainer section** in the randomizer stating *why*
  login is needed: (1) upload the original Emerald ROM (ownership), (2) provide an email to be
  notified if the queue is long.
- **"Generate" button drives everything.** On click: the front builds the bundle and renders the
  docs client-side, **and** — for an eligible user (logged in + verified + owns-rom + no active
  request) — the **same bundle is POSTed to `/api/produce` and the ROM build starts automatically**.
  Starting the build is **not** tied to downloading the docs; there is no separate build button.
  If the user is not eligible, docs are still produced and a warning surfaces what's missing
  (login / verify / upload ROM), or — if they already have an active request — points to its status.
- **Docs download is backend-free.** A "Download documentation" button only packages the locally
  held bundle into the docs zip — it hits no endpoint and works anytime, including while ROMs build.
- **Bundle storage = IndexedDB** (a ~32 MB bundle will not fit in localStorage). The bundle also
  lives server-side on the request. **On reload:** recover the active request via `/api/me` +
  `/api/status` (show ETA), and offer a lazy **"Regenerate docs"** button (assume the user already
  downloaded) that regenerates from the local bundle, falling back to fetching it from the server
  if local storage was cleared.
- **ROM-upload step** only when the user lacks a validated ROM (remembered once validated).
- **Status/ETA view:** poll/SSE `/api/status`; show position + live ETA; when ETA ≥ 2 min offer the
  email-on-ready checkbox. ETA may rise for slow jobs — message it gracefully.
- **"My ROMs" area:** the user's ready ROM(s), 48 h TTL; the download button carries a **"single-use"
  warning** because downloading deletes them server-side. Session restored on return (one active
  request → land straight on its status).

Acceptance criteria:
- [x] Generate renders docs for anyone; the ROM build auto-starts (same bundle → `/api/produce`) only
      when eligible, decoupled from the docs download; clear warnings otherwise. (`onBundleReady`.)
- [~] Docs download hits no endpoint and works anytime; bundle held in IndexedDB; on reload the active
      request + ETA are recovered. **Deferred:** "Regenerate docs" from the stored bundle on reload.
- [x] Login/verify/forgot flow works against the API; explainer present. (Verified end-to-end via smoke:
      register → verify → login → `/api/me` verified:true.)
- [x] ROM upload appears only when needed; remembered after validation (`owns_valid_rom`).
- [~] Status/ETA updates live (polling); "my ROMs" shows a single-use-warned download. **Deferred:** the
      email-on-ready opt-in checkbox when ETA ≥ 2 min (`canDeferEmail` is already returned by produce).
- [x] Session restored on re-entry to the active request (`initAccount` resumes status + polling).

_Visual/DOM rendering and the produce→status→download happy path (needs a real Emerald ROM) = final manual pass._

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown.
- **2026-06-24** — Implemented. New `js/account.js` (auth state, modal wiring, IndexedDB bundle store,
  ROM upload, produce + status polling + ROM download, reload recovery); `verify.html` + `reset.html`;
  index.html got the account modal + "why login" explainer + a `#delivery-panel` (replacing the old
  disabled "Send to server" button); CSS in components.css; app.js calls `initAccount()` on load and
  `onBundleReady(bundle)` from `showGenDone`. Verified by smoke test: all new files served (200), and
  register → verify (token from dev mailer) → login → `/api/me` verified:true; rom-validate rejects a
  non-Emerald (400); produce gated without a ROM (403). account.js is valid ESM. **Deferred polish:**
  (1) "Regenerate docs" from the stored bundle on reload; (2) the email-on-ready opt-in checkbox. Stays
  **in-progress** for the final manual pass (browser UI + the full produce→download with a real Emerald
  ROM). Note: only the (USA, Europe) Emerald hash is in the accepted set so far — use that dump to test.

## Outcome
