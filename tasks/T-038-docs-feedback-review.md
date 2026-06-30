---
id: T-038
title: Documentation feedback review and improvements
status: done
type: docs
created: 2026-06-29
updated: 2026-06-30
target-version: 0.3.1
links: []
blocked-by: []
---

# T-038 — Documentation feedback review and improvements

## Context

The user is reviewing the project documentation and will provide a list of feedback
items. This task collects that feedback, tracks the agreed changes, and records what
ships. Example material the user shares to illustrate the feedback lives in
[assets/T-038/](assets/T-038/) so we share a common reference.

Docs live under `docs/` (indexed by `docs/INDEX.md`), `randomizer/docs/`, ADRs in
`docs/adr/`, and `CLAUDE.md`. See the SSOT rules in `CLAUDE.md` — fixes go to each
fact's single home; drift is repaired, not propagated.

## Plan

1. Receive the user's feedback list (and any example assets dropped in
   [assets/T-038/](assets/T-038/)).
2. For each item, agree on the fix and its home (which doc / ADR / index).
3. Apply changes respecting SSOT (link, don't copy; derive, don't duplicate).

Acceptance criteria:
- [x] Every feedback item is logged below with its resolution (done / deferred / rejected + why).
- [x] Doc changes respect SSOT and `docs/INDEX.md` stays complete.
- [x] No generated/derived files hand-edited.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-29** — Task created. Set up `assets/T-038/` for shared example material. Awaiting the feedback list.
- **2026-06-29** — First feedback batch: landing-page copy (`frontend/index.html`). Resolutions:
  - **Slogan** — dropped the trailing period ("…controlled chaos."→"…controlled chaos"). Applied in both homes: landing (`index.html`) and the docs-viewer header (`template.html`) for consistency. **done**
  - **"What is this?" two descriptions** — restructured the two paragraphs into a numbered `<ol class="info-2in1">` (the requested list indicator) so the "2-in-1" reads as items 1 & 2; led each with an orange `<strong>` term. New CSS in `frontend/css/layout.css` draws square ember number plaques (hard edges + offset shadow) to match the Obsidian pixel theme — `--radius:0`, so no rounded dots. Copy professionalised: romhack item ("Pokémon through Gen 9, plus Megas"; "cuts the story down to the essentials"), randomizer item (dropped "VERY controlled chaos"/"by balanced I mean…", ends "A randomizer for controlled chaos"). **done**
  - **Full feature list review** (ROM / Randomizer / Generated-docs subtabs + features header + landing subtitle) — polished grammar, parallelism and flow with no change to game facts. Kept Oxford spelling consistent with the existing copy (American `-ize`: "customizable/randomized"; British `-our`: "favoured/favourite/colour"). E.g. "6 vs 6"→"6-vs-6", "the most fair battles possible"→"the fairest battles possible", "Evolve candy"→"Evolution candy". **done**
  - Frontend test harness green (`cd frontend && npm test`, 4/4); no test asserts on this copy. No generated/derived files touched.
  - Awaiting the user's next feedback items (and any manual review of the landing) before closing.
