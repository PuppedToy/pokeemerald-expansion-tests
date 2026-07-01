---
id: T-041
title: Match the app top-nav brand title to the Home hero title (green accent + icon-as-C)
status: in-progress
type: feature
created: 2026-07-01
updated: 2026-07-01
target-version: 0.5.0
links: [T-040, T-034]
blocked-by: []
---

# T-041 — Top-nav brand title matches the Home hero title

## Context

The app's Home hero renders the title as `Pokémon <span class="title-accent">Emerald <img class="title-logo" alt="C">ut</span>`
— "Emerald Cut" in brand green with the logo standing in for the "C" of "Cut" (T-034). The top-nav
brand, however, still shows a plain-white "Pokémon Emerald Cut" next to a separate square logo, so the
two don't match. Owner asked to replicate the Home title's colour scheme + icon-as-C in the top bar.
Cosmetic only; the docs viewer already does this (`.ec-title`/`.ec-logo`).

## Plan

In `frontend/index.html` + `frontend/css/layout.css`: restyle the `.topnav-brand` to mirror the Home
title — "Pokémon" default, "Emerald Cut" in `--obs-green` (reuse `.title-accent`), the logo inlined as
the "C" of "Cut" (replacing the separate leading logo, as on Home). Use `em`-based nudges (like the docs
viewer's `.ec-logo`) so it scales with the 12px nav font. Applies at all viewports.

Acceptance criteria:
- [ ] Top-nav brand reads "Pokémon Emerald Cut" with "Emerald Cut" green and the icon as the "C" of "Cut", matching Home.
- [ ] Renders correctly on desktop and mobile (no clipping/misalignment); brand still links Home.
- [ ] Visual baselines refreshed; the change is intentional and reviewed on screenshots.
- [ ] Owner confirms it looks right.

## Progress log

<!-- Append-only. -->

- **2026-07-01** — Created from owner request (consistency polish after T-040). Home title markup/CSS in
  `index.html:80` + `layout.css` (`.title-accent`, `.title-logo`); docs-viewer equivalent is `.ec-title`/`.ec-logo`.

## Outcome

<!-- Filled when closing. -->
