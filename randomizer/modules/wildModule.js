'use strict';

const {
    EVO_TYPE_LC,
    EVO_TYPE_LC_OF_2,
    EVO_TYPE_NFE,
    EVO_TYPE_SOLO,
    EVO_TYPE_LC_OF_3,
    EVO_TYPE_FINAL,
    TIER_UU,
    TIER_OU,
    TIER_RU,
    TIER_NU,
    TIER_PU,
    TIER_ZU,
    TIER_MAGIKARP,
    TIER_UBERS,
    TIER_LEGEND,
    TIER_AG,
    TIER_RU_THRESHOLD,
    TIER_UU_THRESHOLD,
    TIER_UBERS_THRESHOLD,
} = require('../constants');
const {
    getFamilyGroup,
    isSubWeakTier,
    sample,
    sampleAndRemove,
    hasValidMega,
    devolveToBase,
    checkValidEvo,
} = require('./utils');

// Form variants that must never be selected as team/encounter pokemon.
const BANNED_SPECIES_FOR_PICKING = [
    'SPECIES_WISHIWASHI_SCHOOL',
    'SPECIES_AEGISLASH_BLADE',
    'SPECIES_CHERRIM_SUNSHINE',
    'SPECIES_GRENINJA_ASH',
    'SPECIES_CASTFORM_SUNNY',
    'SPECIES_CASTFORM_RAINY',
    'SPECIES_CASTFORM_SNOWY',
    'SPECIES_MORPEKO_HANGRY',
    'SPECIES_ZYGARDE_COMPLETE',
    'SPECIES_TERAPAGOS_NORMAL',
    'SPECIES_TERAPAGOS_STELLAR',
    'SPECIES_DARMANITAN_ZEN',
    'SPECIES_DARMANITAN_GALAR_ZEN',
    // Palafin: Zero is the placeable form (rated/moved as Hero via palafinEffectivePoke); Finizen
    // is its placeable base form. Only Hero (battle-only, like Wishiwashi School) stays banned.
    'SPECIES_PALAFIN_HERO',
    // Meloetta: Pirouette is a battle-only form reached via Relic Song. Only base Aria is placeable;
    // Aria's tier accounts for Pirouette via a weighted blend (see meloetta.js / T-064).
    'SPECIES_MELOETTA_PIROUETTE',
];

// T-052 — extra-starter categories. Each slot is { tier, kind: 'line'|'solo', lineLength }.
//  - 'line': an early (LC) base whose family's best evolution is `tier`; lineLength prefers a
//    3-stage ('3') or 2-stage ('2') line, falling back to any length.
//  - 'solo': a non-evolving mon of `tier` (early-game, best-evo rating ≤ RU).
// The DEFAULT preset reproduces today's 9 exactly (the engine delegates to the legacy path for it).
const EXTRA_STARTER_TIERS = {
    LEGEND: TIER_LEGEND, UBERS: TIER_UBERS, OU: TIER_OU, UU: TIER_UU, RU: TIER_RU, NU: TIER_NU, PU: TIER_PU,
};
const DEFAULT_EXTRA_STARTER_PRESET = [
    { tier: 'UBERS', kind: 'line', lineLength: '3' },
    { tier: 'OU',    kind: 'line', lineLength: '3' },
    { tier: 'UU',    kind: 'line', lineLength: 'any' },
    { tier: 'NU',    kind: 'solo', lineLength: 'any' },
    { tier: 'RU',    kind: 'line', lineLength: 'any' },
    { tier: 'RU',    kind: 'line', lineLength: 'any' },
    { tier: 'RU',    kind: 'line', lineLength: 'any' },
    { tier: 'RU',    kind: 'line', lineLength: 'any' },
    { tier: 'RU',    kind: 'line', lineLength: 'any' },
];
function normalizeStarterSpec(s) {
    s = s || {};
    return {
        tier: String(s.tier || ''),
        kind: s.kind === 'solo' ? 'solo' : 'line',
        lineLength: s.lineLength === '3' ? '3' : s.lineLength === '2' ? '2' : 'any',
    };
}
function isDefaultStarterPreset(specs) {
    if (!Array.isArray(specs) || specs.length !== DEFAULT_EXTRA_STARTER_PRESET.length) return false;
    return specs.every((s, i) => {
        const a = normalizeStarterSpec(s);
        const b = DEFAULT_EXTRA_STARTER_PRESET[i];
        return a.tier === b.tier && a.kind === b.kind && a.lineLength === b.lineLength;
    });
}

