---
id: T-218
title: Strip AI-tell comments and cruft from shipped HTML (frontend shell + generated docs)
status: in-progress     # proposed | in-progress | done | abandoned
type: chore             # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-219, T-220]
blocked-by: []
---

# T-218 — Strip AI-tell comments and cruft from shipped HTML

## Context

The HTML we ship to users carries developer/AI comments visible in "view source". They read as
machine-generated and, worse, leak internal tracking (task/bug IDs) to the public. Two files are affected:

- **`frontend/index.html`** — the app shell (~33 `<!-- -->` comments).
- **`frontend/template.html`** — the **generated-docs viewer template** that becomes the downloadable
  docs / `randomizer/output/out.html` (~19 `<!-- -->` comments, plus `T-…` refs inside its inline
  `<style>`/`<script>`). It is fed to the browser via `__TOKEN__` substitution (`__FONT_PRESS_START_2P__`,
  a per-run namespace token, per-ROM data injection points) done in `app.js`/`randomizer/writerDocs.js`.

`frontend/reset.html` and `frontend/verify.html` are already comment-free.

Typical tells observed (all in the two files above):
- Decorative box-drawing banners: `<!-- ── Top navigation ──────── -->`.
- Internal IDs leaking to users: `(T-040)`, `(T-217)`, `T-201 —`, `T-005 —`, `B-004`.
- Over-explanatory dev notes: `<!-- script to handle moves -->`, `<!-- loader -->`,
  `<!-- pokedex rendering is handled by the filter module below -->`.

Scope is **HTML only** (incl. the inline `<style>`/`<script>` blocks inside `template.html`). The richly
commented `frontend/js/*.js` modules are a deliberate project convention and are **out of scope** unless
the owner extends it.

## Plan

**Scope narrowed (owner, 2026-07-26): SOURCE hygiene only — conservative, "solo lo que no sea útil".** The
*shipped-artifact* cleanliness (no comments in what users download / view-source) is now delivered by the
minify build, split into [T-219](T-219-minified-docs-viewer.md) (docs `out.html`) and
[T-220](T-220-frontend-build-minify.md) (frontend `dist`). This task just removes the genuinely
non-useful tells from the **source** files so they aren't AI-cruft-ridden: decorative box-drawing banners,
leaked `T-…`/`B-…` IDs in `frontend/index.html` + `frontend/template.html`, and redundant obvious labels
(`<!-- loader -->`, `<!-- script to handle moves -->`). **Keep every comment that actually helps a
maintainer.** Add a guard test that fails only on the *tells* (not on all comments).

**Non-negotiable safety rails:**
- **Do NOT touch the `__TOKEN__` placeholders** in `template.html` or any marker the doc generator relies
  on (`app.js` / `writerDocs.js` substitution anchors). Confirmed the generator substitutes by token, not
  by comment — but re-verify before deleting any comment that sits next to a token.
- **Many tests source-inspect these two files** (`beta-surface`, `beta-admin-panel`, `delivery-feedback`,
  `docs-tooltip`, `docs-battle-type`, `docs-rival-gender`, `trainer-card-width`, `topbar-sticky`,
  `responsive`, `nicknames-viewer-data`, `shiny-iv-badge`, `rom-ownership`, `feedback`; and
  `randomizer/__tests__/unit/trainerColors.test.js` reads `template.html`). If a test matched on a removed
  comment, **update the assertion to target the real element — never re-add the comment to satisfy a test.**

**TDD:** first add a failing guard test that greps `frontend/index.html` + `frontend/template.html` for
the *tells* only — `T-\d{3}`/`B-\d{3}` tokens and decorative box-drawing banners (`<!-- ── … ── -->`);
watch it fail; then clean until green. The test must NOT forbid all `<!-- -->` comments (useful ones stay).

Resolved decisions (owner, 2026-07-26):
1. **Aggressiveness:** conservative — remove only the non-useful tells (leaked IDs, decorative banners);
   keep genuinely helpful comments and section labels.
2. **Scope refined during implementation → the HTML comment layer only** (`<!-- … -->` in `index.html` +
   `template.html`). The inline `<style>`/`<script>` block comments were found to be dense source CODE with
   ~40 task-ID refs following the project's traceability convention (like every `.js`); stripping them would
   be inconsistent with the whole codebase, and they are minified out of the shipped docs by T-219 anyway —
   so they are LEFT AS-IS. (Supersedes the initial "applies to inline style/script too" wording.)
3. **Source-clean vs. strip-at-build:** BOTH, split — T-218 cleans the HTML comment layer; the
   shipped-artifact strip/minify is T-219 (docs) + T-220 (frontend). No overlap.
4. **Extend to JS module comments?** Out of scope — convention (and T-220 minifies them out of the bundle).

Acceptance criteria:
- [x] The **HTML comments** of `frontend/index.html` + `frontend/template.html` carry no leaked `T-…`/`B-…`
      IDs and no decorative box-drawing banners (per the new guard test); genuinely useful comments + section
      labels remain.
- [x] The generated docs still build correctly (`__TOKEN__` substitutions untouched — only comment interiors
      changed; `docs-*` + `trainerColors` tests green).
- [x] Full **frontend** suite (194) + **randomizer** suite (1697) green; no assertion referenced a removed
      comment (none needed updating).
- [x] The guard test (`frontend/__tests__/no-ai-tells-in-html.test.js`) fails if a `T-…`/`B-…` token or a
      decorative banner re-enters those files' HTML comments.
- [x] No behaviour/appearance change: `visual-tests` `npm run shoot` shows no horizontal overflow.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Task created (proposed). Scoped to `frontend/index.html` + `frontend/template.html`
  (reset/verify already clean); JS out of scope. Verified `template.html` substitutes by `__TOKEN__`, not
  by comment, so comments are safe to remove — but flagged the many HTML source-inspection tests as the main
  risk. Left three aggressiveness/approach decisions for owner sign-off before starting.
- **2026-07-26** — Owner decisions: (1) **conservative** — remove only non-useful tells, keep helpful
  comments; (2) also wants the shipped artifacts **minified** → carved that out into T-219 (docs `out.html`)
  + T-220 (frontend `dist`), so T-218 is now SOURCE hygiene only; (3) JS module comments stay. Rescoped the
  Plan + acceptance accordingly; the guard test now targets the *tells*, not all comments.
- **2026-07-26** — Implemented on `feature/T-218…` (stacked on the beta branch so the cleanup also covers the
  beta's newly-added `index.html` comments — those files aren't on master yet). Found `template.html`'s
  inline `<style>`/`<script>` carry ~40 task-ID refs (project traceability convention) + a `//` banner →
  **narrowed scope to the HTML `<!-- -->` comment layer only** (decision #2 above); inline code comments left
  (minified out by T-219). TDD: added `frontend/__tests__/no-ai-tells-in-html.test.js` (red first), then a
  comment-interior-only `perl` pass de-decorated banners + stripped IDs while keeping the text. Verified the
  diff (no punctuation artifacts, multi-line comments + `__TOKEN__`s intact). Frontend 194 + randomizer 1697
  green; `shoot` no overflow. **Pending owner manual confirm before closing.**

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
