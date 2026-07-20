FallarborTown_MoveRelearnersHouse_MapScripts::
	.byte 0

@ T-167: the in-world move relearner NPC no longer teaches moves. Relearning is done from
@ the Pokémon summary screen (START on the moves page), where each move is priced. The NPC
@ is now flavour only.
FallarborTown_MoveRelearnersHouse_EventScript_MoveRelearner::
	lockall
	applymovement LOCALID_MOVE_RELEARNER, Common_Movement_FacePlayer
	waitmovement 0
	msgbox FallarborTown_MoveRelearnersHouse_Text_ForgotHowToTeach, MSGBOX_DEFAULT
	releaseall
	end

@ T-167: debug-only. Reached solely from the Party debug menu ("Move Reminder"), never from
@ the NPC above. Opens the priced relearner directly so the feature can be tested quickly.
FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon::
	lockall
	msgbox FallarborTown_MoveRelearnersHouse_Text_TutorWhichMon, MSGBOX_DEFAULT
	special ChooseMonForMoveRelearner
	waitstate
	goto_if_eq VAR_0x8004, PARTY_NOTHING_CHOSEN, FallarborTown_MoveRelearnersHouse_EventScript_DebugDone
	special IsSelectedMonEgg
	goto_if_eq VAR_RESULT, TRUE, FallarborTown_MoveRelearnersHouse_EventScript_DebugDone
	goto_if_eq VAR_0x8005, 0, FallarborTown_MoveRelearnersHouse_EventScript_DebugDone
	special TeachMoveRelearnerMove
	waitstate
FallarborTown_MoveRelearnersHouse_EventScript_DebugDone::
	releaseall
	end

FallarborTown_MoveRelearnersHouse_Text_ForgotHowToTeach:
	.string "I used to be the MOVE TUTOR. I could\n"
	.string "recall any move a POKéMON ever knew…\p"
	.string "But you know what? I just forgot how.$"

FallarborTown_MoveRelearnersHouse_Text_TutorWhichMon:
	.string "Which POKéMON needs tutoring?$"