/**
 * T-052 — config-driven extra-starter selection for CUSTOM lists (unlimited slots, expanded
 * vocabulary). Pure over its ctx; the DEFAULT preset uses the legacy path (kept byte-identical).
 *
 * @param {Array} specs - [{ tier, kind:'line'|'solo', lineLength:'any'|'3'|'2' }, ...]
 * @param {Object} ctx  - { pokemonList, alreadyChosenFamilySet (mutated), alreadyChosenTypes
 *                          (mutated), onPick?(poke) }
 * @returns {Array} chosen pokemon objects
 */
function pickExtraStartersFromSpecs(specs, ctx) {
    const { pokemonList, alreadyChosenFamilySet, alreadyChosenTypes, onPick } = ctx;
    const chosen = [];
    const notChosenFamily = p => !alreadyChosenFamilySet.has(getFamilyGroup(p.family));
    const typeDiverse = (pool) => {
        const filtered = pool.filter(p => ![...alreadyChosenTypes].some(t => p.parsedTypes.includes(t)));
        return filtered.length > 0 ? filtered : pool;
    };
    const linePool = (tier, lineLength) => {
        const base = pokemonList.filter(p =>
            p.evolutionData.isLC && p.rating.bestEvoTier === tier
            && isSubWeakTier(p.rating.tier) && notChosenFamily(p));
        if (lineLength === '3') { const f = base.filter(p => p.evolutionData.type === EVO_TYPE_LC_OF_3); if (f.length) return f; }
        if (lineLength === '2') { const f = base.filter(p => p.evolutionData.type === EVO_TYPE_LC_OF_2); if (f.length) return f; }
        return base;
    };
    const soloPool = (tier) => pokemonList.filter(p =>
        p.evolutionData.type === EVO_TYPE_SOLO
        && p.rating.bestEvoRating <= TIER_RU_THRESHOLD
        && p.rating.tier === tier && notChosenFamily(p));
    for (const rawSpec of specs) {
        const spec = normalizeStarterSpec(rawSpec);
        const tier = EXTRA_STARTER_TIERS[spec.tier];
        if (!tier) continue; // unknown tier → skip this slot
        let pool = spec.kind === 'solo' ? soloPool(tier) : linePool(tier, spec.lineLength);
        pool = typeDiverse(pool);
        if (pool.length === 0) continue; // unsatisfiable slot → skip gracefully
        const pick = sample(pool);
        chosen.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        pick.parsedTypes.forEach(t => alreadyChosenTypes.add(t));
        if (onPick) onPick(pick);
    }
    return chosen;
}

/**
 * Selects extra starters, gym/static pokemon rewards, and wild encounter replacements.
 *
 * @param {Object[]} rawPokemonList  - Rated pokémon list (may include banned form variants).
 * @param {Object}   startersArtifact - { starters, alreadyChosenFamilies } from runStartersModule.
 * @param {Object}   [wildConfig]    - Wild data (replacements, replacementTypes, maps).
 *                                    Defaults to require('../wild'). Pass a mock in tests.
 * @returns {{
 *   extraStarters: string[],
 *   gymRewards: Object,
 *   staticRewards: Object,
 *   replacementLog: Object,
 *   foundMegaEvos: Object[],
 *   alreadyChosenFamilies: string[],
 * }}
 */
