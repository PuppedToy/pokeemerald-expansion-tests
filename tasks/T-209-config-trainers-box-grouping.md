---
id: T-209
title: Keep Steven-tag & evil-types inside the "Trainers & bosses" box
status: proposed        # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-052, T-076, T-165]
blocked-by: []
---

# T-209 — Keep Steven-tag & evil-types inside the "Trainers & bosses" box

## Context

In the randomization settings, the **Trainers & bosses** category renders its fields across several separate
`.card-glass` boxes. **"Disable Steven tag battle"** and the **evil-team (Aqua/Magma) type selectors** appear
**decoupled** — as their own boxes after the first box ends at "Champion type change". This is inconsistent
with the rest of the app, where a category's options live in one box. The fix: instead of **closing** the box
after "Champion type-change" and **opening new ones**, keep everything in the **same** `.card-glass` box.
Related: [T-052](T-052-configurable-randomization-options.md) (categorized settings),
[T-076](T-076-unified-boss-type-pool.md) (champion type-change), [T-165](T-165-disable-steven-tag-battle.md)
(Steven tag option).

### Findings from the current code
All in one template string in `frontend/js/config-form.js`, inside `data-cat="trainers"` (`:1463`, title `:1465`):
- First `.card-glass` opens `:1468` → Gyms changed types (`:1470`), Elite Four changed types (`:1475`),
  **Champion type-change chance (`:1480`)**; the box **closes at `:1484`**.
- **New** box `:1485-1493` → "Disable Steven tag battle" (`:1488`, checkbox `#disable-steven-tag-battle :1491`).
- **New** box `:1494-1498` → Team Aqua types (`teamTypeSelectors('aqua', …) :1496`).
- **New** box `:1499-1503` → Team Magma types (`teamTypeSelectors('magma', …) :1501`).
- Category/section close `:1504-1505`.
- **Fix point:** at `:1484/:1485`, don't close the first `.card-glass` and reopen new ones — keep Steven-tag +
  Aqua + Magma inside the same card (as inner sub-sections). `config-form.js` is served directly (not the
  randomizer worker bundle), so no `node build.js` rebuild is needed.

## Plan

Merge the three trailing boxes into the first `.card-glass` so the whole Trainers & bosses category is one box;
preserve field order, labels, ids and read/set wiring. Visual/overflow check.

Acceptance criteria:
- [ ] "Disable Steven tag battle" and both evil-team type selectors render inside the same box as the gym/E4/
      champion type options (one `.card-glass` for the category).
- [ ] No field ids/values changed; save/load/reset still round-trips these options.
- [ ] Frontend tests green; no horizontal overflow (`npm run shoot` overflow check).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Located the box boundaries in `config-form.js`: first card closes at
  `:1484`, then separate cards open for Steven-tag (`:1485`), Aqua (`:1494`) and Magma (`:1499`). Fix is to keep
  them in the first card instead of reopening.

## Outcome

<!-- Filled when closing. -->
