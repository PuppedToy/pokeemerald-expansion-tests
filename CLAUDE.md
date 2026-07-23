# CLAUDE.md

**pokeemerald-expansion-tests** — a fork of [pret's `pokeemerald`](https://github.com/pret/pokeemerald) via [`pokeemerald-expansion`](https://github.com/rh-hideout/pokeemerald-expansion), a GBA ROM-hack base. The Brooktec work in this repo is the **randomizer / analysis / ROM-builder pipeline** under `randomizer/`, `analyze.js`, `make.js`, and `backend/` — not the C game engine itself.

Stack: Node.js pipeline (`randomizer/`, Jest tests) + Express backend/frontend (`backend/`) on top of the C decomp (built with `make`). Everything committed to this repo — code, docs, file names, commits — is written in **English**.

## Commands

<!-- The single catalog of commands. Other docs reference these by name, never restate them. -->

- `cd backend && npm start` — run the frontend/backend locally → open `http://localhost:3000`
- `cd randomizer && npm test` — run the randomizer Jest suite (typecheck/lint n/a). **Run it before considering any pipeline work done.**
- `cd randomizer && npm test -- --testPathPattern=config` — run one test file
- `node analyze.js` — run the randomizer pipeline (analysis only; never compiles a ROM). See **Randomizer pipeline** below for flags.
- `node make.js --bundle=./path/to/bundle.json` — build ROM(s) from a bundle (ROM-builder machine only)
- `node scripts/check-tracker.mjs` — validate tasks/bugs/changelog consistency (`--write` regenerates indexes)
- `cd backend && node scripts/export-feedback.mjs [--csv]` — dump all submitted user feedback (JSON, or `--csv`) for manual analysis

## Single Source of Truth (SSOT)

Every fact has exactly one home. Before writing a fact anywhere, find its home: if it exists, update it there and link to it; if not, create the single home. Never copy.

| Fact | Its only home |
|---|---|
| Brooktec project version | `CHANGELOG.brooktec.md` (+ git tag) |
| Upstream game version history | `CHANGELOG.md` (upstream — do not repurpose) |
| Commands | the **Commands** section above |
| Work status & history | `tasks/` (one file per task) |
| Known bugs | `bugs/` (one file per bug) |
| Decisions & their why | `docs/adr/` |
| Pipeline design reference | `randomizer/docs/` (see **Randomizer pipeline**) |
| Everything else documented | `docs/` via `docs/INDEX.md` |

Rules:
- **Link, don't copy.** Reference the home (`see docs/adr/ADR-003`), never restate its content.
- **Derive, don't duplicate.** Generated files are derived from source and never hand-edited (see the never-commit list below).
- **Conflict priority:** code & lockfiles > schemas > ADRs > docs > comments. When sources disagree, the loser is fixed in the same change — drift found is drift repaired, never propagated.
- **Status lives in the tracker only.** Never write "current status" into READMEs, docs or summary files.
- Do NOT create root-level summary/notes `.md` files unprompted. New documentation goes under `docs/` and gets linked from `docs/INDEX.md`.

## Task system

All work is traceable. Every non-trivial change (feature, fix, refactor, doc overhaul) belongs to a task file.

- Tasks live in `tasks/T-NNN-slug.md` (monotonic IDs, copy `tasks/TEMPLATE.md`). Lifecycle: `proposed → in-progress → done` (or `abandoned`).
- Each task carries: frontmatter (id, status, dates, `target-version`, links), a **Plan** with acceptance criteria, an **append-only dated Progress Log** (including dead ends), and an **Outcome** when closed.
- Before starting work: open (or create) the task, set it `in-progress`, write the plan. After meaningful progress: append a dated log entry. Never rewrite past log entries.
- **One branch per task (git flow).** If the repo uses git flow, starting a task opens its branch — `git flow feature start T-NNN-slug` (off `develop`) — and closing it runs `git flow feature finish` (back into `develop`).
- One task `in-progress` per person/agent at a time. If scope changes, log it in the task — the task file is the only home of its truth.
- **Closing requires the user.** A task only moves to `done` after the agent asks the user to manually test the result and the user explicitly confirms it is OK. An agent NEVER closes a task autonomously — not even with all acceptance criteria met and checks green — unless the user explicitly asks it to.
- `tasks/INDEX.md` and `bugs/INDEX.md` are **generated caches** (`node scripts/check-tracker.mjs --write`) — never edit them by hand.
- Use the skills: `/task-new`, `/task-close`, `/bug-new`, `/bug-close`, `/release`.

## Bugs and regression tests

- Every bug found is registered in `bugs/B-NNN-slug.md` (copy `bugs/TEMPLATE.md`) with severity, `found-in` version, root cause.
- **Iron rule: a bug may only be marked `fixed` when a regression test exists that reproduces it** — named/annotated with the bug ID, verified to FAIL before the fix and PASS after. The test path goes in the bug's `regression-test` field. No test, no closed bug.
- Bugs never get deleted; the registry is the project's full bug history.

## Versioning

- **SemVer 2.0**: MAJOR breaking, MINOR feature, PATCH fix. `CHANGELOG.brooktec.md` follows **Keep a Changelog** (newest first, `[Unreleased]` section on top). The upstream `CHANGELOG.md` is the game's own history and is left untouched.
- Every task and bug declares its `target-version`. Closing a task/bug adds its line under `[Unreleased]`.
- Releasing (`/release X.Y.Z`): all tasks/bugs for that version closed, checks green, `[Unreleased]` promoted to `[X.Y.Z] - YYYY-MM-DD`, version bumped in its home, and the release cut through `git flow release`.

## TDD — mandatory

All logic in `randomizer/` (except the HTML template) is covered by automated tests. Follow the Red → Green → Refactor cycle for any new feature or bug fix.

1. **Red** — write the test that describes the behavior first and **watch it fail** (`cd randomizer && npm test`). Confirm it fails for the right reason — the assertion itself, not a syntax/import error.
2. **Green** — write the minimum production code to make it pass. Refactor on green without breaking any test.
3. NEVER modify an existing test to make your code pass. **If a test fails after your change, the code is wrong — not the test.** Only change a test if the *specification* itself deliberately changed (say so in the task log and commit). Do not delete or weaken a test because it is inconvenient.
4. Bug fixes start from the failing regression test (see Bugs above).
5. **Tests are the specification.** Untested paths are invisible to future changes. Tests pass before every commit — do not commit with a failing suite.

Test layout (suite runs in <2 s):

```
randomizer/__tests__/
  unit/        ← pure-function tests (no I/O, no filesystem)
  integration/ ← snapshot tests that exercise the full parse+rate pipeline
  fixtures/    ← shared miniMoves, miniPokes, miniAbilities objects
```

## Randomizer pipeline

### Always run the pipeline through `analyze.js`, never `randomizer/index.js` directly

Running `randomizer/index.js` directly generates corrupted output and leaves mutated `src/` files in place; `analyze.js` cleans up correctly after each run (even on crash/Ctrl-C). It:
1. **Aborts before running** if `data/` has uncommitted changes (the pipeline mutates `data/maps/` — the guard prevents silent data loss).
2. **Restores after running** (via `finally`): `src/`, `include/`, and `data/maps/` only. Other `data/` subdirectories are left untouched.

Commit any changes to `src/`, `include/`, or `data/maps/` before running.

| Use case | Command |
|----------|---------|
| Production run — rebalanced game | `node analyze.js` |
| Test rater in isolation | `node analyze.js --no-balance` |
| Identify Phase C TM gaps | `node analyze.js --no-balance --all-tms` |
| Seeded / hard / debug | `node analyze.js --seed=42 --difficulty=hard --debug` |

**Phase C note:** without `--all-tms`, teachable moves are filtered to this game's actual TM pool (`include/constants/tms_hms.h`); with `--all-tms`, all teachable moves are treated as available. Compare the two outputs to find pokemon that need a specific TM added to reach their expected tier.

### Generated files — almost never commit

These are regenerated from source on every run; committing them pollutes history and corrupts base data.

- **Source mutated by the randomizer/rebalancer:** `src/data/pokemon/species_info/gen_*.h`, `src/data/pokemon/level_up_learnsets/gen_9.h`, `src/data/pokemon/teachable_learnsets.h`, `src/data/trainers.party`, `src/data/wild_encounters.json`, `src/starter_choose.c`, `src/data/script_menu.h`, `src/data/trade.h` (its `sIngameTrades[]` block — T-194), `include/constants/tms_hms.h`, `data/maps/**/scripts.inc`, `data/maps/**/map.json`.
- **Randomizer caches:** `randomizer/pokes.json`, `randomizer/level_up_learnsets.json`, `randomizer/teachable_learnsets.json`.
- **Viewer output (keep locally, not in history):** `randomizer/output/out.html`, `randomizer/output/{pokes,trainers,moves,abilities,wildpokes}.js`.

### ROM builds & debug runs

`analyze.js` only analyses. ROMs are built by a separate pipeline on a dedicated builder machine: a `bundle.json` (full randomizer output for one session) is moved to the builder, then `node make.js --bundle=...` writes the game files (`randomizer/writer.js` + TM/item writers) → runs `make` → saves the ROM → restores mutated source. Anything under `debug/<run>/` was produced this way: `bundle.json` (input), `log.txt` (stdout), `logError.txt` (stderr — the real error is usually near the **end**), `rom-*.html` (viewer). A bundle is clean input; corruption almost always originates in the writers (`randomizer/writer.js`, `tmRandomizer.js`, `itemRandomizer.js`), not the bundle.

### Design reference — `randomizer/docs/`

| File | Purpose |
|------|---------|
| `tms.md` | Full TM/HM table: slot number, pool, in-world location. Verify gym reward TM slots, pick-list assignments, unplaced slots. |
| `pick-list-howto.md` | Checklist for wiring a new 3-choice TM pick: which files to touch and in what order. |
| `items.md` | All item categories/pools (fixed, `goodItemPool`, `averageItemPool`, `plates`, `gems`, `protectionBerries`, `fullItemPool`) and every world location with flag, pool, trainer bag cascade. |
| `teachables.md` | Per-run TM teachable expansion: algorithm, constants, data fields (`newTeachables`/`oldTeachables`), viewer surfacing. |
| `trainer-determinism.md` | How shared-trainer teams stay consistent across a bundle's ROMs (per-slot reseeding) and the known, deliberately-unfixed family-dedup limitation. |
| `wild-encounters.md` | Wild-encounter generation: the sweep ("batidas") algorithm, `deterministic` vs `classic` (variable species per zone), the template-keyed plan and structural JSON writer. |
| `randomization-options.md` | Every frontend config option and how it threads to the pipeline (categories, defaults, RNG caveat). |

## Documentation

- `docs/INDEX.md` is the entry point for Brooktec docs and must list every document we add. A doc not in the index does not exist. (The upstream mdbook docs in `docs/` — `SUMMARY.md`, tutorials, etc. — are the game's own and are not governed by this index.)
- Decisions (architecture, tooling, conventions) are recorded as ADRs in `docs/adr/` (copy `docs/adr/TEMPLATE.md`), one decision per file, immutable once accepted (supersede, don't rewrite).
- Pipeline design facts live in `randomizer/docs/` (see table above), not in this file.

## Workflow

- **Branching: git flow.** `develop` is the integration branch, `main` holds released versions; work lives on `feature/T-NNN-slug` branches, releases go through `git flow release`, urgent fixes through `git flow hotfix`. Run `git flow init -d` once if the repo isn't set up.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`…), one logical change per commit, reference the task/bug ID in the body.
- Definition of done: acceptance criteria met, `cd randomizer && npm test` green, task log updated, `CHANGELOG.brooktec.md` line added (if user-visible), no SSOT violations introduced.
- After two failed attempts at the same fix, stop, log the dead end in the task, and reassess the plan.
- **Deploys are owner-gated.** The agent has **no push permission**: to deploy a change, the **owner runs `git push`** and then **explicitly gives the go-ahead**, and only then does the agent run `deploy/update.sh`. The agent never pushes and never deploys un-pushed or un-greenlit code. (DNS / docs / changelog-only changes need no deploy — `update.sh` is for code.) Full loop: `docs/dev-deploy-workflow.md`.

## Do NOT

- Do NOT close a task without the user's explicit confirmation that they manually tested it and it is OK.
- Do NOT `git push` or deploy on your own — the owner pushes to origin and gives the go-ahead first, then you run `deploy/update.sh` (see Workflow).
- Do NOT mark a bug fixed without its regression test.
- Do NOT run `randomizer/index.js` directly — always go through `analyze.js`.
- Do NOT commit randomizer-generated files (see the never-commit list above) or edit generated files (`tasks/INDEX.md`, `bugs/INDEX.md`).
- Do NOT repurpose the upstream `CHANGELOG.md`; Brooktec versioning lives in `CHANGELOG.brooktec.md`.
- Do NOT duplicate a fact that already has a home — link to it.
- Do NOT weaken, skip or delete tests, lint rules or hooks to get to green.
- Do NOT commit credentials. OCI CLI config + API key live in `~/.oci/`; the deploy box's SSH key in `~/.ssh/emerald_box`; deploy secrets (subnet/host/keys) in the gitignored `deploy/.env` / `deploy/.env.local`. The in-project `.oci/` is gitignored too. Deploy how-to: `docs/deploy-oracle.md`.

---
Based on **Brooktec Base** ([brooktec-claude](https://github.com/brooktec/brooktec-claude)) — adopted version: **0.0.1**. To upgrade, diff against the newer `template/` and apply.
