---
id: T-008
title: Box/evolution coherence — level-cap display + Pokédex modal "in box" section
status: proposed
type: feature
created: 2026-06-20
updated: 2026-06-20
target-version: 0.1.0
links: [tasks/T-007-mail-notifications.md]
blocked-by: []
---

# T-008 — Box/evolution coherence in the Pokédex modal (+ level-cap display)

## Context

T-007 added the "box" concept (captured-and-not-fainted Pokémon, with an evolution overlay) and a
level-cap progression. This task surfaces that state directly in the UI so the player always sees,
for any Pokémon, how it relates to their box and family — keeping evolution/possession coherent.
Builds on the T-007 box helpers (`getBoxEntries`/`boxMembers`, `bossCaps`, `getCapturedIds`,
`getFaintedIds`) and the per-run localStorage (`mail_v1.evo` overlay + `nuzlocke_v1`).

## Plan

**A. Current level cap display.** A small dynamic readout near the top (Mail tab and/or the header)
showing `Current level cap: N`, where N = level of the first not-yet-defeated boss in `bossCaps`
(MAX if all defeated). Updates live on boss defeat/undefeat (reuse the existing mail hook).

**B. Pokédex modal "box" section.** A new block placed **before** the Evolution section, shown only
when the Pokémon (or its family) is relevant to the box. Cases, in priority order:
1. **Exact match in box** → a box emoji (no icon yet) + "IN BOX".
   - If it can evolve: nested "This Pokémon can evolve" — per reachable evolution, the target's
     sprite (clickable → opens that Pokémon's modal), an evolution icon, and a cyan **Evolve** button
     (same styling/behaviour as the Mail evolve: set the box overlay to that species).
2. **Family member in box (not this exact species)** → "Family Pokémon in box:" + the real boxed
     species' sprite (clickable → its modal).
3. **This species/family is boxed but fainted** → a `fainted` icon + the boxed family species' sprite
     + "[name] is fainted" in red.
4. **A family member is obtainable on a route and not yet owned** → a `location` icon + "Obtainable in
     <Route>" + the obtainable family species' sprite (clickable → its modal).

"Family" = the evolution family (reuse `family`/`evoTree`/evolution data already on each poke). Route
obtainability comes from `wildPokes` (which route/slot holds a family species).

## Acceptance criteria
- [ ] Header/Mail shows "Current level cap: N" and updates live on boss defeat/undefeat.
- [ ] The modal box section appears only when the Pokémon or its family touches the box, before Evolution.
- [ ] All four cases render correctly with the right icons/sprites; sprites are clickable to re-open the modal for that species; the in-box Evolve button updates the box overlay (and reflects in Mail).
- [ ] Coherent with T-007 box state (capture/faint/evolve) and per-run localStorage; no regressions to Mail or the Pokédex.
- [ ] App (`index.html`) unaffected; `cd randomizer && npm test` green; `node scripts/check-tracker.mjs` green; docs stay self-contained.

## Progress log

- **2026-06-20** — Task created (split out from T-007 to keep that one closeable). Captures the level-cap display + the modal box/evolution-coherence section.

## Outcome

<!-- Filled when closing. -->
