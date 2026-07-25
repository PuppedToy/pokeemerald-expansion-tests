---
id: T-201
title: Docs viewer — show auto-nicknames everywhere + tie the nickname to the capture state
status: proposed        # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-068, T-069, T-070, T-194, T-200]
blocked-by: [T-200]
---

# T-201 — Docs viewer: show auto-nicknames everywhere + tie the nickname to the capture state

## Context

Follow-up to [T-200](T-200-auto-nickname-pools-uniqueness-warnings.md) (and the deferred
[T-069](T-069-starter-nickname-viewer-docs.md)). Once the auto-nickname assignment (starters + wild + statics
+ gifts + trades) is correct and globally unique, **surface those nicknames in the generated documentation
viewer** and make them behave with the viewer's capture/fainted state.

> **DEFINITION UNDER REVIEW.** Per owner request, this task's exact scope (which nickname data reaches the
> viewer, and the precise hook points) must be **revisited once T-200 lands**, because T-200 changes how/where
> the naming is computed and unified. Do NOT start until the owner validates T-200 and re-confirms this file.
> The exact viewer file:line hook points are being mapped during T-200 investigation and will be filled here
> before implementation.

## Plan

The viewer already tracks a per-Pokémon **captured / fainted** state (localStorage). This task shows the
assigned auto-nickname (from the T-200 naming artifacts) at every place a captured Pokémon is displayed, and
binds the nickname to the capture toggle.

### Display surfaces (owner spec)
1. **PC tab** — under each box Pokémon's species name show its nickname (e.g. `Kubfu` with `John` beneath).
   Both alive and fainted mons.
2. **Pokémon modal — "IN BOX" line** — replace the plain "IN BOX" with `<Nickname> is in box`
   (or `<Species> is in box` when it has no nickname), followed by `[Edit nickname]` and `[Mark fainted]`.
3. **Pokémon modal — Family section** — where it lists "Family pokémon in box:", render each as
   `Nickname (Species)`, e.g. `John (Kubfu)`.
4. **Pokémon modal — fainted** — `<Nickname> is fainted` (or `<Species> is fainted` with no nickname).
5. **Encounters box/tiles** — once a tile is captured (green/blue), show the nickname under the species name,
   as in the PC tab. Consequence: **auto-named extra starters already carry their name when the docs open**;
   an auto-named *main* starter shows its name only **after the starter is selected**.

### Capture-bound nickname behaviour (owner spec)
- The auto-nickname is applied to a Pokémon **only when it is marked captured**. **Un-capturing removes** the
  auto-nickname; **re-capturing re-applies** it.
- If the user **edited** the nickname and then un-captured, the **user's edited name is remembered** and
  restored on re-capture (persist the user override separately from the auto value).

