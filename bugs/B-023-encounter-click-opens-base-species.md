---
id: B-023
title: Encounter tile click opens the base species modal instead of the evolved one
status: fixing          # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-07-09
updated: 2026-07-09
found-in: 0.6.0
fixed-in:
regression-test: visual-tests/interaction.spec.mjs (B-023)
links: []
---

# B-023 — Encounter tile click opens the base species modal instead of the evolved one

## Symptom

In the generated docs (docs viewer), the Encounters tab shows an evolved Pokémon in green
once you mark a caught encounter as evolved (e.g. catch a Pichu on Route 102, evolve it to
Pikachu → Route 102 shows Pikachu in green). That green sprite/name is correct.

The bug: clicking that tile to inspect it opens the detail modal for the **base** species
(Pichu), not the **evolved** species (Pikachu). Expected: the modal shows the currently
displayed (evolved) species.

Reproduce: open a run's docs, go to Encounters, evolve a caught encounter (via Mail/PC flow),
return to Encounters, click the now-green evolved tile → modal shows the pre-evolution.

## Root cause

The encounter tile's click handler (`frontend/template.html`, encounters render script) captured the
species from the tile's static `poke-<SPECIES_ID>` CSS class — the **base** wild species baked in at
render time — into a closure variable and opened its modal. It never consulted the evolution overlay
(`store.evo`, keyed `"<routeId>|<slot>"`) that the green sprite/name render path (`applyLocVisuals`)
uses. So the sprite/name showed the evolved species while the click always opened the base form.

The overlay reader (`evoOverlay()`) lives inside the Mail-engine IIFE and was not accessible from the
(separate) encounters script, so the handler had no in-scope way to resolve the current species.

## Fix

- Expose the overlay reader as `window.nzEvoOverlay = evoOverlay` (single source of truth with
  `applyLocVisuals`).
- In the click handler, resolve the current species at click time:
  `cur = window.nzEvoOverlay()[route.id + '|' + slot] || baseSpecies`, then
  `showPokemonModal(findPoke(cur))` (falling back to the base form when unresolved).

Both changes in `frontend/template.html` (T-078/B-023 batch). Regression test
`visual-tests/interaction.spec.mjs` (`B-023: encounter click opens the evolved species`) drives the
real docs fixture: marks a tile evolved, clicks it, and asserts the modal renders the **evolved**
species and not the base. Verified FAIL before the fix, PASS after.
