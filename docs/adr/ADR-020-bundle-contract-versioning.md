# ADR-020: The bundle contract is versioned separately from the app, gated deterministically

- **Status:** accepted
- **Date:** 2026-07-22
- **Task:** T-191

## Context

T-190 lets a user upload an arbitrary `bundle.json` to rebuild ROMs. Bundles are long-lived
artifacts a user keeps and re-uploads later, possibly against a newer app. We need to (a) tell,
deterministically, whether a given bundle is still buildable by the current app, and (b) not let the
bundle's shape drift silently across app changes.

Two version axes already exist and must stay **separate** (T-190):

- **App version** — SemVer, home = `CHANGELOG.brooktec.md` + git tags, owned by `/release`. Stamped
  into bundles as `appVersion` (provenance only; derived, never a second copy — `randomizer/appVersion.js`).
- **Bundle contract version** — `formatVersion` (top-level) + per-artifact `schemaVersion`. This is
  the compatibility lever: it answers "can the current writers/build consume this bundle?".

The original idea ("a hook where Claude decides the version and compatibility") was reframed by the
owner: a non-deterministic LLM gate is unfit for CI and competes with the manual `/release` SoT.

## Decision

- **The compatibility lever is the bundle `formatVersion`, not the app SemVer.** `bundleSchema.js`
  holds `SUPPORTED_FORMAT_VERSIONS` and **rejects, at the ingest boundary, any bundle whose
  `formatVersion` is unsupported**, with a clear message (instead of a confusing downstream build
  failure). This is the "cannot migrate" path.
- **A deterministic drift check** (`backend/__tests__/contractDrift.test.js`) pins the STRUCTURAL
  bundle contract (top-level keys, required artifacts, supported format versions) to a committed
  snapshot. Changing the bundle's shape without acknowledging it fails CI. Updating the snapshot is
  the conscious moment to decide "backward-compatible, or bump `formatVersion`?". This deterministic
  check is the SoT gate; a human (optionally Claude-assisted at dev time) authors any migration and
  the changelog/version bump — never an autonomous runtime bumper.
- **Config field additions are explicitly out of the contract.** Old bundles simply lack a new
  option and fall back to its default, so adding config options is backward-compatible and must not
  trip the drift check or bump `formatVersion`. Config Load already migrates older saved configs
  ad-hoc (`extractConfig`, `normalizeDocsVisibility`).
- **The migration *transform* registry is deferred until the first real migration is needed** (owner
  decision). The gate + version SoT + drift trip-wire are in place, so when a breaking change lands
  the transform has an obvious home and the check forces the decision. Building an empty registry now
  would be premature.

## Alternatives considered

- **LLM decides version/compat in a hook.** Rejected: non-deterministic, can't gate CI, competes
  with the `/release` SoT.
- **Conflate app SemVer with the contract version.** Rejected: a data-shape change is not a
  marketing-version change; conflating them fights `/release` and `CHANGELOG.brooktec.md`.
- **Snapshot the full config field set in the drift check.** Rejected: config additions are
  backward-compatible, so it would false-positive on every new option.
- **Build the migration registry now.** Deferred: no migration exists; premature scaffolding.

## Consequences

- Old/foreign-version bundles fail fast with an actionable message rather than a broken build.
- A structural contract change can't merge silently — the drift check forces a version decision.
- App SemVer stays owned by `/release`; the contract version moves independently.
- When the first breaking change arrives, we add: a `formatVersion` bump in the randomizer's
  `bundle()`, a new `SUPPORTED_FORMAT_VERSIONS` entry, a migration transform, and a golden fixture —
  guided by this ADR. Related: B-048 (artifact-content validation is a separate, still-open gap).
