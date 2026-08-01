// Golden-master corpus specs (T-230). Each spec is a frontend config chosen so the set collectively
// exercises every one of the 26 randomizer outputs (see docs/base-plus-injection-viability.md) and every
// build-time mode/toggle. Fixed seeds are for provenance only — the BACKEND generation path is NOT
// reproducible (base-seed null), so the produced bundles are FROZEN once (generate.mjs) and it is the
// FROZEN bundle that is the golden-master input; `build(frozen_bundle)` IS byte-deterministic (T-231).
import { DEFAULTS } from '../../../frontend/js/config-form.js';

const base = (over) => ({ ...DEFAULTS, runType: 'default', seed: over.seed, ...over });

export const SPECS = [
  // baseline: mutated pokedex, singles trainers, deterministic wild, default starters/items/TM/money/rewards/trades
  { name: 'baseline',      exercises: 'stats,types,abilities,evos,learnsets,tm-compat,moves,wild,starters,trainers,tm-assign,prices,money,relearn,rewards,statics,trades,item-picker', config: base({ seed: 1001 }) },
  // identity pokedex (rebalance off) — unmutated stats/types/abilities/learnsets/tm-compat
  { name: 'rebalance-off', exercises: 'pokedex-identity', config: base({ seed: 1002, rebalance: false }) },
  { name: 'mutate-moves',  exercises: 'move-mutation', config: base({ seed: 1003, mutateMoves: true }) },
  { name: 'doubles',       exercises: 'battle-format-flag(doubles)', config: base({ seed: 1004, battleFormat: 'doubles' }) },
  { name: 'runbun-mixed',  exercises: 'runbun-setvars,mixed,battle-partners', config: base({ seed: 1005, battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 50 }) },
  { name: 'steven-off',    exercises: 'steven-tag-setvar', config: base({ seed: 1006, disableStevenTagBattle: true }) },
  { name: 'wild-classic',  exercises: 'wild-classic', config: base({ seed: 1007, wildEncounterType: 'classic', pokemonPerZone: 8 }) },
  { name: 'economy',       exercises: 'money-defines,relearn-define,item-prices', config: base({ seed: 1008, money: { normal: 999, boss: 9999, gym: 12345 }, moveRelearnPrice: 0 }) },
  { name: 'nicknames-on',  exercises: 'starter-nicknames,location-nicknames,trade-nicknames', config: base({ seed: 1009, nicknames: { ...DEFAULTS.nicknames, enabled: true, includeStarter: true, autoLocation: true } }) },
  { name: 'nuzlocke-3',    exercises: 'multi-rom,shared-data,battle-partners', config: base({ seed: 1010, runType: 'nuzlocke', numROMs: 3, shared: { pokedex: true, trainers: true, starters: true } }) },
];
