# ADR-007: A transactional email provider sends verification, password-reset and ROM-ready mail

- **Status:** accepted
- **Date:** 2026-06-21
- **Task:** T-018

## Context

Email became load-bearing once the owner chose light email verification (ADR-004): the system
must reliably deliver (1) account-verification links, (2) password-reset links, and (3) the
opt-in "your ROM is ready" notification offered when the queue ETA is long (≥ 2 min, ADR-005).
None of this was in the original infra (ADR-001/002). Delivering mail that doesn't land in spam
needs a real sending path and DNS, not a raw SMTP socket from the box.

## Decision

Send all mail through a **transactional email provider** over an API, with proper sender DNS.

- **Provider:** a transactional API (e.g. Resend / Postmark / SES — free/low tier covers this
  volume); the exact pick and API key live in env, chosen in T-027.
- **DNS:** configure **SPF + DKIM** (and DMARC) for the sending domain so verification/reset mail
  is deliverable.
- **Messages:** verification link, password-reset link, ROM-ready notification. The ready
  notification is **opt-in** and only offered when ETA ≥ 2 min; it links back to the user's
  "my ROMs" area (the ROM is downloaded from the site, not attached to the mail).
- **Abuse:** rate-limited per account/IP (ADR-004); we never send to an address that hasn't
  asked — verification is the only mail to an unverified address.

## Alternatives considered

- **No email** (original "sin validación") — rejected with ADR-004; verification and the
  long-queue notification both need it.
- **Direct SMTP from the VPS** — rejected: deliverability/blocklist pain and DNS work without the
  provider's reputation; a provider is simpler and free at this volume.
- **Attach the ROM to the notification email** — rejected: 32 MB attachments are unreliable and
  re-expose the file; the mail links back to the site instead.

## Consequences

- A new external dependency (provider + domain DNS) and a tiny recurring cost (likely $0 at this
  volume). Outbound email failure must degrade gracefully: a build still completes and is
  downloadable from the site even if the notification mail fails.
- We commit to managing the API key (env), the SPF/DKIM records, and opt-in handling. Implemented
  in T-027; consumed by T-021 (verification/reset) and T-025 (ready notification).
