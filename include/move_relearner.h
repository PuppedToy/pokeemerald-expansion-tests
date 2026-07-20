#ifndef GUARD_MOVE_RELEARNER_H
#define GUARD_MOVE_RELEARNER_H

void TeachMoveRelearnerMove(void);
void MoveRelearnerShowHideHearts(s32 move);
void MoveRelearnerShowHideCategoryIcon(s32);
void CB2_InitLearnMove(void);
u32 GetMoveRelearnerMoveCost(u16 move); // T-167
bool8 MoveRelearnerCanAfford(u16 move); // T-167

extern u8 gOriginSummaryScreenPage;
extern bool8 gBoxMonRelearnerActive;
extern struct BoxPokemon *gBoxMonRelearnerBoxMonPtr;
extern struct Pokemon gBoxMonRelearnerPartyBackup;
extern u8 gBoxMonRelearnerPartyCountBackup;

#endif //GUARD_MOVE_RELEARNER_H
