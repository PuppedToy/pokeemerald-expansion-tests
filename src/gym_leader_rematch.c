#include "global.h"
#include "gym_leader_rematch.h"

// T-176: gym leader rematches are disabled in this hack. Post-E4, gym leaders used to periodically
// flag themselves as ready for a rematch (a repeatable prize-money source). UpdateGymLeaderRematch is
// the single entry every caller (TryUpdateGymLeaderRematchFrom{Wild,Trainer}, battle_tower.c) funnels
// through, so making it a no-op removes gym leader rematches entirely. The former per-leader scan and
// rematch tables were deleted with it.
void UpdateGymLeaderRematch(void)
{
}
