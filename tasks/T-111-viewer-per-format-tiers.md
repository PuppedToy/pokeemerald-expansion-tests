---
id: T-111
title: Viewer — surface singles/doubles tiers per Pokémon (mixed shows both)
status: done
type: feature
created: 2026-07-09
updated: 2026-07-15
target-version: 0.8.0
links: [T-083, T-097, T-109]
blocked-by: [T-097]
---

# T-111 — Viewer — surface singles/doubles tiers per Pokémon (mixed shows both)

## Context

Pokémon viability differs by format; the generated docs viewer should reflect it. The doubles
rating/tier fields (T-097) already flow into `output/pokes.js` automatically; this task adds the UI.
For a `singles` run show the singles tier; `doubles` → doubles tier; `mixed` → both.

## Plan

- Add per-format tier display to the viewer (Pokédex list + detail modal), driven by the run's
  `battleFormat`: single tier for pure runs, both tiers (labelled) for mixed.
- Reuse the existing tier rendering/colour system; label clearly (e.g. "Tier (S): OU / Tier (D): UU").
- Keep it responsive (existing mobile constraints).
- Frontend/docs tests where the harness allows.

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [ ] Viewer shows the correct tier(s) per run format; mixed shows both, labelled.
- [ ] No horizontal-scroll/responsive regressions.
- [ ] Relevant tests green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-15** — Implemented in three parts.
  - **(A) contextual doubles data.** Added `rateContextualDoubles(poke, moves, abilities, context, singlesMoveset)`
    to `rating.js` (mirrors `rateContextual`, restricts the learnset to the level cap, calls
    `ratePokemonDoubles`). Like the pokedex doubles rater it **reuses the singles contextual
    `bestMoveset`** (no `chooseMoveset` call) so it consumes ZERO rng — singles output stays
    byte-identical. Wired `poke.contextualRatingsDoubles[cap]` in `pokedexModule.js` alongside the
    existing `contextualRatings` loop. Also persisted `poke.roleDoubles` (the doubles archetype) for the
    viewer badge label.
  - **(B) routed the doubles teambuilding slots to the contextual doubles data.** `trainerSelector.js`
    `getRatingForSort` contextual branch → `pokeCtx(poke, cap)?.absoluteRating`; `favouriteClaim.js`
    `speciesTierForKey` contextual branch → `contextualRatingsDoubles` for a doubles trainer. This
    completes T-109's routing (absoluteTier slots were already routed; this covers the early-game
    contextual-tier slots — gyms/grunts).
  - **(C) viewer per-format tiers.** The run format is the SSOT `config.battleFormat`, surfaced to the
    viewer via a new `%%RUN_BATTLE_FORMAT%%` build-time token (mirrors `%%DOC_RUN_NS%%`): set on the
    docs object in `writerDocs.js` (`options.battleFormat`, passed from `generate.js` `mcfg.battleFormat`),
    injected by all three doc builders (`writer.js` out.html, `frontend/js/app.js` buildDocHtml, and the
    visual-tests fixture builder). `template.html` reads it (with a battleType-derived fallback for a raw
    template) and renders: singles → the singles badge (byte-identical HTML to before); doubles → the
    doubles badge; mixed → both, labelled `S:` / `D:`. Tier **sort** and **filter** are format-aware
    (`pokeSortTier`, `pokeFilterTiers` — mixed matches on either format). Deriving from trainer
    battle-types alone is unreliable (tag battles + ineligible small teams contaminate it — see
    `battleFormat.js`), hence the config token.
  - **Payload:** `contextualRatingsDoubles` is teambuilding-only and ~10 MB/doc, so it's added to the
    doc-omit set in both frontend builders and stripped from the writer's `pokes.js` copy (which also
    repaired the pre-existing shipping of `contextualRatings` in out.html — the viewer never reads
    either at runtime).
  - **Verification:** fast suite green (1082; strengthened the `writerDocs` bundle-shape leak test to
    assert `battleFormat` is present and `diag`/`diagnostics` absent — deliberate contract change).
    Determinism gates 17/17 (singles byte-identical, cross-ROM boss determinism intact). Browser-checked
    the built fixture (Playwright): token injects (`singles`), 968 cards render with no page errors, and
    the singles/doubles/mixed badge + sort + filter helpers all produce the expected output. No
    horizontal overflow at any viewport.
  - **Not yet done:** an in-game/owner visual pass of a `doubles`/`mixed` run's viewer (owner chooses
    when to test); the fixture is a singles run, so mixed/doubles badges were validated by forcing the
    format in-browser rather than by a mixed fixture.
- **2026-07-15 (redesign — owner request).** Owner: the tier must ALWAYS show BOTH formats (not
  format-driven), as an evaluation/comparison tool that stays permanently. New design: a single
  two-sided component — left **Singles**, right **Doubles**, each with a small title + tier badge and a
  subtle divider, with the **shared role** (bulky/…) as a subtle label below. Confirmed the role is
  genuinely shared: both `ratePokemon` and `ratePokemonDoubles` derive it from the same
  `computePowerAndRole(poke)` (base-stat driven, format-independent), so `roleDoubles` always equals
  `rating.role` — dropped the redundant `roleDoubles` field and use `rating.role`.
  - Built `tierDuoHtml(poke)` + `.tier-duo*` CSS in `template.html`, replacing `tierBadgesHtml`. The only
    per-Pokémon tier render is `generatePokeCardContent` (serves both the Pokédex list card AND the
    detail modal), so one component covers every surface; trainer cards don't show tiers.
  - **Removed** the now-dead format infrastructure from the earlier entry: `%%RUN_BATTLE_FORMAT%%` token,
    `getRunFormat`, and `docs.battleFormat` (reverted `writerDocs.js`, `generate.js`, `writer.js`,
    `app.js` and the fixture token injection + the `writerDocs` bundle-shape test). Tier **sort** is now
    by the singles tier (primary/left side); tier **filter** matches on EITHER format's tier (selecting
    "OU" surfaces anything OU in singles or doubles). `contextualRatingsDoubles` payload-omit + the
    writer's slimmed `pokes.js` copy stay (still correct).
  - **Verified:** fast suite 1082 green; determinism gates 17/17 (singles byte-identical); rebuilt
    fixture + Playwright — 968 cards, no page errors, no horizontal overflow at any viewport; modal
    screenshots at 1440 and 360 px show `Singles NU │ Doubles PU` + shared `BULKY` rendering correctly
    and responsively.

## Outcome

Dual tier component shipped: every generated doc surface (pokédex card + modal) shows both the singles and
doubles tier side-by-side, permanently, with a shared type tag and a subtle role subscript — plus the T-141
"Support" tag on the doubles side. Responsive. The old per-run `RUN_BATTLE_FORMAT` single-format token was
removed. Owner-validated on 2026-07-15 (batch with T-102/T-109/T-140/T-141/T-142). Closed.
