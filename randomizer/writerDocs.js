'use strict';

const rng = require('./rng');
const wild = require('./wild.js');
const trainers = require('./trainers.js');
const {
    EVO_TYPE_LC,
    EVO_TYPE_NFE,
    EVO_TYPE_SOLO,
    EVO_TYPE_FINAL,
    TRAINER_POKE_ENCOUNTER,
    TRAINER_POKE_STARTER_TREECKO,
    TRAINER_POKE_STARTER_TORCHIC,
    TRAINER_POKE_STARTER_MUDKIP,
    TRAINER_RESTRICTION_NO_REPEATED_TYPE,
    TRAINER_RESTRICTION_ALLOW_ONLY_TYPES,
    TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES,
    TRAINER_REPEAT_ID,
    NATURES,
    TRAINER_POKE_MEGA_FROM_STONE,
    GENERIC_DEVIATION,
    MEGA_TRAINERS,
} = require('./constants');
const { chooseMoveset, adjustMoveset, rateItemForAPokemon, isSuperEffective, chooseNature } = require('./rating.js');
const { BANNED_SPECIES_FOR_PICKING } = require('./modules/wildModule');
const { sample, checkValidEvo } = require('./modules/utils');

const LEVEL_CAPS = [5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35, 38, 40, 43, 46, 50, 55, 60, 65, 70];

function nearestCap(level) {
    let best = LEVEL_CAPS[0];
    for (const cap of LEVEL_CAPS) {
        if (cap <= level) best = cap;
        else break;
    }
    return best;
}

function nameify(text) {
    return text
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function itemIdToName(itemId) {
    return nameify(itemId.replace('ITEM_', ''));
}

function isValidEvolution(level, { param, method }) {
    return (!isNaN(parseInt(param)) && parseInt(param) <= level && parseInt(param) > 4)
        || ((method === 'ITEM' || param === '0') && level > 28);
}

function djb2Hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0;
    return h;
}

