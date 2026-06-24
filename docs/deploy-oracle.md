# Deploy runbook — Oracle Cloud (ARM free tier)

Operational guide for hosting the Emerald Cut backend on an Oracle Always Free ARM box.
Decisions: [ADR-001](adr/ADR-001-rom-build-server-provider.md) (provider) ·
[ADR-002](adr/ADR-002-build-server-iac-docker.md) (Docker/Compose/Caddy). Task: [T-019](../tasks/T-019-infra-dockerized-build-server-deploy.md).

**Golden rule:** no secret ever goes in the repo. The GitHub deploy key lives only on the box;
`deploy/.env` and `deploy/.env.local` are gitignored.

## 1. Provision the instance (Oracle console)

- Compute → Instances → Create. Shape **VM.Standard.A1.Flex**, **2 OCPU / 12 GB** (full Always Free ARM).
- Image **Canonical Ubuntu 22.04 (aarch64)**. Boot volume **~100 GB**.
- Add **your SSH public key**. Note the **public IP**.
- "Out of host capacity"? Retry / try another AD / or upgrade to Pay-As-You-Go (priority, still free within limits).
- **Security list** (VCN → Subnet → Security List): add ingress rules for **TCP 80** and **TCP 443** from `0.0.0.0/0`
  (22 is open by default). The host firewall is handled by `bootstrap.sh`.

## 2. DNS (Cloudflare)

Point `pokemon-emerald-cut.com` (and `www`) **A record → the box's public IP**. Set it to
**"DNS only" (grey cloud)** so Caddy can complete the Let's Encrypt challenge.
*(Alternative: keep the orange-cloud proxy, set SSL/TLS → "Full (strict)", and install a Cloudflare
Origin Certificate in Caddy — more setup; grey-cloud + Caddy LE is simplest.)*

## 2b. "Out of host capacity" — auto-retry the launch

The free A1 shape is often capacity-constrained ("Out of host capacity" across all ADs). Instead of
clicking Create by hand, leave **`deploy/oci-retry-launch.sh`** running — it loops over the ADs and
retries until a slot frees up, then prints the public IP.

One-time setup (on your machine):
```bash
brew install oci-cli jq          # or the official OCI CLI installer
oci setup config                 # generates an API key; upload the printed public key:
                                 #   Console → Profile → My profile → API keys → Add
```
Fill the `OCI_*` vars in `deploy/.env.local` (compartment + public-subnet OCIDs, your SSH public key
file), then:
```bash
nohup deploy/oci-retry-launch.sh > oci-retry.log 2>&1 &   # leave it running
tail -f oci-retry.log
```
Upgrading to Pay-As-You-Go also fixes capacity (priority hardware, still €0 within Always Free limits)
— but it requires a card and, in some regions, an upfront payment; the retry script keeps it free.

## 3. First bring-up

SSH in (`ssh ubuntu@<ip>`), then:

```bash
# clone just enough to get the script, or scp it; then:
bash deploy/bootstrap.sh
```

`bootstrap.sh` (idempotent) will: install Docker → open 80/443 on the host firewall → generate a
**read-only GitHub deploy key** (you paste the printed public key into GitHub → repo → Settings →
Deploy keys) → clone the repo → create `deploy/.env` with a generated `JWT_SECRET`. It stops so you can
set **`BREVO_API_KEY`** in `deploy/.env`; re-run to build deps and start the stack.

**Staged rollout (de-risks the first deploy):**
- **C1 — infra + flow:** `deploy/.env` ships with `FAKE_BUILD=1`, so the box runs the full flow
  (register → verify → login → ROM-validate → Generate → queue/ETA → download) with *placeholder* ROMs.
  Validate everything over real HTTPS first. Until `BREVO_API_KEY` is set, verification links print in
  the container logs (`docker compose -f deploy/docker-compose.yml logs -f`).
- **C2 — real build:** once the per-ROM `make.js` adapter (T-019 step 1) is in, remove `FAKE_BUILD` from
  `deploy/.env`, `deploy/update.sh`, run one build, and record the time into `AVG_ROM_SECS` (benchmark).

## 4. Push an update later

From **your machine** (never store creds in the repo):

```bash
cp deploy/.env.local.example deploy/.env.local   # fill DEPLOY_HOST, DEPLOY_USER, DEPLOY_KEY (first time)
deploy/update.sh                                  # ssh → git pull → rebuild → restart
```

Requires the code to be **pushed to `origin`** first (the box pulls from GitHub).

## 5. Where things live / ops

- **App data** (SQLite, output ROMs, warm `build/` cache): on the host inside the cloned repo
  (`backend/data`, `roms/`, `build/`) — survives restarts and image rebuilds.
- **TLS certs:** the `caddy_data` Docker volume.
- **Logs:** `docker compose -f deploy/docker-compose.yml logs -f`.
- **Restart / stop:** `... up -d` / `... down`.
- **Rollback:** `git checkout <prev-sha>` in the repo on the box, then `... up -d --build`.
- **Email:** Brevo free tier + sender SPF/DKIM/DMARC on the domain (DNS); `MAIL_FROM` in `deploy/.env`.
