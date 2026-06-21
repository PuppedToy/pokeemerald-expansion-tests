<div align="center">
  <img src="frontend/assets/emeraldCut.png" alt="Pokémon Emerald Cut logo" width="96"><br>
  <h1>Pokémon Emerald Cut</h1>
  <p><em>Your emerald cut for controlled chaos.</em></p>
</div>

**Pokémon Emerald Cut** is a fully randomized and rebalanced Pokémon Emerald experience. Every run is unique — mutated Pokémon tiers, randomized trainers, wild encounters and starters — and each ROM ships with a self-contained, offline, per-run documentation viewer (Encounters, Trainers, PC, Mail, Pokédex, Moves, Abilities). Play it normally, as a nuzlocke, or soul-linked, at a customizable difficulty.

The randomizer / analysis / ROM-builder pipeline lives under [`randomizer/`](randomizer/README.md), `analyze.js` and `backend/`. Run the app locally with `cd backend && npm start`, then open <http://localhost:3000>.

Pokémon Emerald Cut is built on **RHH's `pokeemerald-expansion`**, whose original project README follows below.

---

# About `pokeemerald-expansion`

![Gif that shows debugging functionality that is unique to pokeemerald-expansion such as rerolling Trainer ID, Cheat Start, PC from Debug Menu, Debug PC Fill, Pokémon Sprite Visualizer, Debug Warp to Map, and Battle Debug Menu](https://github.com/user-attachments/assets/cf9dfbee-4c6b-4bca-8e0a-07f116ef891c) ![Gif that shows overworld functionality that is unique to pokeemerald-expansion such as indoor running, BW2 style map popups, overworld followers, DNA Splicers, Gen 1 style fishing, OW Item descriptions, Quick Run from Battle, Use Last Ball, Wild Double Battles, and Catch from EXP](https://github.com/user-attachments/assets/383af243-0904-4d41-bced-721492fbc48e) ![Gif that shows off a number of modern Pokémon battle mechanics happening in the pokeemerald-expansion engine: 2 vs 1 battles, modern Pokémon, items, moves, abilities, fully customizable opponents and partners, Trainer Slides, and generational gimmicks](https://github.com/user-attachments/assets/50c576bc-415e-4d66-a38f-ad712f3316be)

<!-- If you want to re-record or change these gifs, here are some notes that I used: https://files.catbox.moe/05001g.md -->

**`pokeemerald-expansion`** is a GBA ROM hack base that equips developers with a comprehensive toolkit for creating Pokémon ROM hacks. **`pokeemerald-expansion`** is built on top of [pret's `pokeemerald`](https://github.com/pret/pokeemerald) decompilation project. **It is not a playable Pokémon game on its own.** 

# [Features](FEATURES.md)

**`pokeemerald-expansion`** offers hundreds of features from various [core series Pokémon games](https://bulbapedia.bulbagarden.net/wiki/Core_series), along with popular quality-of-life enhancements designed to streamline development and improve the player experience. A full list of those features can be found in [`FEATURES.md`](FEATURES.md).

# [Credits](CREDITS.md)

 [![](https://img.shields.io/github/all-contributors/rh-hideout/pokeemerald-expansion/upcoming)](CREDITS.md)

If you use **`pokeemerald-expansion`**, please credit **RHH (Rom Hacking Hideout)**. Optionally, include the version number for clarity.

```
Based off RHH's pokeemerald-expansion 1.13.1 https://github.com/rh-hideout/pokeemerald-expansion/
```

Please consider [crediting all contributors](CREDITS.md) involved in the project!

# Choosing `pokeemerald` or **`pokeemerald-expansion`**

- **`pokeemerald-expansion`** supports multiplayer functionality with other games built on **`pokeemerald-expansion`**. It is not compatible with official Pokémon games.
- If compatibility with official games is important, use [`pokeemerald`](https://github.com/pret/pokeemerald). Otherwise, we recommend using **`pokeemerald-expansion`**.
- **`pokeemerald-expansion`** incorporates regular updates from `pokeemerald`, including bug fixes and documentation improvements.

# [Getting Started](INSTALL.md)

❗❗ **Important**: Do not use GitHub's "Download Zip" option as it will not include commit history. This is necessary if you want to update or merge other feature branches. 

If you're new to git and GitHub, [Team Aqua's Asset Repo](https://github.com/Pawkkie/Team-Aquas-Asset-Repo/) has a [guide to forking and cloning the repository](https://github.com/Pawkkie/Team-Aquas-Asset-Repo/wiki/The-Basics-of-GitHub). Then you can follow one of the following guides:

## 📥 [Installing **`pokeemerald-expansion`**](INSTALL.md)
## 🏗️ [Building **`pokeemerald-expansion`**](INSTALL.md#Building-pokeemerald-expansion)
## 🚚 [Migrating from **`pokeemerald`**](INSTALL.md#Migrating-from-pokeemerald)
## 🚀 [Updating **`pokeemerald-expansion`**](INSTALL.md#Updating-pokeemerald-expansion)

# [Documentation](https://rh-hideout.github.io/pokeemerald-expansion/)

For detailed documentation, visit the [pokeemerald-expansion documentation page](https://rh-hideout.github.io/pokeemerald-expansion/).

# [Contributions](CONTRIBUTING.md)
If you are looking to [report a bug](CONTRIBUTING.md#Bug-Report), [open a pull request](CONTRIBUTING.md#Pull-Requests), or [request a feature](CONTRIBUTING.md#Feature-Request), our [`CONTRIBUTING.md`](CONTRIBUTING.md) has guides for each.

# [Community](https://discord.gg/6CzjAG6GZk)

[![](https://dcbadge.limes.pink/api/server/6CzjAG6GZk)](https://discord.gg/6CzjAG6GZk)

Our community uses the [ROM Hacking Hideout (RHH) Discord server](https://discord.gg/6CzjAG6GZk) to communicate and organize. Most of our discussions take place there, and we welcome anybody to join us!

---

# Randomizer

This fork includes a fully seeded randomizer and rebalancer on top of pokeemerald-expansion.
All randomization runs in the **browser** — no server needed for generation.

## Quick-start (web frontend)

```bash
# One-time build (re-run after any source .h file change):
node build.js

# Start the local server:
cd backend && npm start
# → open http://localhost:3000
```

Configure your run (Default / Nuzlocke / Soul-Link), review settings, click **Generate**.
The full randomizer pipeline runs client-side in a Web Worker.
Download a **ZIP** containing per-ROM Nuzlocke tracker docs, or the raw **bundle JSON**.

## CLI tools

### `analyze.js` — Quick randomization health check

Runs the full pipeline and opens an HTML viewer with trainer teams, wild encounters,
and starter picks. Does **not** compile a ROM.

```bash
node analyze.js                      # interactive prompts
node analyze.js --seed=42            # fixed seed
node analyze.js --difficulty=hard
node analyze.js --no-balance         # skip stat rebalancing
node analyze.js --all-tms            # treat all teachable moves as TMs
node analyze.js --debug              # level 5 teams, single-slot trainers
```

Output: opens `randomizer/output/out.html` in the default browser.

### `make.js` — ROM production

Randomizes and compiles GBA ROM(s). Requires devkitPro / agbcc toolchain on PATH.

```bash
# Full pipeline: fresh randomization → compile ROM
node make.js --randomize [--seed=42] [--difficulty=hard] [--no-balance] [--debug] [--clean]

# Bundle mode: compile ROM(s) from a pre-generated session bundle
node make.js --bundle=./path/to/bundle.json [--clean]

# Interactive mode (prompts for all options)
node make.js
```

Output: ROM(s) written to `roms/<sessionId>/`.

## Architecture

See [docs/RANDOMIZER.md](docs/RANDOMIZER.md) for the full pipeline design.
