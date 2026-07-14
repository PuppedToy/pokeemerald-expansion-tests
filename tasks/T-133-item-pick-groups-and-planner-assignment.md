---
id: T-133
title: Bound item pick-groups + planner-assigned items (fairness-aware item economy)
status: done
type: feature
created: 2026-07-13
updated: 2026-07-14
target-version: 0.8.0
links: [T-129, T-117, docs/adr/ADR-017-gimmick-attempt-rollback.md]
blocked-by: []
---

# T-133 — Bound item pick-groups + planner-assigned items

## Context

Spun off from T-129 (which made the small correct fix — *items respect roles*, a hazard/reactive mon is
never Choiced). This is the larger system the owner described. **Model fully clarified by the owner
2026-07-14** (superseding my earlier misread — see the correction in the progress log).

### The model (owner's words, distilled)

The game is built on fairness: at many world points the PLAYER picks ONE item from a group (Choice
Band/Specs/Scarf; the 4 Weather Rocks; the plates; the gems; the resist berries; the pick-3 TM lists; …) and
forgoes the others. Trainer bags mirror the player's economy:

- **The bag cascade is REAL and DEFINITION-TIME** (a closed, deterministic function of story progression): a
  boss's bag = the previous boss's bag + everything the player could obtain between them + its own reward.
  Today each pick-group collapses to ONE random `sample([...group])` unit per boss → the boss "carries" a
  random item whether it uses it or not (noise), and each boss re-rolls independently.
- **The change — LINKED packs, resolved on USE.** Each pick-group instead contributes **all** its options as
  a **linked pack**, LOCAL to the bag it is placed in. The trainer only "makes the pick" when it actually
  **USES** (equips / teaches) an item from the pack: on use, **one unit of each pack sibling is removed from
  THAT trainer's own bag** (personal — this removal never cascades). So a trainer's item is a real,
  player-mirroring choice, taken only for what it truly uses; an unused pack stays unresolved (no forced
  random item). This also removes the "banned items" hack (see below) — teams generate standardly.

### Two consumption moments (SAME link logic in both) — owner nuance 1

