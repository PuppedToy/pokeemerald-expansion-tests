---
id: T-003
title: Re-skin the randomizer front-end with the Obsidian UI kit
status: done
type: feature
created: 2026-06-19
updated: 2026-06-19
target-version: 0.1.0
links: []
blocked-by: []
---

# T-003 — Re-skin the randomizer front-end with the Obsidian UI kit

## Context

`obsidian-ui-kit/` is a style guide ("obsidian") authored with Claude Design: a retro
8-bit / GBA-era system — deep navy surfaces, ember-orange primary + cyan secondary,
Press Start 2P (chrome) + VT323 (body), hard edges (radius 0), chunky non-blurred offset
shadows. Tokens/components are documented in `obsidian-ui-kit/STYLE_GUIDE.md` and
`obsidian-ui-kit/css/obsidian.css`.

Goal: apply this look to the **whole front-end app** (`frontend/index.html` + its CSS),
just to see how it feels. Explicitly **out of scope: the docs** (`frontend/template.html`)
— it is fully separate (inline styles, no shared CSS). The app does **not** need to be
self-contained, so loading the two pixel fonts from Google Fonts is fine.

The app's styles live in three files with stable, semantic class names
(`frontend/css/{base,components,layout}.css`), so a re-skin can re-author those files
without touching `index.html`/`config-form.js` markup (only the `<head>` font link).

## Plan

Re-skin by re-authoring the existing classes in the Obsidian visual language (keep the
class names; map them to Obsidian tokens). No markup/JS changes except the font `<link>`.

- `base.css`: replace tokens with the Obsidian palette + pixel fonts; alias the legacy
  token names (`--accent`, `--bg`, `--text`, `--muted`, `--card`, `--glass*`, `--radius`)
  to Obsidian values so any missed reference still reads Obsidian; global reset (navy bg,
  VT323 body, crisp pixels, square edges).
- `components.css`: buttons, cards/panels, inputs, toggle, sliders, radio-cards, checkbox
  rows, section titles, steps, summary rows, warning/success banners → Obsidian (3px
  borders, offset shadows, radius 0, Press Start 2P chrome, VT323 reading text).
- `layout.css`: topnav, landing hero/cards, wizard panels, run/coop panels, config/nav
  bars, generation progress, generate card → Obsidian.
- `index.html`: swap the Inter Google-Fonts link for Press Start 2P + VT323.

Acceptance criteria:
- [x] App loads with the Obsidian look across both tabs (Home + Randomizer) and all 3 wizard steps; no unstyled/broken components.
- [x] Hard edges (no rounded corners), offset pixel shadows, navy surfaces, orange primary / cyan secondary, Press Start 2P + VT323 applied.
- [x] All interactive controls still work and read correctly: run-type radio cards, nuzlocke/soul-link panels, difficulty slider, rebalance toggle + balance slider, advanced collapsible, config save/load, wizard nav, progress bar, download buttons.
- [x] `frontend/template.html` (docs) is untouched and unaffected.
- [x] Markup change limited to the `<head>` font link plus one user-requested consistency fix (show-exact-positions checkbox → toggle); no JS logic changes.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-19** — Task created. Inventoried the Obsidian kit (tokens/components) and the app's CSS/markup; confirmed app (`index.html` + `css/{base,components,layout}.css`) and docs (`template.html`, inline styles) share no CSS. Approach: re-author the 3 app CSS files keeping class names; swap font link.
- **2026-06-19** — Implemented. Re-authored `base.css` (Obsidian tokens + pixel fonts + reset; legacy token names aliased to Obsidian values so inline `var(--accent)`/`var(--muted)` in config-form.js still read Obsidian), `components.css` and `layout.css` (all classes → Obsidian: 3px borders, offset shadows, radius 0, Press Start 2P chrome / VT323 body). Swapped the Inter font link for Press Start 2P + VT323 in `index.html`. No JS/markup changes. Audited config-form.js: every generated class is defined (0 undefined). Verified with Chrome headless screenshots of both tabs: Home (hero with offset shadow, nav, cards) and Randomizer wizard (step boxes + dashed connectors, run-type radio cards, difficulty slider, rebalance toggle/balance slider, advanced collapsible, save/load ghost buttons, review CTA) — all render correctly, no broken components. Docs `template.html` untouched.
- **2026-06-19** — User review found two inconsistencies, fixed: (1) the difficulty range had no `.slider` class so it stayed a native slider — extended the `.slider` rules (track + webkit/moz square thumb) to also target `input[type="range"][name="difficulty"]` (CSS only). (2) "Show exact positions in teams" was a `.checkbox-row` while the equivalent boolean "Rebalance stats" is a `.toggle` — converted it to the same `toggle-wrap` + `.toggle` markup in config-form.js (same `#show-exact-positions` id, so JS is unaffected). This is a small **deviation** from the "no markup changes" criterion, made at the user's request for consistency. Re-verified both via headless screenshot (difficulty slider now has the square pixel thumb; show-exact-positions matches the rebalance toggle).
- **2026-06-19** — User confirmed OK. Closed; committed and merged to master.

## Outcome

- **2026-06-19** — User confirmed the look OK after manual review. Closing.

**Shipped:** The randomizer app (`frontend/index.html` + `css/{base,components,layout}.css`)
re-skinned to the Obsidian UI kit — navy surfaces, ember-orange primary / cyan secondary,
Press Start 2P (chrome) + VT323 (body), hard edges, chunky offset shadows. Re-authored the
3 CSS files keeping every existing class name; swapped the font `<link>`. Verified both tabs
and the full wizard via headless screenshots. Docs (`template.html`) untouched.

**Deviations from the plan:**
- One markup change beyond the font link: converted the "Show exact positions in teams"
  checkbox into a toggle to match the "Rebalance stats" toggle (user-requested consistency
  fix). Same `#show-exact-positions` id, so no JS change.
- The difficulty slider needed the `.slider` rules extended to its `name="difficulty"`
  selector (it had only `accent-color`).

**Follow-ups:** none. (The app intentionally still loads the two pixel fonts from Google
Fonts — self-containment was explicitly out of scope for the app.)