### Trade action in the viewer (owner spec, added 2026-07-25)
A tradeable Pokémon (a town-trade *wanted/accepted* species, from [T-194](T-194-randomized-town-trades.md))
can be **traded** in the docs, which changes it into the trade's *offered* species — **with a different
auto-nickname** (the T-200 `tradeNaming` for that trade, distinct from the wanted mon's own location name).
- In the trade box, the tradeable Pokémon shows a **`trade`** button (text only, **no icon**); once traded it
  shows an **`undo trade`** button (text only, no icon). Present in **both the modal and the encounters box**.
- Trading swaps the displayed species → the offered species and applies that trade's nickname; **undo trade**
  reverts to the wanted species and its own (location) nickname. This is a capture-like state (persisted) that
  interacts with the capture/fainted + edited-nickname rules above.
- This is docs/viewer-only; the in-ROM application of the trade nickname is [T-202](T-202-in-rom-town-trade-nickname-hook.md).

### Acceptance criteria (to be finalised after T-200)
- [ ] All five display surfaces show nickname vs species per the rules above (with/without nickname).
- [ ] `[Edit nickname]` persists a user override; `[Mark fainted]` toggles fainted; both survive reload.
- [ ] Auto-nickname is present only while captured; un-capture clears it; re-capture restores auto (or the
      user override if one was set).
- [ ] Auto-named extra starters show a name on load; auto-named main starter shows one only after selection.
- [ ] Visual/interaction tests (Playwright) cover the surfaces; no horizontal overflow; suites green.

## Viewer hook-point map (investigation 2026-07-25)

Reference for implementation (subject to revision after T-200). All refs in `frontend/template.html` unless noted.

- **Headline:** *no nickname data reaches the viewer today.* The `starterNaming` / `locationNaming` artifacts
  are consumed only by the C writers; nothing is injected into the docs HTML. T-069 (thread naming into
  `writerDocs` → `rom.docs` → template) is **unbuilt**. So this task needs BOTH the pipeline wiring AND a new
  viewer-side capture→nickname state model.
- **Pipeline wiring needed:** `randomizer/writerDocs.js` returns only
  `{ trainersResultsSimplified, viewerTrainers, wildPokes, typeColors }`; injection happens in
  `frontend/js/app.js` `buildDocHtml` (~233-265) and `randomizer/writer.js` (~805-916). Naming is attached
  in `generate.js` **after** `computeRomDocs` (docs at :257/:425, naming at :261-262/:429-430) — the order must
  be fixed to thread naming into the docs pass (T-069's noted blocker).
- **Display surfaces:**
  1. PC tab — `renderPC` cell markup, `template.html:3696-3713` (species name span at :3711; `pcName` at :3695).
  2. Modal "IN BOX" — `window.docBoxSectionHTML`, :3602-3634; the "IN BOX" string at :3613; `[Mark fainted]`
     button already built at :3612. Modal injects it at :2422 (`showPokemonModal` at :2219).
  3. Family "Family Pokémon in box:" — same fn, alive branch :3615-3616 (`nm(alive.currentSpecies)` at :3616).
  4. Fainted line — same fn, :3617-3618 (already renders "`<Species> is fainted`" → swap in nickname).
  5. Encounters tiles — render loop :2058-2113 (species name `.nz-poke-name` at :2099); capture tinting via
     `applyLocVisuals` :2925-2960 (name sync point at :2960).
- **Capture / fainted state model (net-new nickname store):**
  - localStorage `nuzlocke_v1` (namespaced via `nsKey()` :1441): `nzState.locations[routeId] = { selected, delayed, fainted }`.
  - Toggle handlers — **capture/un-capture** `handleSelectChange(routeId, slot, checked)` :3080-3097 (the hook
    to assign auto-nickname on capture / clear on un-capture); **faint** `handleFaintChange` :3068-3078;
    modal→faint bridge `window.docSetFainted` :3648-3653.
  - Derived box membership: `capturedEntries()` :3276-3291 (entry key `routeId+'|'+slot`), `boxMembers()` :3292,
    `docBoxList` :3598, `docFaintedList` :3599.
  - **No per-Pokémon nickname store exists.** Design: a new namespaced key (e.g. `nicknames_v1`) mapping
    `routeId|slot` → `{ nickname, userEdited }`; write auto on capture unless a `userEdited` entry exists;
    clear the auto-only entry on un-capture; add the key to the Reset clear-list at :3752-3758.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed), blocked by T-200. Owner captured the full display + capture-state
  spec (above). Definition explicitly to be revisited after T-200 lands. Investigated + recorded the viewer
  hook-point map (above); key finding: no nickname data reaches the viewer today (T-069 unbuilt), so this task
  needs pipeline threading + a new viewer-side nickname store.
- **2026-07-25** — Definition revised in light of T-200 (as flagged): added the **Trade action in the viewer**
  section (`trade` / `undo trade` text buttons in the trade box, modal + encounters, no icons) — trading swaps
  the mon to the trade's offered species and applies its distinct T-200 `tradeNaming`. Owner chose "docs first":
  the in-ROM trade nickname hook is split out as [T-202](T-202-in-rom-town-trade-nickname-hook.md). Acceptance
  criteria to be finalised with the owner before this task starts.

## Outcome

<!-- Filled when closing. -->
