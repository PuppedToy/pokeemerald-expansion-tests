---
id: T-218
title: Strip AI-tell comments and cruft from shipped HTML (frontend shell + generated docs)
status: proposed        # proposed | in-progress | done | abandoned
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
1. **Aggressiveness:** conservative — remove only the non-useful tells (leaked IDs, decorative banners,
   redundant obvious labels); keep genuinely helpful comments. Applies to `template.html`'s inline
   `<style>`/`<script>` too.
2. **Source-clean vs. strip-at-build:** BOTH, split — T-218 cleans the source conservatively; the
   shipped-artifact strip/minify is T-219 (docs) + T-220 (frontend). No overlap.
3. **Extend to JS module comments?** Out of scope — the `frontend/js/*.js` rich comments are a project
   convention (and T-220's minify strips them from the shipped bundle anyway).

Acceptance criteria:
- [ ] `frontend/index.html` + `frontend/template.html` carry no leaked `T-…`/`B-…` IDs, no decorative
      box-drawing banners, and no redundant obvious labels (per grep + the new guard test) — while genuinely
      useful comments remain.
- [ ] The generated docs still build correctly (the `__TOKEN__` substitutions untouched; `docs-*` +
      `trainerColors` tests green; a doc-gen smoke still produces a valid viewer).
- [ ] Full **frontend** suite + **randomizer** suite green; any assertion that referenced a removed comment
      updated to a real element.
- [ ] The guard test fails if a `T-…`/`B-…` token or a decorative banner re-enters those files.
- [ ] No behaviour/appearance change: `visual-tests` `npm run shoot` shows no horizontal overflow.

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

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
