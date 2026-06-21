# Documentation index

Entry point to all project documentation. **A document not listed here does not exist** — when you add a doc under `docs/`, add its line here in the same change.

## Project

- [CLAUDE.md](../CLAUDE.md) — behavior contract: SSOT map, task system, TDD, versioning rules
- [CHANGELOG.md](../CHANGELOG.md) — version history (Keep a Changelog)
- [tasks/INDEX.md](../tasks/INDEX.md) — work log (generated)
- [bugs/INDEX.md](../bugs/INDEX.md) — bug registry (generated)

## Decisions (ADRs)

<!-- One line per ADR, newest first. -->
- [ADR-002](adr/ADR-002-build-server-iac-docker.md) — build server ships as a single Docker image (Compose + Caddy), for reproducibility and cheap provider portability
- [ADR-001](adr/ADR-001-rom-build-server-provider.md) — a single fixed cheap VPS (Hetzner CX43) behind a serial queue hosts the ROM-build server

## Guides

<!-- Architecture, conventions, runbooks… One line per document. -->
- _none yet_
