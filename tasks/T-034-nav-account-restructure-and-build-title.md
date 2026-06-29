---
id: T-034
title: Nav + account UX restructure, home logo treatment, and build progress in the tab title
status: done
type: feature
created: 2026-06-28
updated: 2026-06-29
target-version: 0.4.0
links: [T-031]
---

# T-034 — Nav + account UX restructure, home logo treatment, and build progress in the tab title

## Context

Owner feedback after the generation-screen polish (T-031). Frontend-only (served files, not the
randomizer bundle). Six points across the nav, the home hero, and the build status.

## Plan

1. **Building → tab title shows the build %** (the build can be long; surface progress in `document.title`).
2. **Queued → tab title shows how many are ahead.**
3. **Home hero**: replace the "C" of "Cut" with the brand icon at glyph size; colour "Emerald Cut" green (`--obs-green`).
4. **Clicking the top-nav brand goes Home.**
5. Replace the weird "<email>" nav tab:
   - **Settings tab** = a real page (not a modal) with email-verified + ROM-ownership status + upload.
   - **Top-right** shows "Logged in as <email> · log out" (or a "Log in" link when logged out).
   - The **login modal** (login/register + the why-an-account explainer) appears only when the app
     asks for login (the "Log in" link or a gated CTA) — never from clicking a profile.

Acceptance criteria:
- [x] While building, the tab title is the live `NN% · …`; while queued, `N ahead · …`; otherwise the default.
- [x] Home hero: "Emerald Cut" is green and the "C" is the brand icon, sized to the text.
- [x] Clicking the brand activates the Home tab.
- [x] A Settings page shows account status + ROM upload (logged in) or a login prompt (logged out).
- [x] Top-right shows "Logged in as <email> · log out" / "Log in"; the login modal no longer opens from a profile click.
- [x] JS syntax valid; randomizer + backend suites green; owner visual review.

## Progress log

- **2026-06-28** — Created from owner feedback. Implementing all six points (frontend-only).

- **2026-06-28** — All six implemented (frontend-only; served files, not the randomizer bundle):
  (1)+(2) `document.title` now shows `Building NN%` (driven by the build-bar tick) / `N ahead`
  (queued) / `✓ ROM ready`, via a `setTabTitle()` helper, resetting to default otherwise.
  (3) Home hero: "Emerald Cut" in `--obs-green` with `emeraldCut.png` (a green "C") replacing the C
  of "Cut" (`.title-accent` / `.title-logo`). (4) The brand links to the Home tab. (5) Removed the
  "<email>" tab → a real **Settings** page (`#tab-settings`, account status + ROM upload), a nav-right
  `#nav-account` ("Logged in as … · log out" / "Log in"), and the modal trimmed to login/register only
  — it opens only from the nav "Log in" or a gated CTA (the "no ROM yet" CTA now routes to Settings,
  where the upload lives). JS syntax-validated; randomizer 470/470, backend 86/86. **Not deployed**
  (owner-gated). Pending owner visual review. (Note: interpreted "the home icon" as the brand logo,
  which is itself a green C — fits the C substitution cleanly.)

- **2026-06-28** — Title icon-C tuning (owner review, point 3). The icon is a full tile (orange bg +
  green/cyan C, transparent corners) whose visible C is smaller than its box, so it rendered too small
  and low at `0.92em`. Tuned visually via a side-by-side compare artifact (real font + logo): owner
  picked **F** (`height: 1.4em`) + a hair left. Final: `height 1.4em; vertical-align -0.12em;
  margin 0 .03em 0 -0.04em`. Sub-pixel left/up nudges below this were imperceptible at the title size,
  so not pursued. CSS-only.

- **2026-06-29** — Owner feedback round: fixed [[B-011]] (a generated run was lost on reload when no
  build was in flight — notably after the email-verification round-trip). `account.js` now restores a
  stored run on load whenever an active build **or** a stored bundle exists; `app.js`'s
  `onRecover({ switchTab })` only jumps to the Randomizer tab for an in-flight build. Guarded the
  re-build-on-reload regression by persisting "already downloaded" per bundle in `localStorage`. Also
  reworded the "needs a ROM" gating from the confusing "Verify your Emerald" to **"Upload your Emerald
  ROM"** (clear explanation + "Upload in Settings" CTA). Frontend has no automated harness → verified
  by manual repro; randomizer 470/470, backend 86/86. Not deployed (owner-gated).

## Outcome

- **2026-06-29** — Shipped + deployed; owner confirmed it's good. All six points live: tab-title build
  progress (`Building NN%` / `N ahead` / `✓ ROM ready`), the green "Emerald Cut" with the brand-icon "C"
  (the logo is itself a green C, so it fits cleanly — the size/position was then fine-tuned to match the
  caps in the follow-up), brand→Home, a real Settings page (status + ROM upload), the nav-right identity
  area, and the login modal only on actual auth requests. The "Verify your Emerald" wording fix landed
  here too. No deviation from plan.