- **2026-06-29** — Feedback: em dashes read as "very AI". Scoped (per user) to the Home and Features tabs only in `frontend/index.html`. Removed all 18 em dashes there (19 chars; L291 had a pair), each recast with a different construction rather than a single replacement: sentence splits, colons, parentheses, comma clauses, "For example,". Out-of-scope em dashes left untouched (auth modal L44; Generate tab L199/L215). Verified 0 em dashes remain in lines 68–118 and 244–333. Frontend tests green (4/4). **done**
- **2026-06-29** — Feedback: the nuzlocke tracker is important enough to surface in the core, not only the features list. Added it to core item 2 of the "What is this?" box: "…full documentation for every run, and those docs double as a built-in nuzlocke tracker." No em dash, Oxford spelling kept; the features-header highlight already mentioned it, so the two stay consistent. Frontend tests green (4/4). **done**
- **2026-06-30** — Feedback batch on the generated doc viewer (`frontend/template.html`), reference output in `assets/T-038/rom-0.html`. Three areas:
  - **Encounters** — (1) route title now centred (`.meta` got `justify-content:center` after the badge removal). (2) New `getEncounterIcon()` maps each slot to pixel icons: grass→grass; old/good/super rod→nerfed/buffed/star + fishingrod; surf & underwater→moves; static→boss; legendary→star+boss; reward→reward; special→star. (3) Type label promoted from 12px to 19px (`.enc-type-label`, matches old name size) and poke name bumped to 22px (`.nz-poke-name`). (4) Removed the redundant header badges (BOSS REWARD / STATIC ENCOUNTER / LEGENDARY) — the per-slot icon+label already conveys it. (5) Wired `stopwatch.png` to the delay control and the location stopwatch badge (was the `clock` fallback emoji). Regenerated `frontend/data/assets.json` so grass/fishingrod/stopwatch embed. **done (pending user visual check)**
  - **PC** — Available/Fainted toggles given a dedicated `.filter-chip.pc-view-btn` (VT323 20px instead of the shared 8px Press Start 2P chip) + icons: `pokeball.png` on Available, `fainted.png` on Fainted. **done (pending user visual check)**
  - **Trainers** — user wants a full reimagining; asked for multiple options in an artifact to iterate. Built a design-studio artifact (3 directions: A Trainer Card / B Roster Sheet / C VS Banner) rendered with the real Obsidian theme, fonts, sprites and generated data (Flannery boss + a Youngster, toggle to compare). Same elements, recomposed. No template change yet — awaiting the user's pick/mix. Artifact: https://claude.ai/code/artifact/1f694f2f-de0a-4272-8e24-9c4b91db6cdf
  - Frontend tests green (4/4). Builder script + exported assets kept in scratchpad (not committed).
- **2026-06-30** — Trainers: user picked **Option B (Roster Sheet)**. Implemented in `frontend/template.html`:
  - New CSS block at end of `<style>` (`.roster`, `.roster-rail`, `.roster-portrait`, `.roster-lv`, `.roster-loc`, `.roster-team`, `.roster-row`, `.roster-moves`) — `.trainer-card` overridden to `display:block;padding:0;overflow:hidden` so the rail bleeds to the card edge. Boss/partner tint the rail via `specialCard`/`partnerCard`.
  - Rewrote the trainer render: card = `.roster` grid (204px rail + team). Rail = name (`.title`, keeps the defeat line-through hook) + framed portrait + Lv chip + location chip + rewards + Defeated toggle. Team = dense `.roster-row`s (sprite 60 · name+item/ability/nature · 2×2 move grid). No-move members collapse to 2 columns.
  - Preserved every JS hook: `.trainer-poke`/`poke-SPECIES_*` (click→modal), `.title` (defeat strikethrough), `.nz-defeat-cb[data-trainer-id]`, `specialCard`/`partnerCard`/rival classes, dataset attrs. Bumped `.trainer-grid` min column 400→500px for the wider card.
  - Verified: `node --check` on the trainer script (OK); ran the render loop against a DOM shim with boss + normal trainers (all structure/hooks present); regenerated a full preview doc from `rom-0.html`'s real data through the updated template (0 leftover tags/font tokens, 206 trainers). Preview for visual check: `scratchpad/rom-preview.html`. Frontend tests green (4/4).
- **2026-06-30** — Encounters tweak (user: nerf/buff/star + rod was confusing): rods now show the fishingrod icon **alone** (old/good/super) — the text label disambiguates. Encounter type-label icons shrunk `1.1em`→`0.9em` to match the text. star stays for Special, star+boss for Legendary.
- **2026-06-30** — Trainers Roster Sheet refinements after the user's 2nd screenshot:
  - **Full-width trainers**: `.trainer-grid` → single column (`1fr`) so each trainer spans the content width; team rows flow in a multi-column grid (`.roster-team` → `auto-fill minmax(400px,1fr)`) instead of one stretched column.
  - **One-line meta**: Ability · Nature · Item now render on a single line (`.rm-ability/.rm-nature/.rm-item/.rm-sep` spans) — removed the `<br>` that forced 2-3 lines and the vertical-centering wobble.
  - **Details on hover**: nature shows the name only (e.g. "Hasty"), with the stat spread ("+Spe / -Def") in a tooltip; ability shows its description on hover (from `abilitiesData`); each move chip shows description + "Power · Acc · PP" on hover (from `movesData`). Tooltip CSS updated to `white-space:pre-line; max-width:280px` so multi-line tooltips wrap/break; dropped `overflow:hidden` on `.trainer-card` so tooltips aren't clipped.
  - Verified against real data via the DOM shim (ability/nature/move tooltips resolve to real descriptions); preview regenerated; frontend tests green (4/4).
