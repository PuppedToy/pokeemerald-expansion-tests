Route118_MapScripts::
	map_script MAP_SCRIPT_ON_TRANSITION, Route118_OnTransition
	map_script MAP_SCRIPT_ON_LOAD, Route118_OnLoad
	map_script MAP_SCRIPT_ON_FRAME_TABLE, Route118_OnFrame
	.byte 0

Route118_OnTransition:
	call GabbyAndTy_EventScript_UpdateLocation
	call_if_eq VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_HideMapNamePopup
	call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_118_EAST, AbnormalWeather_StartGroudonWeather
	call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_118_WEST, AbnormalWeather_StartGroudonWeather
	end

Route118_OnLoad:
	call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_118_EAST, AbnormalWeather_EventScript_PlaceTilesRoute118East
	call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_118_WEST, AbnormalWeather_EventScript_PlaceTilesRoute118West
	end

Route118_OnFrame:
	map_script_2 VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_EndEventAndCleanup_1
	.2byte 0

Route118_EventScript_Girl::
	msgbox Route118_Text_CanCrossRiversWithSurf, MSGBOX_NPC
	end

Route118_EventScript_RouteSignMauville::
	msgbox Route118_Text_RouteSignMauville, MSGBOX_SIGN
	end

Route118_EventScript_RouteSign119::
	msgbox Route118_Text_RouteSign119, MSGBOX_SIGN
	end

Route118_EventScript_Rose::
	trainerbattle_single TRAINER_ROSE_1, Route118_Text_RoseIntro, Route118_Text_RoseDefeat, Route118_EventScript_RegisterRose
	specialvar VAR_RESULT, ShouldTryRematchBattle
	goto_if_eq VAR_RESULT, TRUE, Route118_EventScript_RematchRose
	msgbox Route118_Text_RosePostBattle, MSGBOX_DEFAULT
	release
	end

Route118_EventScript_RegisterRose::
	special PlayerFaceTrainerAfterBattle
	waitmovement 0
	msgbox Route118_Text_RoseRegister, MSGBOX_DEFAULT
	register_matchcall TRAINER_ROSE_1
	release
	end

Route118_EventScript_RematchRose::
	trainerbattle_rematch TRAINER_ROSE_1, Route118_Text_RoseRematchIntro, Route118_Text_RoseRematchDefeat
	msgbox Route118_Text_RosePostRematch, MSGBOX_AUTOCLOSE
	end

Route118_EventScript_Barny::
	trainerbattle_single TRAINER_BARNY, Route118_Text_BarnyIntro, Route118_Text_BarnyDefeat
	msgbox Route118_Text_BarnyPostBattle, MSGBOX_AUTOCLOSE
	end

Route118_EventScript_Wade::
	trainerbattle_single TRAINER_WADE, Route118_Text_WadeIntro, Route118_Text_WadeDefeat
	msgbox Route118_Text_WadePostBattle, MSGBOX_AUTOCLOSE
	end

Route118_EventScript_Dalton::
	trainerbattle_single TRAINER_DALTON_1, Route118_Text_DaltonIntro, Route118_Text_DaltonDefeat, Route118_EventScript_RegisterDalton
	specialvar VAR_RESULT, ShouldTryRematchBattle
	goto_if_eq VAR_RESULT, TRUE, Route118_EventScript_RematchDalton
	msgbox Route118_Text_DaltonPostBattle, MSGBOX_DEFAULT
	release
	end

Route118_EventScript_RegisterDalton::
	special PlayerFaceTrainerAfterBattle
	waitmovement 0
	msgbox Route118_Text_DaltonRegister, MSGBOX_DEFAULT
	register_matchcall TRAINER_DALTON_1
	release
	end

Route118_EventScript_RematchDalton::
	trainerbattle_rematch TRAINER_DALTON_1, Route118_Text_DaltonRematchIntro, Route118_Text_DaltonRematchDefeat
	msgbox Route118_Text_DaltonPostRematch, MSGBOX_AUTOCLOSE
	end

Route118_EventScript_Perry::
	trainerbattle_single TRAINER_PERRY, Route118_Text_PerryIntro, Route118_Text_PerryDefeat
	msgbox Route118_Text_PerryPostBattle, MSGBOX_AUTOCLOSE
	end

Route118_EventScript_Chester::
	trainerbattle_single TRAINER_CHESTER, Route118_Text_ChesterIntro, Route118_Text_ChesterDefeat
	msgbox Route118_Text_ChesterPostBattle, MSGBOX_AUTOCLOSE
	end

Route118_EventScript_Deandre::
	trainerbattle_single TRAINER_DEANDRE, Route118_Text_DeandreIntro, Route118_Text_DeandreDefeat
	msgbox Route118_Text_DeandrePostBattle, MSGBOX_AUTOCLOSE
	end

Route118_EventScript_PickBerry::
	multichoice 0, 0, MULTI_ROUTE118_PICK_BERRY, FALSE
	switch VAR_RESULT
	case 0, Route118_EventScript_PickKee
	case 1, Route118_EventScript_PickMaranga
	case 2, Route118_EventScript_PickJaboca
	case 3, Route118_EventScript_PickRowap
	end

Route118_EventScript_PickKee::
	finditem ITEM_KEE_BERRY
	setflag FLAG_ITEM_ROUTE_118_BERRY
	end

Route118_EventScript_PickMaranga::
	finditem ITEM_MARANGA_BERRY
	setflag FLAG_ITEM_ROUTE_118_BERRY
	end

Route118_EventScript_PickJaboca::
	finditem ITEM_JABOCA_BERRY
	setflag FLAG_ITEM_ROUTE_118_BERRY
	end

Route118_EventScript_PickRowap::
	finditem ITEM_ROWAP_BERRY
	setflag FLAG_ITEM_ROUTE_118_BERRY
	end


Route118_EventScript_PickTM::
	multichoice 0, 0, MULTI_ROUTE118_PICK_TM, FALSE
	switch VAR_RESULT
	case 0, Route118_EventScript_PickThunderbolt
	case 1, Route118_EventScript_PickIceBeam
	case 2, Route118_EventScript_PickFlamethrower
	end

Route118_EventScript_PickThunderbolt::
	finditem ITEM_TM_THUNDERBOLT
	setflag FLAG_ITEM_ROUTE_118_PICK
	end

Route118_EventScript_PickIceBeam::
	finditem ITEM_TM_ICE_BEAM
	setflag FLAG_ITEM_ROUTE_118_PICK
	end

Route118_EventScript_PickFlamethrower::
	finditem ITEM_TM_FLAMETHROWER
	setflag FLAG_ITEM_ROUTE_118_PICK
	end

Route118_Text_PickItem1:
	.string "Thunderbolt$"

Route118_Text_PickItem2:
	.string "Ice Beam$"

Route118_Text_PickItem3:
	.string "Flamethrower$"

Route118_Text_CanCrossRiversWithSurf:
	.string "Even if there isn't a boat, you can\n"
	.string "cross rivers and the sea if you have\l"
	.string "a POKéMON that knows SURF.\p"
	.string "POKéMON can be counted on to do so\n"
	.string "much!$"

Route118_Text_RouteSignMauville:
	.string "ROUTE 118\n"
	.string "{LEFT_ARROW} MAUVILLE CITY$"

Route118_Text_RouteSign119:
	.string "ROUTE 118\n"
	.string "{UP_ARROW} ROUTE 119$"

