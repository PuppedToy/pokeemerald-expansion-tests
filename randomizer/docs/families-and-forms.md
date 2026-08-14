# Families and forms — the model

**The SSOT for how the pipeline decides what counts as one Pokémon, what inherits what, and what
excludes what.** The shape of the model and why it is shaped that way is
[ADR-026](../../docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md); this file
is the ruleset itself, line by line. Decided by the owner during T-277.

The evidence behind each ruling — the engine's form-change classification, the complete regional
listing, the per-line before/after view — is in the audit report and decision sheet under
`tasks/assets/T-277/` (working artifacts, not tracked).

---

## G — General rules

| # | Rule |
|---|---|
| **G1** | **Dedup is per superfamily.** The player may obtain **one** member of a dev block (`#if P_FAMILY_x`) per run, whatever the block splits into. Invariant, no per-case list. This supersedes all of the old Batch 4. |
| **G2** | **Inheritance follows the evolution edge only.** A mon inherits from its direct pre-evolution and nothing else — never a sibling, never another form. |
| **G3** | **A convergence point inherits from ALL its pre-evolutions, stacked** (D0). After T-289 the only convergence left is Mothim. |
| **G4** | **A cosmetic form set keeps one form; the rest leave the game.** Cosmetic = same stats, same types, same abilities. |
| **G5** | **A mega/primal belongs to the species it is a mega of** (R1). |
| **G6** | **An orientation / origin form is the same Pokémon** as its base (R3). |

### G7 — Regional forms come in exactly two shapes

| Shape | Definition | Identity | Inheritance |
|---|---|---|---|
| **MEOWTH treatment** | the regional line has its **own base** (or is a regional base that evolves into a differently-named final) | one **independent family** per line | each line inherits within itself only |
| **KOFFING treatment** | the regional form hangs off a **shared non-regional base**, i.e. it is a branch of that base | **one family**, branching evolution | every branch inherits from the shared base, never from a sibling branch |

Dedup is G1 either way: one per superfamily. So a run offers Meowth **or** Meowth-Alola **or**
Meowth-Galar — never two — and Koffing's line yields Weezing **or** Weezing-Galar, never both.

---

## Per-line decisions

### MEOWTH treatment — independent families

