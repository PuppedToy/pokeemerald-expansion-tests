# ADR-008: The server builds and delivers the full ROM; the ownership-by-hash gate is the accepted mitigation

- **Status:** superseded by [ADR-013](ADR-013-bps-patch-delivery-client-side.md) (2026-07-03)
- **Date:** 2026-06-21
- **Task:** T-018

## Context

The service must get a finished randomized game to the user. Two delivery models were weighed
(T-018): (a) the server builds and returns the **full assembled ROM**; (b) the server returns only
a **patch** applied **client-side** to a ROM the user already owns (e.g. rom-patcher-js), so the
assembled ROM is never distributed and the user's ROM never leaves their machine.

The community/legal norm is that distributing a *patch* (a diff, no copyrighted bytes) is accepted,
while distributing a *full ROM* distributes copyrighted data and is the clearly-infringing act — the
ownership check is a mitigation many sites use, not a legal safe harbor. **This is a product/legal
decision, not engineering, and this ADR is not legal advice.**

A wrinkle specific to this project: pokeemerald-expansion is a full decomp + expansion, so the built
ROM is almost entirely different from vanilla → a vanilla→built patch would be ≈ROM-sized *and* still
carry most original assets. So the client-side-patch model buys little here (no bandwidth saving, not
an airtight safe harbor for a full decomp) while adding a frontend patcher and a server-side vanilla
reference for diffing.

## Decision

The backend **builds and delivers the full ROM(s)** as a downloadable zip (the design in T-025/T-028).
The **ROM-ownership-by-hash gate (T-022)** — verify the user owns a legitimate Emerald, store only the
flag, never the bytes — is the **accepted mitigation**. The product owner has **explicitly accepted the
associated legal exposure** for this model.

## Alternatives considered

- **Client-side patch + hash-only validation** — lower legal exposure and better privacy (ROM never
  leaves the user's machine), but for a full decomp it gives no bandwidth win, isn't a guaranteed safe
  harbor, and adds a frontend patcher plus an in-house vanilla reference. Rejected for now; revisit if
  the legal posture needs hardening (e.g. before a wider public launch).
- **No ownership gate at all** — rejected: the gate is the minimum mitigation and the legitimacy cover.

## Consequences

- Simplest path and matches the rest of the design (validate-and-delete upload, build queue, "my ROMs"
  download). We commit to the ownership gate (T-022) and to not retaining ROM bytes anywhere.
- The legal exposure of distributing assembled ROMs is **accepted, not eliminated**; recommend real
  legal sign-off before any wide/public launch. If that ever changes the answer, the lever is switching
  to the client-side-patch alternative above (a superseding ADR + reworked T-022/T-025/T-028).
