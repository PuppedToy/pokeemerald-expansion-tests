---
id: T-008
title: Box/evolution coherence — level-cap display + Pokédex modal "in box" section
status: done
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
- [x] Header/Mail shows "Current level cap: N" and updates live on boss defeat/undefeat.
- [x] The modal box section appears only when the Pokémon or its family touches the box, before Evolution.
- [x] All four cases render correctly with the right icons/sprites; sprites are clickable to re-open the modal for that species; the in-box Evolve button updates the box overlay (and reflects in Mail).
- [x] Coherent with T-007 box state (capture/faint/evolve) and per-run localStorage; no regressions to Mail or the Pokédex.
- [x] App (`index.html`) unaffected; `cd randomizer && npm test` green; `node scripts/check-tracker.mjs` green; docs stay self-contained.

## Progress log

- **2026-06-20** — Task created (split out from T-007 to keep that one closeable). Captures the level-cap display + the modal box/evolution-coherence section.
- **2026-06-20** — Implemented (branch `feature/T-008-box-coherence`). **(A) Level-cap readout:** added `#level-cap-readout` ("Current level cap: N") to the header; the Mail engine exposes `window.docCurrentCap()` (= level of first not-yet-defeated boss in `bossCaps`, MAX if all defeated) and `refreshCap()` keeps it live via the existing `onBossDefeatChange`/`onBoxMaybeChanged` hooks. **(B) Modal box section:** the Mail engine exposes `window.docBoxSectionHTML(speciesId)`, inserted in `buildPokemonDetailHTML` immediately before `<h3>Evolution</h3>`; renders only when the species or its family touches the box. Four cases, priority order — (1) exact-in-box → `box`/📦 + green "IN BOX", plus per reachable evolution (method LEVEL/LEVEL_BATTLE_ONLY with `level ≤ docCurrentCap()`) the target sprite + `evolution` icon + cyan **Evolve** button; (2) family-in-box → "Family Pokémon in box:" + boxed species sprite (clickable); (3) family fainted → `fainted` icon + sprite + "[name] is fainted" in red; (4) family obtainable & unowned → `location` icon + "Obtainable in <Route>" + sprite. Helpers added: `familySet(speciesId)` (poke.family + familyGroups), `findObtainable(famSet)` (scans `wildPokes`). All sprites are clickable to re-open the modal; the in-box Evolve goes through `window.docBoxEvolve(fromId,toId)` (shared `[data-box-evolve]` document click handler) → sets the box overlay and re-opens the modal for the new form. Box-section CSS added (Obsidian tokens).
  - Verified by headless screenshots on the seeded bundle (bosses 0–14 defeated, STARTER_EXTRA auto-boxed): cap readout shows **42**; Case 1 = Chimchar "IN BOX" + cyan Evolve→Monferno; Case 2 = Monferno "Family Pokémon in box: Chimchar"; Case 3 = fainted Chimchar (icon + red text); Case 4 = Mudkip "Obtainable in Route101". Evolve interaction: clicking it evolved Chimchar→Monferno and re-rendered the modal as Monferno IN BOX with **no** further Evolve offered (Infernape@Lv 54 > cap 42 — cap-gating confirmed). `cd randomizer && npm test` 422 green; `node scripts/check-tracker.mjs` OK.
  - **To confirm in manual test:** the four cases against a real run; Evolve mutating the box reflects back in the Mail tab; route-label cosmetics (data shows "Route101" without a space).
- **2026-06-20** — Review round 3 (user feedback): on evolving, purge stale mail + correct button association.
  - **Stale-mail purge.** Factored a shared `evolveEntry(key, fromSp, toSp)` used by both the mail Evolve button (`doEvolve`) and the modal box-section (`docBoxEvolve`). It sets the overlay then **deletes every mail about the form that just evolved at that encounter** (`entrySpeciesOf(m)===fromSp`): the sibling evolution branches (e.g. once you take Rufflet→Braviary, the Rufflet→Braviary-Hisui mail vanishes — the user's Poliwhirl→Politoed case), the taken mail itself, and that form's level-up/TM move mails — they reference a Pokémon no longer in the box. Then one-hop chains the new form's next level-gated evo, as before. *(Decision: also purges the pre-evo's level/TM mails per "todo el mail sobre el pokemon que acaba de evolucionar"; the evolved form re-accrues its own move mails on the next boss defeat.)*
  - **Button association + stale-button guard.** Confirmed `doEvolve` already targets the mail's own `payload.encounterKey`/`toSpecies` (per-mail), so each button evolves exactly its mail's Pokémon. Added a guard: it only fires if that encounter is still in the box AND currently the mail's pre-evo form, so a leftover/stale button can never re-mutate an already-evolved (or fainted) entry. The dead `m.evolved`→"Evolved ✓" render branch is left in place (harmless; renders legacy stored mails gracefully).
  - Verified (headless, Rufflet boxed, both branches present): clicking the Braviary Evolve button → box overlay = SPECIES_BRAVIARY and the sibling Braviary-Hisui evo mail is deleted (`AFTER evo mails: []`). `cd randomizer && npm test` 422 green; `check-tracker` OK.
