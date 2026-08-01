#ifndef GUARD_RANDOMIZER_PICKS_H
#define GUARD_RANDOMIZER_PICKS_H

#include "constants/randomizer_picks.h"

// T-236 / ADR-022 — data-driven item placement. Previously the randomizer regenerated per-item script
// handlers (multichoice + switch + `finditem ITEM_X` per option) inside data/maps/**/scripts.inc and
// rewrote the MultichoiceList_* label arrays in src/data/script_menu.h every run (compiled script
// bytecode — not injectable). Now every pick location is a STATIC script stub:
//     setvar VAR_0x8004, PICK_<LOCATION>
//     call Common_EventScript_DoPick{3,4}   @ or inline take-slot-0 for single-item locations
//     setflag FLAG_ITEM_<location>          @ skipped when the menu was cancelled
// and the items live in gItemPicks[] (const .rodata, read with RUNTIME indices so -O2/LTO can't fold
// them — the array survives at a fixed .map offset the injector overwrites). The randomizer patches
// the initializers between the anchors at build time (randomizer/itemRandomizer.js).

struct ItemPick
{
    u16 items[MAX_PICK_ITEMS]; // unused slots are ITEM_NONE
};

extern const struct ItemPick gItemPicks[PICK_COUNT];

// special: VAR_0x8004 = pick index, VAR_0x8005 = slot → VAR_RESULT = item id.
void GetItemPickItem(void);
// special: VAR_0x8004 = pick index, VAR_0x8005 = slot → gStringVar1 = menu label for the item
// (item name; "TM <move name>" for TM/HM pocket items so labels track the randomized TM tables).
void BufferItemPickName(void);

// T-236 — mega-trainer removal as data instead of map.json object deletion. The writer/injector
// sets gMegaTrainerHidden[i] (randomizer/megaHiddenWriter.js) and the object-event spawn loops skip
// a hidden mega's two objects: the trainer NPC (matched by its event script) and the mega-stone
// ball (matched by its unique FLAG_ITEM_* template flag). LocalIds never shift and no flags are
// consumed; the two objects' own flag semantics (badge-hide / item-collected) are untouched.
extern const u8 gMegaTrainerHidden[MEGA_TRAINER_COUNT];

struct ObjectEventTemplate;
bool32 RandomizerIsHiddenMegaObject(const struct ObjectEventTemplate *template);

#endif // GUARD_RANDOMIZER_PICKS_H
