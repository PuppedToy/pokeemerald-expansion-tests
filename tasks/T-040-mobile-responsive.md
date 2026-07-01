---
id: T-040
title: Mobile-responsive frontend & generated docs viewer
status: done
type: feature
created: 2026-07-01
updated: 2026-07-01
target-version: 0.5.0
links: [docs/adr/ADR-009-frontend-test-harness-zero-dep.md, T-038, T-039, B-015, B-016]
blocked-by: []
---

# T-040 — Mobile-responsive frontend & generated docs viewer

## Context

The web app (`frontend/`) and the generated documentation viewer (`frontend/template.html`) are
desktop-only: a single `@media (max-width:600px)` query in the app and three partial (one broken)
queries in the viewer, everything `px`-based, the top-nav and docs sidebar don't collapse, touch
targets aren't finger-sized. We want phones/tablets usable **while keeping desktop EXACTLY as today**.
The viewer was just polished ([T-038](T-038-docs-feedback-review.md), [T-039](T-039-encounters-viewer-polish.md),
[B-015](../bugs/B-015-topbar-not-sticky-scrolls-away.md), [B-016](../bugs/B-016-trainer-card-overexpands-wide.md),
shipped in 0.4.0) → desktop regression there is the top risk.

Full approved plan: `~/.claude/plans/floating-bouncing-music.md` (mirrored here). This task owns the work.

## Plan

**Safety invariant:** additive `max-width` media queries only — no base/desktop rule is edited, so above
the breakpoint the output is byte-identical to today. Proved by locking desktop screenshots + a CSS-text
guard before any edit.

**Confirmed decisions (owner):**
- Testing = **two layers**: fast zero-dep structural guards (`node --test`, per [ADR-009](../docs/adr/ADR-009-frontend-test-harness-zero-dep.md))
  stay primary; **Playwright** added as an **isolated dev-only tool** (never a runtime dep) for real
  cross-viewport screenshots, visual-regression baselines and the agent's autonomous preview.
- **iPad = desktop first** (≥768px uses desktop layout; targeted fixes only where screenshots break).
- **Mobile nav = hamburger + off-canvas drawer** for the app top-nav and the docs sidebar.
- **Do NOT unify** the three CSS sources (kit / app / viewer-inline); the kit is the documented SSOT for
  the breakpoint scale + mobile rules, applied consistently to each consumer.

**Breakpoints (documented in the kit):** mobile ≤600px (primary), ≤380px sanity, tablet/iPad 601–1024px
(desktop layout + targeted fixes), desktop ≥1025px (unchanged). Keep existing working queries (760px roster).

**Phases:** 0 visual/shoot harness (`visual-tests/`) → 1 lock desktop baselines → 2 kit responsive layer →
3 app responsive (drawer/modal/wizard/forms/settings) → 4 viewer responsive (sidebar drawer, top-bar
reflow, fix broken 1000px query; preserve B-015/B-016 + T-038/T-039) → 5 zero-dep guards → 6 finalize
visual suite (desktop == baseline) → 7 ADR-010 + docs/INDEX + CHANGELOG.

Acceptance criteria:
- [x] Desktop rendering unchanged: desktop (1440) + iPad screenshots equal the pre-change baselines (visual suite 70/70; desktop+iPad match the lock), and the structural guards confirm additive-only changes.
- [x] App (home, features, wizard, settings, auth modal, reset, verify) usable at 375px: no horizontal overflow, nav via hamburger/drawer, touch targets ≥44px.
- [x] Generated docs viewer usable at 375px (all tabs): sidebar as off-canvas drawer, top-bar stats reflow, no overflow; B-015/B-016 and T-038/T-039 desktop details intact.
- [x] obsidian-ui-kit ships a documented responsive layer + breakpoint scale; `example.html` has viewport meta.
- [x] Zero-dep responsive guards added and green (frontend 14/14); `backend` 94/94; `randomizer` 473/473 (<2s, no new deps).
- [x] `visual-tests` Playwright suite runnable (70/70); `npm run shoot` produces per-viewport PNGs for agent review; ADR-010 recorded and linked in docs/INDEX.
- [x] Owner manually tested on the phone (live on PRO) and confirmed OK ("muy buen responsive, se ve perfecto") — 2026-07-01.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-01** — Task created. Explored the four surfaces (app frontend, obsidian-ui-kit, generated
  docs viewer, test infra) + researched mobile best practices (WCAG 2.5.8 24px min / 44–48px best-practice
  touch targets, mobile-first, viewport meta). Key findings: kit is 100% desktop (zero media queries) and
  **not imported** by the app (tokens copied into `frontend/css/base.css`); viewer has a broken
  `@media (max-width:1000px)` (targets `.app` as grid, real layout is `.main` flex); repo is zero-dep
  (ADR-009, `node --test` + hand-rolled DOM stub) so visual snapshots need a new isolated tool. Owner
  chose two-layer testing, iPad-as-desktop-first, hamburger/drawer nav. Plan approved; branch
  `feature/T-040-mobile-responsive` off master (develop absent; recent tasks shipped on master).
