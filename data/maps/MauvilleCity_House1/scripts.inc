MauvilleCity_House1_MapScripts::
	.byte 0

MauvilleCity_House1_EventScript_RockSmashDude::
	lock
	faceplayer
	msgbox MauvilleCity_House1_Text_MonCanFlyOutOfSmashedRock, MSGBOX_DEFAULT
	release
	end

MauvilleCity_House1_Text_ImRockSmashDudeTakeThis:
	.string "Woohoo!\p"
	.string "I hear people call me the ROCK SMASH\n"
	.string "GUY, but I find that sort of degrading.\p"
	.string "I think I deserve a bit more respect,\n"
	.string "like maybe the ROCK SMASH DUDE.\p"
	.string "Woohoo!\p"
	.string "Anyways, your POKéMON look pretty\n"
	.string "strong.\p"
	.string "I like that!\n"
	.string "Here, take this HIDDEN MACHINE!$"

MauvilleCity_House1_Text_ExplainRockSmash:
	.string "That HM contains ROCK SMASH.\p"
	.string "If you come across large boulders\n"
	.string "that block your path…\p"
	.string "Well, use that HM move and smash\n"
	.string "them right out of your way!\p"
	.string "Yes, sir! Smash rocks aside, I say!\n"
	.string "Woohoo!$"

MauvilleCity_House1_Text_MonCanFlyOutOfSmashedRock:
	.string "Wattson took the rock smash HM from me.\p"
	.string "You'll have to defeat him to get it back.$"

