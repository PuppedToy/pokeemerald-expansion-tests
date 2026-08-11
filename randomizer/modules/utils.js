'use strict';

const rng = require('../rng');
const {
    TIER_PU,
    TIER_ZU,
    TIER_MAGIKARP,
    EVO_TYPE_SOLO,
    EVO_TYPE_LC,
    EVO_TYPE_LC_OF_2,
    EVO_TYPE_LC_OF_3,
    NATURE_STRATEGY_MIN_LEVEL,
    ABILITY_STRATEGY_MIN_LEVEL,
    DEFAULT_EVOLUTION_LEVEL,
} = require('../constants');
const { activeDiagnostics, DIAGNOSTIC_CODES } = require('../diagnostics');

// T-063 — cosmetic multi-form suffixes. A family named `P_FAMILY_<BASE>_<SUFFIX>` whose suffix is
// one of these is a size/seasonal/sea/antique variant of `P_FAMILY_<BASE>` and must collapse to it,
// so the "one obtainable per family per run" dedup treats all its forms as one. Deliberately a
// curated SUBSET of POKE_FORMS: regional forms (ALOLA/GALAR/HISUI/PALDEA) and functional forms
// (OWN_TEMPO/ROAMING/ARTISAN) are genuinely distinct Pokémon and stay their own families.
const COSMETIC_FORM_SUFFIXES = [
    'EAST', 'SUMMER', 'AUTUMN', 'WINTER', 'SMALL', 'LARGE', 'SUPER', 'ANTIQUE',
    // T-157 — Burmy cloaks and Ogerpon masks: separate families that randomize independently (in
    // POKE_FORMS) but collapse here so the "one obtainable per family per run" dedup treats all
    // cloaks/masks as one (one in the wild; a trainer holds at most one, though it may be any form).
    'SANDY', 'TRASH', 'WELLSPRING', 'HEARTHFLAME', 'CORNERSTONE',
];

// Explicit overrides (win over the suffix strip) for any family that can't be derived by stripping.
const groupedFamilies = {
    // T-185 — Greninja Battle Bond is a SOLO in its own parser family (P_FAMILY_GRENINJA_BATTLE_BOND),
    // deliberately NOT part of the normal Froakie evolution line. Collapsing its dedup group to
    // P_FAMILY_FROAKIE makes the existing "one obtainable per family per run" dedup enforce the owner
    // rule: if a Froakie-line member (or Battle Bond) is placed, the other can never be placed too.
    P_FAMILY_GRENINJA_BATTLE_BOND: 'P_FAMILY_FROAKIE',
};

function getFamilyGroup(familyId) {
    if (groupedFamilies[familyId]) return groupedFamilies[familyId];
    for (const suffix of COSMETIC_FORM_SUFFIXES) {
        if (familyId.endsWith('_' + suffix)) return familyId.slice(0, -(suffix.length + 1));
    }
    return familyId;
}

function isSubWeakTier(tier) {
    return tier === TIER_PU || tier === TIER_ZU || tier === TIER_MAGIKARP;
}

function sample(array) {
    if (array.length === 0) return null;
    return array[Math.floor(rng.random() * array.length)];
}

function sampleAndRemove(array) {
    if (array.length === 0) return null;
    const index = Math.floor(rng.random() * array.length);
    const element = array[index];
    array.splice(index, 1);
    return element;
}

const invalidMegas = ['SPECIES_FROSLASS', 'SPECIES_KLEAVOR'];
function hasValidMega(poke) {
    return poke.evolutionData.megaEvos
        && poke.evolutionData.megaEvos.length > 0
        && !invalidMegas.includes(poke.id);
}

function devolveToBase(pokemonList, pokemon) {
    if (
        pokemon.evolutionData.type === EVO_TYPE_SOLO
        || pokemon.evolutionData.isLC
        || !pokemon.evoTree?.length
    ) {
        return pokemon;
    }
    if (pokemon.evolutionData.megaBaseForm) {
        return devolveToBase(pokemonList, pokemonList.find(p => p.id === pokemon.evolutionData.megaBaseForm));
    }
    const baseForm = pokemon.evoTree[0];
    return pokemonList.find(p => p.id === baseForm);
}

