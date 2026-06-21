# ADR-002: The build server ships as a single Docker image, orchestrated with Compose

- **Status:** accepted
- **Date:** 2026-06-21
- **Task:** T-017

## Context

The hard part of hosting this service is **reproducing the build environment**: the
decomp needs `arm-none-eabi-gcc` (devkitARM) *and* a host toolchain to compile the
`tools/` (make, gcc, libpng, …) before it can build the ROM. Reproducing that by hand
on a fresh VPS is error-prone and rots as distro packages drift.

We also just observed (ADR-001, T-017) that cloud prices are **volatile** — Hetzner
hiked on 2026-06-15, Oracle cut its free tier the same day. The cheapest provider today
may not be the cheapest in six months, so the ability to **move providers cheaply** is
itself a cost requirement. Constraint: keep it simple, prioritize cost.

## Decision

Package the whole build server as **one Docker image** and run it with **Docker Compose**
on the fixed VPS (ADR-001).

- **Image:** a base Linux + devkitARM/`arm-none-eabi` toolchain + the host build deps +
  Node, with the repo baked in (or git-pulled at start). It runs the Express backend,
  which shells out to `node make.js` *inside the same container* per job.
- **Compose services:** (1) the Node build server; (2) **Caddy** in front for automatic
  HTTPS (cheapest path to TLS — one config line). A **named volume** persists the warm
  `build/` cache (so jobs stay incremental across restarts) and the generated ROMs.
- **Reproducibility:** the identical image runs on the dev machine and on the server, so
  "works on my machine" build failures are caught before deploy.
- **Portability:** moving providers is `docker compose up` on the new box — this is the
  concrete hedge against the price volatility in ADR-001.
- Build `-j` is bounded to the container's CPU count (see T-017's `make -j` note).

## Alternatives considered

- **Hand-run provisioning / cloud-init shell scripts** — rejected: cheaper to write once
  but rots (apt version drift), not reproducible locally, and a provider move means
  re-running and re-debugging the script on a fresh OS.
- **PaaS / serverless (Cloud Run, Lambda, Fly Machines, etc.)** — rejected: a multi-minute
  native `make` with a multi-GB warm cache is a poor fit and ends up costing more than a
  flat cheap VPS; also re-introduces the elasticity we rejected in ADR-001.
- **Kubernetes** — rejected: vast overkill for one fixed worker.
- **Nix for reproducibility** — viable but a steeper toolchain than the team's Docker
  familiarity; revisit only if the Docker image proves hard to pin.

## Consequences

- One artifact (the image) is the unit of build, test and deploy; provider choice becomes
  nearly free to change. We commit to maintaining the Dockerfile and pinning base-image /
  toolchain versions so the image stays reproducible.
- A larger image (toolchain + repo, multi-GB) and a Docker layer on the host — negligible
  cost on the chosen box, and the warm-cache volume must be sized into the ≥80 GB disk.
- The `make.js` source-restore + warm-`build/` semantics must be preserved inside the
  container (the volume holds `build/`; the repo working tree is reset per job as today).
