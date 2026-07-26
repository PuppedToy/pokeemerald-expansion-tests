---
id: T-218
title: Strip AI-tell comments and cruft from shipped HTML (frontend shell + generated docs)
status: proposed        # proposed | in-progress | done | abandoned
type: chore             # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: []
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

Remove `<!-- -->` comments and the ID/banner tells from `frontend/index.html` and `frontend/template.html`
(and the `T-…`/`B-…`/banner tells inside `template.html`'s inline `<style>`/`<script>`). Prefer cleaning
the source over adding a build-time stripper (no static build step exists for `index.html`; keeps it
simple and diff-reviewable). Add a guard test so comments/IDs cannot re-leak.

**Non-negotiable safety rails:**
- **Do NOT touch the `__TOKEN__` placeholders** in `template.html` or any marker the doc generator relies
  on (`app.js` / `writerDocs.js` substitution anchors). Confirmed the generator substitutes by token, not
  by comment — but re-verify before deleting any comment that sits next to a token.
- **Many tests source-inspect these two files** (`beta-surface`, `beta-admin-panel`, `delivery-feedback`,
  `docs-tooltip`, `docs-battle-type`, `docs-rival-gender`, `trainer-card-width`, `topbar-sticky`,
  `responsive`, `nicknames-viewer-data`, `shiny-iv-badge`, `rom-ownership`, `feedback`; and
  `randomizer/__tests__/unit/trainerColors.test.js` reads `template.html`). If a test matched on a removed
  comment, **update the assertion to target the real element — never re-add the comment to satisfy a test.**

**TDD:** first add a failing guard test that greps the two shipped HTML files for (a) any `<!-- -->`
comment and (b) any `T-\d{3}`/`B-\d{3}` token; watch it fail; then clean until green.

Open decisions to confirm with the owner when starting:
1. **Aggressiveness on inline `<style>`/`<script>` in `template.html`:** strip *all* comments there, or
   only the tells (IDs, banners, redundant labels), keeping genuinely structural section markers?
   (Default recommendation: strip IDs + banners + redundant labels; keep nothing purely decorative.)
2. **Source-clean vs. strip-at-build/generate:** clean the source + guard test (recommended) vs. add a
   comment-stripping pass at serve/doc-gen time (heavier machinery).
3. **Extend to JS?** Sweeping `T-…` refs out of the `frontend/js/*.js` module comments is out of scope by
   default (they don't ship as prominently and are a project convention) — include only if the owner asks.

Acceptance criteria:
- [ ] `frontend/index.html` and `frontend/template.html` contain no `<!-- -->` comments and no `T-\d{3}`/
      `B-\d{3}` references (per grep + the new guard test).
- [ ] The generated docs still build correctly (the `__TOKEN__` substitutions untouched; the `docs-*` and
      `trainerColors` tests green; a real `node analyze.js`/doc-gen smoke still produces a valid viewer).
- [ ] Full **frontend** suite + **randomizer** suite green; any assertion that referenced a removed comment
      updated to a real element.
- [ ] A regression guard test fails if a comment or a `T-…`/`B-…` token re-enters the shipped HTML.
- [ ] No behaviour/appearance change: `visual-tests` `npm run shoot` shows no horizontal overflow (and no
      unexpected visual diff).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Task created (proposed). Scoped to `frontend/index.html` + `frontend/template.html`
  (reset/verify already clean); JS out of scope. Verified `template.html` substitutes by `__TOKEN__`, not
  by comment, so comments are safe to remove — but flagged the many HTML source-inspection tests as the main
  risk. Left three aggressiveness/approach decisions for owner sign-off before starting.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
