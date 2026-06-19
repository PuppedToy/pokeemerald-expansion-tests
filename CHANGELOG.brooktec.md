# Changelog (Brooktec)

Project-version history for the Brooktec randomizer/analysis work in this repo.
This is **separate** from the upstream game changelog in `CHANGELOG.md`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer 2.0](https://semver.org/). Each line references the task/bug that produced it.

## [Unreleased]

### Added

- Self-contained docs sprites: `build.js` now generates `frontend/data/sprites.json` (gitignored) — a base64 map of every Pokémon/trainer sprite, encoded as cropped 8-bit indexed PNGs with transparency (~3x smaller than RGBA). The frontend embeds them into each generated doc, so docs render images with zero external CDN dependency. New TDD-covered modules `randomizer/spriteMapper.js` (source parsing/mapping) and `randomizer/spriteImage.js` (crop + indexed-PNG encoder), plus the `randomizer/generateSprites.js` orchestrator (T-001).
