---
id: T-006
title: Finish aligning the docs with Obsidian (flatten leftovers) + pixel-icon wiring
status: done
type: feature
created: 2026-06-20
updated: 2026-06-20
links: [tasks/T-004-docs-overhaul.md]
blocked-by: []
target-version: 0.1.0
---

# T-006 — Docs Obsidian polish + pixel icons

## Context

After the T-004 re-skin, a user review (rendered doc in `tasks/T-006-Assets/`) shows some
doc elements still read non-retro: rounded corners and a gradient badge that survived because
they are **inline styles in the render JS** (the appended CSS overrides can't beat inline
styles), plus the color **emojis** used for nav icons / markers / nuzlocke controls break the
pixel aesthetic.

Remaining offenders found (template.html): inline `border-radius` on the tier badge (~L897),
`.trainer-poke`/`.wild-poke` cards (~L1106/1235, also a glassy white bg), flag pills (~L1305),
a button (~L649); the LEGENDARY badge uses a `linear-gradient` text fill (~L1251).

Emoji inventory + proposed pixel-icon replacements are recorded in the progress log.

## Plan

A. **Flatten leftovers (CSS-level, beats inline):**
   - Add `*,*::before,*::after{ border-radius:0 !important }` to the doc → square every corner
     including inline-styled ones.
   - Override `.trainer-poke`/`.wild-poke` default background to `--obs-well` (nuzlocke state
     classes keep winning by specificity).
   - Replace the LEGENDARY badge `linear-gradient` text fill with a flat Obsidian color (edit
     the inline style in the render JS).

B. **Pixel-icon mechanism (incremental):**
   - Add a `getIcon(name, fallbackEmoji)` helper: returns an `<img class="ico">` from
     `EMBEDDED_ASSETS['icons/<name>.png']` (T-004 asset mechanism) when present, else the emoji
     fallback. `.ico{ height:1em; image-rendering:pixelated; vertical-align:middle }`.
   - Convert the emoji sites to `getIcon(...)` so that, as the user drops PNGs into
     `frontend/assets/icons/`, they auto-replace the emoji with zero breakage in between.
   - Mirror the few app-side emojis (index.html / config-form.js / app.js) once icons exist.

