# How to Add a New 3-Choice TM Pick

A "3-choice TM pick" is an item ball in the world where the player opens a menu and chooses one of three TMs. The displayed move names update automatically each pipeline run to reflect the randomized TM pool.

This guide covers all the files that must be touched, in order.

---

## Step 1 — Assign TM slot numbers

Decide which three TM slots the pick will offer. Slots must come from the same pool (see `tms.md` for pool ranges) and must not already be placed elsewhere. Mark them as placed in `tms.md`.

Example: TM08, TM09, TM10 (avgDmg pool, unplaced slots).

---

## Step 2 — Add the MULTI_ constant

**File:** `include/constants/script_menu.h`

Add a new `#define` at the end of the custom multichoice block, incrementing the last value:

```c
#define MULTI_ROUTE104_PICK_TM2            158
```

---

## Step 3 — Add the MultichoiceList to script_menu.h

**File:** `src/data/script_menu.h`

**3a.** Add the static list near the other lists for the same route. Placeholder move names don't matter — tmRandomizer.js overwrites them on every run:

```c
static const struct MenuAction MultichoiceList_Route104PickTM2[] =
{
    {COMPOUND_STRING("TM Placeholder")},
    {COMPOUND_STRING("TM Placeholder")},
    {COMPOUND_STRING("TM Placeholder")},
};
```

**3b.** Register it in `gMultichoiceLists[]` using the constant from Step 2:

```c
[MULTI_ROUTE104_PICK_TM2] = MULTICHOICE(MultichoiceList_Route104PickTM2),
```

---

## Step 4 — Wire the randomizer

**File:** `puppedjs/tmRandomizer.js` → `PICK_LISTS` array

Add an entry mapping the list name to the three TM slot numbers (1-based):

```js
['MultichoiceList_Route104PickTM2',  [8,  9,  10]],
```

The randomizer will replace the three `COMPOUND_STRING` entries in the list on every run with the actual move names assigned to those slots.

---

## Step 5 — Add the pick script to the map's scripts.inc

**File:** `data/maps/<MapName>/scripts.inc`

Add a script that opens the multichoice and branches to per-option handlers. Each handler calls `finditem ITEM_TMxx` (the slot number from Step 1) then `setflag FLAG_ITEM_<flag>`:

```asm
Route104_EventScript_PickTM2::
    multichoice 0, 0, MULTI_ROUTE104_PICK_TM2, FALSE
    switch VAR_RESULT
    case 0, Route104_EventScript_PickTM2_Option1
    case 1, Route104_EventScript_PickTM2_Option2
    case 2, Route104_EventScript_PickTM2_Option3
    end

Route104_EventScript_PickTM2_Option1::
    finditem ITEM_TM08
    setflag FLAG_ITEM_ROUTE_104_PP_UP
    end

Route104_EventScript_PickTM2_Option2::
    finditem ITEM_TM09
    setflag FLAG_ITEM_ROUTE_104_PP_UP
    end

Route104_EventScript_PickTM2_Option3::
    finditem ITEM_TM10
    setflag FLAG_ITEM_ROUTE_104_PP_UP
    end
```

---

## Step 6 — Update the map object event

**File:** `data/maps/<MapName>/map.json`

Change the item ball object event to use the new script. Set `trainer_sight_or_berry_tree_id` to `"0"` (not an item ID — the script handles the item directly):

```json
{
  "trainer_sight_or_berry_tree_id": "0",
  "script": "Route104_EventScript_PickTM2",
  "flag": "FLAG_ITEM_ROUTE_104_PP_UP"
}
```

> **Note:** `graphics_id` stays `OBJ_EVENT_GFX_ITEM_BALL` — that's what shows the ball sprite.

---

## Step 7 — Wire up the trainer bag and reward (optional)

If a nearby trainer should carry those same TMs (so their Pokemon can use them and the player sees the TMs listed as rewards):

**File:** `puppedjs/trainers.js`

```js
const choice104TMs2 = [tmItem(8), tmItem(9), tmItem(10)];
```

Then reference it in the trainer definition:

```js
{
    id: 'TRAINER_KOICHI',
    reward: [...choice104TMs2],
    bag: [...choice104TMs2],
    ...
}
```

---

## Checklist

- [ ] TM slots chosen and marked in `tms.md`
- [ ] `MULTI_*` constant added to `include/constants/script_menu.h`
- [ ] `MultichoiceList_*` added to `src/data/script_menu.h` (static array + gMultichoiceLists entry)
- [ ] Entry added to `PICK_LISTS` in `puppedjs/tmRandomizer.js`
- [ ] Pick script added to the map's `scripts.inc`
- [ ] Map object event updated in `map.json`
- [ ] Trainer bag/reward updated in `puppedjs/trainers.js` (if applicable)
