# Obsidian UI Kit

A retro 8-bit (GBA-era) **dark-mode** design system — pixel borders, chunky offset shadows, deep-navy surfaces and ember-orange controls. Built for fan projects (e.g. Pokémon romhacks) that want a polished retro look on a modern web stack.

This bundle is a **design reference + starter kit** for a real project. Hand it to Claude (or any developer) and ask it to build on top of these tokens and components.

## What's in here

```
obsidian-ui-kit/
├── README.md            ← you are here
├── STYLE_GUIDE.md       ← the full spec: tokens, type, components, do/don't
├── STYLE_GUIDE.html     ← visual, print-ready style guide → open & "Save as PDF" (Cmd/Ctrl+P)
├── css/
│   ├── obsidian.css     ← the design system: :root tokens + all component classes
│   └── fonts.css        ← the two pixel fonts (Press Start 2P + VT323)
└── example.html         ← standalone page using every component (open in a browser)
```

## Quick start

```html
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/obsidian.css">
<body class="obs">
  <button class="obs-btn">PRESS START</button>
</body>
```

That's it — `obsidian.css` defines all design tokens as CSS custom properties under `:root` and ships every component as a plain `obs-`-prefixed class. No build step, no framework, no JS required (except for stateful widgets — tabs, modal, toast — where `example.html` shows the minimal vanilla JS).

## Fonts

Both typefaces are open-source (SIL Open Font License) and load from **Google Fonts** by default — zero setup. To self-host for offline use, download the `.woff2` files (links are in `css/fonts.css`), drop them in a `fonts/` folder, and switch to the commented `@font-face` block in that file.

## Using this with Claude (recommended workflow)

When starting your real project, give Claude this whole folder and a prompt like:

> "Use the Obsidian UI Kit in this folder as the design system. Read `STYLE_GUIDE.md` and `css/obsidian.css` for the tokens and component classes, and `example.html` to see them in use. Build [your feature] following this system exactly — square corners, offset pixel shadows, Press Start 2P for chrome + VT323 for body, orange primary / cyan secondary on dark navy. Reuse the `obs-*` classes and `--obs-*` tokens; don't invent new colors outside the accent ring."

Claude reads `.md` and `.css` natively, so the style guide + CSS are the most important files for it. `STYLE_GUIDE.html` is a designed, print-ready reference for humans — open it in a browser and use **Cmd/Ctrl+P → Save as PDF** to get a PDF copy.

## Adapting to a framework

The kit is vanilla CSS, so it drops into any stack:
- **React / Vue / Svelte:** wrap each `obs-*` pattern in a component; keep the class names and tokens. Stateful widgets (tabs/modal/toast) map to your framework's state instead of the demo's vanilla JS.
- **Tailwind / CSS-in-JS:** port the `:root` tokens to your theme config; the structure tokens (3px borders, offset shadows, 0 radius) are the load-bearing part of the aesthetic.

## Rules that make or break the look

1. `border-radius: 0` everywhere.
2. Shadows are solid + offset + non-blurred (`Npx Npx 0 #04080f`), never soft/glow.
3. Press Start 2P only for headings/buttons/labels; VT323 for anything you actually read.
4. Orange = one primary action per view; cyan = secondary/interactive; navy everywhere else.

See `STYLE_GUIDE.md` §6 for the full Do/Don't list.

---

*Not affiliated with Nintendo / Game Freak. Fonts © their respective authors under the SIL OFL.*
