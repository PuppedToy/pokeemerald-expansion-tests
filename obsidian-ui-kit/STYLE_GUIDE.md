# Obsidian UI Kit — Style Guide

**Version 1.0** · A retro 8-bit (GBA-era) component system, dark-mode native.

> Pixel borders · chunky offset shadows · zero rounded corners · two pixel typefaces.

---

## 1. Design Principles

1. **Hard edges only.** `border-radius` is always `0`. The retro feel comes from sharp pixel rectangles, never soft corners.
2. **Chunky offset shadows = depth.** Every raised element casts a solid (non-blurred) shadow offset down-right, e.g. `box-shadow: 4px 4px 0 #04080f`. On hover, the element lifts (`translate(-2px,-2px)`) and the shadow grows; on press it sinks (`translate(2px,2px)`) and the shadow collapses to `0`.
3. **Dark navy surfaces, ember-orange action.** Backgrounds are deep desaturated blues. Orange is the primary call-to-action; cyan is the secondary/interactive accent. Use accent colors sparingly — they should pop against the navy.
4. **Pixel type, two roles.** Press Start 2P for chrome (headings, buttons, labels); VT323 for everything readable (body, captions, table cells). Never set Press Start 2P below 8px or as long-form body — it becomes unreadable.
5. **Snappy, stepped motion.** Transitions are fast (`0.08s`); spinners use `steps()` not smooth rotation. Retro hardware doesn't ease.

---

## 2. Color Tokens

| Token | Hex | Role |
|---|---|---|
| `--obs-bg` | `#0d1b2a` | Page base background |
| `--obs-bg-deep` | `#081320` | Header, footer, wells |
| `--obs-surface` | `#16293f` | Cards / panels |
| `--obs-surface-2` | `#1d3550` | Raised / row hover |
| `--obs-well` | `#0a1726` | Input & progress backgrounds |
| `--obs-line` | `#2c4a6a` | Dashed dividers |
| `--obs-shadow` | `#04080f` | Pixel shadow **and** all borders |
| `--obs-orange` | `#ff7a18` | **Primary** action |
| `--obs-orange-deep` | `#b34e00` | Pressed / deep fill |
| `--obs-cyan` | `#2fe0d0` | **Secondary** / links / interactive |
| `--obs-cyan-deep` | `#138b80` | Striped progress dark stop |
| `--obs-green` | `#56d96b` | Success |
| `--obs-yellow` | `#ffce3f` | Warning |
| `--obs-red` | `#ff5d5d` | Danger / error |
| `--obs-text` | `#eaf1f8` | Primary text (cool white) |
| `--obs-text-dim` | `#8ba2bb` | Secondary text |
| `--obs-text-mute` | `#566f8a` | Tertiary / footnotes |

**Text-on-fill:** on orange use `#0d1b2a` (`--obs-on-orange`); on cyan use `#06231f` (`--obs-on-cyan`). Never use white text on orange or cyan — contrast and the retro feel both suffer.

Accents share roughly equal chroma & lightness and only vary in hue — keep any new accent on that same ring (use `oklch`), don't introduce a brighter or more saturated color.

---

## 3. Typography

| Style | Font | Size | Use |
|---|---|---|---|
| Hero | Press Start 2P | 42px / 1.5 | Page hero, with `text-shadow: 5px 5px 0 #04080f` |
| H1 | Press Start 2P | 28px / 1.5 | Section titles |
| H2 | Press Start 2P | 20px / 1.5 | Sub-sections |
| H3 | Press Start 2P | 14px / 1.6 | Card titles, modal titles |
| Label | Press Start 2P | 10px | Buttons, tabs |
| Micro | Press Start 2P | 8px | Badges, table headers, eyebrows |
| Lead | VT323 | 24px | Intro paragraphs |
| Body | VT323 | 21px | Default body copy |
| Caption | VT323 | 19px | Secondary text, metadata |

- **Line-height** for Press Start 2P is generous (1.5–1.7) — the glyphs are tall and need breathing room.
- **Letter-spacing** `1px` on all display text.
- VT323 is the workhorse for anything longer than a few words; it stays readable down to ~18px.

---

## 4. Structure Tokens

| Token | Value |
|---|---|
| `--obs-border` | `3px solid #04080f` |
| `--obs-radius` | `0` (always) |
| `--obs-shadow-sm` | `3px 3px 0 #04080f` |
| `--obs-shadow-md` | `4px 4px 0 #04080f` |
| `--obs-shadow-lg` | `6px 6px 0 #04080f` |
| `--obs-shadow-xl` | `9px 9px 0 #04080f` |
| `--obs-inset` | `inset 3px 3px 0 rgba(0,0,0,.4)` (inputs/wells) |
| Spacing scale | 6 / 12 / 18 / 24 / 32 / 48 px (`--obs-sp-1`…`6`) |
| Transition | `0.08s` (`--obs-ease`) |

---

## 5. Components

All components are plain CSS classes prefixed `obs-`. Markup examples below; see `example.html` for the full set rendered.