function runWildModule(rawPokemonList, startersArtifact, wildConfig, moduleConfig = {}) {
    if (!wildConfig) {
        wildConfig = require('../wild');
    }

    const pokemonList = rawPokemonList.filter(p => !BANNED_SPECIES_FOR_PICKING.includes(p.id));

    const alreadyChosenFamilySet = new Set(
        (startersArtifact.alreadyChosenFamilies || []).map(f => getFamilyGroup(f))
    );
    const foundMegaEvos = [];

    const addToFoundMegaEvosIfHasMegaEvo = (poke, levelFound = 0) => {
        if (
            hasValidMega(poke)
            && poke.rating.megaEvoTier !== TIER_AG
            && foundMegaEvos.every(m => m.family !== poke.family)
        ) {
            (poke.evolutionData.megaEvos || []).forEach(megaEvoId => {
                const megaForm = pokemonList.find(p => p.id === megaEvoId);
                if (!megaForm) return;
                const baseForm = pokemonList.find(p => p.id === megaForm.evolutionData.megaBaseForm);
                if (!baseForm) return;
                const pokeThatEvolvesToBase = pokemonList.filter(p =>
                    (p.evolutions || []).some(e => e.pokemon === baseForm.id)
                )[0];
                const evolveLevel = (pokeThatEvolvesToBase && pokeThatEvolvesToBase.evolutions)
                    ? (pokeThatEvolvesToBase.evolutions.find(e => e.pokemon === baseForm.id)?.param || 25)
                    : 0;
                foundMegaEvos.push({
                    family: poke.family,
                    megaFormId: megaForm.id,
                    baseFormId: baseForm.id,
                    item: megaForm.evolutionData.megaItem,
                    level: Math.max(levelFound, Number(evolveLevel)),
                });
            });
        }
    };

    // ── Check main starters for mega evos ──────────────────────────────────────
    (startersArtifact.starters || []).forEach(starterId => {
        const starterPoke = pokemonList.find(p => p.id === starterId);
        if (starterPoke) addToFoundMegaEvosIfHasMegaEvo(starterPoke);
    });

    // ── Extra starters ─────────────────────────────────────────────────────────
    const alreadyChosenTypes = new Set();
    const starterSpecs = moduleConfig && moduleConfig.extraStarters;

    // Legacy selection (default preset / no config) — byte-identical to pre-T-052 behaviour.
    const selectDefaultExtraStarters = () => {
    // Slot 1: 1 UBERS LC (prefer LC-of-3, then LC-of-2, then any UBERS LC; fallback OU LC)
    let slot1Pool = pokemonList.filter(poke =>
        poke.evolutionData.type === EVO_TYPE_LC_OF_3
        && poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_UBERS
        && isSubWeakTier(poke.rating.tier)
        && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
    );
    if (slot1Pool.length === 0) {
        slot1Pool = pokemonList.filter(poke =>
            poke.evolutionData.type === EVO_TYPE_LC_OF_2
            && poke.evolutionData.isLC
            && poke.rating.bestEvoTier === TIER_UBERS
            && isSubWeakTier(poke.rating.tier)
            && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        );
    }
    if (slot1Pool.length === 0) {
        slot1Pool = pokemonList.filter(poke =>
            poke.evolutionData.isLC
            && poke.rating.bestEvoTier === TIER_UBERS
            && isSubWeakTier(poke.rating.tier)
            && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        );
    }
    if (slot1Pool.length === 0) {
        slot1Pool = pokemonList.filter(poke =>
            poke.evolutionData.isLC
            && poke.rating.bestEvoTier === TIER_OU
            && isSubWeakTier(poke.rating.tier)
            && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        );
    }
    if (slot1Pool.length === 0) {
        throw new Error('No UBERS or OU LC pokemon found for extra starters slot 1.');
    }

    const chosenExtraPokemon = [sample(slot1Pool)];
    alreadyChosenFamilySet.add(getFamilyGroup(chosenExtraPokemon[0].family));
    chosenExtraPokemon[0].parsedTypes.forEach(t => alreadyChosenTypes.add(t));
    addToFoundMegaEvosIfHasMegaEvo(chosenExtraPokemon[0]);

    // Slot 2: 1 OU LC (prefer LC-of-3, fallback any OU LC; type-diverse)
    let ouLCPokes = pokemonList.filter(poke =>
        poke.evolutionData.type === EVO_TYPE_LC_OF_3
        && poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_OU
        && isSubWeakTier(poke.rating.tier)
        && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
    );
    if (ouLCPokes.length === 0) {
        ouLCPokes = pokemonList.filter(poke =>
            poke.evolutionData.isLC
            && poke.rating.bestEvoTier === TIER_OU
            && isSubWeakTier(poke.rating.tier)
            && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        );
    }
    const ouLCFiltered = ouLCPokes.filter(p =>
        ![...alreadyChosenTypes].some(t => p.parsedTypes.includes(t))
    );
    const ouPool = ouLCFiltered.length > 0 ? ouLCFiltered : ouLCPokes;
    if (ouPool.length > 0) {
        const pick = sample(ouPool);
        chosenExtraPokemon.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        pick.parsedTypes.forEach(t => alreadyChosenTypes.add(t));
        addToFoundMegaEvosIfHasMegaEvo(pick);
    }

    // Slot 3: 1 UU LC (prefer type-diverse pick)
    const uuLCPokes = pokemonList.filter(poke =>
        poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_UU
        && isSubWeakTier(poke.rating.tier)
        && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
    );
    const uuLCFiltered = uuLCPokes.filter(p =>
        ![...alreadyChosenTypes].some(t => p.parsedTypes.includes(t))
    );
    const uuPool = uuLCFiltered.length > 0 ? uuLCFiltered : uuLCPokes;
    if (uuPool.length > 0) {
        const pick = sample(uuPool);
        chosenExtraPokemon.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        pick.parsedTypes.forEach(t => alreadyChosenTypes.add(t));
        addToFoundMegaEvosIfHasMegaEvo(pick);
    }

    // Slot 4: 1 NU SOLO (earlyGame)
    const earlyGame = pokemonList.filter(poke =>
        poke.evolutionData.type === EVO_TYPE_SOLO
        && poke.rating.bestEvoRating <= TIER_RU_THRESHOLD
        && poke.rating.tier === TIER_NU
        && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
    );
    const earlyGameFiltered = earlyGame.filter(p =>
        ![...alreadyChosenTypes].some(t => p.parsedTypes.includes(t))
    );
    if (earlyGameFiltered.length > 0) {
        const pick = sampleAndRemove(earlyGameFiltered);
        chosenExtraPokemon.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        pick.parsedTypes.forEach(t => alreadyChosenTypes.add(t));
        addToFoundMegaEvosIfHasMegaEvo(pick);
    }

    // Slots 5-9: up to 5 RU LC (type-diverse first, then unrestricted)
    const ruLC = pokemonList.filter(poke =>
        poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_RU
        && isSubWeakTier(poke.rating.tier)
        && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
    );
    const ruLCFiltered = ruLC.filter(p =>
        ![...alreadyChosenTypes].some(t => p.parsedTypes.includes(t))
    );
    while (chosenExtraPokemon.length < 9 && ruLCFiltered.length > 0) {
        const pick = sampleAndRemove(ruLCFiltered);
        const idxInBase = ruLC.findIndex(p => p.id === pick.id);
        if (idxInBase >= 0) ruLC.splice(idxInBase, 1);
        chosenExtraPokemon.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        pick.parsedTypes.forEach(t => alreadyChosenTypes.add(t));
        for (let i = ruLCFiltered.length - 1; i >= 0; i--) {
            if ([...alreadyChosenTypes].some(t => ruLCFiltered[i].parsedTypes.includes(t))) {
                ruLCFiltered.splice(i, 1);
            }
        }
        addToFoundMegaEvosIfHasMegaEvo(pick);
    }
    while (chosenExtraPokemon.length < 9 && ruLC.length > 0) {
        const pick = sampleAndRemove(ruLC);
        chosenExtraPokemon.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        addToFoundMegaEvosIfHasMegaEvo(pick);
    }
    return chosenExtraPokemon;
    }; // end selectDefaultExtraStarters

    // The default preset (or no config) uses the legacy path above (byte-identical); custom lists
    // go through the pure spec selector.
    const chosenExtraPokemon = (Array.isArray(starterSpecs) && !isDefaultStarterPreset(starterSpecs))
        ? pickExtraStartersFromSpecs(starterSpecs, {
            pokemonList,
            alreadyChosenFamilySet,
            alreadyChosenTypes,
            onPick: addToFoundMegaEvosIfHasMegaEvo,
        })
        : selectDefaultExtraStarters();

    const extraStarters = chosenExtraPokemon.map(p => p.id);

    // ── Gym pokemon rewards ────────────────────────────────────────────────────

    const gym1ReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && !poke.evolutionData.isMega
        && poke.rating.tier === TIER_NU
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const gym1Replacement = sampleAndRemove(gym1ReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(gym1Replacement.family));
    addToFoundMegaEvosIfHasMegaEvo(gym1Replacement, 13);

    const gym2ReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && poke.rating.tier === TIER_NU
        && poke.evolutionData.type === EVO_TYPE_LC_OF_2
        && poke.rating.bestEvoTier === TIER_RU
        && (poke.evolutions || []).some(
            evo => evo.method === 'ITEM' || (evo.method === 'LEVEL' && parseInt(evo.param) <= 25)
        )
    );
    const gym2Replacement = sampleAndRemove(gym2ReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(gym2Replacement.family));
    addToFoundMegaEvosIfHasMegaEvo(gym2Replacement, 19);

    // gym3 + slateportGrunts: final form with mega, devolved to base form
    const gym3ReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && !poke.evolutionData.isMega
        && poke.evolutionData.isFinal
        && hasValidMega(poke)
        && poke.rating.bestEvoRating < TIER_UU_THRESHOLD
        && poke.rating.megaEvoRating < TIER_UBERS_THRESHOLD
        && checkValidEvo(pokemonList, poke, 29)
    );
    const gym3Replacement = devolveToBase(pokemonList, sampleAndRemove(gym3ReplacementList));
    alreadyChosenFamilySet.add(getFamilyGroup(gym3Replacement.family));
    const slateportGruntsReward = devolveToBase(pokemonList, sampleAndRemove(gym3ReplacementList));
    alreadyChosenFamilySet.add(getFamilyGroup(slateportGruntsReward.family));

    const gym4n5ReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_UU
    );
    const gym4Replacement = sampleAndRemove(gym4n5ReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(gym4Replacement.family));
    addToFoundMegaEvosIfHasMegaEvo(gym4Replacement, 36);
    const gym5Replacement = sampleAndRemove(gym4n5ReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(gym5Replacement.family));
    addToFoundMegaEvosIfHasMegaEvo(gym5Replacement, 39);

    const shellyRewardReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && !poke.evolutionData.isMega
        && poke.evolutionData.isFinal
        && hasValidMega(poke)
        && poke.rating.bestEvoRating < TIER_UBERS_THRESHOLD
        && poke.rating.megaEvoTier === TIER_OU
        && checkValidEvo(pokemonList, poke, 41)
    );
    const shellyRewardReplacement = sampleAndRemove(shellyRewardReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(shellyRewardReplacement.family));

    const gym6ReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_OU
    );
    const gym6Replacement = sampleAndRemove(gym6ReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(gym6Replacement.family));
    addToFoundMegaEvosIfHasMegaEvo(gym6Replacement, 46);

    const gym7n8ReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && !poke.evolutionData.isMega
        && poke.evolutionData.isFinal
        && poke.rating.bestEvoTier === TIER_OU
    );
    const gym7Replacement = sampleAndRemove(gym7n8ReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(gym7Replacement.family));
    addToFoundMegaEvosIfHasMegaEvo(gym7Replacement, 56);
    const gym8Replacement = sampleAndRemove(gym7n8ReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(gym8Replacement.family));
    addToFoundMegaEvosIfHasMegaEvo(gym8Replacement, 64);

    // Decide the mega stone each mega-giving reward hands out HERE, at bundle-creation
    // time, picking one of the family's stones at random, and store it on the reward.
    // The ROM maker then writes this verbatim with no RNG — keeping the bundle the
    // single source of truth (so e.g. Charizardite X vs Y varies per seed).
    const chooseMegaStone = (poke) => {
        const stones = rewardMegaStones(poke, pokemonList);
        return stones.length > 0 ? sample(stones) : null;
    };
    gym3Replacement.megaStone        = chooseMegaStone(gym3Replacement);
    slateportGruntsReward.megaStone  = chooseMegaStone(slateportGruntsReward);
    shellyRewardReplacement.megaStone = chooseMegaStone(shellyRewardReplacement);

    const gymRewards = {
        gym1: gym1Replacement,
        gym2: gym2Replacement,
        gym3: gym3Replacement,
        gym4: gym4Replacement,
        gym5: gym5Replacement,
        gym6: gym6Replacement,
        gym7: gym7Replacement,
        gym8: gym8Replacement,
        slateportGrunts: slateportGruntsReward,
        shellyReward: shellyRewardReplacement,
        wallyLilycove: null, // filled below from static pool
    };

    // ── Static pokemon rewards ─────────────────────────────────────────────────

    const strongSoloReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && poke.rating.bestEvoTier === TIER_UU
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const regirockReplacement = sampleAndRemove(strongSoloReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(regirockReplacement.family));
    addToFoundMegaEvosIfHasMegaEvo(regirockReplacement, 36);
    const regiceReplacement = sampleAndRemove(strongSoloReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(regiceReplacement.family));
    addToFoundMegaEvosIfHasMegaEvo(regiceReplacement, 39);
    const mewReplacement = sampleAndRemove(strongSoloReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(mewReplacement.family));
    addToFoundMegaEvosIfHasMegaEvo(mewReplacement, 39);
    const wallyLilycoveReward = sampleAndRemove(strongSoloReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(wallyLilycoveReward.family));
    addToFoundMegaEvosIfHasMegaEvo(wallyLilycoveReward, 48);

    gymRewards.wallyLilycove = wallyLilycoveReward;

    const premiumSoloReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && poke.rating.bestEvoTier === TIER_OU
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const registeelReplacement = sampleAndRemove(premiumSoloReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(registeelReplacement.family));
    addToFoundMegaEvosIfHasMegaEvo(registeelReplacement, 46);

    const legendReplacementList = pokemonList.filter(poke =>
        !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        && poke.rating.bestEvoTier === TIER_LEGEND
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const legend1Replacement = sampleAndRemove(legendReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(legend1Replacement.family));
    const legend2Replacement = sampleAndRemove(legendReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(legend2Replacement.family));
    const legend3Replacement = sampleAndRemove(legendReplacementList);
    alreadyChosenFamilySet.add(getFamilyGroup(legend3Replacement.family));
    addToFoundMegaEvosIfHasMegaEvo(legend1Replacement, 61);
    addToFoundMegaEvosIfHasMegaEvo(legend2Replacement, 61);
    addToFoundMegaEvosIfHasMegaEvo(legend3Replacement, 61);

    const staticRewards = {
        regirock: regirockReplacement,
        regice: regiceReplacement,
        mew: mewReplacement,
        registeel: registeelReplacement,
        legend1: legend1Replacement,
        legend2: legend2Replacement,
        legend3: legend3Replacement,
    };

    // ── Wild encounter replacements ────────────────────────────────────────────

    const replacementLog = {};
    const { replacements = {}, replacementTypes = {} } = wildConfig;

    const replacementLists = {};
    Object.entries(replacementTypes).forEach(([key, value]) => {
        const { replace: tiers, type: types, hasMega, megaTiers } = value;
        replacementLists[key] = pokemonList.filter(poke => {
            if (poke.evolutionData.isMega) return false;
            if (alreadyChosenFamilySet.has(getFamilyGroup(poke.family))) return false;
            if (tiers && !tiers.includes(poke.rating.bestEvoTier)) return false;
            if (megaTiers && !megaTiers.includes(poke.rating.megaEvoTier)) return false;
            if (hasMega && !poke.evolutionData.megaEvos?.length) return false;
            let hasAnyType = false;
            (types || []).forEach(replacementType => {
                if (replacementType === EVO_TYPE_LC)    hasAnyType = hasAnyType || poke.evolutionData.isLC;
                else if (replacementType === EVO_TYPE_NFE)  hasAnyType = hasAnyType || poke.evolutionData.isNFE;
                else if (replacementType === EVO_TYPE_SOLO) hasAnyType = hasAnyType || poke.evolutionData.type === EVO_TYPE_SOLO;
                else if (replacementType === EVO_TYPE_FINAL)hasAnyType = hasAnyType || poke.evolutionData.isFinal;
            });
            return hasAnyType;
        });
    });

    const { maps: wildMaps = [] } = wildConfig;
    const findReplacementLevel = (speciesId) => {
        let foundMap = wildMaps.find(m =>
            m.land === speciesId || m.old === speciesId || m.surf === speciesId || m.underwater === speciesId
        );
        if (foundMap) return foundMap.level || 29;
        foundMap = wildMaps.find(m => m.good === speciesId);
        if (foundMap) return foundMap.level || 33;
        return 48;
    };

    const newlyAddedFamilies = new Set();

    Object.entries(replacements).forEach(([speciesId, replacementTypeKey]) => {
        const list = replacementLists[replacementTypeKey];
        if (!list || list.length === 0) return;
        for (let i = list.length - 1; i >= 0; i--) {
            if (newlyAddedFamilies.has(getFamilyGroup(list[i].family))) list.splice(i, 1);
        }
        if (list.length === 0) return;
        const replacement = sampleAndRemove(list);
        if (!replacement) return;
        alreadyChosenFamilySet.add(getFamilyGroup(replacement.family));
        newlyAddedFamilies.add(getFamilyGroup(replacement.family));
        addToFoundMegaEvosIfHasMegaEvo(replacement, findReplacementLevel(speciesId));
        replacementLog[speciesId] = replacement.id;
    });

    return {
        extraStarters,
        gymRewards,
        staticRewards,
        replacementLog,
        foundMegaEvos,
        alreadyChosenFamilies: [...alreadyChosenFamilySet],
    };
}