// B-067 — the level at which an evolution becomes reachable. A LEVEL evolution carries it in `param`;
// a stone evolution keeps the ITEM there and carries its level in `minLevel` — the
// `CONDITIONS({IF_MIN_LEVEL, N})` clause that evoLevelWriter re-rolls on every run. Same precedence
// rule as wildModule's megaBaseFormLevel (B-062): first the param, then minLevel, then the default.
function evolutionMinLevel({ param, minLevel }) {
    return [param, minLevel, DEFAULT_EVOLUTION_LEVEL]
        .map(Number)
        .find(value => Number.isFinite(value) && value > 0);
}

// B-067 — a stone evolution used to be legal from a hardcoded level 29 up (`method === 'ITEM' &&
// level > 28`), which ignored its own IF_MIN_LEVEL entirely: Wally at Route 110 (level 29) fielded a
// Basculegion M whose Dawn Stone gate was 49. Read the level instead of the method.
function isValidEvolution(level, evolution) {
    const { param, method } = evolution;
    if (method === 'ITEM') return level >= evolutionMinLevel(evolution);
    return (!isNaN(parseInt(param)) && parseInt(param) <= level && parseInt(param) > 4)
        || (param === '0' && level > 28);
}

// T-106 — the inverse of tryEvolve: given a (possibly mega, possibly final) mon, return the
// MOST-EVOLVED form whose incoming evolution is legal at `level`. Used by reverse-order continuity to
// project a recurring character's authoritative endgame roster back onto an earlier appearance
// (Champion Metagross/level 78 → Granite-Cave/level 22 Metang). A mega is first reduced to its base
// form (no mega item early), then we walk DOWN the line while the step INTO the current form is
// illegal at the level. Base/solo/LC mons (no pre-evolution) are returned unchanged.
function devolveToLevel(pokemonList, pokemon, level) {
    let current = pokemon;
    if (current.evolutionData && current.evolutionData.megaBaseForm) {
        current = pokemonList.find(p => p.id === current.evolutionData.megaBaseForm) || current;
    }
    for (let guard = 0; guard < 12; guard++) {
        const preEvo = pokemonList.find(p => (p.evolutions || []).some(e => e.pokemon === current.id));
        if (!preEvo) break; // current is a base form → cannot devolve further
        const evo = preEvo.evolutions.find(e => e.pokemon === current.id);
        if (isValidEvolution(level, evo)) break; // legal to field `current` at this level → stop
        current = preEvo; // the step into `current` needs a higher level → devolve one stage
    }
    return current;
}

// B-068 — does the data call this mon a FIRST stage (nothing is supposed to evolve into it)? Read from
// both signals, because they can disagree: `isLC` is a boolean flag while EVO_TYPE_LC / _OF_2 / _OF_3 all
// name a first stage in their own right, and a mon can carry the type without the flag.
const FIRST_STAGE_TYPES = new Set([EVO_TYPE_SOLO, EVO_TYPE_LC, EVO_TYPE_LC_OF_2, EVO_TYPE_LC_OF_3]);
function isFirstStage(pokemon) {
    return FIRST_STAGE_TYPES.has(pokemon.evolutionData.type) || !!pokemon.evolutionData.isLC;
}

