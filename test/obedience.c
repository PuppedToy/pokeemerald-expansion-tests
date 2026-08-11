#include "global.h"
#include "battle.h"
#include "battle_util.h"
#include "event_data.h"
#include "string_util.h"
#include "test/test.h"

// The disobedience mechanic is removed via B_OBEDIENCE_DISABLED (T-267).
//
// This is a plain TEST() rather than a BATTLE_TEST because obedience is unreachable from the battle test
// framework: test_runner_battle.c builds every battle with BATTLE_TYPE_RECORDED_LINK, which
// GetAttackerObedienceForAction() exempts before looking at anything else. So the decision function is
// called directly with the battler globals staged (same approach as test/text.c's battle string test).
TEST("(Obedience) A Pokémon obeys however over-levelled it is and however few Badges the player has")
{
    u32 i;
    u32 savedBattleTypeFlags = gBattleTypeFlags;

    ASSUME(B_OBEDIENCE_DISABLED == TRUE);
    // Each Badge raises the obeyed level; the Rain Badge waives the check outright.
    ASSUME(!FlagGet(FLAG_BADGE08_GET));

    gBattleTypeFlags = BATTLE_TYPE_TRAINER;
    gBattlerAttacker = 0;
    gBattlerPositions[0] = B_POSITION_PLAYER_LEFT; // Player-controlled, so BattlerHasAi() does not waive the check.

    // The worst case vanilla can produce: an outsider — so both B_OBEDIENCE_MECHANICS branches read 100 —
    // at the widest possible gap over the no-Badge threshold of 10.
    gBattleMons[0].level = 100;
    gBattleMons[0].metLevel = 100;
    gBattleMons[0].otId = 0xFEEDFACE;
    StringCopy(gBattleMons[0].otName, COMPOUND_STRING("OUTSIDE"));

    // Disobedience was a dice roll (~9% obeyed anyway at this level), so one OBEYS would prove nothing.
    for (i = 0; i < 64; i++)
        EXPECT_EQ(GetAttackerObedienceForAction(), OBEYS);

    gBattleTypeFlags = savedBattleTypeFlags;
}