// Every mega stone item a reward pokemon's family can use (pure, no RNG). The bundler
// picks one of these at random (sample) when assigning a gym reward's stone.
function rewardMegaStones(rewardPoke, pokemonList) {
    const megaEvos = rewardPoke && rewardPoke.evolutionData && rewardPoke.evolutionData.megaEvos;
    if (!megaEvos || megaEvos.length === 0) return [];
    return megaEvos
        .map(megaId => {
            const megaPoke = pokemonList.find(p => p.id === megaId);
            return megaPoke ? megaPoke.evolutionData.megaItem : null;
        })
        .filter(Boolean);
}

// Deterministic mega stone (first family stone) — used only as the ROM maker's RNG-free
// fallback for older bundles that didn't store a chosen stone. Returns null when none.
function resolveRewardMegaStone(rewardPoke, pokemonList) {
    const stones = rewardMegaStones(rewardPoke, pokemonList);
    return stones.length > 0 ? stones[0] : null;
}

module.exports = {
    runWildModule, BANNED_SPECIES_FOR_PICKING, resolveRewardMegaStone, rewardMegaStones,
    // Exported for the frontend default + unit testing (T-052).
    DEFAULT_EXTRA_STARTER_PRESET, isDefaultStarterPreset, EXTRA_STARTER_TIERS, pickExtraStartersFromSpecs,
};