- **2026-06-20** — Review round 2 (user feedback): three mail/evolution fixes in `template.html` (mail engine; outside Jest scope per CLAUDE.md, verified by data simulation + headless screenshots on `debug/run-5`).
  1. **Next-boss reward leak.** A boss's TM segment is `boss-own trainers ∪ trainers with level ∈ (prev, next]`, and `next` (the next boss's level) is inclusive — so the *next* boss (e.g. Brawly, Lv 19) was swept into the current boss's segment (Rival–Rustboro, window (17,19]), mis-attributing Brawly's "TM Charm" to the rival AND re-sending it when Brawly is later defeated. Fix: exclude trainers belonging to **any other boss** (`otherBossTrainers`) from the level-band scan. Verified: `Brawly in NEW seg: false`; only the genuine non-boss trainer (Josué) remains.
  2. **Mail thumbnails not clickable.** Added `evo-link` + `data-id` to `.mail-thumb`, reusing the existing document-level `.evo-link` handler → clicking a mail's Pokémon sprite opens its modal. Verified: thumb click opened Rufflet's modal.
  3. **Stone+level evolutions ignored.** `levelEvos()` only matched `LEVEL`/`LEVEL_BATTLE_ONLY`; stone evos in this romhack are `EVO_ITEM` + `CONDITIONS({IF_MIN_LEVEL,N})` (the parser already captures `evo.minLevel`, TDD'd in `parserEvo.test.js`, committed `ca3ceffc46`). Rebuilt `levelEvos()` into `evoGateLevel()` + `levelEvos()` returning `{pokemon, level, method, param}`, treating ITEM-with-minLevel as level-gated; updated all four call sites (mail gen, doEvolve chain, box-section, docBoxEvolve) to use `ev.level`. Now stone evos notify and appear in the modal box-section. Verified on Rufflet (Route 104 surf): mail shows both "Rufflet → Braviary (Lv 20)" and "Rufflet → **Braviary Hisui** (Lv 25)"; modal box-section lists both with Evolve buttons. (The modal's main Evolution section already rendered "Level N + Stone".) Note: run-5 bundle predates `minLevel`, so the harness injects it to mimic the live pipeline — confirmed present in `frontend/data/base-data.json` (Pikachu→Raichu `minLevel:"25"`).
- **2026-06-20** — Bug (user-found, mail engine): the Route 103 rival's TM mail was **triplicated**. Root cause: `FLAG_DEFEATED_RIVAL_ROUTE103` maps to 6 rival variants (BRENDAN/MAY × the 3 starter-counters); in the seen run the 3 MAY variants all award the identical `TM Psych Up`, and the TM-mail `id` was keyed by trainer (`tm|flag|tid|encounterKey|move`), so each variant produced its own mail. Fix (`template.html`, mail engine — outside the Jest scope per CLAUDE.md, so verified by data simulation + headless): (1) key the TM-mail id by `tm|flag|encounterKey|moveId` (no trainer) so identical rewards from variant trainers collapse via the idempotent `addMail`; (2) attribute a boss's own-trainer reward to the **boss label** (`b.label` → "Rival – Route 103") instead of the ugly per-variant name, level-banded trainers keep their own label; (3) `dedupeTmMails()` self-heal in `reconcile()` collapses pre-fix stores (same `capFlag|encounterKey|moveId`, keeps oldest, preserves read). Verified against `debug/run-5`: a single Psych-Up learner went **OLD 3 ids → NEW 1**; in-browser the rival segment now shows exactly one TM mail per (box Pokémon, move) — 5 Psych-Up mails = 5 *distinct* box mons, not 15 (5×3). Mail's per-Pokémon one-mail-per-TM behaviour is intended and unchanged.

- **2026-06-20** — Review round 4 (user feedback, **pending — must be fixed before closing**; not yet implemented):
  1. **Branching evolutions over-purge mail.** For Pokémon with multiple possible evolutions (e.g. Braviary: Rufflet → Braviary / Braviary-Hisui), choosing one evolution — whether via the Mail Evolve button **or** the modal box-section Evolve — must delete **only the mail(s) of the non-chosen evolution branches**, not every mail about that form. Current behaviour (the round-3 `evolveEntry` purge) deletes **all** of them. Scope the purge to the sibling branches that were *not* taken; keep the taken evolution's own follow-up mails as appropriate.
  2. **Brief "evolved" feedback before marking read.** When an evolution is taken, the mail should first show a `[tick] evolved` state for ~0.5s, and only **after** that interval be marked as read. Gives the user a moment of visual feedback instead of the mail flipping straight to read.
