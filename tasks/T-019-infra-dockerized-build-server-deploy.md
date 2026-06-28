---
id: T-019
title: Dockerized build-server image + deploy to Oracle Cloud (ARM free tier)
status: in-progress
type: chore
created: 2026-06-21
updated: 2026-06-24
target-version: 0.3.0
links: [docs/adr/ADR-002-build-server-iac-docker.md, docs/adr/ADR-001-rom-build-server-provider.md, docs/adr/ADR-006-untrusted-bundle-build-sandbox.md, docs/adr/ADR-007-transactional-email-notifications.md, T-017, T-018, T-025, T-026, T-029, T-030]
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

1. **Real-build wiring → [T-030](T-030-real-per-rom-build-adapter.md)** (split out — it's app code, not
   infra). T-019 deploys with `FAKE_BUILD=1` first to validate the flow over HTTPS; the real build (and
   the benchmark below) lands once T-030 is in and `FAKE_BUILD` is switched off.
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
- [ ] Real build (via [T-030](T-030-real-per-rom-build-adapter.md)) produces a ROM inside the container;
      `make -j` bounded — validated here on the box, then `FAKE_BUILD` off.
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
- **2026-06-25** — **Deployed to Hetzner CX23** (2 vCPU/4 GB/40 GB, Ubuntu 24.04, IP 167.233.130.107)
  in **FAKE_BUILD** mode. Box prep: 4 GB swap, ufw 22/80/443, Docker 29.6 + Compose v5. Image builds
  fine (multi-arch held). Deployed by **rsync** of the working tree (not git clone) → the box has no
  `.git` yet, so updates are currently re-rsync, and the real build's `git` restore (T-030) will need
  `.git` added before FAKE_BUILD is turned off. **Full auth e2e green on the box** (register → verify
  link in logs → verify → login → `/api/me` verified:true); DB wiped to a clean state for launch.
  Two deploy bugs found & fixed: (1) an rsync `--exclude 'build/'` also dropped `backend/build/`
  (source) — anchored to `/build/`; (2) **[B-004](../bugs/B-004-env-file-inline-comments.md)** —
  env_file inline comments became values (BREVO key garbage → email crash); fixed `.env.example` +
  regression test. Note: `docker compose restart` ≠ env reload → use `up -d --force-recreate`.
  **Pending:** Cloudflare A record → the IP (owner) for Caddy HTTPS; then T-030 real build + benchmark;
  then T-029.
- **2026-06-28** — **LIVE on HTTPS.** Owner added the Cloudflare A record (grey cloud) for apex + www →
  the box; Caddy obtained Let's Encrypt certs (after a restart to clear the pre-DNS backoff).
  `https://pokemon-emerald-cut.com` serves the app (200, valid cert), `/api/me` 401, www→apex 301.
  Then **real build wired** (T-030): added `.git`, `FAKE_BUILD=0`, `AVG_ROM_SECS=180`; validated a full
  produce→build→download of a **32 MB real ROM** via the API. Three integration bugs found & fixed on
  the box (B-004 env_file comments, B-005 schema keys, B-006 auth body-parser 413). Test data wiped;
  warm `build/` cache kept. **Deploy method caveat (for the runbook):** deployed via rsync (no git
  pull); `.git` added separately; and rsync must NOT carry host-arch tool binaries (`make clean` once
  fixes "Exec format error") nor `backend/build/` under a `build/` exclude. **Remaining for closing
  T-019:** Brevo email + SPF/DKIM (optional), lock the rest of the Emerald hashes, fold the rsync/clean
  gotchas into the runbook + `update.sh`. Core infra goal met; T-029 (manual e2e) can run now.
- **2026-06-28** — **Brevo email LIVE.** Owner created the Free account, authenticated the domain
  (DKIM/SPF in Cloudflare) and supplied the API key (kept only on the box `deploy/.env` + the owner's
  gitignored `.claudeSecrets`, never in the repo/transcript). Validated the `brevoTransport` shape with
  a test, set the key on the box, recreated the app (Brevo transport active), and a real registration
  delivered a verification email to the owner's Gmail ✓. **Public email verification works** — the last
  launch blocker. **Remaining to fully close T-019:** lock the rest of the Emerald hashes (JP/FR/DE/IT/ES
  from the No-Intro DAT; only USA/Europe accepted today), and fold the deploy gotchas (rsync excludes
  `/build/` not `build/`; `make clean` once to drop host-arch tool binaries; `up -d --force-recreate`
  ≠ `restart` for env reload) into the runbook + `update.sh`. Optional: DMARC for deliverability.
- **2026-06-25** — Researched current (Jun 2026) Oracle free-A1 capacity: still exists but genuinely
  scarce ("can take days"; bots compete) and the owner can't use the PAYG capacity-priority fix (Oracle
  demanded ~€93 upfront). So prepared the **Hetzner fallback** (owner-approved) in the runbook (§2c):
  **~€4/mo CX22**, instant, no capacity games. Confirmed **zero code changes** are needed — the Dockerfile
  is multi-arch (`node:24-bookworm` + `arm-none-eabi` cross-compiler builds the same on x86/ARM) and
  bootstrap/Compose/Caddy are provider-agnostic; only diff is the SSH user (`root` vs `ubuntu`). The
  Oracle retry loop keeps running overnight in parallel — whichever lands first wins.
- **2026-06-24** — **Fase A (infra) delivered** (branch `feature/T-019-deploy`): `deploy/Dockerfile`
  (node:24-bookworm + the exact decomp toolchain from UBUNTU.md/CI), `deploy/docker-compose.yml`
  (app non-root + bind-mounted repo + Caddy, cert volume), `deploy/Caddyfile` (auto-HTTPS for
  pokemon-emerald-cut.com; Cloudflare grey-cloud noted), `deploy/.env.example` + `.env.local.example`
  (+ both gitignored), `deploy/bootstrap.sh` (Docker, host firewall, **read-only GitHub deploy key**,
  clone, JWT gen, deps, up — idempotent, no secrets) and `deploy/update.sh` (local redeploy, creds from
  gitignored `.env.local`). Runbook `docs/deploy-oracle.md` (linked in INDEX). **Staged rollout:** ship
  with `FAKE_BUILD=1` to validate the whole flow over real HTTPS first, then land the real build adapter
  and switch it off. Scripts `bash -n` clean. **Remaining:** the per-ROM `make.js` adapter (next), then
  provision + bootstrap + benchmark + T-029. Decisions captured: domain `pokemon-emerald-cut.com`
  (Cloudflare), private repo → SSH deploy key.
- **2026-06-24** — Split the real-build adapter into its own task **[T-030](T-030-real-per-rom-build-adapter.md)**
  (it's app code, not infra). T-019 is now infra/deploy only; it deploys FAKE first and turns the real
  build on once T-030 lands. Continuing T-019 to guide the owner through Oracle provisioning.

## Outcome
