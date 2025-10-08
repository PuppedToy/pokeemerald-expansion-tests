const {
    TIER_BAD,
    TIER_WEAK,
    TIER_AVERAGE,
    TIER_STRONG,
    TIER_PREMIUM,
    TIER_LEGEND,
    TIER_GOD,
    TIER_GOD_THRESHOLD,
    TIER_LEGEND_THRESHOLD,
    TIER_PREMIUM_THRESHOLD,
    TIER_STRONG_THRESHOLD,
    TIER_AVERAGE_THRESHOLD,
    TIER_WEAK_THRESHOLD,
    POKEMON_TYPE_POISON,
} = require('./constants');
const { plates, protectionBerries } = require('./items');

const BEST_RATING_FOR_MEGA_EVO = 780;
const BEST_RATING_FOR_FULLY_EVO = 720;
const BEST_RATING_FOR_NFE = 515;
const BEST_RATING_FOR_LC_3EVO = 400;

const WORST_RATING_FOR_MEGA_EVO = 480;
const WORST_RATING_FOR_FULLY_EVO = 250;
const WORST_RATING_FOR_NFE = 205;
const WORST_RATING_FOR_LC_3EVO = 180;


const statusList = {
    MOVE_GROWL: 3,
    MOVE_TAIL_WHIP: 3,
    MOVE_LEER: 3,
    MOVE_SAND_ATTACK: 4,
    MOVE_STRING_SHOT: 2,
    MOVE_HARDEN: 4,
    MOVE_DEFENSE_CURL: 4,

    MOVE_HONE_CLAWS: 6.5,
    MOVE_HOWL: 6.5,
    MOVE_WORK_UP: 6.5,
    
    MOVE_THUNDER_WAVE: 7,
    MOVE_BULK_UP: 7,
    MOVE_CALM_MIND: 7,
    MOVE_SWORDS_DANCE: 8,
    MOVE_DEFEND_ORDER: 8,
    MOVE_COSMIC_POWER: 8,
    MOVE_DRAGON_DANCE: 8.5,
    MOVE_QUIVER_DANCE: 9,
    MOVE_VICTORY_DANCE: 9,
    MOVE_TAIL_GLOW: 9,
    MOVE_SHELL_SMASH: 9.5,
    MOVE_SPORE: 10,
    MOVE_BELLY_DRUM: 8,
    MOVE_STEALTH_ROCK: 8,
    MOVE_ACUPRESSURE: 7,
    MOVE_SLEEP_POWDER: 8,
    MOVE_DEFOG: 7,
    MOVE_AGILITY: 7,
    MOVE_MILK_DRINK: 8.5,
    MOVE_SOFT_BOILED: 8.5,
    MOVE_SLACK_OFF: 8.5,
    MOVE_HEAL_ORDER: 8.5,
    MOVE_RECOVER: 8.5,
    MOVE_SYNTHESIS: 8.5,
    MOVE_MOONLIGHT: 8.5,
    MOVE_ROOST: 8.5,
    MOVE_HEAL_BELL: 7,
    MOVE_AROMATHERAPY: 7,
    MOVE_LEECH_SEED: 8,
    MOVE_TOXIC: 8,

    // Special moves like this are discouraged unless gimmick team
    MOVE_TRICK_ROOM: 3,

    // Other moves that are kinda special
    MOVE_METAL_BURST: 8,
    MOVE_LUSTER_PURGE: 8,
    MOVE_MIST_BALL: 8,

    // Others that might need specific handling
    MOVE_GYRO_BALL: 6,
    // Multi-hits for skill link
    // Drops for contrary
};

