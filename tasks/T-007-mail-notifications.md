---
id: T-007
title: Mail notification tab in the docs (level-cap-driven, between Trainers and Pokedex)
status: done
type: feature
created: 2026-06-20
updated: 2026-06-20
target-version: 0.1.0
links: [tasks/T-005-per-run-docs-localstorage.md, tasks/T-006-docs-obsidian-polish.md]
blocked-by: []
---

# T-007 — Mail notifications (level-cap driven)

## Context

The generated docs track a Nuzlocke run (capture/faint/defeat). This adds a **Mail** inbox
(between Trainers and Pokedex) that proactively tells the player what they can do now as the
**level cap** rises — and the cap rises each time a specific boss is defeated. Cap levels are
the SSOT in `src/caps.c` (`sLevelCapFlagMap`); the boss↔flag relation is 1-to-1 and is made an
explicit code SSOT so it never drifts. Full design: `.claude/plans/nueva-feature-justo-entre-snoopy-island.md`.

## Plan

See the approved plan file for the full design + the 32-row boss↔cap↔flag mapping table.
Summary:
- **SSOT**: `randomizer/bossCaps.js` — `parseLevelCaps(capsC)` (from caps.c) + `BOSS_CAP_TRAINERS`
  (flag→{trainers,label}) + `buildBossCaps()` joining them with a 1-to-1 assertion.
- **Build**: `build.js` writes `frontend/data/bosscaps.json` (gitignored); `app.js` injects it as
  the `bossCaps` global into each doc.
- **Doc engine** (`template.html`): Mail tab + section + self-contained IIFE. Box-with-evolution
  overlay; 4 mail types (static / evolution / level-up move / TM move) generated per cap advance
  over the window `(prevLevel, newLevel]`; evolve button (one-hop chain, no move mails); per-type
  mute; mark-all-read; per-mail read toggle; unread bubble on the tab; sort read>unread, priority
  static>evo>level>tm, date new>old; skip→confirm + ordered catch-up; uncheck purges + recheck
  regenerates. Hooks into existing `handleDefeatChange`/`handleSelectChange`/`handleFaintChange`.
- **Icons** (present): `mail` (unread/nav), `openMail` (read), `evolution`, `moves`; emoji fallback for the rest.

Acceptance criteria:
- [x] `randomizer/bossCaps.js` parses caps.c and joins the SSOT map with a build-failing 1-to-1 assertion; unit-tested.
- [x] `build.js` emits `frontend/data/bosscaps.json` (gitignored); `app.js` injects `bossCaps`.
- [x] Mail tab sits between Trainers and Pokedex with an unread-count bubble.
- [x] Defeating a boss generates the 4 mail types correctly over the cap window; verified on a real bundle by headless screenshot.
- [x] Evolve button updates the box species (+one-hop chain) and generates no move mails; mute makes a type arrive read; mark-all-read works; uncheck purges and recheck regenerates; skip prompts and catches up in order.
- [x] App (`index.html`) unaffected; docs remain self-contained (0 new external requests); `cd randomizer && npm test` green; `node scripts/check-tracker.mjs` green.

## Progress log

- **2026-06-20** — Task created from approved plan. Researched + documented the 1-to-1 boss↔cap↔flag mapping (caps.c + map scripts). Icons present: mail, openMail, evolution, moves.
- **2026-06-20** — Implemented. (1) `randomizer/bossCaps.js`: `parseLevelCaps` + `BOSS_CAP_TRAINERS` (32-row SSOT) + `buildBossCaps` with a 1-to-1 assertion; `STATIC_UNLOCKS`. TDD `bossCaps.test.js` incl. a real-`caps.c` integrity test (suite 422 green). (2) `build.js` step 5 writes `frontend/data/bosscaps.json` (32 bosses, gitignored). (3) `app.js` loads + injects `bossCaps` via a `bosscaps.js` placeholder. (4) `template.html`: Mail nav (between Trainers/Pokedex) + bubble, `#mail` section, reset-handler line, and **3 one-line hooks** in the existing nuzlocke handlers. (5) Self-contained Mail engine IIFE: box-with-evolution overlay; per-cap generation of the 4 types over `(prev,next]`; reconcile model (generate defeated-not-generated in order, delete on un-defeat — handles skip + auto-defeat ordering with monotonic timestamps); skip → confirm + catch-up; evolve (overlay + read + one-hop chain, no move mails); per-type mute; mark-all-read; per-mail read toggle; unread bubble; filters; sort **unread-first** then priority (static>evo>level>tm) then date (new>old), read dimmed; injected Obsidian CSS.
  - Verified by headless screenshots on `debug/run-5` (seeding bosses 0–14, STARTER_EXTRA auto-boxed): static mails show live randomized species (Ditto@Desert Ruins, …@Island Cave/New Mauville), evolution mails with Evolve buttons (Chimchar→Monferno), level-up move mails within correct windows; filter chips, mute toggles, Evolve→"Evolved ✓"+read, Mark-all-read dims all + clears the 85-bubble. App unaffected; suite 422 green; build green.
  - To confirm in manual test: evolve one-hop chaining with a known by-level chain; the `FLAG_MET_RIVAL_LILYCOVE`→Wally nuance.
