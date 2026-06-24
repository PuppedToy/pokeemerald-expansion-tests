---
id: T-019
title: Dockerized build-server image + deploy to Oracle Cloud (ARM free tier)
status: proposed
type: chore
created: 2026-06-21
updated: 2026-06-24
target-version: 0.3.0
links: [docs/adr/ADR-002-build-server-iac-docker.md, docs/adr/ADR-001-rom-build-server-provider.md, docs/adr/ADR-006-untrusted-bundle-build-sandbox.md, docs/adr/ADR-007-transactional-email-notifications.md, T-017, T-018, T-025, T-026, T-029]
blocked-by: []
---

# T-019 — Dockerized build-server image + deploy to the VPS

## Context

Implements the infra decided in
[ADR-002](../docs/adr/ADR-002-build-server-iac-docker.md): ship the build server as a
single Docker image + Compose, deployed to the fixed VPS from
[ADR-001](../docs/adr/ADR-001-rom-build-server-provider.md). Future work — to be detailed
before starting; depends on the backend flow (T-018) for an end-to-end deploy.

## Plan

Target: **Oracle Cloud Always Free ARM** (the €0 bootstrap sanctioned by ADR-001). The agent guides
the owner through provisioning interactively; the goal is **minimal, repeatable** ops — one bootstrap
script + Docker, so moving to another box tomorrow is a few commands. **No secrets ever committed**
(SSH key/host and API keys live in a gitignored `deploy/.env` / the owner's `~/.ssh`).

1. **Real-build wiring (carried over from T-024/T-025 handoffs).** Refactor `make.js`'s bundle loop
   into a callable **per-ROM** unit; implement the real `buildRom` adapter (replaces FAKE_BUILD),
   bound `make -j` to the container CPUs, preserve the per-ROM `restore()`. This is the one piece of
   app code left; everything else here is infra.
2. **Dockerfile** (ARM): base Linux + the **`arm-none-eabi` / devkitARM** toolchain + host build deps
   (make, gcc, libpng…) + Node; repo pulled at build; pin base + toolchain versions. Validate the ARM
   toolchain path once (the cross-compiler output is host-arch-independent — ADR-001).
3. **docker-compose**: build-server + **Caddy** (automatic HTTPS, one line) + a **named volume** for
   SQLite (`backend/data`) + output ROMs + the warm `build/` cache.
4. **Bootstrap script** (`deploy/bootstrap.sh`): on a fresh Oracle box — install Docker, clone the repo,
   write `.env` from a template, open the firewall (Oracle security list + `iptables`), `docker compose
   up -d`. Idempotent; re-runnable.
5. **Update/redeploy script** (`deploy/update.sh`, in the repo, **no creds**): run locally, reads target
   host/user from the gitignored `deploy/.env`, then `ssh` → `git pull` → `docker compose build` →
   `docker compose up -d` (i.e. the agent can help trigger a fresh build on the target without ever
   seeing/committing the SSH key). Document a manual fallback.
6. **Email enablement** (T-027 handoff): create the Brevo account, set `BREVO_API_KEY`, configure sender
   **SPF/DKIM/DMARC**, confirm one live send.
7. **Lock the remaining Emerald hashes** in `rom/validate.js` from the No-Intro GBA DAT (T-022 open item).
8. **Benchmark** one real full + incremental build on the instance and record the numbers (ADR-001) —
   feeds the ETA seed (`AVG_ROM_SECS`).
9. **Runbook** under `docs/` (provision → bootstrap → update → rollback → where logs/data live),
   linked from `docs/INDEX.md`. Then run [T-029](T-029-full-flow-manual-test.md) against the live box.

Acceptance criteria (draft):
- [ ] Real `buildRom` adapter produces a ROM via `make.js` inside the container; `make -j` bounded.
- [ ] Compose stack (server + Caddy + persistent volume) runs on the Oracle ARM box with HTTPS.
- [ ] `deploy/bootstrap.sh` brings up a fresh box with minimal manual steps; **no secrets in the repo**.
- [ ] `deploy/update.sh` redeploys an update to the running box (creds read from gitignored `deploy/.env`).
- [ ] Email live (Brevo + SPF/DKIM/DMARC, one live send); remaining Emerald hashes locked from No-Intro.
- [ ] Build times benchmarked + recorded; deploy runbook in `docs/` linked from `docs/INDEX.md`.

## Progress log

- **2026-06-21** — Task created (future, broad strokes) alongside ADR-002 and T-017.
- **2026-06-21** — Re-pointed by the T-018 epic: deploy now depends on the real backend
  (T-025) and the hardened build sandbox (T-026, ADR-006), not just the old T-018 stub. The
  Compose stack must add the SQLite/ROM/`build/` persistent volume (ADR-003) and SPF/DKIM DNS
  for email (ADR-007). The build-time benchmark ADR-001 commits to still lives here.
- **2026-06-24** — Owner picked **Oracle Cloud Always Free ARM** (ADR-001's €0 bootstrap) and will be
  guided through provisioning interactively. Refined the plan for: minimal repeatable ops (bootstrap +
  `update.sh`, **no committed secrets**), the **real per-ROM build adapter** wiring (the last app-code
  piece, carried from T-024/T-025), the ARM toolchain, Brevo+DNS enablement, and locking the remaining
  Emerald hashes. Unblocked (T-025/T-026 done). T-029 runs against the live box once up.

## Outcome
