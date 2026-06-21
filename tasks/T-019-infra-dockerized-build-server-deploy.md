---
id: T-019
title: Dockerized build-server image + deploy to the VPS
status: proposed
type: chore
created: 2026-06-21
updated: 2026-06-21
target-version: 0.3.0
links: [docs/adr/ADR-002-build-server-iac-docker.md, docs/adr/ADR-001-rom-build-server-provider.md, T-017]
blocked-by: [T-018]
---

# T-019 — Dockerized build-server image + deploy to the VPS

## Context

Implements the infra decided in
[ADR-002](../docs/adr/ADR-002-build-server-iac-docker.md): ship the build server as a
single Docker image + Compose, deployed to the fixed VPS from
[ADR-001](../docs/adr/ADR-001-rom-build-server-provider.md). Future work — to be detailed
before starting; depends on the backend flow (T-018) for an end-to-end deploy.

## Plan

Strokes (to refine):
- **Dockerfile**: base Linux + devkitARM/`arm-none-eabi` toolchain + host build deps
  (make, gcc, libpng…) + Node; repo baked in or pulled at start; pin base/toolchain versions.
- **docker-compose**: the Node build server + Caddy (automatic TLS); a named volume for the
  warm `build/` cache + output ROMs (sized into the ≥80 GB disk).
- Validate one **real full + incremental build inside the container** (the calibration
  ADR-001 commits to) and record the numbers.
- If the chosen box is ARM (Oracle free / Hetzner CAX), validate the ARM toolchain path.
- **Deploy**: provision the VPS, `docker compose up`, smoke-test produce→download.
- Document the deploy runbook under `docs/` (and link it in `docs/INDEX.md`).

Acceptance criteria (draft):
- [ ] Image builds reproducibly and produces a ROM via `node make.js` inside the container.
- [ ] Compose stack (server + Caddy + warm-cache volume) runs on the target VPS with HTTPS.
- [ ] Benchmarked build times recorded; `make -j` bounded to container CPUs.
- [ ] Deploy runbook in `docs/`, linked from `docs/INDEX.md`.

## Progress log

- **2026-06-21** — Task created (future, broad strokes) alongside ADR-002 and T-017.

## Outcome