| Line | Resulting families |
|---|---|
| Meowth | `{Meowth, Persian}` · `{Meowth-Alola, Persian-Alola}` · `{Meowth-Galar, Perrserker}` |
| Farfetch'd | `{Farfetch'd}` · `{Farfetch'd-Galar, Sirfetch'd}` |
| Wooper | `{Wooper, Quagsire}` · `{Wooper-Paldea, Clodsire}` |
| Qwilfish | `{Qwilfish}` · `{Qwilfish-Hisui, Overqwil}` |
| Sneasel | `{Sneasel, Weavile}` · `{Sneasel-Hisui, Sneasler}` |
| Corsola | `{Corsola}` · `{Corsola-Galar, Cursola}` |
| Zigzagoon | `{Zigzagoon, Linoone}` · `{Zigzagoon-Galar, Linoone-Galar, Obstagoon}` |
| Yamask | `{Yamask, Cofagrigus}` · `{Yamask-Galar, Runerigus}` |
| Darumaka | `{Darumaka, Darmanitan(+Zen)}` · `{Darumaka-Galar, Darmanitan-Galar(+Zen)}` — the Zen forms follow their own line |
| Rattata | `{Rattata, Raticate}` · `{Rattata-Alola, Raticate-Alola}` |
| Sandshrew | `{Sandshrew, Sandslash}` · `{Sandshrew-Alola, Sandslash-Alola}` |
| Vulpix | `{Vulpix, Ninetales}` · `{Vulpix-Alola, Ninetales-Alola}` |
| Diglett | `{Diglett, Dugtrio}` · `{Diglett-Alola, Dugtrio-Alola}` |
| Growlithe | `{Growlithe, Arcanine}` · `{Growlithe-Hisui, Arcanine-Hisui}` |
| Geodude | `{Geodude, Graveler, Golem}` · `{Geodude-Alola, Graveler-Alola, Golem-Alola}` |
| Ponyta | `{Ponyta, Rapidash}` · `{Ponyta-Galar, Rapidash-Galar}` |
| Slowpoke | `{Slowpoke, Slowbro, Slowking}` · `{Slowpoke-Galar, Slowbro-Galar, Slowking-Galar}` |
| Grimer | `{Grimer, Muk}` · `{Grimer-Alola, Muk-Alola}` |
| Voltorb | `{Voltorb, Electrode}` · `{Voltorb-Hisui, Electrode-Hisui}` |
| Zorua | `{Zorua, Zoroark}` · `{Zorua-Hisui, Zoroark-Hisui}` |
| Tauros | `{Tauros}` · `{Tauros-Paldea-Combat}` · `{Tauros-Paldea-Blaze}` · `{Tauros-Paldea-Aqua}` — four independent Pokémon |
| Volbeat / Illumise | `{Volbeat}` · `{Illumise}` — not even alternate forms, two different Pokémon |
| Phione / Manaphy | `{Phione}` · `{Manaphy}` — two different Pokémon |

### KOFFING treatment — one family, branching evolution

| Line | Family | Branches |
|---|---|---|
| Koffing | `{Koffing, Weezing, Weezing-Galar}` | Weezing (candy) / Weezing-Galar (moon stone) |
| Mr. Mime | `{Mime Jr., Mr. Mime, Mr. Mime-Galar, Mr. Rime}` | Mr. Mime (candy) / Mr. Mime-Galar (ice stone) → Mr. Rime |
| Goomy | `{Goomy, Sliggoo, Goodra, Sliggoo-Hisui, Goodra-Hisui}` | Sliggoo (candy) / Sliggoo-Hisui (ice stone) |
| Pikachu | `{Pichu, Pikachu, Raichu, Raichu-Alola}` | Raichu (candy) / Raichu-Alola (sun stone) |
| Exeggcute | `{Exeggcute, Exeggutor, Exeggutor-Alola}` | Exeggutor (candy) / Exeggutor-Alola (leaf stone) |
| Cubone | `{Cubone, Marowak, Marowak-Alola}` | Marowak (candy) / Marowak-Alola (fire stone) |
| Cyndaquil | `{…, Typhlosion, Typhlosion-Hisui}` | Typhlosion (candy) / Typhlosion-Hisui (dusk stone) |
| Oshawott | `{…, Samurott, Samurott-Hisui}` | Samurott (candy) / Samurott-Hisui (dusk stone) |
| Petilil | `{Petilil, Lilligant, Lilligant-Hisui}` | Lilligant (candy) / Lilligant-Hisui (sun stone) |
| Rufflet | `{Rufflet, Braviary, Braviary-Hisui}` | Braviary (candy) / Braviary-Hisui (dawn stone) |
| Rowlet | `{…, Decidueye, Decidueye-Hisui}` | Decidueye (candy) / Decidueye-Hisui (dawn stone) |
| Rockruff | `{Rockruff, Lycanroc-Midday, Lycanroc-Midnight, Lycanroc-Dusk}` | candy / moon stone / dusk stone — one Lycanroc per run |
| Bergmite | `{Bergmite, Avalugg, Avalugg-Hisui}` | Avalugg (candy) / Avalugg-Hisui (ice stone) |

### Fully independent Pokémon (their own family, dedup still G1)

Articuno-Galar · Zapdos-Galar · Moltres-Galar · Stunfisk-Galar · Magearna / Magearna-Original ·
Eternatus / Eternatus-Eternamax · Indeedee-M / Indeedee-F.

Magearna, Eternatus and Indeedee follow the **Therian pattern**: independent Pokémon, one per run.

### Burmy — its own bespoke case (subfamilies)

The only family that needs a custom rule. Required outcome:

- the player receives **one** Burmy / Wormadam / Mothim in total (G1);
- **Mothim** converges and **accumulates** the mutations of all three cloaks (G3);
- **each Wormadam inherits only from its own Burmy cloak** — Wormadam-Sandy takes Burmy-Sandy's
  mutations and nothing from Plant or Trash.

So the three cloaks are **subfamilies**: separate inheritance units, one dedup group, and a
convergence point that unions. This is the model `T-284` has to express.

### Cosmetic — keep one form, remove the rest from the game

| Set | Keep | Remove |
|---|---|---|
| Basculin | **White-Striped** (it is the one that branches into Basculegion M/F) | Red-Striped, Blue-Striped |
| Deerling / Sawsbuck | one season | the other three |
| Pumpkaboo / Gourgeist | **Average** | Small, Large, Super |
| Shellos / Gastrodon | **West** | East |
| Sinistea / Polteageist | one | the other |
| Poltchageist / Sinistcha | one line | the other |
| Squawkabilly | **Green** | Blue, Yellow, White |
| Tatsugiri | one | the other two |
| Zarude | **Zarude** | Zarude-Dada |
| Xerneas | one (see **Xerneas** below) | the other |

Already decided earlier and shipping in T-289: **Rockruff-Own-Tempo** and **Gimmighoul-Roaming**.

### Exceptions the engine already handles correctly

- **Greninja Battle Bond** — T-185's treatment stands, trust it.
- **Meltan → Melmetal** — one family; the line has to be created (T-286).

---

## Transformation forms

### Premium transformation items — new mechanic

Four items get the same treatment as mega stones, but as their own premium tier:

| Item | Base | Transformed form |
|---|---|---|
| Rusted Sword | Zacian-Hero | Zacian-Crowned |
| Rusted Shield | Zamazenta-Hero | Zamazenta-Crowned |
| Red Orb | Groudon | Groudon-Primal |
| Blue Orb | Kyogre | Kyogre-Primal |

Rules:

1. Available **only in the last mega-stone batch** — the one unlocked by defeating May.
2. Placed **only if** the associated base Pokémon is obtainable in this run.
3. Usable **only by the Elite Four and the Champion**.
4. They are **extra**: a trainer may carry one of these *in addition to* its regular mega stone, and
   it does not count as "the mega".
5. A trainer may equip one only if it fields one of the four base Pokémon.
6. The transformed form is rated **as a standard Pokémon, not as a mega**. If it comes out **AG**,
   the item is not placed at all and no E4/Champion may use it.
7. **Mega stones have priority.** When available trainer slots < items to place, mega stones go first.

Consequence flagged by the owner: this changes how **Drizzle / Drought on Groudon and Kyogre** are
rated — see open item **O3**.

### The other held-item transformation forms — same treatment?

Same engine shape (`FORM_CHANGE_ITEM_HOLD`), so the same mechanic applies. Owner asked to evaluate:

| Item | Base | Transformed | Verdict |
|---|---|---|---|
| Adamant Crystal | Dialga | Dialga-Origin | **confirmed** — Zacian/Zamazenta treatment |
| Lustrous Globe | Palkia | Palkia-Origin | **confirmed** — Zacian/Zamazenta treatment |
| Griseous Orb / Core | Giratina-Altered | Giratina-Origin | **confirmed** — Zacian/Zamazenta treatment |
| Wellspring / Hearthflame / Cornerstone Mask | Ogerpon-Teal | the three masked Ogerpon | **confirmed** — Teal is the only wild-findable Ogerpon; a mask is placed like an end-game mega stone |
| One Genesect Drive | Genesect | the matching Drive form | **confirmed** — one random Drive; it only retypes Techno Blast (see below) |

### Forms changed by an item OUTSIDE battle — no item modelling at all

Deoxys · Rotom · Shaymin · Tornadus / Thundurus / Landorus / Enamorus · Hoopa · Oricorio · Zygarde,
plus the fusions Kyurem · Necrozma · Calyrex.

Rule: **the player simply obtains one concrete form and the item is irrelevant.** Treated exactly like
the fusions — no duplicates (never two Deoxys, never two Kyurem, G1 covers it), but **trainers may
field any form**.

### Xerneas — answering the owner's question

Our engine, `sXerneasFormChangeTable`:

```
BEGIN_BATTLE -> XERNEAS_ACTIVE
END_BATTLE   -> XERNEAS_NEUTRAL
```

Unconditional: no item, no ability, no HP threshold. Xerneas is Neutral in the overworld and in the
box, and Active in **every** battle, always. And the two entries are identical in the data —
**BST 680, pure Fairy, Fairy Aura, same everything**. Neutral is the dormant look, Active the glowing
one; there is no gameplay difference whatsoever.

So Xerneas is **purely cosmetic**: keep one form, drop the other (G4). Recommend keeping
`XERNEAS_NEUTRAL` as the canonical entry since that is what the player owns outside battle.

### Terapagos

Terastallization does not exist in this base, so **Tera Shift is rated 0** — Terapagos is treated as
a Pokémon with no ability. (This also settles the engine/ban-list mismatch: the placeable form must be
`TERAPAGOS_NORMAL`, not `TERAPAGOS_TERASTAL`.)

### Battle states that must never be placed

Confirmed bug from the audit: these are pure battle states the player can never own, yet the
randomizer may place them today. They belong in `BANNED_SPECIES_FOR_PICKING`:

`XERNEAS_ACTIVE` (moot once Xerneas collapses) · `NECROZMA_ULTRA` · `ETERNATUS_ETERNAMAX`
(⚠ but the owner ruled Eternamax is an *independent Pokémon* — see open item **O6**) ·
`TERAPAGOS_TERASTAL`.

---

## Work this creates beyond the existing 12 tasks

| Task | Scope |
|---|---|
| **T-290** | Premium transformation items: the 4 confirmed + whatever O4/O5 add. Last mega batch, E4/Champion only, gated on base obtainability and on the transformed form not being AG, mega stones first when slots are short. Includes making primal/crowned forms rate as standard Pokémon instead of megas. |
| **T-291** | Remove the cosmetic duplicate species from the game (the table above) — a `REMOVED_SPECIES` sweep plus the base-ROM implications. Shares T-289's lane. |
| **T-292** | Rate Tera Shift at 0 and fix the Terapagos placeable form. |
| **T-293** | Ban the battle-only states that are currently placeable. |

---

## Resolved — the seven open items

### O1 · Bergmite → KOFFING treatment
Confirmed a slip. `{Bergmite, Avalugg, Avalugg-Hisui}` is one family branching by ice stone, exactly
like Pikachu → Raichu / Raichu-Alola. Moved above.

### O2 · Shellos / Gastrodon → remove the East forms
Owner indifferent, so taking the consistent option: East leaves the game like Pumpkaboo's extra sizes
and Squawkabilly's extra colours, rather than surviving as a dedup-suppressed duplicate.

### O3 · Drizzle / Drought vs the primal abilities — **the rater already does this**

The ruling: a primal form does **not** have Drizzle/Drought, it has Primordial Sea / Desolate Land,
which *override* normal weather and do not combine with the team; but the mon's **own** benefit from
sun/rain still counts.

I checked before writing anything, and that is exactly what the code already does:

- `rating.js:1282-1284` — `inSun` includes `DESOLATE_LAND` and `inRain` includes `PRIMORDIAL_SEA`, so
  the primal's own sun/rain-scaling moves are valued. The comment right above even says *"primals are
  own-only there"*.
- `rating.js:3140` / `rating.js:3165` — every combo bonus (the flat +0.4, the STAB bonus, the recovery
  bonus and the **+0.3 teambuilding bonus**) is gated on `hasAbility('DRIZZLE')` / `hasAbility('DROUGHT')`.
  Primordial Sea and Desolate Land match neither, so they already earn none of it.

**So nothing changes in the weather rating.** What T-290 changes is the *mega classification*:
`getEvolutionType` types any `_PRIMAL` id as `EVO_TYPE_MEGA` (`parser.js:898`), which today drags in
the mega-only rules — most importantly the cap that stops a mega reaching LEGEND unless its base is
LEGEND (`modules/pokedexModule.js:370-378`). Dropping that is what lets Primal Kyogre/Groudon rate
honestly, which is what your rule 6 (withhold the item if the form is AG) needs. Zacian-Crowned and
Zamazenta-Crowned are already rated as standard Pokémon — no `_MEGA`/`_PRIMAL` suffix — so they need
nothing. **T-290 must audit every `isMega` / `evolutionData.isMega` use, not the weather code.**

### O4 · Ogerpon → premium tier
Teal is the only Ogerpon findable in the wild; one mask is placed like an end-game mega stone under
the premium rules. Standing consequence: the mask is `FORM_CHANGE_ITEM_HOLD`, so it **occupies the
held-item slot** — a masked Ogerpon can never carry a berry or a boosting item.

### O5 · Genesect → one random Drive, and it is cheaper than it looks

All five Genesect entries are `GENESECT_SPECIES_INFO(form)` where the parameter is **only the sprite
name**. Stats, types and abilities are byte-identical across base and all four Drive forms
(BST 600, Bug/Steel, Download). The Drive changes nothing but **Techno Blast's type** — exactly your
guess. So no species need re-enabling for balance; one random Drive as a premium item is the whole
feature.

⚠ Dependency: Genesect is macro-defined, so finding **F10** applies — its own mutations never reach the
ROM today. **T-283 must land before this means anything.**

### O6 · Eternatus-Eternamax → no action
Its BST bans it in practice; if a run mutates it into placement, so be it.

### O7 · Necrozma-Ultra → keep it, it is genuinely reachable

The condition you set was "ban it if it needs a Z-move, since there are no Z-moves". It does not:
Ultra Burst is implemented in this base as its own battle gimmick — `P_ULTRA_BURST_FORMS TRUE`
(`include/config/species_enabled.h:28`), `GIMMICK_ULTRA_BURST` in `src/data/gimmicks.h`, and
`ITEM_ULTRANECROZIUM_Z` is a real item (`include/constants/items.h:481`). It works like Mega Evolution:
hold the item, burst in battle.

So Ultra Necrozma is reachable and stays. Under your fusion rule it needs no item modelling at all —
the player simply receives a concrete Necrozma form (base / Dusk-Mane / Dawn-Wings / Ultra), one per
run via G1, and trainers may field any of them.

---

### O8 · Dialga / Palkia / Giratina → premium tier, Zacian treatment
Their **original** forms (Dialga, Palkia, Giratina-Altered) are the obtainable Pokémon. The Origin
forms are obtainable **only** the way a mega stone is: through the item, in the last batch.

### O9 · Premium item placement

- **One Ogerpon mask per run** (random among the three) and **one Genesect Drive per run** (random
  among the four). The other masks/drives are simply not placed.
- Every premium item is placed **only if its Pokémon is obtainable in that run** — and, per rule 6,
  only if the transformed form does not rate AG.
- So the per-run candidate set is at most **nine**: Rusted Sword, Rusted Shield, Red Orb, Blue Orb,
  Adamant Crystal, Lustrous Globe, Griseous Orb, one mask, one drive.
- **Mega stones are placed first and are never displaced.** Premium items then fill whatever slots
  remain, **in random order**. When the slots run out, the premium items are the ones dropped.

---

## Everything is decided

No open items remain. The ruleset above is complete; ADR-026 records the model and the 15 child tasks
implement it.