## Acceptance criteria
- [x] No rounded corners anywhere in a generated doc (incl. tier badges, poke cards, flag pills) — verified by headless screenshots.
- [x] No gradient fills; LEGENDARY badge is flat Obsidian.
- [x] `getIcon()` wired at every emoji site; with no PNGs present the doc still renders (emoji fallback); dropping a matching PNG into `frontend/assets/` (or `icons/`) swaps it in (verified with the user's encounters/trainers/pokedex/reward/location PNGs).
- [x] App (`index.html`) and docs interactivity unaffected; `cd randomizer && npm test` green; `node scripts/check-tracker.mjs` green.

## Progress log

- **2026-06-20** — Task created. Audited remaining non-retro elements (inline rounded styles + legendary gradient) and the full emoji inventory.
- **2026-06-20** — Review round 2 (doc `docs-rom-0-3897080029`): (1) menu icons read small → bumped `.nav-icon` to 20px and nav `img.ico` to 24px. (2) wired the new `reward.png` (getIcon `gift`→`reward`). (3) trainer-team moves hard to read → redesigned `.move-item`: dark `--obs-well` background, type shown as a 7px left-accent stripe (`border-left-color` set inline), move name in light VT323 17px left-aligned (was 10px dark text on the type fill). (4) tier badges looked like type chips → new `.tier-badge` raised plaque (3px border + `--obs-shadow-md` offset shadow, Press Start 2P), tier color kept as fill, clearly distinct from the flat `.type` chips. Verified all four by headless screenshot (trainers + pokedex).
- **2026-06-20** — Review round 3: user clarified the move-readability issue was font size, not colour — reverted `.move-item` to the full type-colour fill (dark centered text) but kept the larger box and bumped the font to 19px VT323. Wired the new `location.png` (getIcon `pin`→`location`). Confirmed both by screenshot.
- **2026-06-20** — Added a stepped spin to the app's generating gear: `#gen-running .generate-icon img { animation: gen-gear-spin 1.2s steps(12) infinite }` (steps() = retro, per the kit). Only animates while the generating view is shown. (Headless screenshots freeze CSS animations at t=0, so motion is verified live in-browser, not by screenshot.)
- **2026-06-20** — Implemented flatten (global `border-radius:0!important` to beat inline styles; legendary gradient → flat; BOSS/STATIC off-palette → cyan/red; `.trainer-poke`/`.wild-poke` → flat well) and the icon mechanism. Discovered the user places icons at `frontend/assets/<name>.png` (root, simple names, 16×16) rather than the originally-proposed `icons/nav-*.png`; aligned `iconAsset()`/`getIcon()`/`data-icon` to resolve `<name>.png` (root) or `icons/<name>.png`, and updated the table. App side: added `.px-icon` and wired the generate-step ⚙ to `/assets/generating.png`. Verified by headless screenshots: docs nav shows the user's `encounters.png`/`pokedex.png`/`trainers.png`; unmade ones (moves/abilities) fall back to emoji; app generate step shows `generating.png`. Suite 415 green; build green.

### Emoji → pixel-icon substitution table

**Convention (matches what the user started):** drop PNGs in **`frontend/assets/<name>.png`**
(root; `icons/<name>.png` subfolder also resolves). ~16×16 RGBA, Obsidian palette. They
auto-embed (build.js → assets.json → EMBEDDED_ASSETS) and the doc swaps the emoji for the
PNG via `getIcon(name, emoji)` / `data-icon="name"`; until a file exists the emoji shows.

Docs (wired — file name the doc looks for):
| Emoji | Use | File | Status |
|---|---|---|---|
| 🗺️ | nav Encounters | `encounters.png` | ✅ created |
| ⚔️ | nav Trainers | `trainers.png` | ✅ created |
| 📖 | nav Pokedex | `pokedex.png` | pending |
| ⚡ | nav Moves | `moves.png` | pending |
| ✨ | nav Abilities | `abilities.png` | pending |
| ⚠️ | Reset All Data | `warning.png` | pending |
| ❤️ | footer | `heart.png` | pending |
| ⭐️ | BUFF / BST up marker | `star.png` | pending |
| 🔻 | NERF / BST down marker | `arrow-down.png` | pending |
| 🔧 | mutated (mixed) marker | `wrench.png` | pending |
| ✦ | LEGENDARY badge | `legendary.png` | pending |
| 🎁 | trainer reward | `gift.png` | pending |
| 📍 | trainer location | `pin.png` | pending |
| 💀 | nuzlocke fainted | `skull.png` | pending |
| ⏱ | nuzlocke delay / stopwatch | `clock.png` | pending |
| ✓ | nuzlocke captured | `check.png` | pending (optional) |

App (index.html / config-form.js / app.js) — wiring TBD in this task:
| Emoji | Use | File | Status |
|---|---|---|---|
| ⚙️ | generating | `generating.png` | ✅ created |
| ⚖️ | landing "Rebalanced tiers" | `tiers.png` | pending |
| 🎲 | landing "Fully seeded" | `dice.png` | pending |
| 🔗 | landing "Soul-Link" | `link.png` | pending |
| 📦 | generation complete | `package.png` | pending |
| ⬇️ | download buttons | `download.png` | pending |

Monochrome symbols left as pixel-font glyphs (optional): `✗`/`✖` close, `→`/`←` arrows, `↺` reset, `➕` log-plus, `☑` select.

## Outcome

- **2026-06-20** — User confirmed ("lo veo bien por ahora, cierra"). Closed; committed and merged to master.

**Shipped:** The docs now read as fully Obsidian — a global `border-radius:0 !important` flattens
every corner (including inline-styled tier badges, poke cards and flag pills that the appended CSS
couldn't otherwise beat); the LEGENDARY gradient and the off-palette BOSS/STATIC colours are flat
Obsidian; `.trainer-poke`/`.wild-poke` rows use a flat well; tier badges became a raised plaque
(3px border + offset shadow) clearly distinct from type chips; trainer-team moves are full type
colour with a larger 19px readable name; menu icons enlarged.

A reusable emoji→pixel-icon mechanism shipped: `getIcon(name, emoji)` (JS-rendered sites) and
`data-icon` (static markup) resolve `frontend/assets/<name>.png` (or `icons/<name>.png`), falling
back to the emoji until a PNG exists, so the user adds icons incrementally with zero breakage.
Wired across all doc emoji sites + the app's generating gear (which also spins, stepped). Verified
swap-in with the user's `encounters/trainers/pokedex/generating/reward/location` PNGs.

**Deferred (not blocking):**
- Remaining doc icon PNGs (`moves`, `abilities`, `star`, `arrow-down`, `wrench`, `legendary`,
  `warning`, `heart`, `skull`, `clock`, `check`) — they swap in automatically as the user creates
  them; emoji fallback until then.
- Full app-side emoji→icon wiring beyond the generating gear (`tiers`/`dice`/`link`/`package`/
  `download`) — left for when those PNGs exist; can be a small follow-up.

**Follow-ups:** none opened; the deferred items are drop-in (no code needed for the doc icons).