- **2026-06-20** — Review round 4 **resolved** (reworks the round-3 `evolveEntry` purge above).
  1. **Sibling-only purge.** `evolveEntry(key, fromSp, toSp)` now deletes only the *non-chosen* evolution branches for this encounter (`type==='evolution' && fromSpecies===fromSp && toSpecies!==toSp`) instead of every mail about the form. The taken evolution mail is kept and marked `evolved=true`; the form's level-up/TM move mails are left untouched. Removed the now-unused `entrySpeciesOf` helper.
  2. **Evolved-then-read feedback.** The taken mail is marked `evolved` immediately (renders "Evolved ✓" via the existing — now live — render branch), and a 500 ms `setTimeout` then sets `read=true` and re-renders (only if Mail is active). Applies to both the Mail Evolve button and the modal box-section Evolve (shared `evolveEntry`).
  - Verified (headless, Rufflet boxed, both branches present): BEFORE `[Braviary{evolved:false,read:false}, Braviary-Hisui{…}]`, level#6 tm#23 → at +200 ms `[Braviary{evolved:true,**read:false**}]` (sibling Hisui gone, not yet read) → at +700 ms `[Braviary{evolved:true,**read:true**}]`, level#6 tm#23 **unchanged**. `cd randomizer && npm test` 422 green; `node scripts/check-tracker.mjs` OK.

- **2026-06-20** — Review round 5 (user feedback): faint toggles in the modal box section + a family-grouping finding.
  1. **"Mark fainted" on IN BOX (Case 1)** and **"Undo" on the fainted message (Case 3).** Both go through `window.docSetFainted(routeId, slot, fainted, speciesId)`, which toggles the **same** per-encounter `.nz-faint-cb` checkbox the Encounters tab uses (dispatching `change` → `handleFaintChange` → `onBoxMaybeChanged`) and then re-opens the modal so its box section reflects the new state. This keeps faint state coherent across the Encounters tab, Mail, PC and the modal. Verified (headless, Chimchar boxed): IN BOX shows "Mark fainted" → click sets `nuzlocke_v1.STARTER_EXTRA.fainted=[special2]` and the section flips to "Chimchar is fainted" + Undo → Undo clears it back to `[]` and IN BOX returns. `cd randomizer && npm test` 422 green; `check-tracker` OK.
  2. **Family-grouping finding (Goomy ↔ Goodra-Hisui).** `familySet()` grouped by the species' `family` field. In the expansion data Goomy is `P_FAMILY_GOOMY` but the Hisuian branch (Sliggoo-Hisui, **Goodra-Hisui**) is `P_FAMILY_GOOMY_HISUI` — a separate family constant — so they didn't group, hence no "Family Pokémon in box". They ARE linked by *evolution* (Goomy's own data has `EVO_ITEM Metal Coat → Sliggoo-Hisui`).
- **2026-06-20** — Fix #3 implemented (user asked to do it before closing). Rebuilt `familySet()` on a union-find that unions species by **both** the `family` field **and** the evolution graph (each poke unioned with its `evolutions[].pokemon`). Since the field-union preserves every prior grouping and the evolution edges only *add* regional bridges, the result is a strict superset of the old grouping → no family can become un-grouped (no regression), it only unites regional branches the data files separately. Verified (headless): boxing a **Goodra-Hisui** and opening **Goomy**'s modal now shows "Family Pokémon in box: Goodra Hisui" (was empty before). `cd randomizer && npm test` 422 green; `node scripts/check-tracker.mjs` OK.

## Outcome

- **2026-06-20** — Closed at the user's explicit request (`Cierra la tarea, commit y merge`) after five review rounds of manual testing.

**Shipped:** Box/evolution coherence in the generated docs — a live "Current level cap: N" header readout and a Pokédex-modal "box" section (before Evolution) covering four cases (IN BOX with cap-gated Evolve incl. stone+level evolutions / family-in-box / family-fainted / obtainable-on-route), all sprites clickable. Mark-fainted + Undo from the modal stay in sync with the Encounters tab; evolving purges only the non-chosen branches and shows an "Evolved ✓"-then-read feedback; family grouping unites regional branches via an evolution-graph union-find. Build-side: stone evolutions surface their `IF_MIN_LEVEL` (parser already captured `minLevel`).

**Deviations from plan:** the box-section grew beyond the original 4-case spec via review feedback — rival-TM dedup, next-boss reward exclusion, clickable mail thumbnails, stone+level evolutions, sibling-only evolve purge + delayed read, modal faint toggles, and evolution-graph family grouping (rounds 2–5). All in `template.html` (mail engine), outside the Jest suite per CLAUDE.md, verified by data simulation + headless screenshots. Suite stayed 422 green throughout.

**Follow-ups:** **T-009** (PC box-grid tab) was developed on this same branch and ships with this merge but remains `in-progress` pending the user's manual test. **T-010** (per-section scroll policy) noted for later.