// Pure docs computation — same trainer resolution as writer.js but no file I/O.
// baseRngSeed: when non-null, per-slot RNG reseeding is applied (shared trainer determinism).
async function writerDocs(pokedexArtifact, trainersArtifact, startersArtifact, wildArtifact, baseRngSeed = null) {
    let { pokes: pokemonList, moves, abilities } = pokedexArtifact;
    const { trainersData: rawTrainersData, itemAssignments } = trainersArtifact;
    const { starters } = startersArtifact;
    const { extraStarters, gymRewards, staticRewards, replacementLog: wildReplacementLog, foundMegaEvos: wildFoundMegaEvos } = wildArtifact;

    pokemonList = pokemonList.filter(poke => !BANNED_SPECIES_FOR_PICKING.includes(poke.id));

    // Deep-clone trainersData — mega trainer processing splices the array in-place
    const trainersData = JSON.parse(JSON.stringify(rawTrainersData));

    // Build replacementLog from artifacts (no file reads)
    const replacementLog = {};

    // Wild species replacements
    Object.entries(wildReplacementLog).forEach(([k, v]) => { replacementLog[k] = v; });

    // Gym reward replacements
    const pokeRewardReplacements = [
        gymRewards.gym1,
        gymRewards.gym2,
        gymRewards.gym3,
        gymRewards.gym4,
        gymRewards.gym5,
        gymRewards.gym6,
        gymRewards.gym7,
        gymRewards.gym8,
        gymRewards.slateportGrunts,
        gymRewards.shellyReward,
        gymRewards.wallyLilycove,
    ];
    pokeRewardReplacements.forEach((reward, i) => {
        replacementLog[`SPECIES_GYM${i + 1}_REWARD`] = reward.id;
    });

    // Static reward replacements
    if (staticRewards.regirock)  replacementLog['SPECIES_REGIROCK']  = staticRewards.regirock.id;
    if (staticRewards.regice)    replacementLog['SPECIES_REGICE']    = staticRewards.regice.id;
    if (staticRewards.mew)       replacementLog['SPECIES_MEW']       = staticRewards.mew.id;
    if (staticRewards.registeel) replacementLog['SPECIES_REGISTEEL'] = staticRewards.registeel.id;
    if (staticRewards.legend1)   replacementLog['SPECIES_LEGEND1']   = staticRewards.legend1.id;
    if (staticRewards.legend2)   replacementLog['SPECIES_LEGEND2']   = staticRewards.legend2.id;
    if (staticRewards.legend3)   replacementLog['SPECIES_LEGEND3']   = staticRewards.legend3.id;

    // Mega trainer processing — no file I/O, just build megaReplacementLog and splice trainersData
    const foundMegaEvos = [...wildFoundMegaEvos].sort((a, b) => a.level - b.level);
    const megaReplacementLog = {};

    function removeMegaTrainer(megaTrainer) {
        const trainerIndex = trainersData.findIndex(t => t.id === megaTrainer.trainer);
        if (trainerIndex >= 0) trainersData.splice(trainerIndex, 1);
    }

    function updateMegaTrainer(megaTrainer, megaEvo) {
        megaReplacementLog[`ITEM_MEGA_${megaTrainer.id}`] = megaEvo.item;
    }

    const megaTrainers = MEGA_TRAINERS;
    let nextMegaEvo = foundMegaEvos.shift();
    for (let i = 0; i < megaTrainers.length; i++) {
        const foundTrainer = trainersData.find(t => t.id === megaTrainers[i].trainer);
        if (!foundTrainer) {
            throw new Error(`Could not find trainer with id ${megaTrainers[i].trainer} to assign mega evolution.`);
        }
        const level = foundTrainer.level;

        if (!nextMegaEvo || nextMegaEvo.level > level) {
            removeMegaTrainer(megaTrainers[i]);
            continue;
        }

        updateMegaTrainer(megaTrainers[i], nextMegaEvo);

        if (!foundMegaEvos.length) {
            nextMegaEvo = null;
            continue;
        }
        nextMegaEvo = foundMegaEvos.shift();
    }

    // Trainer resolution — identical to writer.js forEach, no file I/O
    const trainersResults = {};
    const storedIds = {};
    const pokeIdIVCache = {};

    function generateIVs(breedTier, pokeId) {
        if (pokeId && pokeIdIVCache[pokeId]) return pokeIdIVCache[pokeId];
        let ivs;
        if (breedTier === 'perfect') {
            ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
        } else if (breedTier === 'good') {
            const order = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].sort(() => rng.random() - 0.5);
            ivs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            Object.keys(ivs).forEach(s => { ivs[s] = Math.floor(rng.random() * 32); });
            order.slice(0, 3).forEach(s => { ivs[s] = 31; });
        } else {
            ivs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            Object.keys(ivs).forEach(s => { ivs[s] = Math.floor(rng.random() * 32); });
        }
        if (pokeId) pokeIdIVCache[pokeId] = ivs;
        return ivs;
    }

    trainersData.forEach(trainer => {
        for (let i = 0; i < (trainer.bag || []).length; i++) {
            const item = trainer.bag[i];
            if (item.startsWith('TM_')) {
                const moveId = item.replace('TM_', 'MOVE_');
                trainer.bag.splice(i, 1);
                i--;
                if (!trainer.tms) trainer.tms = [];
                trainer.tms.push(moveId);
            }
        }

        if (trainer.copy) {
            const target = trainersResults[trainer.copy];
            trainersResults[trainer.id] = {
                level: target.level,
                isBoss: target.isBoss,
                team: [...target.team],
                class: trainer.class,
            };
            return;
        }

        let foundMega = false;

        const canLearnMove = (pokemon, moveToLearn) => {
            return (
                pokemon.teachables && pokemon.teachables.includes(moveToLearn)
            ) || (
                pokemon.learnset && pokemon.learnset.some(lu => lu.move === moveToLearn && lu.level <= trainer.level)
            );
        };

        const canLearnAnyOfMoves = (pokemon, movesToLearn) =>
            movesToLearn.some(m => canLearnMove(pokemon, m));

        const tryEvolve = (pokemon, tryMega) => {
            let chosenTrainerMon = { ...pokemon };
            let possibleEvolutions;

            do {
                if (!chosenTrainerMon.evolutions || chosenTrainerMon.evolutions.length === 0) break;

                possibleEvolutions = chosenTrainerMon.evolutions.filter((evo) => {
                    if (chosenTrainerMon.isFinal) return false;
                    if (tryMega) {
                        const megaForms = pokemonList.filter(p => p.evolutionData.megaBaseForm && p.evolutionData.megaBaseForm === evo.pokemon);
                        if (megaForms.length) return true;
                        let i = 1;
                        do {
                            if (!chosenTrainerMon.evolutions || chosenTrainerMon.evolutions.length === 0) return false;
                            for (let i = 0; i < chosenTrainerMon.evolutions.length; i++) {
                                const evolvedForm = pokemonList.find(p => p.id === chosenTrainerMon.evolutions[i].pokemon);
                                if (!evolvedForm) continue;
                                const evolvedFormMegaForms = pokemonList.filter(p => p.evolutionData.megaBaseForm && p.evolutionData.megaBaseForm === evolvedForm.id);
                                if (evolvedFormMegaForms.length > 0) return true;
                            }
                            if (chosenTrainerMon.evolutions.length > 0) {
                                const randomEvo = sample(chosenTrainerMon.evolutions);
                                const randomEvolvedForm = pokemonList.find(p => p.id === randomEvo.pokemon);
                                if (randomEvolvedForm) { chosenTrainerMon = randomEvolvedForm; continue; }
                            }
                            return false;
                        } while (i < 100);
                        return false;
                    }
                    return isValidEvolution(trainer.level, evo);
                });

                if (possibleEvolutions.length > 0) {
                    possibleEvolutions.sort((a, b) => parseInt(b.param) - parseInt(a.param));
                    let evolvedForm;
                    for (let i = 0; i < possibleEvolutions.length && !evolvedForm; i++) {
                        evolvedForm = pokemonList.find(p => p.id === possibleEvolutions[i].pokemon);
                        if (evolvedForm) chosenTrainerMon = evolvedForm;
                    }
                    if (!evolvedForm) break;
                }
            } while (possibleEvolutions.length > 0);

            return chosenTrainerMon;
        };

        const choosePokemonFromDefinition = (trainerMonDefinition) => {
            let pokemonStrictList = [];
            let pokemonLooseList = [];
            let chosenTrainerMon;

            if (trainerMonDefinition.oneOf) {
                pokemonLooseList = trainerMonDefinition.oneOf.map(p => pokemonList.find(pl => pl.id === p));
            } else if (trainerMonDefinition.specific) {
                const specificPokemon = pokemonList.find(p => p.id === trainerMonDefinition.specific);
                if (specificPokemon) pokemonStrictList = [specificPokemon];
            } else if (trainerMonDefinition.specificIfTier) {
                const specificPokemon = pokemonList.find(p => p.id === trainerMonDefinition.specificIfTier);
                let qualifies = false;
                if (specificPokemon && trainerMonDefinition.contextualTier) {
                    const cap = nearestCap(trainer.level);
                    const contextual = specificPokemon.contextualRatings?.[cap];
                    qualifies = !!(contextual && trainerMonDefinition.contextualTier.includes(contextual.tier));
                } else if (specificPokemon) {
                    qualifies = true;
                }
                if (qualifies) {
                    pokemonStrictList = [specificPokemon];
                } else {
                    pokemonLooseList = [...pokemonList];
                }
            } else if (trainerMonDefinition.special === TRAINER_POKE_ENCOUNTER) {
                pokemonLooseList = trainerMonDefinition.encounterIds.map((encounterId) => {
                    const replacedId = replacementLog[encounterId];
                    return pokemonList.find(p => p.id === (replacedId || encounterId));
                });
            } else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_TREECKO) {
                const starterPokemon = pokemonList.find(p => p.id === starters[1]);
                pokemonStrictList = [starterPokemon];
            } else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_TORCHIC) {
                const starterPokemon = pokemonList.find(p => p.id === starters[2]);
                pokemonStrictList = [starterPokemon];
            } else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_MUDKIP) {
                const starterPokemon = pokemonList.find(p => p.id === starters[0]);
                pokemonStrictList = [starterPokemon];
            } else if (trainerMonDefinition.special === 'PLAYER_LEGEND_TREECKO') {
                pokemonStrictList = [staticRewards.legend1];
            } else if (trainerMonDefinition.special === 'PLAYER_LEGEND_TORCHIC') {
                pokemonStrictList = [staticRewards.legend2];
            } else if (trainerMonDefinition.special === 'PLAYER_LEGEND_MUDKIP') {
                pokemonStrictList = [staticRewards.legend3];
            } else if (trainerMonDefinition.special === TRAINER_REPEAT_ID) {
                const repeatedId = storedIds[trainerMonDefinition.id];
                if (repeatedId) {
                    const repeatedPokemon = pokemonList.find(p => p.id === repeatedId);
                    if (repeatedPokemon) pokemonStrictList = [repeatedPokemon];
                }
            } else if (trainerMonDefinition.special === TRAINER_POKE_MEGA_FROM_STONE) {
                const megaStone = megaReplacementLog[trainerMonDefinition.megaStone];
                const mega = pokemonList.filter(p => p.evolutionData.megaItem === megaStone);
                if (mega.length === 1) pokemonStrictList = mega;
            } else {
                pokemonLooseList = [...pokemonList];
            }

            // General filters for the loose list
            if (trainerMonDefinition.isMega) {
                pokemonLooseList = pokemonLooseList.filter(p => p.evolutionData.isMega);
            } else {
                pokemonLooseList = pokemonLooseList.filter(p => !p.evolutionData.isMega);
            }
            if (trainerMonDefinition.absoluteTier) {
                pokemonLooseList = pokemonLooseList.filter(p => trainerMonDefinition.absoluteTier.includes(p.rating.tier));
            }
            if (trainerMonDefinition.contextualTier) {
                const cap = nearestCap(trainer.level);
                const beforeCount = pokemonLooseList.length;
                const filtered = pokemonLooseList.filter(p => {
                    const contextual = p.contextualRatings?.[cap];
                    return contextual && trainerMonDefinition.contextualTier.includes(contextual.tier);
                });
                pokemonLooseList = filtered.length > 0 ? filtered : pokemonLooseList;
                if (filtered.length === 0 && beforeCount > 0) {
                    console.warn(`WARN: contextualTier filter yielded 0 results for trainer ${trainer.id} at level ${trainer.level} (cap=${cap}). Falling back.`);
                }
            }
            if (trainerMonDefinition.evoType) {
                pokemonLooseList = pokemonLooseList.filter(p => {
                    let result = false;
                    trainerMonDefinition.evoType.forEach(evoType => {
                        if (evoType === EVO_TYPE_LC)    result = result || p.evolutionData.isLC;
                        else if (evoType === EVO_TYPE_NFE)   result = result || p.evolutionData.isNFE;
                        else if (evoType === EVO_TYPE_SOLO)  result = result || p.evolutionData.type === EVO_TYPE_SOLO;
                        else if (evoType === EVO_TYPE_FINAL) result = result || p.evolutionData.isFinal;
                    });
                    return result;
                });
            }
            if (trainerMonDefinition.megaTier) {
                pokemonLooseList = pokemonLooseList.filter(p =>
                    p.evolutionData.megaEvos && p.evolutionData.megaEvos.length > 0 &&
                    trainerMonDefinition.megaTier.includes(p.rating.megaEvoTier)
                );
            }
            if (trainerMonDefinition.evolutionTier) {
                pokemonLooseList = pokemonLooseList.filter(p => trainerMonDefinition.evolutionTier.includes(p.rating.bestEvoTier));
            }
            if (trainerMonDefinition.exactTypes) {
                pokemonLooseList = pokemonLooseList.filter(p => trainerMonDefinition.exactTypes.every(t => p.parsedTypes.includes(t)));
            }
            if (trainerMonDefinition.type) {
                pokemonLooseList = pokemonLooseList.filter(p => p.parsedTypes.some(t => trainerMonDefinition.type.includes(t)));
            } else if (trainerMonDefinition.weakToTypes) {
                pokemonLooseList = pokemonLooseList.filter(p =>
                    trainerMonDefinition.weakToTypes.some(t => isSuperEffective(t, p.parsedTypes))
                );
            }
            if (trainerMonDefinition.abilities) {
                pokemonLooseList = pokemonLooseList.filter(p => p.parsedAbilities.some(a => trainerMonDefinition.abilities.includes(a)));
            }
            if (trainerMonDefinition.hasStat) {
                const [statName, comparator, value] = trainerMonDefinition.hasStat;
                let check = () => true;
                if (comparator === '<') check = (p) => p[statName] < value;
                else if (comparator === '>') check = (p) => p[statName] > value;
                pokemonLooseList = pokemonLooseList.filter(check);
            }
            if (trainerMonDefinition.checkValidEvo) {
                pokemonLooseList = pokemonLooseList.filter(p => checkValidEvo(pokemonList, p, trainer.level, trainer));
            }
            if (trainerMonDefinition.mustHaveOneOfMoves) {
                pokemonLooseList = pokemonLooseList.filter(p => canLearnAnyOfMoves(p, trainerMonDefinition.mustHaveOneOfMoves));
            }

            if (trainerMonDefinition.tryEvolve) {
                pokemonLooseList = pokemonLooseList.map(p => tryEvolve(p, trainerMonDefinition.tryMega && !foundMega));
                pokemonStrictList = pokemonStrictList.map(p => tryEvolve(p, trainerMonDefinition.tryMega && !foundMega));
            }

            if (pokemonLooseList.length > 0) {
                let filteredLooseList = pokemonLooseList.filter(p => !team.find(tp => tp.pokemon.id === p.id));
                (trainer.restrictions || []).forEach(restriction => {
                    if (restriction === TRAINER_RESTRICTION_NO_REPEATED_TYPE) {
                        const selectedTypes = new Set(...team.map(pokemon => pokemon.parsedTypes).flat());
                        filteredLooseList = filteredLooseList.filter(p => !p.parsedTypes.some(t => selectedTypes.has(t)));
                    } else if (restriction === TRAINER_RESTRICTION_ALLOW_ONLY_TYPES) {
                        if (trainer.types) filteredLooseList = filteredLooseList.filter(p => p.parsedTypes.some(t => trainer.types.includes(t)));
                    } else if (restriction === TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES) {
                        if (trainer.abilities) filteredLooseList = filteredLooseList.filter(p => p.parsedAbilities.some(a => trainer.abilities.includes(a)));
                    }
                });
                pokemonStrictList = [...pokemonStrictList, ...filteredLooseList];
            }

            const getRatingForSort = (poke) => {
                if (trainerMonDefinition.contextualTier) {
                    const cap = nearestCap(trainer.level);
                    return poke.contextualRatings?.[cap]?.absoluteRating ?? poke.rating.absoluteRating;
                }
                return poke.rating.absoluteRating;
            };

            if (pokemonStrictList.length > 0) {
                chosenTrainerMon = trainerMonDefinition.pickBest
                    ? pokemonStrictList.sort((a, b) => getRatingForSort(b) - getRatingForSort(a))[0]
                    : sample(pokemonStrictList);
            } else if (pokemonLooseList.length > 0) {
                chosenTrainerMon = trainerMonDefinition.pickBest
                    ? pokemonLooseList.sort((a, b) => getRatingForSort(b) - getRatingForSort(a))[0]
                    : sample(pokemonLooseList);
            }

            return chosenTrainerMon;
        };

        const team = [];
        trainer.team.forEach((trainerMonDefinition, slotIndex) => {
            if (baseRngSeed !== null) {
                const slotSeed = (baseRngSeed ^ Math.imul(djb2Hash(trainer.id + ':' + slotIndex), 0x9E3779B9)) >>> 0;
                rng.seed(slotSeed);
            }
            let chosenTrainerMon = choosePokemonFromDefinition(trainerMonDefinition);

            if (!chosenTrainerMon && trainerMonDefinition.fallback && trainerMonDefinition.fallback.length) {
                let fallbackCount = 1;
                let fallbackDefinition;
                do {
                    fallbackDefinition = trainerMonDefinition.fallback.shift();
                    chosenTrainerMon = choosePokemonFromDefinition(fallbackDefinition);
                } while (!chosenTrainerMon && trainerMonDefinition.fallback && trainerMonDefinition.fallback.length);
                if (fallbackDefinition) trainerMonDefinition = fallbackDefinition;
            }
            if (!chosenTrainerMon) {
                chosenTrainerMon = sample(pokemonList);
            }

            if (trainerMonDefinition.tryMega) {
                if (
                    (chosenTrainerMon.evolutionData.isFinal || chosenTrainerMon.evolutionData.type === EVO_TYPE_SOLO)
                    && chosenTrainerMon.evolutionData.megaEvos
                    && chosenTrainerMon.evolutionData.megaEvos.length > 0
                    && !foundMega
                ) {
                    const megaPoke = pokemonList.filter(p => p.evolutionData.megaBaseForm === chosenTrainerMon.id);
                    if (megaPoke.length) chosenTrainerMon = sample(megaPoke);
                }
            }

            if (chosenTrainerMon) {
                let baseFormMon = chosenTrainerMon;
                let megaItem;
                const megaMoves = [];
                if (chosenTrainerMon.evolutionData.megaBaseForm) {
                    baseFormMon = pokemonList.find(p => p.id === chosenTrainerMon.evolutionData.megaBaseForm) || chosenTrainerMon;
                    if (foundMega) {
                        chosenTrainerMon = baseFormMon;
                    } else {
                        if (chosenTrainerMon.id === 'SPECIES_RAYQUAZA_MEGA') {
                            megaItem = null;
                            megaMoves.push('MOVE_DRAGON_ASCENT');
                        } else if (chosenTrainerMon.evolutionData.megaItem) {
                            megaItem = itemIdToName(chosenTrainerMon.evolutionData.megaItem);
                        }
                        foundMega = true;
                    }
                }
                if (trainerMonDefinition.id) storedIds[trainerMonDefinition.id] = chosenTrainerMon.id;
                if (baseFormMon.id) storedIds[baseFormMon.id] = chosenTrainerMon.id;

                const effectiveBreedTier = trainerMonDefinition.breedTier || trainer.breedTier || null;
                const pokeId = trainerMonDefinition.id || null;
                const newTeamMember = {
                    pokemon: baseFormMon,
                    item: megaItem || trainerMonDefinition.item || null,
                    nature: trainerMonDefinition.nature || null,
                    moves: megaMoves,
                    breedTier: effectiveBreedTier,
                    pokeId,
                    ivs: generateIVs(effectiveBreedTier, pokeId),
                };

                if (trainerMonDefinition.tryToHaveMove) {
                    trainerMonDefinition.tryToHaveMove.forEach(moveToLearn => {
                        if (canLearnMove(chosenTrainerMon, moveToLearn) && !newTeamMember.moves.includes(moveToLearn)) {
                            newTeamMember.moves.push(moveToLearn);
                        }
                    });
                }

                let validAbilities = [];
                if (trainer.abilities && trainer.abilities.length > 0) {
                    validAbilities = [...validAbilities, ...chosenTrainerMon.parsedAbilities.filter(a => trainer.abilities.includes(a))];
                }
                if (trainerMonDefinition.abilities) {
                    validAbilities = [...validAbilities, ...chosenTrainerMon.parsedAbilities.filter(a => trainerMonDefinition.abilities.includes(a))];
                }
                let ability = null;
                if (validAbilities.length > 0) {
                    ability = sample(validAbilities);
                    let abilityIndex = chosenTrainerMon.parsedAbilities.indexOf(ability);
                    let originalAbility = baseFormMon.parsedAbilities[abilityIndex];
                    if (originalAbility === 'NONE') { abilityIndex = 0; originalAbility = baseFormMon.parsedAbilities[0]; }
                    newTeamMember.ability = originalAbility;
                } else {
                    validAbilities = [...chosenTrainerMon.parsedAbilities];
                    if (trainer.level < 28) {
                        validAbilities = validAbilities.slice(0, 2);
                    }
                    validAbilities = validAbilities.filter(a => Boolean(a) && a !== 'NONE').sort((a, b) => {
                        if (trainer.level < 28) return rng.random() - 0.5;
                        const abilityA = abilities[`ABILITY_${a}`];
                        const abilityB = abilities[`ABILITY_${b}`];
                        const ratingA = abilityA?.rating * (1 + (rng.random() * GENERIC_DEVIATION * 2 - GENERIC_DEVIATION));
                        const ratingB = abilityB?.rating * (1 + (rng.random() * GENERIC_DEVIATION * 2 - GENERIC_DEVIATION));
                        return ratingB - ratingA;
                    });
                    if (!validAbilities) throw new Error(`WARN: No valid abilities found for ${chosenTrainerMon.id} in trainer ${trainer.id}.`);
                    ability = validAbilities[0];
                    let abilityIndex = chosenTrainerMon.parsedAbilities.indexOf(ability);
                    let originalAbility = baseFormMon.parsedAbilities[abilityIndex];
                    if (originalAbility === 'NONE') { abilityIndex = 0; originalAbility = baseFormMon.parsedAbilities[0]; }
                    newTeamMember.ability = originalAbility;
                }

                let { moveset, tmsUsed } = chooseMoveset(
                    chosenTrainerMon, moves, trainer.level,
                    newTeamMember.moves, ability, newTeamMember.item, trainer.tms || [], 0.1,
                );
                tmsUsed.forEach(tmUsed => {
                    if (trainer.tms && trainer.tms.includes(tmUsed)) trainer.tms.splice(trainer.tms.indexOf(tmUsed), 1);
                });

                if (!newTeamMember.item && trainer.bag && trainer.bag.length > 0) {
                    const movesetObjects = moveset.map(m => moves[m]);
                    const sortedBagItems = trainer.bag
                        .map(bagItemId => ({
                            id: bagItemId,
                            rating: rateItemForAPokemon(bagItemId, chosenTrainerMon, ability, movesetObjects, trainer.level, trainer.bag.length, trainer.bannedItems || [], GENERIC_DEVIATION),
                        }))
                        .filter(bi => bi.rating > 0)
                        .sort((a, b) => b.rating - a.rating)
                        .map(bi => bi.id);
                    if (sortedBagItems.length > 0) {
                        newTeamMember.item = sortedBagItems[0];
                        trainer.bag.splice(trainer.bag.indexOf(newTeamMember.item), 1);
                    }
                }

                if (!newTeamMember.nature) {
                    if (trainer.level < 28) {
                        newTeamMember.nature = sample(Object.values(NATURES)).name;
                    } else {
                        newTeamMember.nature = chooseNature(chosenTrainerMon, moveset, moves, ability, newTeamMember.item, GENERIC_DEVIATION);
                    }
                }

                if (newTeamMember.item) {
                    moveset = adjustMoveset(chosenTrainerMon, trainer.level, moveset, newTeamMember.moves, moves, ability, newTeamMember.item, 0.1);
                }
                newTeamMember.moves = moveset;
                team.push(newTeamMember);
            }
        });

        trainersResults[trainer.id] = {
            level: trainer.level,
            class: trainer.class || 'Red Back',
            reward: (trainer.reward || []).map(r => {
                if (r.startsWith('SPECIES_')) return nameify(replacementLog[r].replace('SPECIES_', ''));
                if (r.startsWith('ITEM_')) return itemIdToName(megaReplacementLog[r]);
                if (r.startsWith('TM_')) return 'TM ' + nameify(r.replace('TM_', ''));
                if (r.startsWith('GYM_REWARD_')) return pokeRewardReplacements[parseInt(r.replace('GYM_REWARD_', '')) - 1].name;
                return r;
            }) || [],
            isBoss: trainer.isBoss || false,
            isPartner: trainer.isPartner || false,
            team,
            preventShuffle: trainer.preventShuffle || false,
        };
    });

    // Build trainersResultsSimplified (pokemon object → pokemon.id)
    const trainersResultsSimplified = {};
    Object.entries(trainersResults).forEach(([trainerId, trainerData]) => {
        trainersResultsSimplified[trainerId] = {
            ...trainerData,
            team: trainerData.team.map(teamEntry => ({
                ...teamEntry,
                pokemon: teamEntry.pokemon.id,
            })),
        };
    });

    // Build wildPokes map (same as writer.js lines 1285-1361)
    const maps = wild.maps.map(({ id, ...keys }) => {
        const result = { id };
        Object.entries(keys).forEach(([key, value]) => {
            if (value !== undefined) result[key] = replacementLog[value];
        });
        return result;
    });

    maps.unshift({
        id: 'STARTER_EXTRA',
        ...extraStarters.reduce((acc, id, index) => {
            acc[`special${index + 1}`] = id;
            return acc;
        }, {}),
    });
    maps.unshift({
        id: 'STARTERS',
        special1: starters[0],
        special2: starters[1],
        special3: starters[2],
    });

    const extractMap = (id, extra = {}) => {
        const idx = maps.findIndex(m => m.id === id);
        return idx !== -1 ? Object.assign(maps.splice(idx, 1)[0], extra) : null;
    };
    const desertRuinsEntry = extractMap('MAP_DESERT_RUINS',   { label: 'Desert Ruins',   staticEncounter: true });
    const islandCaveEntry  = extractMap('MAP_ISLAND_CAVE',    { label: 'Island Cave',    staticEncounter: true });
    const newMauvilleEntry = extractMap('MAP_NEW_MAUVILLE',   { label: 'New Mauville',   staticEncounter: true });
    const ancientTombEntry = extractMap('MAP_ANCIENT_TOMB',   { label: 'Ancient Tomb',   staticEncounter: true });
    const skyPillarEntry   = extractMap('MAP_SKY_PILLAR_TOP', { label: 'Sky Pillar Top', legendaryEncounter: true });
    const route123Entry    = extractMap('MAP_ROUTE123');

    const insertions = [
        { afterMap: 'MAP_ROUTE116', entry: { id: 'BOSS_ROXANNE_REWARD',          label: 'Roxanne Reward',          boss: true, special1: pokeRewardReplacements[0].id } },
        { afterMap: 'MAP_ROUTE106', entry: { id: 'BOSS_BRAWLY_REWARD',           label: 'Brawly Reward',           boss: true, special1: pokeRewardReplacements[1].id } },
        { afterMap: 'MAP_ROUTE109', entry: { id: 'BOSS_SLATEPORT_GRUNTS_REWARD', label: 'Slateport Grunts Reward', boss: true, special1: pokeRewardReplacements[8].id } },
        { afterMap: 'MAP_ROUTE118', entry: { id: 'BOSS_WATTSON_REWARD',          label: 'Wattson Reward',          boss: true, special1: pokeRewardReplacements[2].id } },
        { afterMap: 'MAP_ROUTE114', entry: islandCaveEntry },
        { afterMap: 'MAP_ROUTE114', entry: { id: 'BOSS_NORMAN_REWARD',           label: 'Norman Reward',           boss: true, special1: pokeRewardReplacements[4].id } },
        { afterMap: 'MAP_ROUTE114', entry: desertRuinsEntry },
        { afterMap: 'MAP_ROUTE114', entry: { id: 'BOSS_FLANNERY_REWARD',         label: 'Flannery Reward',         boss: true, special1: pokeRewardReplacements[3].id } },
        { afterMap: 'MAP_ISLAND_CAVE', entry: newMauvilleEntry },
        { afterMap: 'MAP_ROUTE119', entry: { id: 'BOSS_SHELLY_REWARD',           label: 'Shelly Reward',           boss: true, special1: pokeRewardReplacements[9].id } },
        { afterMap: 'MAP_ROUTE120', entry: ancientTombEntry },
        { afterMap: 'MAP_ROUTE120', entry: { id: 'BOSS_WINONA_REWARD',           label: 'Winona Reward',           boss: true, special1: pokeRewardReplacements[5].id } },
        { afterMap: 'MAP_ROUTE121', entry: { id: 'BOSS_WALLY_LILYCOVE',          label: 'Wally Lilycove Reward',   boss: true, special1: pokeRewardReplacements[10].id } },
        { afterMap: 'MAP_ROUTE124', entry: { id: 'BOSS_TATE_LIZA_REWARD',        label: 'Tate & Liza Reward',      boss: true, special1: pokeRewardReplacements[6].id } },
        { afterMap: 'MAP_ROUTE129', entry: route123Entry },
        { afterMap: 'MAP_ROUTE129', entry: { id: 'BOSS_JUAN_REWARD',             label: 'Juan Reward',             boss: true, special1: pokeRewardReplacements[7].id } },
        { afterMap: 'MAP_ROUTE129', entry: skyPillarEntry },
    ];
    for (const { afterMap, entry } of insertions) {
        const idx = maps.findIndex(m => m.id === afterMap);
        if (idx !== -1) maps.splice(idx + 1, 0, entry);
        else maps.push(entry);
    }

    return { trainersResultsSimplified, wildPokes: maps };
}

module.exports = { writerDocs };
