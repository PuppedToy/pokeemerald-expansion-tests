---
id: T-222
title: Legal hardening — GDPR minimum, patch-not-ROM wording, disclaimers
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-221, docs/legal-risk-analysis.md]
blocked-by: []
---

# T-222 — Legal hardening (GDPR minimum + wording + disclaimers)

## Context

Acting on [T-221](T-221-legal-risk-analysis.md) — the parts the owner asked me to implement (domain rename
is owner-handled; Pokémon/ability **names are kept as-is**, disclaimers instead of masking). Everything
here is *hardening/framing*, not a licence.

## Plan (what I can do, broken down)

**A. GDPR minimum (no analytics/cookies in the app → no consent banner needed; only essential storage).**
- New `frontend/privacy.html` — privacy policy: what's collected (email, password *hash*, run metadata,
  diagnostics), why + lawful basis (consent + contract/legitimate interest), retention (48h builds; account
  until deletion), rights (access/erasure — deletion already exists), no tracking/analytics cookies, no data
  selling, hosting, contact. Clearly the minimum, plain English.
- Registration **consent checkbox** (required) in the auth modal linking Privacy + Terms; guard in
  `doRegister` too.

**B. Patch-not-ROM wording (never imply the *service* builds/delivers a ROM).**
- `frontend/js/account.js`: "build a ROM"/"build ROMs"/"Building your ROM…"/"build a playable ROM" →
  "generate a patch"/"generate patches"/"Generating your patch…"/"apply your patch and play". Keep the
  *user's-own-ROM* phrasings ("your ROM stays in your browser", "add your Emerald ROM", "apply the patch to
  your ROM") — that's the correct framing.
- `backend/email/templates.js`: "your ROM is ready"→"your patch is ready", "generating ROMs"→"generating
  patches", "build your ROM"→"generate your patch", "the ROM you prepared has finished building"→"the patch
  you prepared has finished generating".

**C. Disclaimers (add where needed; keep names, don't mask).**
- Global **footer** in `index.html`: *not affiliated with / endorsed by Nintendo, Game Freak or The Pokémon
  Company*; *Pokémon and all related names/marks are trademarks of their respective owners*; *free,
  non-commercial fan tool*; *generates patch files, does not distribute the game*; *you must own a legal
  copy*; links to Privacy + Terms.
- New `frontend/terms.html` — Terms/Legal: the same disclaimers, non-commercial/no-profit, own-a-legal-copy,
  patch-not-ROM, all rights of the originals reserved to their owners, as-is/no-warranty.
- Inline **"you must own a legal copy"** note near the generate flow + the Settings ROM upload.
- Generated **docs** (`frontend/template.html`): add the not-affiliated + trademark line to the `<footer>`.

**D. Tests.** Update the 2 assertions that referenced the old building-state string (deliberate spec change);
add a guard test that the required legal notices/links exist in `index.html` + the docs template.

Acceptance criteria:
- [x] `privacy.html` + `terms.html` exist, linked from a global footer; registration requires a `required`
      consent checkbox (guarded in `doRegister` too). Both pages are minified into `dist` by T-220's build.
- [x] No user-facing string implies the *service* builds/delivers a ROM — swept `account.js`, `index.html`,
      `verify.html`, the email templates + their stale comments; internal state ids (`req.state==='building'`)
      kept; user's-own-ROM phrasings kept ("your ROM stays on your device", "apply the patch to your ROM").
- [x] Not-affiliated + trademark + non-commercial + patch-not-game + own-legal-copy notices on the site footer
      + inline near the generate flow + Settings ROM upload, and the not-affiliated + trademark line in the
      generated docs footer (`template.html`).
- [x] Pokémon/ability/etc. names unchanged (no masking) — disclaimers instead.
- [x] Backend 208 + frontend 207 green (2 building-state assertions updated + new
      `frontend/__tests__/legal-notices.test.js` guard); `npm run shoot` no overflow; `node build.js` OK.
- [ ] Owner manual check of the live pages/wording after deploy.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Task created + implemented. Recon: no analytics/cookies (GDPR minimum = policy + consent,
  no banner); delivery download was already patch-first (T-079); only 2 tests asserted the building-state
  string. Names kept per owner; disclaimers added instead.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
