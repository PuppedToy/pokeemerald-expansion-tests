---
id: T-224
title: Beta UX fixes from validation (notice gating, admin "run" vs ROM)
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-216, T-217]
blocked-by: []
---

# T-224 — Beta UX fixes from owner validation

## Context

Owner feedback while validating the live beta:
1. The "closed beta / invite-only" notice on the randomizer shows for everyone — it should only show to
   users who **don't have build access yet** (not `accepted`).
2. "has ROM" should mean *a ROM uploaded in the browser* (a client-only fact that never travels to the
   server); Settings should read it from the browser. Investigation: Settings **already** reads the local
   IndexedDB store (T-080) and `/api/me` does not track it. The only server-side "ROM" wording is the admin
   panel's **"Prepared ROM"** column — but that's the held **run/bundle** (needed for the invite lottery),
   not a browser ROM. → the fix is to rename that to **"run"** (consistent with patch-not-ROM, T-222).
3. A browser ROM is **not** required to generate — docs + the raw `.bps` patch download without one; the ROM
   only enables the green "apply patch to my ROM" button. Investigation: **already implemented** (T-053/T-079)
   — confirmed, no change.

## Plan

- **(1)** `applyBetaChrome()` (`frontend/js/account.js`): hide `#beta-notice` unless `betaMode && not
  accepted`; keep the BETA badge for everyone. Re-evaluate on auth changes (call from `updateNavAccount`).
- **(2)** `frontend/js/admin.js`: rename the display wording "Prepared ROM" / "with a prepared ROM" /
  "prepared ROMs" / "ROM ✓" → "prepared run" / "run" (keep the ROM-count in parentheses). API field names
  (`hasRom`/`withRom`/`heldRoms`) are internal and unchanged.
- **(3)** No code change — confirm the ROM-optional generation + green-button gating stays as-is.

Acceptance criteria:
- [x] The closed-beta notice is hidden for `accepted` users (and shown to anonymous / pending users) while
      BETA is on; the badge still shows for everyone. (`applyBetaChrome` re-runs on every auth change.)
- [x] The admin panel no longer calls the held run a "ROM" — it reads "prepared run" / "run".
- [x] Settings ROM presence stays browser-only (confirmed — `hydrateSettingsRom` reads IndexedDB `hasRom`);
      `/api/me` still doesn't track it (confirmed).
- [x] ROM stays optional for generation; the raw `.bps` downloads without a ROM; the green apply button is
      gated on a local ROM (confirmed — `hydrateReadyRow`, T-053/T-079; no change needed).
- [x] Frontend suite green (207) — beta-surface accepted→notice-hidden added, beta-admin-panel "run" wording
      updated; `shoot` no overflow.
- [ ] Owner re-validates on the live site after deploy.

## Progress log

- **2026-07-26** — From owner validation. Investigated: Settings ROM row + delivery are already browser-local
  (T-080/T-053); server never tracks the browser ROM. So (2) reduces to renaming the admin "Prepared ROM"
  (held run) to "run"; (3) is already done. Only real change is (1) notice gating + (2) admin wording.

## Outcome

<!-- Filled when closing. -->
