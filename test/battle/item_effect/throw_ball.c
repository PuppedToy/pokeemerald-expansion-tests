#include "global.h"
#include "event_data.h"
#include "pokemon_storage_system.h"
#include "test/battle.h"

TO_DO_BATTLE_TEST("Poke Balls can't be thrown when there's 2 opposing wild battlers")
TO_DO_BATTLE_TEST("Poke Balls can't be thrown when there's no space in the Pokemon Storage System")
TO_DO_BATTLE_TEST("Poke Balls can't be thrown when an opposing wild battler is in a semi-invulnerable state")
TO_DO_BATTLE_TEST("Poke Balls can't be thrown when B_FLAG_NO_CATCHING is set")

// T-178: a caught wild mon must arrive with no status condition. Status is mirrored into the box
// (see MON_DATA_STATUS in SetMonData), so a statused mon sent to the PC would otherwise stay statused.
WILD_BATTLE_TEST("Caught Pokemon added to the party is healed of its status condition")
{
    GIVEN {
        PLAYER(SPECIES_WOBBUFFET);
        OPPONENT(SPECIES_CATERPIE) { HP(1); Status1(STATUS1_PARALYSIS); }
    } WHEN {
        TURN { USE_ITEM(player, ITEM_ULTRA_BALL); }
    } SCENE {
        MESSAGE("You used Ultra Ball!");
    } THEN {
        EXPECT_EQ(GetMonData(&gPlayerParty[1], MON_DATA_SPECIES), SPECIES_CATERPIE);
        EXPECT_EQ(GetMonData(&gPlayerParty[1], MON_DATA_STATUS), STATUS1_NONE);
    }
}

WILD_BATTLE_TEST("Caught Pokemon sent to the PC is healed of its status condition")
{
    GIVEN {
        PLAYER(SPECIES_WOBBUFFET);
        PLAYER(SPECIES_ZIGZAGOON);
        PLAYER(SPECIES_POOCHYENA);
        PLAYER(SPECIES_TAILLOW);
        PLAYER(SPECIES_WINGULL);
        PLAYER(SPECIES_WURMPLE);
        OPPONENT(SPECIES_CATERPIE) { HP(1); Status1(STATUS1_PARALYSIS); }
    } WHEN {
        TURN { USE_ITEM(player, ITEM_ULTRA_BALL); }
    } SCENE {
        MESSAGE("You used Ultra Ball!");
    } THEN {
        struct BoxPokemon *caught = GetBoxedMonPtr(gSpecialVar_MonBoxId, gSpecialVar_MonBoxPos);
        EXPECT_EQ(GetBoxMonData(caught, MON_DATA_SPECIES), SPECIES_CATERPIE);
        EXPECT_EQ(GetBoxMonData(caught, MON_DATA_STATUS), STATUS1_NONE);
    }
}
