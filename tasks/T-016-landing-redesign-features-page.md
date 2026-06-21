---
id: T-016
title: Redesign the landing and add a Features menu item
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-06-21
updated: 2026-06-21
target-version: 0.2.0
links: [T-015, LANDING_BRAINSTORM.md]
blocked-by: []
---

# T-016 — Redesign the landing and add a Features menu item

## Context

After the rebrand to Pokémon Emerald Cut (T-015), the front-end landing still
reads like the old generic randomizer (big "A whole new Hoenn" title, three glass
cards). The product is really a 2-in-1 (QoL romhack + balanced randomizer with
per-run docs); the pitch and full feature list already exist as prose in
`LANDING_BRAINSTORM.md`. This task reshapes the landing around that pitch and
surfaces the full feature list under its own top-nav menu item.

## Plan

Front-end only (`frontend/index.html`, `frontend/css/*.css`, `frontend/js/app.js`).

- Landing hero: drop the brand eyebrow; the big title becomes **Pokémon Emerald
  Cut**; keep the slogan; replace the subtitle with the brainstorm's one-liner.
- Replace the three glass cards with two boxes: **What is this?** (the 2-in-1
  pitch, ending in a CTA that navigates to the Features menu item) and **What's
  in the future?** (the roadmap bullets).
- Add a **Features** top-nav menu item → a Features section with **3 subtabs**:
  ROM / Randomizer / Generated docs (from brainstorm §3.2/§3.3/§3.4). The two
  generic bullets (§3.1) become "highlights" in the Features header so nothing
  is lost. Copy is taken from `LANDING_BRAINSTORM.md` with light typo fixes.
- Reuse existing tab routing (`setActiveTab`, `data-tab`) and the Obsidian kit
  (`.card`, `.btn`); add a small subtab switcher + a `[data-goto-tab]` handler.

Acceptance criteria:
- [x] Top nav has Home / Features / Randomizer; Features opens the new section.
- [x] Landing title = "Pokémon Emerald Cut" (no eyebrow), slogan kept, new subtitle.
- [x] "What is this?" + "What's in the future?" boxes render; the CTA jumps to Features.
- [x] Features section shows 3 working subtabs with the brainstorm content.
- [x] No regressions to the Randomizer wizard; `app.js` loads without error.
- [x] User reviews the look and confirms direction.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-21** — Task created. Decided 3 subtabs (ROM/Randomizer/Docs) per the
  user's instruction; folded brainstorm §3.1 "Generic features" into Features
  header highlights to avoid dropping content (brainstorm has 4 sub-sections).
  The landing CTA links to the Features *menu item* (not a browser tab), via a
  new `[data-goto-tab]` handler reusing `setActiveTab`.
- **2026-06-21** — Implemented in `frontend/index.html` (hero rewrite, two info
  boxes, Features section with 3 subtabs), `frontend/css/layout.css` (info boxes,
  feature lists, subtabs) and `frontend/js/app.js` (`[data-goto-tab]` + subtab
  switcher). Light typo fixes applied to the brainstorm copy. `app.js` validates
  as a module; tabs↔sections and subtabs↔panels verified consistent. User
  confirmed ("Está genial"). Closed alongside [[T-015]].

## Outcome

Landing reshaped around the product pitch: title is now **Pokémon Emerald Cut**
(eyebrow dropped), slogan kept, new one-line subtitle; the three old glass cards
were replaced by **What is this?** (2-in-1 pitch + CTA) and **What's in the
future?** boxes. Added a **Features** top-nav menu item with three subtabs — ROM,
Randomizer, Generated docs — populated from `LANDING_BRAINSTORM.md` §3.2–§3.4,
with §3.1's two generic bullets surfaced as header highlights. Front-end only;
no pipeline/test impact. Deviation: brainstorm has 4 feature sub-sections but the
user asked for 3 subtabs — resolved by folding §3.1 into the header (revisit if a
4th "General" subtab is wanted).
