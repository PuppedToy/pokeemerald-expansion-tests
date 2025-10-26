EverGrandeCity_MapScripts::
	map_script MAP_SCRIPT_ON_TRANSITION, EverGrandeCity_OnTransition
	.byte 0

EverGrandeCity_OnTransition:
	call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
	end

EverGrandeCity_EventScript_VictoryRoadSign::
	msgbox EverGrandeCity_Text_EnteringVictoryRoad, MSGBOX_SIGN
	end

EverGrandeCity_EventScript_CitySign::
	msgbox EverGrandeCity_Text_CitySign, MSGBOX_SIGN
	end

EverGrandeCity_EventScript_PokemonLeagueSign::
	msgbox EverGrandeCity_Text_EnteringPokemonLeague, MSGBOX_SIGN
	end

EverGrandeCity_EventScript_Rival::
	lockall
	checkplayergender
	goto_if_eq VAR_RESULT, MALE, EverGrandeCity_EventScript_RivalMay
	goto_if_eq VAR_RESULT, FEMALE, EverGrandeCity_EventScript_RivalBrendan
	end

EverGrandeCity_EventScript_RivalMay::
	msgbox EverGrandeCity_Text_May_OneLastBattle, MSGBOX_DEFAULT
	closemessage
	playbgm MUS_ENCOUNTER_MAY, TRUE
	switch VAR_STARTER_MON
	case 0, EverGrandeCity_EventScript_StartMayBattleTreecko
	case 1, EverGrandeCity_EventScript_StartMayBattleTorchic
	case 2, EverGrandeCity_EventScript_StartMayBattleMudkip
	end

EverGrandeCity_EventScript_RivalBrendan::
	msgbox EverGrandeCity_Text_Brendan_OneLastBattle, MSGBOX_DEFAULT
	closemessage
	playbgm MUS_ENCOUNTER_BRENDAN, TRUE
	switch VAR_STARTER_MON
	case 0, EverGrandeCity_EventScript_StartBrendanBattleTreecko
	case 1, EverGrandeCity_EventScript_StartBrendanBattleTorchic
	case 2, EverGrandeCity_EventScript_StartBrendanBattleMudkip
	end

EverGrandeCity_EventScript_StartMayBattleTreecko::
	trainerbattle_no_intro TRAINER_MAY_EVERGRANDE_CITY_TREECKO, EverGrandeCity_Text_RivalDefeated
	goto EverGrandeCity_EventScript_AfterMayBattle
	end

EverGrandeCity_EventScript_StartMayBattleTorchic::
	trainerbattle_no_intro TRAINER_MAY_EVERGRANDE_CITY_TORCHIC, EverGrandeCity_Text_RivalDefeated
	goto EverGrandeCity_EventScript_AfterMayBattle
	end

EverGrandeCity_EventScript_StartMayBattleMudkip::
	trainerbattle_no_intro TRAINER_MAY_EVERGRANDE_CITY_MUDKIP, EverGrandeCity_Text_RivalDefeated
	goto EverGrandeCity_EventScript_AfterMayBattle
	end

EverGrandeCity_EventScript_StartBrendanBattleTreecko::
	trainerbattle_no_intro TRAINER_BRENDAN_EVERGRANDE_CITY_TREECKO, EverGrandeCity_Text_RivalDefeated
	goto EverGrandeCity_EventScript_AfterBrendanBattle
	end

EverGrandeCity_EventScript_StartBrendanBattleTorchic::
	trainerbattle_no_intro TRAINER_BRENDAN_EVERGRANDE_CITY_TORCHIC, EverGrandeCity_Text_RivalDefeated
	goto EverGrandeCity_EventScript_AfterBrendanBattle
	end

EverGrandeCity_EventScript_StartBrendanBattleMudkip::
	trainerbattle_no_intro TRAINER_BRENDAN_EVERGRANDE_CITY_MUDKIP, EverGrandeCity_Text_RivalDefeated
	goto EverGrandeCity_EventScript_AfterBrendanBattle
	end

EverGrandeCity_EventScript_AfterMayBattle::
	msgbox EverGrandeCity_Text_MayTimeToHeadBack, MSGBOX_DEFAULT
	goto EverGrandeCity_EventScript_RivalExit
	end

EverGrandeCity_EventScript_AfterBrendanBattle::
	msgbox EverGrandeCity_Text_BrendanTimeToHeadBack, MSGBOX_DEFAULT
	goto EverGrandeCity_EventScript_RivalExit
	end

EverGrandeCity_EventScript_RivalExit::
	closemessage
	applymovement LOCALID_PLAYER, EverGrandeCity_Movement_WatchRivalExit
	applymovement LOCALID_EVERGRANDE_CITY_RIVAL, EverGrandeCity_Movement_RivalExit
	waitmovement 0
	playse SE_LEDGE
	removeobject LOCALID_EVERGRANDE_CITY_RIVAL
	message EverGrandeCity_LevelCap
	waitmessage
	call Common_EventScript_PlayLevelCapFanfare
	setflag FLAG_DEFEATED_EVERGRANDE_RIVAL
	applymovement LOCALID_PLAYER, EverGrandeCity_Movement_Return
	waitmovement 0
	releaseall
	end

EverGrandeCity_Movement_WatchRivalExit:
	walk_right
	walk_in_place_faster_left
	step_end

EverGrandeCity_Movement_RivalExit:
	walk_down
	walk_left
	walk_left
	walk_left
	walk_left
	walk_left
	walk_left
	walk_left
	walk_left
	walk_up
	walk_up
	step_end

EverGrandeCity_Movement_Return:
	walk_left
	walk_in_place_faster_up
	step_end

EverGrandeCity_EventScript_SetVisitedEverGrande::
	setflag FLAG_VISITED_EVER_GRANDE_CITY
	setvar VAR_TEMP_1, 1
	end

EverGrandeCity_Text_EnteringVictoryRoad:
	.string "ENTERING VICTORY ROAD$"

EverGrandeCity_Text_EnteringPokemonLeague:
	.string "ENTERING POKéMON LEAGUE\n"
	.string "CENTER GATE$"

EverGrandeCity_Text_CitySign:
	.string "EVER GRANDE CITY\p"
	.string "“The paradise of flowers, the sea,\n"
	.string "and POKéMON.”$"

EverGrandeCity_Text_May_OneLastBattle:
	.string "MAY: And here we are.\n"
	.string "One more step to glory…\p"
	.string "But only one of us can\n"
	.string "really be the Champion.$"

EverGrandeCity_Text_Brendan_OneLastBattle:
	.string "BRENDAN: And here we are.\n"
	.string "One more step to glory…\p"
	.string "But only one of us can\n"
	.string "really be the Champion.$"

EverGrandeCity_Text_RivalDefeated:
	.string "I… Lost?$"

EverGrandeCity_Text_MayTimeToHeadBack:
	.string "MAY: … … … … … … … …\n"
	.string "{PLAYER}{KUN}…\p"
	.string "Alright. Go ahead. You win.\n"
	.string "Now claim your prize."
	.string "I will… Go home. I guess.$"

EverGrandeCity_Text_BrendanTimeToHeadBack:
	.string "BRENDAN: … … … … … … … …\n"
	.string "{PLAYER}{KUN}…\p"
	.string "Alright. Go ahead. You win.\n"
	.string "Now claim your prize."
	.string "I will… Go home. I guess.$"

EverGrandeCity_LevelCap:
	.string "The level cap has been raised to 70!$"
