---
id: T-015
title: Rebrand the app to "Pokémon Emerald Cut" everywhere
status: done            # proposed | in-progress | done | abandoned
type: docs              # feature | fix | refactor | docs | chore
created: 2026-06-21
updated: 2026-06-21
target-version: 0.2.0
links: []               # related bug/ADR/PR ids or paths
blocked-by: []
---

# T-015 — Rebrand the app to "Pokémon Emerald Cut" everywhere

## Context

The app currently carries two inconsistent names: the front-end app
(`frontend/index.html`) is branded "Pokémon Emerald Randomizer" / "Emerald
Randomizer", while the generated per-run docs viewer (`frontend/template.html`)
is branded "PuppedJS". The project needs a single identity in every place a name
is shown.

Single name, logo and slogan (per the user):
- **Name:** `Pokémon Emerald Cut` (everywhere the name is shown).
- **Logo:** `emeraldCut.png` — used by both the front-end app and the generated
  docs. Asset already lives at `frontend/assets/emeraldCut.png` (a pixel-art
  emerald-cut gem).
- **Slogan:** `Your emerald cut for controlled chaos.` ("emerald cut" = the gem
  cut, tying the name to the "controlled chaos" idea from `LANDING_BRAINSTORM.md`).

The in-game GBA title-screen logo is out of scope (separate C-game asset).

## Plan

Replace every user-facing brand string and logo placeholder with the single
name/logo/slogan, in the front-end app, the docs viewer template and the
READMEs. The offline docs embed the logo via the existing `assets.json` /
`getIcon('emeraldCut')` mechanism (no new wiring). Branding-only — no
`randomizer/` logic changes, so the existing test suite must stay green
(no test depends on brand strings).

Acceptance criteria:
- [x] `frontend/index.html`: `<title>`, top-nav name and logo, and landing hero
      (brand + slogan) all read "Pokémon Emerald Cut"; favicon = emeraldCut.png.
- [x] `frontend/template.html` (docs): `<title>`, header name, logo badge,
      tagline and footer all read "Pokémon Emerald Cut" / the slogan; favicon =
      embedded emeraldCut.png. No "PuppedJS"/"custom journey" strings remain.
- [x] `randomizer/README.md` and the root `README.md` name the project
      "Pokémon Emerald Cut" (root keeps the required RHH/pokeemerald-expansion
      attribution).
- [x] No "Emerald Randomizer" / "PuppedJS" brand strings remain in `frontend/`.
- [x] `cd randomizer && npm test` green.
- [x] User manually confirms the app + a generated doc show the new branding.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-21** — Task created. Scoped the brand strings: app name lives in
  `frontend/index.html` (title/top-nav/landing), docs name "PuppedJS" lives only
  in `frontend/template.html` (title/header/footer); no test or `writerDocs.js`
  reference depends on the brand. Docs logo will reuse the `getIcon`/`data-icon`
  → `assets.json` embedding (emeraldCut.png added to the asset map via
  `node build.js`/generateAssets; `assets.json` is gitignored).
- **2026-06-21** — Implemented across `frontend/index.html`, `frontend/template.html`,
  `frontend/css/layout.css`, `randomizer/README.md` and the root `README.md`;
  added the `[Unreleased]` changelog line. Suite green (31 suites / 464 tests).
  User confirmed the branding ("Está genial"). Closed alongside [[T-016]].

## Outcome

Single identity **Pokémon Emerald Cut** shipped everywhere a name/logo/slogan is
shown: front-end top-nav (logo image + name) and favicon, landing, the per-run
docs viewer (header logo via embedded `emeraldCut.png`, title, tagline, footer,
offline favicon), `randomizer/README.md`, and a branded header on the root
`README.md` (upstream RHH/pokeemerald-expansion attribution preserved below).
Branding-only — no `randomizer/` logic touched. The landing hero was then reworked
further in [[T-016]] (the "Pokémon Emerald Cut" eyebrow became the page title).
Committed together with T-016 on `feature/T-016-landing-redesign-features-page`.
