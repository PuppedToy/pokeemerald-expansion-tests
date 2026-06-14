Route124_DivingTreasureHuntersHouse_MapScripts::
	map_script MAP_SCRIPT_ON_TRANSITION, Route124_DivingTreasureHuntersHouse_OnTransition
	.byte 0

Route124_DivingTreasureHuntersHouse_OnTransition:
	setflag FLAG_LANDMARK_HUNTERS_HOUSE
	end

Route124_DivingTreasureHuntersHouse_EventScript_TreasureHunter::
	lock
	faceplayer
	msgbox Route124_DivingTreasureHuntersHouse_Text_Retired, MSGBOX_DEFAULT
	release
	end

Route124_DivingTreasureHuntersHouse_EventScript_ShardTradeBoard::
	msgbox Route124_DivingTreasureHuntersHouse_Text_ShardTradeBoard, MSGBOX_SIGN
	end

Route124_DivingTreasureHuntersHouse_Text_Retired:
	.string "I'm the DIVING TREASURE HUNTER!\p"
	.string "I used to trade rare EVOLUTION STONES\n"
	.string "to folks who brought me SHARDS…\p"
	.string "But these days everyone's already got\n"
	.string "the whole set! Those were the days.$"

Route124_DivingTreasureHuntersHouse_Text_ShardTradeBoard:
	.string "“Out of business! All my EVOLUTION\n"
	.string "STONES have found new homes.”$"