const typeChart = {
  NORMAL:     { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
  FIRE:       { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2 },
  WATER:      { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  ELECTRIC:   { WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
  GRASS:      { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5 },
  ICE:        { FIRE: 0.5, WATER: 0.5, GRASS: 2, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5 },
  FIGHTING:   { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2, FAIRY: 0.5 },
  POISON:     { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0, FAIRY: 2 },
  GROUND:     { FIRE: 2, ELECTRIC: 2, GRASS: 0.5, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2 },
  FLYING:     { ELECTRIC: 0.5, GRASS: 2, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
  PSYCHIC:    { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG:        { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5, FAIRY: 0.5 },
  ROCK:       { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
  GHOST:      { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5 },
  DRAGON:     { DRAGON: 2, STEEL: 0.5, FAIRY: 0 },
  DARK:       { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, FAIRY: 0.5 },
  STEEL:      { FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, FAIRY: 2, STEEL: 0.5 },
  FAIRY:      { FIRE: 0.5, FIGHTING: 2, POISON: 0.5, DRAGON: 2, DARK: 2, STEEL: 0.5 },
};

function damageMultiplier(attackingType, defendingTypes) {
    const chart = typeChart[attackingType.toUpperCase()];
    let result = 1;
    defendingTypes.forEach(defType => {
        if (chart && chart[defType.toUpperCase()]) {
            result *= chart[defType.toUpperCase()];
        }
    });
    return result;
}

function isSuperEffective(attackingType, defendingTypes) {
    return damageMultiplier(attackingType, defendingTypes) > 1;
}

function rateMove(move) {
    const isStatus = move.category === 'DAMAGE_CATEGORY_STATUS';
    if (isStatus) return statusList[move.id] || 5;
    if (statusList[move.id]) {
        return statusList[move.id];
    }
    
    const moveEffect = move.effect || '';
    let power = move.power || 50;
    const isMultihit = moveEffect.includes('EFFECT_MULTI_HIT');
    if (isMultihit) {
        power *= 4;
    }
    const isTripleKick = moveEffect.includes('EFFECT_TRIPLE_KICK');
    if (isTripleKick) {
        power *= 6.5;
    }
    else {
        const strikeCount = parseInt(move.strikeCount, 10) || 1;
        power *= strikeCount;
        if (strikeCount > 1) {
            power += power*0.5;
        }
    }
    if (move.additionalEffects.includes('MOVE_EFFECT_RECHARGE')) {
        power *= 0.6;
    }
    let rating = Math.min(10 * power / 140, 12);
    const isOhko = moveEffect.includes('EFFECT_OHKO');
    if (isOhko) rating = 12;
    const pp = move.pp || 40;
    rating += (pp-5)/20;
    const priority = move.priority || 0;
    rating += priority;
    const isSuckerPunch = moveEffect.includes('EFFECT_SUCKER_PUNCH');
    if (isSuckerPunch) rating -= 0.5;
    const isFirstTurnOnly = moveEffect.includes('EFFECT_FIRST_TURN_ONLY');
    if (isFirstTurnOnly) rating += 3; // Fake Out and First Impression are very good moves
    const isTwoTurns = moveEffect.includes('EFFECT_TWO_TURNS_ATTACK');
    if (isTwoTurns) {
        rating *= 0.5;
    }
    const isFlyLike = moveEffect.includes('EFFECT_SEMI_INVULNERABLE');
    if (isFlyLike) {
        rating *= 0.7;
    }
    const isRecoil = moveEffect.includes('EFFECT_RECOIL');
    if (isRecoil) {
        rating *= 0.9;
    }
    const isFutureSight = moveEffect.includes('EFFECT_FUTURE_SIGHT');
    if (isFutureSight) {
        rating *= 0.8;
    }
    const isLastResort = moveEffect.includes('EFFECT_LAST_RESORT');
    if (isLastResort) {
        rating *= 0.6;
    }
    const isSolarBeam = moveEffect.includes('EFFECT_SOLAR_BEAM');
    if (isSolarBeam) {
        rating *= 0.8;
    }
    const hasDefSpefDrop = move.additionalEffects.includes('MOVE_EFFECT_DEF_SPDEF_DOWN');
    const hasSpeDrop = move.additionalEffects.includes('MOVE_EFFECT_SPD_MINUS_1');
    if (hasDefSpefDrop || hasSpeDrop) {
        rating *= 0.95;
    }
    const hasAtkDefDrop = move.additionalEffects.includes('MOVE_EFFECT_ATK_DEF_DOWN');
    const hasSpaDrop = move.additionalEffects.includes('MOVE_EFFECT_SP_ATK_MINUS_2');
    if (hasAtkDefDrop || hasSpaDrop) {
        rating *= 0.9;
    }
    let accuracy = move.accuracy || 110;
    if (accuracy == 0) accuracy = 110;
    rating -= (100 - accuracy) / 10;
    const isRecoilIfMiss = moveEffect.includes('EFFECT_RECOIL_IF_MISS');
    if (isRecoilIfMiss) {
        rating *= (100 - accuracy)/100;
    }
    const isBasedOnHp = moveEffect.includes('EFFECT_POWER_BASED_ON_USER_HP');
    if (isBasedOnHp) {
        rating *= 0.9;
    }
    const isExplosion = moveEffect.includes('EFFECT_EXPLOSION');
    if (isExplosion) {
        rating *= 0.3;
    }
    const isMindBlownLike = moveEffect.includes('EFFECT_MAX_HP_50_RECOIL');
    if (isMindBlownLike) {
        rating *= 0.75;
    }
    const isHitEscape = moveEffect.includes('EFFECT_HIT_ESCAPE');
    if (isHitEscape) {
        rating *= 1.5;
    }
    const isKnockOff = moveEffect.includes('EFFECT_KNOCK_OFF');
    if (isKnockOff) {
        rating *= 1.3;
    }
    const isRollout = moveEffect.includes('EFFECT_ROLLOUT');
    if (isRollout) {
        rating *= 2.5;
    }
    const isFalseSwipe = moveEffect.includes('EFFECT_FALSE_SWIPE');
    if (isFalseSwipe) {
        rating *= 0.5;
    }

    return rating;
}

function rateMoveForAPokemon(move, poke, ability, item, otherMoves, currentMoves) {
    if (
        currentMoves.filter(m => m.category !== 'DAMAGE_CATEGORY_STATUS').length < 2
        && move.category === 'DAMAGE_CATEGORY_STATUS'
    ) {
        return 0;
    }

    const hasAbility = (abilityToQuery) => {
        return ability === abilityToQuery || (!ability && poke.parsedAbilities.includes(abilityToQuery));
    }

    let rating = move.rating;
    if (move.category === 'DAMAGE_CATEGORY_PHYSICAL') {
        rating += poke.baseAttack / 100;
    }
    else if (move.category === 'DAMAGE_CATEGORY_SPECIAL') {
        rating += poke.baseSpAttack / 100;
    }
    // Status moves value defenses (except setup, which need to be evaluated differently @TODO)
    else {
        rating += (poke.baseHP + poke.baseDefense + poke.baseSpDefense) / 300;
    }

    if (move.category !== 'DAMAGE_CATEGORY_STATUS') {
        let stab = poke.parsedTypes.includes(move.type) ? 1.5 : 1.0;
        if (hasAbility('ADAPTABILITY')) {
            stab = 2.0;
        }
        rating *= stab;

        if (hasAbility('TECHNICIAN') && move.power <= 60) {
            rating *= 1.5;
        }

        if (hasAbility('SKILL_LINK') && move.effect && move.effect.includes('EFFECT_MULTI_HIT')) {
            rating *= 2.5;
        }

        const gemRegex = /^ITEM_(\w+)_GEM$/;
        if (item) {
            const match = item.match(gemRegex);
            if (match) {
                const gemType = match[1];
                if (gemType === move.type) {
                    rating *= 1.3;
                }
            }
        }

        // If another damaging move of the same type exists, devalue this move
        if (currentMoves.some(m => m.category !== 'DAMAGE_CATEGORY_STATUS' && m.type === move.type)) {
            rating *= 0.3;
        }
    }

    // @TODO move base rating + stab + ability synergy + other moves synergy, coverage
    return rating;
}

function rateItemForAPokemon(item, poke, ability, moveset, bagSize, deviation = 0) {
    const offensePower = Math.max(poke.baseAttack, poke.baseSpAttack)/100;
    const defensePower = (poke.baseDefense + poke.baseSpDefense + poke.baseHP)/300;
    let coverageRating = 0;
    const checkedTypes = [];
    const calculatedDeviation = 1 + ((Math.random() ? 1 : -1) * Math.random() * deviation);
    moveset.forEach(move => {
        if (move.category !== 'DAMAGE_CATEGORY_STATUS' && !checkedTypes.includes(move.type)) {
            checkedTypes.push(move.type);
            coverageRating += 2.5;
        }
    });

    if (item === 'Flame Orb') {
        const hasFacade = moveset.some(m => m.id === 'MOVE_FACADE');
        const hasGuts = ability === 'GUTS';
        const hasQuickFeet = ability === 'QUICK_FEET';
        if (hasFacade && (hasGuts || hasQuickFeet)) {
            return 10 * offensePower / defensePower * calculatedDeviation;
        }
        if (hasGuts || hasFacade) {
            return 9 * offensePower / defensePower * calculatedDeviation;
        }
        if (hasQuickFeet) {
            return 8 * offensePower / defensePower * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Eviolite') {
        if (poke.evolutionData.isNFE) {
            return 10 * defensePower / offensePower * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Rocky Helmet') {
        if (ability === 'ROUGH_SKIN' || ability === 'IRON_BARBS') {
            return 9.5 * defensePower / offensePower * calculatedDeviation;
        }
        return 8.5 * poke.baseDefense / offensePower * calculatedDeviation;
    }
    if (item === 'Black Sludge') {
        if (poke.parsedTypes.includes(POKEMON_TYPE_POISON)) {
            return 9.5 * defensePower / offensePower * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Leftovers') {
        return 9.5 * defensePower / offensePower * calculatedDeviation;
    }
    if (item === 'Life Orb') {
        const hasMagicGuard = ability === 'MAGIC_GUARD';
        if (hasMagicGuard) {
            return 9.5 * offensePower / defensePower * calculatedDeviation;
        }
        return 8.5 * offensePower / defensePower * calculatedDeviation;
    }
    if (item === 'Expert Belt') {
        return coverageRating * 0.75 * offensePower / defensePower * calculatedDeviation;
    }
    if (item === 'Heavy-Duty Boots') {
        const rockDamageMultiplier = damageMultiplier('ROCK', poke.parsedTypes);
        return 5 * calculatedDeviation + (1 - rockDamageMultiplier) * 2;
    }
    if (item === 'Oran Berry') {
        const minHPAtWhichRatingIsMax = 30;
        const ratingDevaluation = 5; // For each X extra HP, rating devalues by 1 point
        const baseHPNear10Rating = Math.max(0, Math.min(10, 10 - ((poke.baseHP - minHPAtWhichRatingIsMax) / ratingDevaluation)));
        return baseHPNear10Rating * calculatedDeviation;
    }
    if (item === 'Chesto Berry') {
        if (ability === 'INSOMNIA' || ability === 'EARLY_BIRD') {
            return 0;
        }
        const hasRest = moveset.some(m => m.id === 'MOVE_REST');
        if (hasRest) {
            return 9 * defensePower / offensePower * calculatedDeviation;
        }
        return 3 * calculatedDeviation;
    }
    if (item.includes(' Gem')) {
        const gemType = item.split(' Gem')[0].toUpperCase();
        const stabExtra = poke.parsedTypes.includes(gemType) ? 0.5 : 0;
        for (const move of moveset) {
            if (move.category !== 'DAMAGE_CATEGORY_STATUS' && move.type === gemType) {
                if (move.id === 'MOVE_ACROBATICS' && gemType === 'FLYING') {
                    if (ability === 'UNBURDEN') {
                        return 9.1 * offensePower / defensePower * calculatedDeviation + stabExtra;
                    }
                    return 8 * offensePower / defensePower * calculatedDeviation + stabExtra;
                }
                return 7 * offensePower / defensePower * calculatedDeviation + stabExtra;
            }
        }
        return 0;
    }
    const itemId = 'ITEM_' + item.replace(/ /, '_').toUpperCase();
    if (item.includes(' Plate')) {
        const plateType = plates[itemId];
        const stabExtra = poke.parsedTypes.includes(plateType) ? 0.5 : 0;
        for (const move of moveset) {
            if (move.category !== 'DAMAGE_CATEGORY_STATUS' && move.type === plateType) {
                return 6.5 * offensePower / defensePower * calculatedDeviation + stabExtra;
            }
        }
        return 0;
    }
    if (item.includes(' Berry')) {
        const protectionBerriesEntries = Object.entries(protectionBerries);
        for (const [berryType, berryId] of protectionBerriesEntries) {
            if (berryId === itemId) {
                const berryTypeDamageMultiplier = damageMultiplier(berryType, poke.parsedTypes);
                if (berryTypeDamageMultiplier > 1) {
                    return (5 + berryTypeDamageMultiplier) * defensePower / offensePower * calculatedDeviation;
                }
                return 0;
            }
        }
    }
    return calculatedDeviation;
}

// deviation is a value from 0 to 1 indicating how much randomness to add to the rating, so a
// trainer may have their own bias towards certain moves
// Recommanded value: 0.1
function chooseMoveset(poke, moves, level = 100, startingMoveset = [], ability = null, item = null, tmsInBag = null, deviation = 0) {
    const moveset = [...startingMoveset].map(move => moves[move] ? moves[move] : null).filter(m => m !== null);
    const tmsUsed = [];
    const tms = tmsInBag && Array.isArray(tmsInBag) ? poke.teachables.filter(tm => tmsInBag.includes(tm)) : poke.teachables;
    const allMoves = [
        ...poke.learnset.filter(ls => ls.level <= level).map(ls => ls.move),
        ...tms,
    ];
    let uniqueMoves = Array.from(new Set(allMoves)).map(moveId => {
        const move = moves[moveId];
        if (!move) {
            console.warn(`Warning: Move ${moveId} not found for ${poke.name}`);
            return null;
        }
        return {
            ...move,
            rating: rateMove(move),
        };
    }).filter(m => m !== null);

    while (uniqueMoves.length > 0 && moveset.length < 4) {
        const ratedMoves = uniqueMoves.map(move => {
            const rating = rateMoveForAPokemon(move, poke, ability, item, uniqueMoves, moveset) * (1 + ((Math.random() ? 1 : -1) * Math.random() * deviation));
            return {
                ...move,
                rating,
            };
        }).filter(m => m !== null);

        ratedMoves.sort((a, b) => b.rating - a.rating);
        moveset.push(ratedMoves[0]);
        uniqueMoves = uniqueMoves.filter(move => move.id !== ratedMoves[0].id);
    }

    moveset.forEach(move => {
        if (!poke.learnset.some(ls => ls.move === move.id)
            && tms.includes(move.id))
        {
            tmsUsed.push(move.id);
        }
    });

    return {
        moveset: moveset.map(m => m.id),
        tmsUsed,
    };
}

function ratePokemon(poke, moves, abilities) {
    let bestAbilityRating = 0;
    poke.parsedAbilities.forEach(abilityId => {
        if (abilityId === 'NONE') return;
        const abilityRating = abilities[`ABILITY_${abilityId}`]?.rating || 0;
        if (abilityRating > bestAbilityRating) {
            bestAbilityRating = abilityRating;
        }
    });

    let trueBST = poke.baseBST;
    if (poke.abilities.includes('TRUANT')) {
        trueBST -= poke.baseAttack * 0.5 + poke.baseSpAttack * 0.5;
    }
    if (poke.abilities.includes('HUGE_POWER') || poke.abilities.includes('PURE_POWER')) {
        trueBST += poke.baseAttack;
        bestAbilityRating = poke.baseAttack / 12;
    }
    // Wonder Guard?
    // @TODO if any stat is a hard outlier, increase bst rating (deoxys, blissey)
    // @TODO What happens to Zacian and Eternatus-Emax?

    // 0-10 while 0 is WORST_RATING_FOR_LC_3EVO and 10 is BEST_RATING_FOR_MEGA_EVO
    const absoluteBSTRating = Math.max(0, (trueBST - WORST_RATING_FOR_LC_3EVO) * 10 / (BEST_RATING_FOR_MEGA_EVO - WORST_RATING_FOR_LC_3EVO));
    // For now we will just do absolute
    // @TODO relative

    const { moveset } = chooseMoveset(poke, moves);

    let movesRating = 0;
    moveset.forEach(moveId => {
        if (moves[moveId] && moves[moveId].rating) {
            movesRating += moves[moveId].rating;
        }
    });
    movesRating *= 0.25;

    const absoluteRating = (absoluteBSTRating * 0.8) + (movesRating * 0.1) + (bestAbilityRating * 0.1);

    // These tiers are kinda working. I should add that OU is actually exclusive pokemon and UU-RU are the average fully evolved ones
    // GOD should only be used by extremely hard bosses. Should not come up in the game in general. Esp. Eternatus Emax
    let tier;
    if (absoluteRating >= TIER_GOD_THRESHOLD) {
        tier = TIER_GOD;
    }
    else if (absoluteRating >= TIER_LEGEND_THRESHOLD) {
        tier = TIER_LEGEND;
    }
    else if (absoluteRating >= TIER_PREMIUM_THRESHOLD) {
        tier = TIER_PREMIUM;
    }
    else if (absoluteRating >= TIER_STRONG_THRESHOLD) {
        tier = TIER_STRONG;
    }
    else if (absoluteRating >= TIER_AVERAGE_THRESHOLD) {
        tier = TIER_AVERAGE;
    }
    else if (absoluteRating >= TIER_WEAK_THRESHOLD) {
        tier = TIER_WEAK;
    }
    else {
        tier = TIER_BAD;
    }

    return {
        absoluteRating,
        absoluteBSTRating,
        bestMoveset: moveset,
        movesRating,
        bestAbilityRating,
        tier,
    };
}

module.exports = {
    ratePokemon,
    chooseMoveset,
    rateMove,
    rateItemForAPokemon,
}