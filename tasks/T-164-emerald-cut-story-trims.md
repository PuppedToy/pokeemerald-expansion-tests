---
id: T-164
title: Emerald-cut story/text trims and content removals
status: in-progress
type: feature
created: 2026-07-19
updated: 2026-07-19
target-version: 0.6.0
links: [B-042]
blocked-by: []
---

# T-164 — Emerald-cut story/text trims and content removals

## Context

General "emerald cut" pass: this ROM-hack base trims a lot of the vanilla game.
The owner supplied 18 concrete edits over the decomp map scripts / dialogue / new-game
flags (not the randomizer pipeline). These are C-decomp/script changes verified only by
a ROM build (CI/builder) + manual play; there is no local GBA toolchain and no automated
harness for overworld scripts.

Decisions taken with the owner before starting:
- Gym TM description text is cut, but the `giveitem` stays (the TM handed over is randomized,
  so the vanilla description is stale). — item 1.
- Fly and Dive are **not** gym rewards in this repo, so their field gifts are kept (removing
  them would make the game uncompletable). Only the duplicated field HM gifts Cut/Surf/Strength
  are removed. — item 7.
- Mirage Tower: only mark the event done from the start; do **not** put a fossil in the bag. — item 15.
- Slateport museum grunt (item 9): hidden via its new-game hide flag rather than deleting the
  map.json object, to avoid a local_id build break that cannot be verified without a local build.

## Plan

Edit map scripts / text / new-game init to apply the 18 changes. Group by file where possible.
The Shelly 1-tile offset (item 16) is a real defect → tracked as B-042 and fixed on this branch.

Acceptance criteria (manual, in ROM):
- [ ] 1. Gym leaders no longer describe the TM they hand over (TM still given).
- [ ] 2. Steven no longer names Steel Wing as his favorite move (TM still given).
- [ ] 3. Poké Mart shopping tutorial skipped from the start.
- [ ] 4. Calvin's line reads naturally without "in this game".
- [ ] 5. Route 103 rival gives a short "see you in Rustboro" line.
- [ ] 6. Flower-shop girl no longer gives a Berry.
- [ ] 7. HM Cut/Surf/Strength field gifts removed; only gym sources remain (Fly/Dive kept).
- [ ] 8. Rusturf Tunnel grunt has a short first-meeting line (Magma ref at most).
- [ ] 9. Slateport museum item-giving grunt no longer appears / gives nothing.
- [ ] 10. Trick House is completed from the start (no puzzles).
- [ ] 11. Casino prizes removed (dolls + free doll included).
- [ ] 12. Wally Mauville encounter dialogue drastically shortened.
- [ ] 13. Route 111 Winstrate gauntlet done from the start (no battle).
- [ ] 14. Jagged Pass grunt only talks, no battle.
- [ ] 15. Mirage Tower resolved from the start (fossil assumed obtained; no item given).
- [ ] 16. Shelly post-battle no longer leaves the player 1 tile too low (B-042).
- [ ] 17. Mt. Chimney (2) and Weather Institute (5) grunts only talk, no battles.
- [ ] 18. Aqua Hideout + Route 128 Archie/Maxie drama cut to minimal terse lines.

## Progress log

- **2026-07-19** — Task created. Scope mapped across the decomp via parallel exploration;
  owner resolved the three blocking decisions (HMs Fly/Dive kept, gym TM text-only, fossil
  no-item). Branch `feature/T-164-emerald-cut-story-trims` off master.
- **2026-07-19** — All 18 edits implemented. Files touched (27): the six new-game flags in
  `data/scripts/new_game.inc`; gym TM-description msgbox removed in Dewford/Mauville/Lavaridge/
  Fortree/Mossdeep/Sootopolis gyms; Steven Steel-Wing line trimmed; HM field gifts stripped in
  CuttersHouse/WallysHouse/RusturfTunnel (+ gift-dangling text reworded); Calvin, Route103 rival,
  flower-shop girl, Rusturf grunt texts; Jagged Pass grunt battle removed (flag kept); Mt Chimney (2)
  + Weather Institute (5) grunts set `TRAINER_TYPE_NONE` in map.json and scripts changed to talk-only
  msgbox; Wally Mauville dialogue trimmed; Game Corner doll clerk + free-doll NPC neutered; Shelly
  `slide_down` removed (B-042); Aqua Hideout 1F/B1F/B2F + Route128 drama summarized (Route128 cut from
  8 to 3 messages, movements preserved).
  Decisions/notes: (a) gym `giveitem` kept, only the stale TM description msgbox removed. (b) Fly/Dive
  field gifts kept (no gym source). (c) Museum grunt (item 9) hidden via its new-game hide flag rather
  than deleting the map.json object — avoids a local_id build break that can't be verified without a
  local build; its dead script/text remain (never reached). (d) Orphaned text/label data left in place
  where harmless (unused `.string`/labels compile fine).
  Verification: no dangling label refs; all flags/vars/`settrainerflag`/`TRAINER_VICKY` exist; randomizer
  Jest suite green (1361 pass). C/overworld cannot be built locally — awaiting owner ROM build + manual
  test of all 18 acceptance criteria.

## Outcome

<!-- Filled when closing. -->