- **2026-06-30** — Three more Roster tweaks: (1) nature tooltip now spells stats out in full (`+Atk / -Spd` → `+Attack / -Special Defense`) via an abbreviation expander. (2) Team back to a **single full-width column** per trainer (`.roster-team` → flex column) — the 2-column grid felt cramped at the user's resolution. (3) Held-item icon switched from the 🎒 emoji to `pokeball.png` (`getIcon('pokeball')`). Verified item/nature markup via the shim; preview regenerated; frontend tests green (4/4).
- **2026-06-30** — Card-sizing study + fix. Built an interactive artifact (3 width/layout iterations A/B/C of the Pokémon card, live width slider, real Tiana/Sawyer data): https://claude.ai/code/artifact/b418577e-1e64-410d-aabe-87cd51525fab. User picked **A** but clarified the real issue: cards were *stretching* (`1fr`), which isolated the moves far right on wide screens. Fix: Pokémon cards are now **fixed-width, no stretch** — `.roster-team` → `flex-wrap`, `.roster-row` → `width:640px; max-width:100%`. The team fits as many fixed cards per row as the width allows and wraps the rest (1 col at the user's res, 2 when team area ≥ ~1290px). Moves stay close to the info at any size. Trainer cards left full-width for now (pokemon-cards-wrap vs trainer-cards-2-up is an either/or; went with the former per latest feedback). Preview regenerated; frontend tests green (4/4).
- **2026-06-30** — Batch of 6 (template.html):
  1. **Move chips don't stretch** — `.roster-moves` got `align-items:start` so a shorter chip keeps its height and leaves a gap instead of doubling to match a taller neighbour; chip text also flex-centred.
  2. **Collapsed Mail badge** — when the menu is collapsed the envelope now centres and the unread count sits as an absolute bottom-right bubble (`a[data-target="mail"]{position:relative}` + `#mail-bubble{position:absolute}`), instead of icon+count drifting off-centre.
  3. **Wider collapsed sidebar** — `.right.nav-collapsed` 50px → 64px.
  4. **Top bar with run stats** — new sticky `.topbar` (id `topbar`) holding the brand title + four stat tiles: **Level cap** (orange), **Pokémon in box**, **Deaths** (red), **Next boss** (cyan). `refreshCap()` rewritten to update all four (+ `nextBossLabel()`); added `refreshCap()` to `onBoxMaybeChanged` so box/deaths update live on capture/faint. A 📌 button unpins the bar (→ `position:static`, persisted in localStorage); JS measures the bar height into `--tbh`, which offsets the sticky sidebar below it. Old `header.top`/level-cap-readout removed.
  5. **Brand title** — replaced "Pokémon Emerald Cut" + slogan with just **"Emerald Cut"** in `--obs-green`, the `emeraldCut` logo standing in for the "C" of Cut (same technique as the landing `.title-accent`/`.title-logo`), sized for the bar and respecting the 40px document margin (`.topbar-inner` padding matches `.main`).
  6. **Reset All Data hidden when collapsed** — `.right.nav-collapsed #reset-all-btn{display:none}`; only shows when the menu is expanded.
  - Verified: all 16 inline scripts `node --check` clean; cap/next-boss logic checked against real `bossCaps` (fresh→cap 7 "Rival – Route 103"; after 2 bosses→cap 12 "Roxanne – Badge 1"). Preview regenerated & served; frontend tests green (4/4).