- **2026-07-01** — **Phase 0 (harness)** done: isolated `visual-tests/` (Playwright dev-only, gitignored
  binaries). `fixtures/build-doc-sample.cjs` reproduces the browser worker's `generateDefault` in Node
  (seed 42) + app.js `buildDocHtml` → a deterministic, self-contained *current* viewer sample (the old
  `randomizer/output/out.html` predates T-038). `shoot.mjs` boots the backend (FAKE_BUILD, throwaway
  DB), screenshots every screen×viewport into `.shots/` and reports horizontal overflow (the agent's
  autonomous preview); `visual.spec.mjs` + `playwright.config.mjs` = per-viewport visual-regression with
  a no-overflow assertion. Dead end: `waitUntil:'networkidle'` hangs (app polls) → `domcontentloaded`;
  and nav setup must use `dispatchEvent` (pre-fix mobile nav overflows → target off-viewport → click()
  refuses). **Phase 1 (desktop lock)** done: 39 baselines (13 screens × desktop+iPad-portrait+landscape),
  desktop re-run **13/13 green & deterministic**; iPad has **no overflow at 768/1024** → "iPad = desktop"
  confirmed. **Phase 3 (app) core** done: `.topnav` → hamburger + off-canvas drawer (markup wraps
  tabs/account in `.topnav-menu` that is `display:contents` on desktop → byte-identical; burger/scrim
  hidden on desktop; JS toggles `body.nav-open`); compact numbered stepper, 44px touch targets, modal
  padding, wrap paddings — all additive `@media (max-width:600px)`. Verified: desktop **13/13 unchanged**,
  mobile **no overflow anywhere**, drawer + stepper reviewed via screenshots. Remaining: Phase 2 (kit),
  Phase 4 (docs viewer — delicate), Phase 5 (zero-dep guards), Phase 6 (refresh mobile baselines),
  Phase 7 (ADR-010 + changelog).
- **2026-07-01** — **Phase 2 (obsidian-ui-kit)** done: added §15 RESPONSIVE to `obsidian.css` (additive
  `@media (max-width:600px)`: tighter container/section/panel/modal padding, 18px inputs, 44px tap
  targets on btn/check/radio/toggle, full-width toast) + a `.obs-scroll-x` wrapper utility for wide
  tables/tab-strips; documented the breakpoint scale as STYLE_GUIDE §8; `example.html` already had the
  viewport meta. `STYLE_GUIDE.html` (print copy) left as-is — `.md` is its stated source of truth.
  **Checkpoint before Phase 4** (docs viewer): it's the just-polished, highest-regression surface, so
  pausing here for owner review + a real-phone check of the app before touching `template.html`.
- **2026-07-01** — Owner: "Playwright es cosa tuya, sé autónomo" + would eyeball the app themselves.
  **Phase 4 (docs viewer)** done in `template.html`, additive only: removed the dead
  `@media(max-width:1000px)` block (bad selectors); added a `≤600px` layer — `.main` stacks, `.content`
  full-width, `.right` sidebar → right off-canvas **drawer** (full-height, `.app.docs-nav-open`) with a
  hamburger in the top bar + scrim + Escape/tab-select close, the collapse state neutralised in the
  drawer, compact top-bar stat tiles, and `overflow-x:auto` on the active section so wide
  encounter/roster/table content scrolls instead of being clipped. **Phase 5 (guards)**:
  `frontend/__tests__/responsive.test.js` (viewport metas, per-surface `@media` layers, drawer
  desktop-preserving defaults, dead-query-gone) — frontend suite **14/14**. **Phase 6**: refreshed all
  baselines; full visual run **70/70 green** across phone-sm/mobile/iPad-portrait/iPad-landscape/desktop
  (desktop + iPad match the lock = unchanged; mobile has no overflow). Verified the docs drawer opens
  correctly at 375 and every viewer tab (Encounters/Trainers/PC/Pokédex/Moves/Abilities) is full-width
  and clean on mobile. **Phase 7**: ADR-010 (visual-tests as an isolated dev tool scoping ADR-009 to
  runtime/unit) + docs/INDEX + CHANGELOG `[Unreleased]`. Remaining: owner real-phone confirmation (close gate).