### Buttons — `.obs-btn`
Modifiers: `--secondary` (cyan), `--ghost` (outline), `--danger` (red), `--sm`, `--lg`. State via `:hover` / `:active` / `:disabled` is built in.
```html
<button class="obs-btn">PRIMARY</button>
<button class="obs-btn obs-btn--secondary">SECONDARY</button>
<button class="obs-btn obs-btn--ghost">GHOST</button>
<a class="obs-btn obs-btn--lg" href="#">CALL TO ACTION</a>
```

### Cards / Panels — `.obs-panel`, `.obs-card`
`.obs-panel` is a padded container. `.obs-card` adds an optional `.obs-card__media` strip (diagonal-stripe placeholder) and `.obs-card__body`; add `.obs-card--hover` for the lift effect.

### Forms — `.obs-input`, `.obs-select`, `.obs-textarea`
Wrap selects in `.obs-select-wrap` for the ▼ chevron. Inputs use an inset shadow and focus to an orange border. Label with `.obs-field__label`.

### Checkbox / Radio / Toggle
Use a hidden native `<input>` plus a styled sibling — fully accessible & keyboard-operable:
```html
<label class="obs-toggle"><input type="checkbox" checked><span class="obs-toggle__track"></span><span class="obs-body">Label</span></label>
<label class="obs-check"><input type="checkbox"><span class="obs-check__box"></span><span class="obs-body">Label</span></label>
<label class="obs-radio"><input type="radio" name="g"><span class="obs-radio__dot"></span><span class="obs-body">Label</span></label>
```

### Badges — `.obs-badge`
Modifiers: `--cyan`, `--green`, `--yellow`, `--red`, `--outline`.

### Tabs — `.obs-tabs`
`.obs-tabs__list` > `.obs-tab` (active = `.is-active` or `aria-selected="true"`), then `.obs-tabs__panel`. Switching is wired in JS (see `example.html`).

### Progress / Loaders — `.obs-progress`, `.obs-dots`, `.obs-spinner`
Bar modifiers: `--green`, `--cyan`, `--striped` (animated). `.obs-dots` = 4 pulsing squares; `.obs-spinner` = stepped pixel spinner; `.obs-blink` for a blinking cursor.

### Tables — `.obs-table`
Orange header row, zebra body rows, hover highlight. Plain `<table>` semantics.

### Alerts / Toasts — `.obs-alert`, `.obs-toast`
Alert modifiers: `--success`, `--warning`, `--error` (default = info/cyan). `.obs-toast` is fixed bottom-right; toggle `display` in JS.

### Modal — `.obs-modal-backdrop` + `.obs-modal`
Backdrop dims to `rgba(4,8,15,.78)`; modal has an orange title bar (`.obs-modal__head`), `.obs-modal__body`, `.obs-modal__foot`. Toggle the backdrop's `display` in JS; close on backdrop click or `[data-close]`.

---

## 6. Do / Don't

**Do**
- Keep all corners square.
- Use solid, offset, non-blurred shadows.
- Reserve orange for the single most important action per view.
- Pair Press Start 2P (chrome) with VT323 (reading).
- Animate with `steps()` and short durations.

**Don't**
- Add `border-radius`, blur, or gradients-as-fills (diagonal *stripe patterns* are fine; smooth gradients are not).
- Set body copy in Press Start 2P.
- Introduce new high-saturation colors outside the accent ring.
- Use white text on orange/cyan fills.
- Add drop-shadow blur or glow (the kit is flat + offset, not neon).

---

## 7. Imagery

There are **no decorative SVG illustrations** in this system. Real artwork (sprites, screenshots, key art) goes in `.obs-image-slot` placeholders — a diagonal-striped well with a monospace caption describing what belongs there (e.g. `[ game screen capture ]`). Replace with real assets at build time. Sprites should be pixel art rendered with `image-rendering: pixelated`.

## 8. Responsive (T-040)

The kit is **desktop-first**. All component rules describe the desktop design; a single **additive**
mobile band overrides only spacing, type size and tap targets, so **above the breakpoint the rendering
is byte-identical to the desktop design**.

| Band | Range | Behaviour |
|------|-------|-----------|
| Mobile | ≤ 600px | The `@media (max-width:600px)` block in `obsidian.css` §15: tighter container/section/panel/modal padding, `font-size:18px` inputs (no iOS auto-zoom), `min-height:44px` tap targets (WCAG 2.5.8 min 24px; 44px is the iOS/best-practice benchmark), full-width toast. |
| Tablet / iPad | 601–1024px | **Desktop layout** — no dedicated tablet design; add a targeted rule only if real content breaks. |
| Desktop | ≥ 1025px | The base design, unchanged. |

Rules:

- **Never edit a base rule to make mobile work.** Add a `@media (max-width:600px)` override instead — that is what keeps desktop pixel-identical.
- Wrap anything intrinsically wide (a `.obs-table`, a `.obs-tabs` strip) in **`.obs-scroll-x`** so it scrolls horizontally rather than overflowing the page.
- Always ship `<meta name="viewport" content="width=device-width, initial-scale=1.0">` (see `example.html`).
