# ADR-013: BPS patch delivery with client-side patching (supersedes ADR-008)

- **Status:** accepted
- **Date:** 2026-07-03
- **Task:** T-053
- **Supersedes:** ADR-008

## Context

[ADR-008](ADR-008-rom-delivery-full-rom-ownership-gate.md) chose to build and deliver the full
assembled ROM behind an ownership-by-hash gate, explicitly deferring the client-side-patch
alternative and naming the trigger to revisit it: *"before a wider public launch."* We are now at
that point — the intent is to **publish** this romhack, **free, non-commercial, no company, no
monetization**.

Two facts reframe the original trade-off:

1. **Legal posture / enforcement.** For a freely-distributed, non-commercial hobby hack, the dominant
   enforcement reality is DMCA takedown / cease-and-desist, escalating with monetization, visibility
   and — critically — *hosting complete ROMs*. The litigated fact pattern (RomUniverse et al.) is "a
   server that stores and serves complete copyrighted ROMs." Model A (server builds, stores and
   delivers the full ROM behind a hash checkbox) exhibits exactly that profile, and the hash gate is
   bypassable and cosmetic (a hash proves nothing about who holds the file). Model B (deliver a patch;
   the user's own ROM never leaves their machine) is the community-tolerated posture, never makes the
   server a ROM host, and makes the ownership gate self-enforcing — a patch is inert without a genuine
   base ROM. The law and, more importantly, enforcement look at *the act performed and the profile
   exhibited*, not the end state the user reaches; both models leave the user with the same ROM.

2. **The full-decomp caveat still holds and is stated honestly.** pokeemerald-expansion is a full
   decomp; the built ROM is almost entirely different from vanilla, so a vanilla→built BPS is
   ≈ROM-sized and still carries most copyrighted *expression*. The patch is therefore **not** a
   "contains no copyrighted bytes" safe harbor. Its value is: (a) the server never stores or serves a
   complete ROM, (b) the user's ROM never leaves their machine (privacy), (c) it is the accepted
   community posture, (d) the ownership gate becomes self-enforcing.

This is a product/legal decision, not engineering, and **this ADR is not legal advice**; real legal
sign-off is recommended before any wide public launch.

## Decision

Delivery switches to a **BPS patch generated server-side and applied client-side** (HackDex-style):

- `make.js` keeps an **option to emit a full `.gba`** (debugging / builder use), but the **default and
  normal flow produces a `.bps`** (vanilla→built delta).
- The **frontend stores the user's vanilla ROM in the browser's IndexedDB** (the user's own machine)
  after a one-time selection, hashes it client-side against the known-good Emerald set, and applies
  the BPS locally (bundled patcher) to produce the final ROM. **ROM bytes never reach the server.**
- **Ownership validity is still persisted in SQLite** — a cheap flag, the extra step is free — but the
  ROM bytes live only in IndexedDB.
- **Generation is decoupled from ownership:** a user can generate and download the BPS *without* having
  provided a ROM yet. The UI states "BPS generated" and offers either (a) download the BPS or
  (b) patch it with the stored ROM if one is present.
- **The single-use download model is replaced** by an ephemeral-BPS model: one BPS per user at a time,
  deleted on a TTL (≈48h) or when the user starts the next randomization.

The base ROM revision used for the delta (single canonical revision vs. multi-region set — which
narrows or widens the ownership gate) is decided in T-053.

## Alternatives considered

- **Keep Model A (ADR-008: server builds/stores/serves the full ROM).** Rejected: exhibits the ROM-host
  profile that is actually litigated, and the hash gate is cosmetic. Superseded by this ADR.
- **Host the BPS on an open/public CDN as "just a patch."** Rejected: for a full decomp the BPS carries
  copyrighted expression; treat its hosting with the same caution as a ROM.

## Consequences

- The server never stores or transmits a complete copyrighted ROM; it serves a `.bps`. Backend load
  drops (no 16 MB uploads — hashing moves client-side; delivery is a smaller/static-servable artifact).
  Privacy improves (ROM never uploaded).
- Requires a **gitignored vanilla reference ROM on the builder** for diffing, a BPS-creation step in
  the build, a **client-side patcher** (bundled), and reworked T-022/T-025/T-028 behaviour.
  Implementation and acceptance criteria live in **T-053**.
- The BPS still carries copyrighted expression (full decomp) — treat its hosting with the same caution
  as a ROM.
- This is the **first half** of a larger possible shift — build the expansion base once, then randomize
  by binary injection instead of compiling from scratch — explored in **T-054**.