- **2026-07-01** — Owner tested the app on device and hit a real defect: opening the app hamburger
  darkened the screen and any tap just closed it — the drawer's links were unclickable. Root cause: the
  drawer is `.topnav-menu`, trapped inside `.topnav`'s stacking context (`z-index:1000`), while the
  scrim `.nav-scrim` is a `<body>` child at `z-index:1100` — so the scrim outranked the *entire* topnav
  subtree and ate every tap on the menu (the drawer's own high z-index is meaningless outside its
  parent's context). The docs viewer drawer was unaffected (its `.right`/scrim share the root context).
  TDD fix: added `visual-tests/interaction.spec.mjs` (real `.click()` on a drawer link — fails with
  "scrim intercepts pointer events") → confirmed it **failed** on the app (docs passed), then set the
  app scrim to `z-index:999` (below `.topnav`'s 1000, still above page content) → **4/4 pass**
  (app+docs × mobile+phone-sm). Additive/mobile-only, desktop lock unaffected. (Kept as a T-040
  iteration, not a B-NNN: the drawer is unreleased code from this same task — happy to formalise a bug
  entry if preferred.)
- **2026-07-01** — Deployed to PRO (`deploy/update.sh`, owner green-light) and verified prod serves the
  new code. Owner tested the generated docs on mobile and gave 3 mobile-only fixes (desktop must stay
  as-is), all in `template.html` ≤600px: (1) **unpin** now keeps the bar (hamburger + title) pinned and
  only hides the extra stat tiles — `.app.topbar-unpinned .topbar{position:sticky}` +
  `.topbar-stats{display:none}` inside the media query (desktop's static-bar unpin untouched);
  (2) **Encounters** drop the fixed 168px column matrix → `#wildpokes-cards` column, `.location-card`
  100% wide, `.enc-slots{grid-template-columns:1fr!important}` = full-width rows, vertical scroll;
  (3) **Trainers** fit the screen — removed the section `overflow-x:auto` (it broke width:100%/max-width
  capping and forced the 640px rows to horizontal-scroll) and set `.roster-row{width:100%}`. Diagnosed
  the overflow via a getBoundingClientRect probe (roster was 668px), fixed, re-verified:
  documentScrollWidth=375 with 0 elements past the edge on both tabs; unpin probe shows
  bar=sticky/stats=none/burger=visible. Desktop guard **14/14 unchanged**, interaction **4/4**, full
  visual **74/74** after refreshing the mobile encounters/trainers baselines.
- **2026-07-01** — Feedback fixes committed and redeployed to PRO (owner green-light); verified prod
  serves all three fixes. Owner re-tested on mobile and confirmed: "muy buen responsive, se ve perfecto,
  cerramos tarea." All acceptance criteria met, all suites green — **task closed (done)**. Target 0.5.0.

## Outcome

Shipped a full mobile-responsive layer for the web app **and** the generated docs viewer while keeping
desktop (and iPad ≥601px) **byte-identical** — the guiding invariant was "additive `max-width:600px`
media queries only, never edit a base rule", proved by locking desktop+iPad pixel baselines before any
edit and keeping them green throughout.

**What shipped:**
- **App** (`frontend/`): top-nav → hamburger + off-canvas drawer (`.topnav-menu` is `display:contents`
  on desktop so nothing changes there; scrim at `z-index:999` below `.topnav` so the drawer, trapped in
  `.topnav`'s stacking context, stays tappable), compact numbered stepper, 44px tap targets, modal/wrap
  paddings, verified reset/verify/settings/auth.
- **Docs viewer** (`frontend/template.html`): sidebar → off-canvas drawer, full-width content, compact
  top bar; **feedback round**: unpin keeps the bar (burger + title) pinned and only hides the stat tiles,
  Encounters became full-width vertically-scrolling rows (no fixed-column matrix), Trainers fit the
  screen (no horizontal scroll). Removed the dead `@media(max-width:1000px)` block. B-015/B-016 and
  T-038/T-039 preserved.
- **Obsidian UI kit**: documented responsive `@media` layer (§15) + breakpoint scale (STYLE_GUIDE §8) +
  `.obs-scroll-x` utility.
- **Testing**: a new **isolated, dev-only** Playwright harness (`visual-tests/`, [ADR-010](../docs/adr/ADR-010-visual-regression-playwright-dev-tool.md))
  — per-viewport pixel baselines (desktop = the "must not change" lock), a no-overflow assertion, an
  interaction spec (drawer navigation), a deterministic offline docs fixture builder, and `shoot.mjs`
  for hands-free multi-resolution screenshots — plus fast zero-dep structural guards
  (`frontend/__tests__/responsive.test.js`). Final: visual 74/74, frontend 14/14, backend 94, randomizer 473.

**Deviations from the plan:** none material. The plan's "two-layer testing" was realised as ADR-010's
isolated Playwright tool + node --test guards. iPad confirmed as desktop-first (no overflow at 768/1024),
so no dedicated tablet design was needed. The mdBook site (`docs/`) was out of scope (already responsive).

**Defects found & fixed in-task (owner review, unreleased code — logged here, no B-NNN):** drawer links
were unclickable because the scrim outranked `.topnav`'s stacking context (fixed: scrim `z-index:999`,
regression test in `visual-tests/interaction.spec.mjs`); the fixture builder was mutating generated
source as a pipeline side-effect (fixed: it now restores `src`/`include`/`data/maps` in a `finally`).

**Follow-ups:** none required. Optional tidy — `deploy/update.sh` rsyncs `visual-tests/` (dev-only) to
the box; could add `--exclude 'visual-tests/'` in a future pass (harmless, not served). Released under
**0.5.0** (CHANGELOG `[Unreleased]`). Live and owner-validated on https://pokemon-emerald-cut.com.