// Can a trainer of `level` legitimately own this mon — i.e. is there a path from a base form up to it
// whose every step is legal at that level?
//
// B-068 — this used to short-circuit to `true` whenever `evolutionData` said the mon was solo or LC,
// on the assumption that such a mon has no pre-evolution to satisfy. A branch evolution that crosses
// families makes that label lie: Koffing (P_FAMILY_KOFFING) evolves by Moon Stone into Weezing-Galar,
// which lives in P_FAMILY_KOFFING_GALAR and is therefore parsed as EVO_TYPE_SOLO with no pre-evolution
// recorded — so its stone gate was never checked and any trainer could field it. Ask the data instead
// of the label: whether anything in THIS run's pool actually evolves into the mon.
function checkValidEvo(pokemonList, evaluatedPokemon, level, trainer) {
    let current = evaluatedPokemon;
    if (current.evolutionData.megaBaseForm) {
        const baseForm = pokemonList.find(p => p.id === current.evolutionData.megaBaseForm);
        if (!baseForm) {
            if (trainer) {
                activeDiagnostics().warn(
                    DIAGNOSTIC_CODES.MEGA_NO_BASE_FORM,
                    `Could not find base form for mega pokemon ${evaluatedPokemon.id} when checking valid evolutions`,
                    { pokemon: evaluatedPokemon.id, trainerId: trainer.id },
                );
            }
            return false;   // (this guard used to sit AFTER the dereference above, so it never ran)
        }
        current = baseForm;
    }
    // Walk DOWN the line, requiring one legal incoming step per stage. Guard bound mirrors
    // devolveToLevel's: malformed data must not hang a run.
    for (let guard = 0; guard < 12; guard++) {
        const preEvos = pokemonList.filter(p => (p.evolutions || []).some(e => e.pokemon === current.id));
        if (preEvos.length === 0) {
            // Nothing in this pool evolves into `current`. If the data also calls it a first stage it is
            // genuinely obtainable as it stands; if the data says it has a pre-evolution, that
            // pre-evolution was filtered out of this run and we keep the old conservative answer.
            return isFirstStage(current);
        }
        if (preEvos.length > 1
            && current.id !== 'SPECIES_GHOLDENGO'
            && !current.id.includes('SPECIES_LYCANROC')) {
            if (trainer) {
                activeDiagnostics().warn(
                    DIAGNOSTIC_CODES.MULTIPLE_PRE_EVOLUTIONS,
                    `Multiple pre-evolutions found for ${current.id}`,
                    {
                        pokemon: current.id,
                        trainerId: trainer?.id,
                        preEvolutions: preEvos.map(p => p.id),
                    },
                );
            }
        }
        const legal = preEvos.filter(p =>
            p.evolutions.some(e => e.pokemon === current.id && isValidEvolution(level, e)));
        if (legal.length === 0) return false;
        current = legal[0];
    }
    return true;
}

// T-057: whether a trainer of this level picks a strategic nature (true) or a random one (false).
function usesStrategicNature(level) {
    return level >= NATURE_STRATEGY_MIN_LEVEL;
}

// T-057: whether a trainer of this level picks a strategic ability (true) or a random one (false).
function usesStrategicAbility(level) {
    return level >= ABILITY_STRATEGY_MIN_LEVEL;
}

function canLearnMove(pokemon, moveToLearn, trainerLevel) {
    return (
        (pokemon.teachables && pokemon.teachables.includes(moveToLearn)) ||
        (pokemon.learnset && pokemon.learnset.some(lu => lu.move === moveToLearn && lu.level <= trainerLevel))
    );
}

// T-199 — a rival's legendary slot (PLAYER_LEGEND_TREECKO/TORCHIC/MUDKIP). The resolved team member is
// tagged with this so the docs viewer can hide it behind a placeholder until Juan is marked defeated.
function isPlayerLegendSpecial(special) {
    return typeof special === 'string' && special.startsWith('PLAYER_LEGEND');
}

module.exports = {
    getFamilyGroup,
    isSubWeakTier,
    sample,
    sampleAndRemove,
    hasValidMega,
    devolveToBase,
    devolveToLevel,
    evolutionMinLevel,
    isValidEvolution,
    checkValidEvo,
    canLearnMove,
    usesStrategicNature,
    usesStrategicAbility,
    isPlayerLegendSpecial,
};