- **2026-06-30** — Batch of 5 (template.html):
  1. **Encounters slot consistency** — slots were `minmax(100px,1fr)` auto-fill so their size changed with viewport (squished on wide screens). Now a fixed grid: `.enc-slots` = `grid-auto-flow:column; grid-template-rows:repeat(3,auto); grid-auto-columns:168px` → at most 3 rows, columns = ceil(N/3) (3 mons→1 col, 4→2, 6→2, 7→3). Slot width constant on resize. `#wildpokes-cards` → flex-wrap and `.location-card{width:max-content}` so each location card hugs its grid and extends with its pokémon count. (Trainers layout untouched.)
  2. **Collapsed sidebar** — widened 64→80px; fixed the off-centre active marker: the hidden `.nav-text` was still consuming the flex `gap`, nudging the icon left — `.right.nav-collapsed .nav a{gap:0}` centres it.
  3. **Reset All Data in collapsed menu** — the earlier `display:none` lost to the button's inline `display:flex`; now `display:none !important`, so it's truly hidden when collapsed.
  4. **Top-bar stat icons** — each tile gets a small pixel icon: Level cap→buffed, Pokémon in box→pc, Deaths→fainted, Next boss→boss (`.tb-stat` → row with `.tb-ico` + stacked `.tb-col`).
  - Preview regenerated & served; frontend tests green (4/4).
- **2026-06-30** — User added `pinned.png` / `unpinned.png`. Wired into the top-bar pin button: `applyPinned()` now sets `pin.innerHTML = getIcon(pinned?'pinned':'unpinned', emojiFallback)` (PNG with emoji fallback); `.topbar-pin .ico{height:18px}`. Regenerated `frontend/data/assets.json` (28 assets, pinned/unpinned embedded). Preview regenerated; frontend tests green (4/4).

- **2026-06-30** — Final tweak: buff/nerf/adjusted name icon resized per context (`.nz-poke-name .ico` & `.roster-pname .ico` → 0.72em; `.modal-content .title .ico` → 1.45em). User confirmed the whole batch — closing.

## Outcome

Shipped a broad redesign of the generated doc viewer (`frontend/template.html`), iterated live with the user over a regenerated preview and two design-study artifacts (trainer-layout options + a card-sizing study). What landed:

- **Encounters** — pixel icon per slot type (grass / rods / surf+dive / static / legendary / reward / special; fishing rods show the rod alone after the nerf/buff/star combos read as confusing), bigger type label + name, dropped the redundant header badges, `stopwatch.png` wired to the delay control. Slots are now a fixed-size grid (168px, ≤3 rows, columns = ceil(N/3)) so they no longer get squished on resize; location cards hug their content and wrap.
- **Trainers** — full "Roster Sheet" redesign (dossier rail + dense team cards) chosen from an artifact of 3 directions. Pokémon cards are fixed-width (640px) and wrap (no stretch); ability·nature·item on one line with hover tooltips (ability text, nature stat spread spelled out in full, move power/acc/pp); held-item icon = pokeball; move chips don't stretch to a tall neighbour.
- **PC** — Available/Fainted toggles enlarged with pokeball/fainted icons.
- **Top bar** — new sticky brand bar ("Emerald Cut" with the logo as the "C") + four live run stats (Level cap / Pokémon in box / Deaths / Next boss), each with a small icon; a pin button (pinned/unpinned PNGs) toggles sticky↔static, persisted.
- **Sidebar** — wider when collapsed, active marker re-centred, Reset All Data hidden when collapsed, collapsed Mail shows a bottom-right unread bubble.

Deviations: scope grew well beyond "doc feedback" into a UI overhaul, but stayed within `frontend/template.html` (+ new icon assets) — no `docs/` changes were needed, so `docs/INDEX.md` is untouched. The icon set (`grass, fishingrod, stopwatch, pinned, unpinned`, tweaked `adjusted`) was added by the user; `frontend/data/assets.json` is regenerated by `build.js` (not committed). Reference material in `tasks/assets/T-038/` (screenshots + a generated preview doc) kept local, not committed. No follow-up tasks spawned. Verified throughout via `node --check` on all inline scripts, DOM-shim render checks, logic checks against real `bossCaps`, and the frontend test harness (4/4 green).