1. **Archetype selection (forward):** the planner assigns a role-item directly — e.g. a mon crystallised as a
   Choice-Scarf revenge-killer gets the Choice Scarf up front, and (per T-129's forward goal) then builds an
   all-attacking set knowing it is Choiced.
2. **Post-build (current path):** the existing bag-item rating/assignment (`resolveTrainerTeam.js:363-377`).

Both must funnel through the **same** link-aware consumption.

### TMs are "items" that resolve during MOVE selection — owner nuances 2 & 3

- A TM pack (`choice*TMs`) follows the same link logic, but is consumed when a mon **learns a TM move**
  (`trainer.tms`, post-`normalizeTrainerBagTms`), not during item assignment.
- **Prevent the self-block bug (n2):** if a pack is {TM Flamethrower, Thunderbolt, Sludge Bomb} and a Rotom
  wants BOTH Flamethrower and Thunderbolt, using the first must NOT block the second — for it OR its
  teammates. (Solved by the multiset "prefer-unlinked" rule below when buyable/loose copies exist.)
- **Buyable-TM copies (n3):** at shop points every boss gets a **loose (unlinked)** copy of each buyable TM.
  So a boss can hold a loose Flamethrower AND a pack Flamethrower at once. Rules:
  - Assigning Flamethrower when there are 2 units (one loose) → consume the loose one → **no siblings removed**.
  - Assigning a sibling (Thunderbolt) → detects the 2 Flamethrowers and removes only **1** (the pack unit),
    leaving the loose one.

### Other nuances (owner)

- **n4 — unlinked items/TMs** (single-ball rewards, fixed rewards, buyable copies) trigger **no** link on use.
- **n5 — repeated items:** items shouldn't normally repeat (e.g. two gem packs get distinct gems), but the
  link logic must handle a repeated id gracefully anyway (the multiset accounting does).
- **n6 — deliberately-separate links:** the 4 Weather **Rocks** are ONE link; the 4 weather-setting **TMs** are
  a SEPARATE link (not cross-linked), for simplicity. Flag any odd case that surfaces.

## Plan

Design first, then build test-first. **No global ledger; everything is per-trainer bag-local.**

### Data model (proposed)

Keep `trainer.bag` (item display-name multiset) and `trainer.tms` (`MOVE_*` multiset) as flat arrays; add
`trainer.linkGroups: [{ members: [id,…] }]` — each entry is ONE pick-instance (homogeneous: all item names
or all `MOVE_*`). **"Unlinked units" of an id = count(id in pool) − (#linkGroups containing id).** Consumption:
1. If unlinked units of `id` > 0 → remove one `id`, **no group touched** (a loose/buyable/fixed copy). (n3/n4)
2. Else → spend a group containing `id`: remove one `id`, remove one unit of each sibling present, drop the
   group. (the pick is made; siblings forgone) — record the activation for the log.

This "count-minus-groups + prefer-unlinked" rule reproduces every owner example, incl. the n2 Rotom bug
(loose copies are consumed first, so the pack stays intact and neither move is blocked).

### Pieces

- **`linkedChoiceSample([...group])`** — new bag-construction helper replacing `sample([...group])`. Emits a
  pack MARKER carrying all options; the per-trainer finalize pass (extend `normalizeTrainerBagTms`) expands
  markers into flat units + a `linkGroups` entry (translating `TM_*`→`MOVE_*` for TM packs so they operate on
  `trainer.tms`). Each boss's cumulative `linkedChoiceSample` calls register their own local packs.
- **Link-aware consumption helper** (new pure module, e.g. `modules/itemLinks.js`) — the count-minus-groups
  rule above; used by BOTH consumption moments + TM/move selection. Deterministic, no RNG.
- **Planner item assignment (forward)** — at archetype selection, a role that maps to a bag item (Choice*)
  claims it via the helper and drives an all-attacking moveset; keep T-129's reverse guard as the net.
- **Decision log (T-130)** — surface item-choice reasoning: which item a mon claimed, and when a linked pack
  ACTIVATED to remove which siblings from the bag.
- **Remove `bannedItems` entirely** — delete the 2 trainer declarations (`trainers.js:1530,2854`), the
  `rateItemForAPokemon` param (`rating.js:1413-1414`) + the resolver pass (`resolveTrainerTeam.js:368`); teams
  generate standardly.
- Must respect determinism: any new RNG stays inside the per-slot reseed; item/link state lives on the cloned
  attempt trainer and commits only on success (ADR-017); cross-ROM determinism + continuity gates stay green.

Acceptance criteria:
- [x] `linkedChoiceSample` replaces `sample([...group])` for every pick-group bag entry; each emits a bag-local
      linked pack (items → `bag`, `TM_*` → `tms`), never a single pre-rolled random item.
- [x] Consuming an item/TM applies the count-minus-groups rule: an unlinked/loose unit is spent first (no
      siblings removed, n3/n4); otherwise the pack activates and removes one unit of each present sibling.
- [x] The n2 Rotom case (two moves from one pack, loose copies present) never self-blocks — for the mon or
      its teammates; the n3 buyable-copy accounting matches the owner's example exactly.
- [x] Weather Rocks and weather-setting TMs are two SEPARATE links (n6) — supported by the model.
- [x] Same consumption logic fires at BOTH moments (forward archetype assignment + post-build) and for TMs at
      move selection; a forward-claimed Choice mon builds an all-attacking set (T-129 guard kept as net).
- [x] `bannedItems` is fully removed (no declarations, param, or pass); teams still generate standardly.
- [x] Decision log shows item claims + linked-pack activations (which siblings removed).
- [x] Deterministic; per-slot reseed + cross-ROM determinism/continuity gates green; `cd randomizer && npm test`
      green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-13** — Task created (spun off from T-129, per owner's fairness/bound-items + planner-assignment
  description). Design + owner validation pending before any code.
- **2026-07-14** — DESIGN analysis (mapped the current item economy; `docs/items.md` + code in
  `itemRandomizer.js`, `trainers.js`, `resolveTrainerTeam.js`). Key findings:
  - **Pick-groups already exist as per-location arrays** in `itemAssignments` (plates/gems/berries = 4 opts,
    `pool()` ball/item = 3). But there is NO bind/remove-siblings concept. A cumulative BOSS bag collapses
    each group to ONE item via `sample([...group])`; a side trainer spreads all N into its bag.
  - **CORRECTION to this task's premise.** The Context said "the reduced bag cascades to later bosses, as
    the pipeline already passes bags down." That is NOT how the code works. Bags are **per-trainer and
    frozen at bundle-creation**; the "cumulative growth" is a *definition-time* construct (bag functions
    spread each other). At runtime each trainer consumes only its OWN independent bag copy
    (`resolveTrainerTeam.js:363-377`, spliced by value on the cloned attempt trainer, committed back to that
    trainer only). Nothing cascades between trainers/bosses at runtime.
  - Consequence: two distinct scopes of "bound pick-group":
    - **L1 (within-trainer):** assigning one option removes its siblings from THAT trainer's bag → a trainer
      never fields two items from the same group. Cheap, fully deterministic (per-slot reseed), no
      cross-trainer state.
    - **L2 (global fairness ledger):** options shrink across successive bosses run-wide. Requires a NEW
      deterministic story-order consumption ledger and BREAKS the current "resolve once, in any order"
      property + the deferred-partner second pass (Tabitha↔Maxie, `writerDocs.js`). Likely its own ADR.
  - **Choice items are barely in the economy:** `premiumItems` (incl. the 3 Choice items) is declared but
    NEVER placed. The only live Choice items are `choiceIsabellaItem = [Band, Scarf, Specs]` → Isabella
    (all 3 in bag+reward) + Tate&Liza cumulative bag (sampled to 1). So "planner assigns Choice as a role"
    only bites broadly if we ALSO expand where Choice items are placed.
  - **Determinism constraints to preserve** (from `trainer-determinism.md` + code): any new item RNG must sit
    inside the per-slot-reseeded loop; item state stays on the cloned `attemptTrainer` and commits only on
    success (ADR-017); a global shared pool would need a fixed deterministic draw order.
  - **Recommendation (pending owner sign-off): PHASE IT.** Phase 1 = L1 within-trainer binding + planner
    claims a Choice item present in the bag as a role (forward moveset coherence; keep T-129's reverse guard
    as safety net) — deterministic, no architecture risk, delivers the visible win. Phase 2 (deferred, own
    ADR) = L2 global fairness ledger. Open sub-question: expand Choice-item placement now, or later?
- **2026-07-14 (CORRECTION — owner clarified; my prior entry was wrong on the key point).** I wrongly claimed
  "bags don't cascade / the task's premise is inaccurate". They DO cascade, at DEFINITION time: a boss's bag
  = the previous boss's bag + everything the player could pick up in between + its own reward (a closed,
  deterministic function of story progression — computable dynamically). What is PERSONAL (non-cascading) is
  the link-driven REMOVAL when an item is consumed. My "L1 vs L2 global ledger" framing was a
  misunderstanding — there is NO global ledger. The whole feature is within a single trainer's own bag:
  - Today each pick-group contributes ONE random `sample([...group])` unit to a boss's cumulative bag (noise).
  - New: each pick-group contributes ALL its options as a LINKED pack (local to that one bag). The trainer
    only "spends" the pick when it actually USES (equips / teaches) an item from the pack; on use, ONE unit of
    each pack sibling is removed FROM ITS OWN BAG. So the trainer picks exactly like the player at that point,
    and only for what it truly uses. No random noise; unused packs stay unresolved (no forced item).
  See the rewritten Context/Plan below for the full model + all owner nuances.

- **2026-07-14 (implementation, owner "adelante").** Built the model test-first, incrementally:
  - **Core helper** `modules/itemLinks.js` — `consumeLinkedUnit` (count-minus-groups + prefer-unlinked),
    `unlinkedCount`, `linkedChoiceSample` (pack marker), `isLinkedPack`, `expandLinkedPacks`. 9 unit tests
    encode the owner's exact examples (berry pick, buyable n3, Rotom n2, weather-separate n6, repeated n5).
  - **Finalize** `normalizeTrainerBagTms` now expands pack markers → flat `bag`/`tms` + `bagLinks`/`tmLinks`
    (TM packs translated `TM_→MOVE_`); order-preserving (byte-identical with no packs). 2 tests.
  - **Consumption** (both the post-build item path AND TM/move selection) routes through `consumeLinkedUnit`;
    attempt engine clones/commits `bagLinks`/`tmLinks` (ADR-017 isolation). Behaviour-preserving until packs
    exist.
  - **Bag construction** — all 44 `sample([...group])` cumulative-bag collapses → `linkedChoiceSample(...)`.
    Now every boss holds the full pick-pack and "makes the pick" only on use.
  - **bannedItems REMOVED** entirely (2 trainer decls, the `rateItemForAPokemon` param + check, the resolver
    pass, the test arg). Teams generate standardly.
  - **Decision log** shows each linked pack activation: `→ linked item/TM-pack: <mon> took <X> → forwent <…>`.
  - **Verified (seed 2920625670):** Roxanne (Castform took Flame Plate → forwent Toxic/Mind/Insect Plate;
    Skitty took a TM → forwent its 2 siblings), Wattson (Electric Seed pack + TM packs), Norman (TM packs) all
    show correct activations. `npm test` 1045; determinism + continuity gates 17/17.
  - **DEAD END logged:** tried to bulk-link the 42 reward-giver *bare* pick-group spreads (`bag: [...choiceX]`)
    with a regex; JS lookahead backtracking corrupted bag-function calls (`...rival103Bag()`). Not applied.
    Those vars also appear in `reward:` (must NOT link). Left for a careful per-site pass — and it's NOT a
    regression (those trainers were already `[...group]` unlinked pre-T-133; only the `sample` boss bags
    changed).
  - **REMAINING:** (a) forward archetype Choice assignment (the 2nd consumption moment); (b) optionally link
    the reward-giver bare spreads (per-site).
- **2026-07-14 (forward Choice — owner "elige tú la solución que mejor modelice").** Modelled item↔role as
  **dependent vs enhanced** (owner's insight): a Choice role EXISTS only if its item does (dependent); a
  weather setter merely PREFERS its rock (enhanced). Enhanced items already assigned forward by T-125 — left
  as-is. Built the DEPENDENT path:
  - `planForwardChoiceItem` (archetypeRefine, +8 unit tests) — if a mon fills an offensive role the team wants
    (`choiceScarfRevengeKiller`/`wallbreaker`, both detectors already exclude setup sweepers) AND a Choice
    item is available in the bag, returns the stat-matched Choice (Scarf for a revenge killer; Band/Specs by
    attack stat for a breaker), falling back to whatever Choice the bag holds. null when none available
    (never forced) — DEPENDENT.
  - Wired into `resolveTrainerTeam` right after the ability is chosen, BEFORE `chooseMoveset` — so the Choice
    mon builds an all-attacking set (chooseMoveset already rates status moves 0 under a Choice item). Consumes
    link-aware; logs the pack activation. T-129 reverse guard stays the net for any post-build item.
  - **Verified (seed 2920625670):** Sidney's Buzzwole (physical) → Choice Band; Phoebe's Marshadow (fast) →
    Choice Scarf; Glacia/Drake → Choice Scarf — each drawn from the linked Choice pack (forgoing the two
    siblings), stat-matched. `npm test` 1053; determinism + continuity gates 17/17.
  - Reward-giver bare spreads: owner confirmed they must NOT link (those trainers are the FIRST to show the
    items, so they hold all — they don't pick). Left unlinked; full 42-trainer list handed to the owner to
    review individually. Choice-item placement is currently thin (only the Isabella/Tate&Liza cumulative
    pack), so forward Choice fires mainly at the E4/endgame today — the mechanism is correct and will bite
    more if Choice placement expands (out of scope here).

## Outcome

Shipped the bag-local **linked-pack economy**: every pick-group in a trainer's bag is now the full option set
(`linkedChoiceSample`), and a trainer "makes the pick" only when a Pokémon actually equips/teaches an option —
at which point one unit of each pack sibling is forgone from THAT trainer's own bag (count-minus-groups, prefer
unlinked/loose copies). Applies at both consumption moments (forward archetype claim + post-build) and to TMs
at move selection. Added the **forward dependent Choice** claim (`planForwardChoiceItem`): a strong attacker
that the team wants, with a Choice item available, gets it before its moveset and builds all-attacking
(stat-matched). Enhanced items (weather rock / Room Service / Electric Seed) stay forward-assigned by T-125.
`bannedItems` removed entirely. Decision log surfaces every linked-pack activation.

Owner reviewed the regenerated decision log (seed 2920625670) and accepted 2026-07-14 (Roxanne plate/TM packs;
Sidney→Choice Band, Phoebe/Glacia/Drake→Choice Scarf/Specs from the linked Choice pack). `npm test` 1053;
determinism + continuity gates 17/17.

Deliberately NOT done (owner-confirmed): the 42 reward-giver bare-spread trainers stay unlinked — they are the
FIRST to display those items, so they hold all options and don't "pick" (full list handed to the owner).

Follow-ups spawned: **emergent electric terrain** (a non-dedicated trainer that rolls a terrain setter —
Miraidon/Hadron Engine, Electric Surge — should build electric terrain or drop it, mirroring T-136 emergent
weather; the abuser-quality rating T-135 should extend to it, per the owner's "aplica a todo gimmick"). Item
placement expansion (put Choice items in more bags so forward Choice bites earlier than the E4) is separate.
