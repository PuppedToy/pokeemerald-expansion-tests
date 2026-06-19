---
name: release
description: Cut a release X.Y.Z — verify all tasks/bugs for the version are closed, checks are green, promote [Unreleased] in the changelog and tag through git flow. Use when the user asks to release a version.
---

# Release X.Y.Z

1. Decide the version with SemVer 2.0 against the `[Unreleased]` content: breaking → MAJOR, feature → MINOR, only fixes → PATCH. Confirm with the user if ambiguous.
2. Verify readiness — abort and report if any fails:
   - No task or bug with `target-version: X.Y.Z` is still open (`tasks/INDEX.md`, `bugs/INDEX.md` after `--write`).
   - `node scripts/check-tracker.mjs` passes.
   - The project check command (and build, if any) is green.
   - Every `[Unreleased]` line traces to a task/bug id.
3. If the repo uses git flow, open the release branch: `git flow release start X.Y.Z`. Do steps 4-5 on it. (No git flow: do them on the integration branch and tag manually in step 6.)
4. In `CHANGELOG.brooktec.md`: rename `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD` and add a fresh empty `[Unreleased]` on top.
5. Bump the version in its other declared homes if the project has them (e.g. `package.json` **and its lockfile**) — the SSOT map in CLAUDE.md says where. Commit `chore(release): X.Y.Z`.
6. Cut the release:
   - **git flow:** `GIT_MERGE_AUTOEDIT=no git flow release finish X.Y.Z` — merges into `main`, tags it (prefix per `gitflow.prefix.versiontag`, often empty → `X.Y.Z`), and back-merges into `develop`. `GIT_MERGE_AUTOEDIT=no` avoids the merge-commit editor.
     - **getopt caveat (macOS/BSD without gnu-getopt):** a spaced tag message in `-m "..."` makes `git flow` abort. Finish with `-n` (no tag) and create the annotated tag yourself on `main`: `git tag -a X.Y.Z -m "<message>"`.
   - **no git flow:** commit and `git tag -a X.Y.Z -m "<message>"`.
7. Report the released changelog section to the user. Push `main`, `develop` and the tag only when the user asks (e.g. `git push origin main develop --follow-tags`).
