---
id: T-223
title: Migrate to the emerald-cut-randomizer.com domain
status: in-progress     # proposed | in-progress | done | abandoned
type: chore             # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-221, docs/legal-risk-analysis.md]
blocked-by: []
---

# T-223 — Domain migration to `emerald-cut-randomizer.com`

## Context

Acting on [T-221](T-221-legal-risk-analysis.md) — moving off the trademark-in-domain
`pokemon-emerald-cut.com` to `emerald-cut-randomizer.com` (owner buys the domain; DNS on Cloudflare).
The box is a single Hetzner host (IPv4 `167.233.130.107`), fronted by **Caddy** (automatic Let's Encrypt),
reverse-proxying to the `app` container. The old domain's A records are **DNS-only** (grey cloud), which is
what lets Caddy complete the ACME challenge.

## What needs to change (the investigation result)

The app itself needs **no** code change — it's served on whatever host Caddy routes. Two config points do:

1. **`deploy/Caddyfile`** (done here): add the new domain (canonical) + `www` redirect, and keep the old
   domain redirecting to the new during migration. Caddy issues certs for all four names automatically.
2. **`BASE_URL`** in the box's `deploy/.env` (runtime env, not in the repo): change to
   `https://emerald-cut-randomizer.com` so email verification/reset/ready **links** point at the new site.
   `MAIL_FROM` can stay on the old (already Brevo-verified) domain — email keeps working — or move to the new
   domain *after* authenticating it in Brevo (new DKIM/brevo-code records). Owner's call.

**Key gotcha:** `deploy/update.sh` recreates only the **app** container — it does **not** reload Caddy. So a
Caddyfile change is rsynced but not applied until Caddy is reloaded/recreated (step 3 below).

## Deploy procedure (owner-gated; run only after the new DNS is live)

1. **DNS** — add `emerald-cut-randomizer.com` to Cloudflare, import the zone file
   (`~/Downloads/emerald-cut-randomizer.com.txt`): A `@` + `www` → `167.233.130.107`, **DNS-only**. Verify:
   `dig +short emerald-cut-randomizer.com` → `167.233.130.107`. (Email DKIM/brevo-code are per-domain — set
   up in Brevo only if moving `MAIL_FROM`; SPF+DMARC are in the zone file.)
2. **Deploy the Caddyfile** — owner pushes master + greenlights → `deploy/update.sh` (rsyncs the new
   Caddyfile). Set `BASE_URL` on the box too: edit `${DEPLOY_PATH}/deploy/.env` →
   `BASE_URL=https://emerald-cut-randomizer.com` (own line; `chown` handled by update.sh).
3. **Reload Caddy** (the step update.sh skips):
   `docker compose -f deploy/docker-compose.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile`
   (or `... up -d --force-recreate caddy`). Caddy then requests the new cert.
4. **Verify** — `curl -sI https://emerald-cut-randomizer.com` → 200; the old domain 301-redirects to it;
   register a test account and confirm the email link uses the new domain.

## Plan / acceptance

- [x] DNS zone file for the new domain prepared for Cloudflare import (A DNS-only + SPF/DMARC; DKIM/brevo-code
      flagged as Brevo-generated, not copied).
- [x] `deploy/Caddyfile` updated: new domain canonical + `www` redirect; old domain + `www` redirect to new.
- [ ] New domain purchased + DNS imported + resolving to the box (owner).
- [ ] Deployed + Caddy reloaded + `BASE_URL` switched; new domain serves over HTTPS, old redirects.
- [ ] (Optional) `MAIL_FROM` moved to the new domain after Brevo authentication.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Investigated the box (read-only): Caddy serves `pokemon-emerald-cut.com` + `www` with
  issued LE certs; `BASE_URL`/`MAIL_FROM` on the old domain; A records DNS-only; box IPv4 `167.233.130.107`
  (also has IPv6, but the old domain is IPv4-only in DNS — replicated as-is). Found update.sh does NOT reload
  Caddy → documented the manual reload. Prepared the Cloudflare zone file + the Caddyfile change (new
  canonical + old→new redirects). Nothing deployed — waiting on the new domain's DNS.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
