# Documentation index

Entry point to all project documentation. **A document not listed here does not exist** — when you add a doc under `docs/`, add its line here in the same change.

## Project

- [CLAUDE.md](../CLAUDE.md) — behavior contract: SSOT map, task system, TDD, versioning rules
- [CHANGELOG.md](../CHANGELOG.md) — version history (Keep a Changelog)
- [tasks/INDEX.md](../tasks/INDEX.md) — work log (generated)
- [bugs/INDEX.md](../bugs/INDEX.md) — bug registry (generated)

## Decisions (ADRs)

<!-- One line per ADR, newest first. -->
- [ADR-008](adr/ADR-008-rom-delivery-full-rom-ownership-gate.md) — the server builds and delivers the full ROM; the ownership-by-hash gate is the accepted mitigation
- [ADR-007](adr/ADR-007-transactional-email-notifications.md) — a transactional email provider sends verification, password-reset and ROM-ready mail
- [ADR-006](adr/ADR-006-untrusted-bundle-build-sandbox.md) — the ROM build runs in a hardened sandbox because the bundle is untrusted input
- [ADR-005](adr/ADR-005-two-tier-preemptive-build-queue.md) — a two-tier (fast/slow) preemptive serial queue schedules builds, preempting at ROM granularity
- [ADR-004](adr/ADR-004-auth-email-password-jwt.md) — authentication is email + password with light email verification and JWT
- [ADR-003](adr/ADR-003-persistence-job-lifecycle-recovery.md) — SQLite persists the request lifecycle; recovery restores the tree and re-runs in-flight jobs
- [ADR-002](adr/ADR-002-build-server-iac-docker.md) — build server ships as a single Docker image (Compose + Caddy), for reproducibility and cheap provider portability
- [ADR-001](adr/ADR-001-rom-build-server-provider.md) — a single fixed cheap VPS (Hetzner CX43) behind a serial queue hosts the ROM-build server

## Guides

<!-- Architecture, conventions, runbooks… One line per document. -->
- _none yet_
