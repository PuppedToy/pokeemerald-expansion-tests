# How to Add a New Item / TM Pick

A "pick" is an item ball in the world where the player opens a menu and chooses one of 2–4 items
(or a plain ball that just gives one item). Since **T-236** every pick is **data-driven**: the map
script is static and only says *which pick* it is; the items and the menu labels come from the
`gItemPicks[]` table at runtime.

```
data/maps/<Map>/scripts.inc        static stub:  setvar VAR_0x8004, PICK_<X>  +  call Common_EventScript_DoPick
include/constants/randomizer_picks.h            PICK_<X> index
src/randomizer_picks.c             gItemPicks[PICK_<X>] = {{ item0, item1, item2, item3 }}
data/scripts/randomizer_picks.inc  the shared menu/give scripts (never edited per pick)
```

There are **two kinds** of pick, and they differ only in who fills the table row:

| Kind | Table row filled by | Menu labels |
|---|---|---|
| **Item pick** (berries, gems, plates, pool items, single good items) | `randomizer/itemRandomizer.js` each run, between the `@ITEM_PICKS_START/END` anchors | item names, resolved at runtime |
| **TM pick** | nobody — the row is **static** C (the TM *slot* is fixed; only the move behind it changes) | `"TM <move>"`, resolved at runtime from the TM table |

`script_menu.h` is no longer involved: menus are built with `dynmultipush` from the table, so no
`MULTI_*` constant and no `MultichoiceList_*` array are needed. The shared script skips `ITEM_NONE`
slots, so a 2- or 3-item pick just leaves the tail of its row empty.

---

## A. Adding a TM pick

### Step 1 — Assign TM slot numbers

Decide which TM slots the pick offers. Slots must come from the same pool (see `tms.md` for pool
ranges) and must not already be placed elsewhere. Mark them as placed in `tms.md`.

Example: TM08, TM09, TM10 (avgDmg pool, unplaced slots).

### Step 2 — Add the PICK_TM_ constant

**File:** `include/constants/randomizer_picks.h` — add at the end of the TM block and bump
`PICK_COUNT`:

```c
#define PICK_TM_ROUTE104_2          30
...
#define PICK_COUNT                  53   // ← +1
```

### Step 3 — Add the table row

**File:** `src/randomizer_picks.c` — **after** the `@ITEM_PICKS_END` anchor (the static TM section;
rows before the anchor get overwritten every run). Slot order must match the script's case order:

```c
    [PICK_TM_ROUTE104_2]           = {{ ITEM_TM08, ITEM_TM09, ITEM_TM10, ITEM_NONE }},
```

### Step 4 — Add the pick script

**File:** `data/maps/<MapName>/scripts.inc` — show the menu from the table, then branch to the
static per-option handlers (TM picks keep their own `finditem` handlers):

```asm
Route104_EventScript_PickTM2::
	setvar VAR_0x8004, PICK_TM_ROUTE104_2
	call Common_EventScript_ShowPickMenu
	switch VAR_RESULT
	case 0, Route104_EventScript_PickTM2_Option1
	case 1, Route104_EventScript_PickTM2_Option2
	case 2, Route104_EventScript_PickTM2_Option3
	end

Route104_EventScript_PickTM2_Option1::
	finditem ITEM_TM08
	setflag FLAG_ITEM_ROUTE_104_PP_UP
	end
	@ …Option2 / Option3 the same with TM09 / TM10
```

> Pressing B returns `MULTI_B_PRESSED` (127), which matches no `case` and falls through to `end` —
> the ball stays, as before.

---

## B. Adding an item pick (randomized from a pool)

### Step 1 — Add the PICK_ constant

**File:** `include/constants/randomizer_picks.h` — add it **inside** the randomized block (before
`PICK_RANDOMIZED_COUNT`) and bump `PICK_RANDOMIZED_COUNT` **and** `PICK_COUNT`. Renumbering shifts
every later index, so append at the end of the randomized block rather than inserting.

### Step 2 — Add the table row (default only)

**File:** `src/randomizer_picks.c`, **between** the `@ITEM_PICKS_START/END` anchors:

```c
    [PICK_ROUTE104_NEWPICK]        = {{ ITEM_NONE, ITEM_NONE, ITEM_NONE, ITEM_NONE }},
```

### Step 3 — Wire the randomizer

**File:** `randomizer/itemRandomizer.js`

1. `buildAssignments()` — draw the items (`pool(3)`, `berry(4)`, `good(1)[0]`, …) under a new key.
2. `PICK_TABLE` — add `['PICK_ROUTE104_NEWPICK', 'route104NewPick']`. **Order must match the
   header's indices** (the scripts pass raw numbers) — the unit test asserts one line per entry.
3. `randomizeItems()`'s return — expose the display name(s) so `trainers.js` can propagate them.

### Step 4 — Add the pick script

**File:** `data/maps/<MapName>/scripts.inc`

```asm
Route104_EventScript_NewPick::
	setvar VAR_0x8004, PICK_ROUTE104_NEWPICK
	call Common_EventScript_DoPick
	goto_if_eq VAR_RESULT, 0, Route104_EventScript_NewPickEnd
	setflag FLAG_ITEM_ROUTE_104_NEWPICK
Route104_EventScript_NewPickEnd::
	end
```

`Common_EventScript_DoPick` shows the menu and gives the chosen item; it returns `VAR_RESULT` = 1
(taken) or 0 (cancelled), so the flag is only set when the player actually took something. For a
**single-item** location there is no menu — take slot 0 directly:

```asm
Route104_EventScript_NewItem::
	setvar VAR_0x8004, PICK_ROUTE104_NEWITEM
	setvar VAR_0x8005, 0
	special GetItemPickItem
	finditem VAR_RESULT
	setflag FLAG_ITEM_ROUTE_104_NEWITEM
	end
```

---

## C. Shared steps (both kinds)

### Update the map object event

**File:** `data/maps/<MapName>/map.json` — point the item ball at the new script and set
`trainer_sight_or_berry_tree_id` to `"0"` (the script gives the item, not the ball):

```json
{
  "trainer_sight_or_berry_tree_id": "0",
  "script": "Route104_EventScript_PickTM2",
  "flag": "FLAG_ITEM_ROUTE_104_PP_UP"
}
```

> `graphics_id` stays `OBJ_EVENT_GFX_ITEM_BALL` — that's what shows the ball sprite.

### Wire up the trainer bag and reward (optional)

**File:** `randomizer/trainers.js` — so a nearby trainer carries the same items:

```js
const choice104TMs2 = [tmItem(8), tmItem(9), tmItem(10)];
// then:  { id: 'TRAINER_KOICHI', reward: [...choice104TMs2], bag: [...choice104TMs2], … }
```

Item picks use `itemAssignments.<yourKey>` instead of `tmItem(n)`.

---

## Checklist

- [ ] TM slots chosen and marked in `tms.md` (TM picks) / pool draw added to `buildAssignments` (item picks)
- [ ] `PICK_*` constant added to `include/constants/randomizer_picks.h`, counts bumped
- [ ] Row added to `gItemPicks[]` in `src/randomizer_picks.c` (after the anchors for TMs, inside for items)
- [ ] `PICK_TABLE` entry added in `randomizer/itemRandomizer.js` (item picks only)
- [ ] Pick script added to the map's `scripts.inc`
- [ ] Map object event updated in `map.json`
- [ ] Trainer bag/reward updated in `randomizer/trainers.js` (if applicable)
- [ ] `cd randomizer && npm test` green