- **2026-06-20** — Bug (user-found): only 3 of the 9 STARTER_EXTRA mons entered the box → only 3 sets of notifications. Cause: the Mail engine's local `ENCOUNTER_TYPES` listed only `special1..special3` (and bogus `rock/grass/fish`), but STARTER_EXTRA stores its 9 mons in `special1..special9`. Fix: align the list to the canonical `ENCOUNTER_TYPES` (special1..special9). Verified: box size now 9; evolution mails cover all eligible starters (Skarmory/Kubfu correctly excluded — no level evolution).
- **2026-06-20** — Icon pass: TM mail badge → `moves` (no `tm.png`); level badge stays `buffed`. Wired all remaining new icons, replacing emoji fallbacks doc-wide: BUFF marker ⭐→`buffed`, NERF 🔻→`nerfed`, mixed/mutated 🔧→`adjusted` (in `getLogIcon`/`getFullPokeLogIcon`/`bstIcon`); nuzlocke fainted 💀→`fainted`; `boss` icon added to boss trainer card titles and the encounters "BOSS REWARD" badge. All 18 asset icons now in use. Remaining emojis without a PNG (kept as fallback): check ✓, clock ⏱, legendary ✦, heart ❤️; app landing emojis (⚖🎲🔗📦) unchanged (no matching icons). Verified by headless screenshots (pokedex markers, trainers).
- **2026-06-20** — Review tweaks: (a) per-type badge overlaid bottom-right of the envelope icon — `buffed` (level), `moves` (TM), `evolution` (evo), `encounters` (static); all use existing icons (no `tm.png` needed). (b) Level-up move mails are now **one per move** with title "X can learn <Move>" (like TM), subtitle "Learned at Lv N". (c) TM title "X can learn TM <Move>". (d) TM subtitle uses the **full trainer name** (label or id minus trailing _N, e.g. "Chester"/"Lass Haley"), mirroring the Trainers tab — not just the class. Verified by headless screenshots.

## Outcome

- **2026-06-20** — User reviewed iteratively (multiple screenshot rounds + the STARTER_EXTRA box fix) and opted to close here; committed and merged to master.

**Shipped:** A level-cap-driven **Mail** inbox in the generated docs (between Trainers and Pokedex).
SSOT in `randomizer/bossCaps.js` (caps.c levels × the documented 32-row boss↔flag map, joined with a
build-failing 1-to-1 assertion; TDD'd incl. a real-caps.c integrity test). `build.js` emits
`frontend/data/bosscaps.json`; `app.js` injects `bossCaps`. The self-contained Mail engine generates 4
mail types per cap advance (static / evolution / level-up move / TM move) over `(prev,next]`, with a
box-with-evolution overlay, evolve (one-hop chain, no move mails), per-type mute, mark-all-read,
per-mail read toggle, unread bubble, filters, unread-first sort, skip→confirm+ordered catch-up, and
uncheck-purges/recheck-regenerates — all via 3 one-line hooks into the existing nuzlocke handlers. Also
wired every available pixel icon (mail/openMail/evolution/moves/buffed/nerfed/adjusted/fainted/boss/…),
replacing emoji across the docs, plus per-mail type badges.

**Deviations:** sort flipped to unread-first per user (plan had the literal read-first). Level-up move
mails are one-per-move (not one-per-Pokémon) per a later review request.

**Follow-up:** **T-008** — "current level cap" display + the Pokédex modal **box/evolution coherence**
section (IN BOX / family-in-box / fainted / obtainable-in-route). Split out so this task closes clean.

**Known item to confirm in real play:** the `FLAG_MET_RIVAL_LILYCOVE`→Wally mapping nuance (noted in
`bossCaps.js`); the build's 1-to-1 assertion guarantees coverage, only the trainer attribution is the
open question.
