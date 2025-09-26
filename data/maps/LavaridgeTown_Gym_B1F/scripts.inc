LavaridgeTown_Gym_B1F_MapScripts::
	map_script MAP_SCRIPT_ON_TRANSITION, LavaridgeTown_Gym_B1F_OnTransition
	.byte 0

LavaridgeTown_Gym_B1F_OnTransition:
	call LavaridgeTown_Gym_B1F_EventScript_SetTrainerTempVars
	end

@ Unclear where/if these temp vars are getting checked
LavaridgeTown_Gym_B1F_EventScript_SetTrainerTempVars::
	setvar VAR_TEMP_7, 0
	setvar VAR_TEMP_8, 0
	setvar VAR_TEMP_9, 0
	setvar VAR_TEMP_A, 0
	setvar VAR_TEMP_7, 1
