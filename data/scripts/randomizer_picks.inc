@ T-236 / ADR-022 — shared data-driven item-pick scripts. Every pick location's map script is a static
@ stub that sets VAR_0x8004 = PICK_* (include/constants/randomizer_picks.h) and calls one of these.
@ The items live in gItemPicks[] (src/randomizer_picks.c), read via the GetItemPickItem /
@ BufferItemPickName specials — the randomizer/injector only touches that table, never script bytecode.

@ Builds and shows the menu from gItemPicks[VAR_0x8004]: every non-NONE slot becomes an option
@ (labels are the item names, or "TM <move>" for TM items), so 2/3/4-item picks share this script and
@ a partially-filled entry (e.g. the berry pool running out at Route 121) shows exactly its real
@ options, as the generated handlers did. Used directly by the TM picks, whose per-option handlers
@ are static. In: VAR_0x8004 = pick index. Out: VAR_RESULT = chosen slot (= push id), or
@ MULTI_B_PRESSED on cancel. Clobbers VAR_0x8005 and STR_VAR_1.
Common_EventScript_ShowPickMenu::
	setvar VAR_0x8005, 0
	special GetItemPickItem
	goto_if_eq VAR_RESULT, ITEM_NONE, Common_EventScript_ShowPickMenuSlot1
	special BufferItemPickName
	dynmultipush Common_Text_PickItemName, 0
Common_EventScript_ShowPickMenuSlot1:
	setvar VAR_0x8005, 1
	special GetItemPickItem
	goto_if_eq VAR_RESULT, ITEM_NONE, Common_EventScript_ShowPickMenuSlot2
	special BufferItemPickName
	dynmultipush Common_Text_PickItemName, 1
Common_EventScript_ShowPickMenuSlot2:
	setvar VAR_0x8005, 2
	special GetItemPickItem
	goto_if_eq VAR_RESULT, ITEM_NONE, Common_EventScript_ShowPickMenuSlot3
	special BufferItemPickName
	dynmultipush Common_Text_PickItemName, 2
Common_EventScript_ShowPickMenuSlot3:
	setvar VAR_0x8005, 3
	special GetItemPickItem
	goto_if_eq VAR_RESULT, ITEM_NONE, Common_EventScript_ShowPickMenuShow
	special BufferItemPickName
	dynmultipush Common_Text_PickItemName, 3
Common_EventScript_ShowPickMenuShow:
	dynmultistack 0, 0, FALSE, 4, FALSE, 0, NULL
	return

@ Menu + take: shows the menu and, unless cancelled, gives the chosen item (finditem — same message/
@ fanfare as the old generated handlers). In: VAR_0x8004 = pick index. Out: VAR_RESULT = 1 item taken /
@ 0 cancelled — the calling stub sets its FLAG_ITEM_* only on 1 (B-cancel keeps the ball, as before).
Common_EventScript_DoPick::
	call Common_EventScript_ShowPickMenu
	goto Common_EventScript_TakePickedItem

Common_EventScript_TakePickedItem::
	goto_if_eq VAR_RESULT, MULTI_B_PRESSED, Common_EventScript_PickCancelled
	copyvar VAR_0x8005, VAR_RESULT
	special GetItemPickItem
	finditem VAR_RESULT
	setvar VAR_RESULT, 1
	return

Common_EventScript_PickCancelled::
	setvar VAR_RESULT, 0
	return

Common_Text_PickItemName:
	.string "{STR_VAR_1}$"
