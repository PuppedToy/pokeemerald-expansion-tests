PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles::
	applymovement LOCALID_PLAYER, Common_Movement_Delay32
	waitmovement 0
	playse SE_DOOR
	setmetatile 6, 1, METATILE_EliteFour_OpenDoor_Frame, FALSE
	setmetatile 6, 2, METATILE_EliteFour_OpenDoor_Opening, FALSE
	setmetatile 0, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 1, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	setmetatile 2, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 3, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	setmetatile 4, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 8, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	setmetatile 9, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 10, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	setmetatile 11, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 12, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	special DrawWholeMapView
	return

PokemonLeague_EliteFour_EventScript_WalkInCloseDoor::
	applymovement LOCALID_PLAYER, Common_Movement_WalkUp6
	waitmovement 0
	playse SE_TRUCK_DOOR
	setmetatile 5, 12, METATILE_EliteFour_EntryDoor_ClosedTop, TRUE
	setmetatile 6, 12, METATILE_EliteFour_EntryDoor_ClosedTop, TRUE
	setmetatile 7, 12, METATILE_EliteFour_EntryDoor_ClosedTop, TRUE
	setmetatile 5, 13, METATILE_EliteFour_EntryDoor_ClosedBottom, TRUE
	setmetatile 6, 13, METATILE_EliteFour_EntryDoor_ClosedBottom, TRUE
	setmetatile 7, 13, METATILE_EliteFour_EntryDoor_ClosedBottom, TRUE
	special DrawWholeMapView
	return

@ Essentially unused, only necessary when re-entering an Elite Four room after defeating the member, which isnt normally possible
PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom::
	setmetatile 6, 1, METATILE_EliteFour_OpenDoor_Frame, FALSE
	setmetatile 6, 2, METATILE_EliteFour_OpenDoor_Opening, FALSE
	setmetatile 5, 12, METATILE_EliteFour_EntryDoor_ClosedTop, TRUE
	setmetatile 6, 12, METATILE_EliteFour_EntryDoor_ClosedTop, TRUE
	setmetatile 7, 12, METATILE_EliteFour_EntryDoor_ClosedTop, TRUE
	setmetatile 5, 13, METATILE_EliteFour_EntryDoor_ClosedBottom, TRUE
	setmetatile 6, 13, METATILE_EliteFour_EntryDoor_ClosedBottom, TRUE
	setmetatile 7, 13, METATILE_EliteFour_EntryDoor_ClosedBottom, TRUE
	setmetatile 0, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 1, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	setmetatile 2, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 3, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	setmetatile 4, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 8, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	setmetatile 9, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 10, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	setmetatile 11, 2, METATILE_EliteFour_RightSpotlightOff, TRUE
	setmetatile 12, 2, METATILE_EliteFour_LeftSpotlightOff, TRUE
	return

PokemonLeague_EliteFour_EventScript_CloseDoor::
	setmetatile 5, 12, METATILE_EliteFour_EntryDoor_ClosedTop, TRUE
	setmetatile 6, 12, METATILE_EliteFour_EntryDoor_ClosedTop, TRUE
	setmetatile 7, 12, METATILE_EliteFour_EntryDoor_ClosedTop, TRUE
	setmetatile 5, 13, METATILE_EliteFour_EntryDoor_ClosedBottom, TRUE
	setmetatile 6, 13, METATILE_EliteFour_EntryDoor_ClosedBottom, TRUE
	setmetatile 7, 13, METATILE_EliteFour_EntryDoor_ClosedBottom, TRUE
	return

@ ── T-090 / ADR-014 — League Run & Bun: per-Elite-Four "singles or doubles?" choice ──────────────
@ Each E4 room calls this before its battle. It sets VAR_RESULT = 1 (doubles) or 0 (singles); the room
@ then branches to TRAINER_<X> (singles) or TRAINER_<X>_DOUBLES (doubles). The battle type itself rides
@ on the trainer's Double Battle flag (see src/battle_main.c). While a quota of the chosen type remains
@ it prompts and decrements it; once one type is exhausted it forces the other without asking. Mode 0
@ (the default / any non-Run & Bun run) never prompts and always returns singles.
PokemonLeague_EliteFour_EventScript_ChooseBattleStyle::
	goto_if_eq VAR_RUNANDBUN_MODE, 0, PokemonLeague_EliteFour_EventScript_BattleStyleSingles
	goto_if_eq VAR_RUNANDBUN_DOUBLES_LEFT, 0, PokemonLeague_EliteFour_EventScript_BattleStyleSingles
	goto_if_eq VAR_RUNANDBUN_SINGLES_LEFT, 0, PokemonLeague_EliteFour_EventScript_BattleStyleDoubles
	msgbox PokemonLeague_EliteFour_Text_ChooseBattleStyle, MSGBOX_YESNO
	goto_if_eq VAR_RESULT, YES, PokemonLeague_EliteFour_EventScript_BattleStyleDoubles
	@ NO → fall through to singles

PokemonLeague_EliteFour_EventScript_BattleStyleSingles::
	setvar VAR_RESULT, 0
	goto_if_eq VAR_RUNANDBUN_MODE, 0, PokemonLeague_EliteFour_EventScript_BattleStyleDone
	goto_if_eq VAR_RUNANDBUN_SINGLES_LEFT, 0, PokemonLeague_EliteFour_EventScript_BattleStyleDone
	subvar VAR_RUNANDBUN_SINGLES_LEFT, 1
	return

PokemonLeague_EliteFour_EventScript_BattleStyleDoubles::
	setvar VAR_RESULT, 1
	goto_if_eq VAR_RUNANDBUN_DOUBLES_LEFT, 0, PokemonLeague_EliteFour_EventScript_BattleStyleDone
	subvar VAR_RUNANDBUN_DOUBLES_LEFT, 1
	return

PokemonLeague_EliteFour_EventScript_BattleStyleDone::
	return

PokemonLeague_EliteFour_Text_ChooseBattleStyle:
	.string "The League rules let you choose how\n"
	.string "to face this ELITE FOUR member.\p"
	.string "Shall we make this a Double Battle?$"
