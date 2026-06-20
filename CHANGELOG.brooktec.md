# Changelog (Brooktec)

Project-version history for the Brooktec randomizer/analysis work in this repo.
This is **separate** from the upstream game changelog in `CHANGELOG.md`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer 2.0](https://semver.org/). Each line references the task/bug that produced it.

## [Unreleased]

### Changed

- Moves tab in the generated docs now shows each move's in-game description on its card, a `TM{NN}` badge for TM moves with the in-world location it's obtained from (route + trainer), and a "TMs only" filter that orders results by TM number; hovering a move in the Pokédex modal shows its description. Move descriptions are parsed properly from `moves_info.h` (single-line, multi-line and shared-constant `.description`s), TM numbers are derived from the run's TM pool, and TM locations come from the `randomizer/docs/tms.md` SSOT (T-011).
- Docs icon polish: the "added/new" markers (new learnset move, new TM, added ability) and the LEGENDARY badge now use the `star.png` pixel icon instead of star/sparkle glyphs; the Encounters "captured" control is now a Poké Ball icon; and the captured/delayed/fainted controls have tooltips ("Mark as captured/delayed/fainted") (T-011).
- Generated docs now apply a per-section scroll position when you open a tab: Encounters jumps to your last captured route and Trainers to your last defeated trainer (your progress frontier), while Mail, Pokédex, Moves, Abilities and PC open at the top (T-010).
- Docs Obsidian polish: flattened the remaining rounded/gradient elements that the re-skin missed (tier badges, poke/flag cards, LEGENDARY badge), made tier badges a raised bordered/shadowed plaque distinct from type chips, enlarged + made trainer-team move names readable, and bigger menu icons. Added a reusable emoji→pixel-icon mechanism (`getIcon`/`data-icon` over `frontend/assets/*.png`, emoji fallback) so hand-drawn icons drop in incrementally; the generating gear now spins (T-006).
- Generated docs now isolate their `localStorage` per run: each doc bakes in a stable per-run namespace (seed + player + ROM) and suffixes every storage key with it, so opening docs from two different runs in the same browser/origin no longer makes them collapse onto each other's nuzlocke / filter / nav state. Un-generated template falls back to the legacy shared keys (T-005).
- Docs overhaul: the generated docs are now fully self-contained (fonts + assets embedded as base64; **zero** external network requests), re-skinned to the Obsidian UI kit to match the app, and ~65% smaller (15.8 → 5.5 MB) by dropping unrendered pipeline fields at injection time. Adds a reusable `frontend/assets/` embedding mechanism. Supersedes T-002 (T-004).
- Re-skinned the randomizer front-end app with the Obsidian UI kit (retro 8-bit / GBA-era: navy surfaces, ember-orange + cyan, Press Start 2P + VT323, hard edges, offset shadows). Re-authored `frontend/css/{base,components,layout}.css` keeping all class names; the docs are unaffected (T-003).

### Added

- A max-priority "Congratulations — you beat the game!" victory mail (with a star badge) that appears in the docs' Mail tab when you mark Champion Steven defeated; it sorts above every other notification and has its own filter chip once earned (T-011).
- PC tab in the generated docs (between Trainers and Mail): a single scrollable, non-paginated grid of your box Pokémon, each clickable to open its detail modal, with an Available ↔ Fainted toggle (the Fainted view renders each Pokémon in black-and-white). Also makes the obtained Pokémon's evolution stage coherent everywhere — the Encounters tab now shows the evolved form, fainting freezes a Pokémon at the form it fainted at, and deselecting rolls it back to its base form (T-009).
- Box/evolution coherence in the docs: a live "Current level cap: N" header readout, and a Pokédex-modal "box" section (before Evolution) showing how any Pokémon relates to your box — IN BOX (with cap-gated Evolve actions, including stone+level evolutions like Hisuian forms), a family member in box, a fainted family member, or where a family member is obtainable. Mark-fainted / undo from the modal stays in sync with the Encounters tab; evolving removes only the non-chosen branches and shows brief feedback. Family grouping unites regional branches via the evolution graph (T-008).
- Mail notifications tab in the generated docs (between Trainers and Pokedex): a level-cap-driven inbox that, as you mark bosses defeated, surfaces static-encounter unlocks, available evolutions (with an Evolve action), and newly available level-up / TM moves for the Pokémon in your box. Per-type mute, mark-all-read, unread bubble, filters. Backed by a build-time boss↔level-cap↔flag SSOT (`randomizer/bossCaps.js`, parsed from `src/caps.c` with a 1-to-1 assertion) (T-007).


- Self-contained docs sprites: `build.js` now generates `frontend/data/sprites.json` (gitignored) — a base64 map of every Pokémon/trainer sprite, encoded as cropped 8-bit indexed PNGs with transparency (~3x smaller than RGBA). The frontend embeds them into each generated doc, so docs render images with zero external CDN dependency. New TDD-covered modules `randomizer/spriteMapper.js` (source parsing/mapping) and `randomizer/spriteImage.js` (crop + indexed-PNG encoder), plus the `randomizer/generateSprites.js` orchestrator (T-001).
