#include "global.h"
#include "test/battle.h"

// T-174: Honey Gather is a battle-only clone of Pickup — it picks up an item a foe
// used up during the turn. Its former out-of-battle Honey find has been removed.

ASSUMPTIONS
{
    ASSUME(gItemsInfo[ITEM_SITRUS_BERRY].holdEffect == HOLD_EFFECT_RESTORE_PCT_HP);
    ASSUME(I_SITRUS_BERRY_HEAL >= GEN_4);
}

SINGLE_BATTLE_TEST("Honey Gather grants an item used by another Pokémon")
{
    GIVEN {
        PLAYER(SPECIES_COMBEE) { Ability(ABILITY_HONEY_GATHER); }
        OPPONENT(SPECIES_WOBBUFFET) { MaxHP(100); HP(51); Item(ITEM_SITRUS_BERRY); }
    } WHEN {
        TURN { MOVE(player, MOVE_SCRATCH); }
    } SCENE {
        ANIMATION(ANIM_TYPE_MOVE, MOVE_SCRATCH, player);
        ABILITY_POPUP(player, ABILITY_HONEY_GATHER);
        MESSAGE("Combee found one Sitrus Berry!");
    } THEN {
        EXPECT_EQ(player->item, ITEM_SITRUS_BERRY);
    }
}

WILD_BATTLE_TEST("Honey Gather grants an item used by itself in wild battles (Gen9+)")
{
    GIVEN {
        WITH_CONFIG(GEN_PICKUP_WILD, GEN_9);
        PLAYER(SPECIES_COMBEE) { Ability(ABILITY_HONEY_GATHER); MaxHP(100); HP(51); Item(ITEM_SITRUS_BERRY); }
        OPPONENT(SPECIES_WOBBUFFET);
    } WHEN {
        TURN { MOVE(opponent, MOVE_SCRATCH); }
    } SCENE {
        ANIMATION(ANIM_TYPE_MOVE, MOVE_SCRATCH, opponent);
        ABILITY_POPUP(player, ABILITY_HONEY_GATHER);
        MESSAGE("Combee found one Sitrus Berry!");
    } THEN {
        EXPECT_EQ(player->item, ITEM_SITRUS_BERRY);
    }
}

SINGLE_BATTLE_TEST("Honey Gather doesn't grant the user their item outside wild battles")
{
    GIVEN {
        PLAYER(SPECIES_WOBBUFFET);
        OPPONENT(SPECIES_COMBEE) { Ability(ABILITY_HONEY_GATHER); MaxHP(500); HP(251); Item(ITEM_SITRUS_BERRY); }
    } WHEN {
        TURN { MOVE(player, MOVE_SCRATCH); }
    } SCENE {
        ANIMATION(ANIM_TYPE_MOVE, MOVE_SCRATCH, player);
        NONE_OF {
            ABILITY_POPUP(opponent, ABILITY_HONEY_GATHER);
            MESSAGE("Combee found one Sitrus Berry!");
        }
    } THEN {
        EXPECT_EQ(opponent->item, ITEM_NONE);
    }
}
