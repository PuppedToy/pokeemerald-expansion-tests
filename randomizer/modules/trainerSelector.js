'use strict';

const {
    EVO_TYPE_LC, EVO_TYPE_NFE, EVO_TYPE_SOLO, EVO_TYPE_FINAL,
    TRAINER_POKE_ENCOUNTER,
    TRAINER_POKE_STARTER_TREECKO, TRAINER_POKE_STARTER_TORCHIC, TRAINER_POKE_STARTER_MUDKIP,
    TRAINER_REPEAT_ID, TRAINER_POKE_MEGA_FROM_STONE,
    TRAINER_RESTRICTION_NO_REPEATED_TYPE,
    TRAINER_RESTRICTION_ALLOW_ONLY_TYPES,
    TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES,
} = require('../constants');
const { TIER_SEQ } = require('../constants');
const { sample, checkValidEvo, getFamilyGroup, hasValidMega, devolveToLevel } = require('./utils');
// T-142 — the doubles support tier-flex + hard-pick use the support detector (the "wants support" signal
// is the up-front roll in resolveTrainerTeam → context.doublesWantsSupport, read here).
const { DETECTORS } = require('./featureDetectors');

function tiersUpTo(maxTier) {
    const idx = TIER_SEQ.indexOf(maxTier);
    return idx === -1 ? [maxTier] : TIER_SEQ.slice(0, idx + 1);
}
// The tiers exactly ONE step below each tier in `tiers` (TIER_SEQ is weakest→strongest, so one-below =
// index-1). Used to admit a slightly-weaker dedicated support onto a high-tier doubles team (T-142 r2).
function tiersOneBelow(tiers) {
    const out = [];
    for (const t of tiers) { const i = TIER_SEQ.indexOf(t); if (i > 0) out.push(TIER_SEQ[i - 1]); }
    return out;
}

const LEVEL_CAPS = [5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35, 38, 40, 43, 46, 50, 55, 60, 65, 70];

function nearestCap(level) {
    let best = LEVEL_CAPS[0];
    for (const cap of LEVEL_CAPS) {
        if (cap <= level) best = cap;
        else break;
    }
    return best;
}

function isValidEvolution(level, { param, method }) {
    return (!isNaN(parseInt(param)) && parseInt(param) <= level && parseInt(param) > 4)
        || ((method === 'ITEM' || param === '0') && level > 28);
}

/**
 * Creates a choosePokemonFromDefinition function bound to a trainer + mutable context.
 * The context object is read by reference on each call so callers can update team/foundMega
 * between slots.
 *
 * @param {object[]} pokemonList - filtered pokemon pool
 * @param {object}   trainer     - trainer object (.level, .restrictions, etc.)
 * @param {object}   context     - mutable { team, foundMega, storedIds }
 * @param {object}   opts        - { starters, staticRewards, replacementLog, megaReplacementLog, isSuperEffective }
 * @returns {function} choosePokemonFromDefinition(def) => pokemon|undefined
 */
function createChooser(pokemonList, trainer, context, opts = {}) {
    const {
        starters = [null, null, null],
        staticRewards = {},
        replacementLog = {},
        megaReplacementLog = {},
        isSuperEffective = () => false,
        // T-107 (107c) — how to pick among tier-valid, family-deduped candidates for a NON-pickBest
        // slot. Defaults to a uniform sample (today's behaviour); the engine injects an archetype-
        // biased picker that degrades to this same sample at low sophistication / no identity.
        pickCandidate = (list) => sample(list),
        model = null,          // T-142 r2 — the archetype model, for the doubles support tier-flex
        moves = {},            // detector ctx (support detection reads move metadata via ctx.moves)
    } = opts;

    const canLearnMove = (pokemon, moveToLearn) =>
        (pokemon.teachables && pokemon.teachables.includes(moveToLearn)) ||
        (pokemon.learnset && pokemon.learnset.some(lu => lu.move === moveToLearn && lu.level <= trainer.level));

    const canLearnAnyOfMoves = (pokemon, movesToLearn) =>
        movesToLearn.some(m => canLearnMove(pokemon, m));

    const tryEvolve = (pokemon, tryMega) => {
        let current = { ...pokemon };
        let possibleEvolutions;
        do {
            if (!current.evolutions || current.evolutions.length === 0) break;
            possibleEvolutions = current.evolutions.filter((evo) => {
                if (current.isFinal) return false;
                if (tryMega) {
                    const megaForms = pokemonList.filter(p => p.evolutionData.megaBaseForm && p.evolutionData.megaBaseForm === evo.pokemon);
                    if (megaForms.length) return true;
                    let i = 1;
                    do {
                        if (!current.evolutions || current.evolutions.length === 0) return false;
                        for (let j = 0; j < current.evolutions.length; j++) {
                            const evolvedForm = pokemonList.find(p => p.id === current.evolutions[j].pokemon);
                            if (!evolvedForm) continue;
                            if (pokemonList.filter(p => p.evolutionData.megaBaseForm && p.evolutionData.megaBaseForm === evolvedForm.id).length > 0) return true;
                        }
                        if (current.evolutions.length > 0) {
                            const randomEvo = sample(current.evolutions);
                            const randomEvolvedForm = pokemonList.find(p => p.id === randomEvo.pokemon);
                            if (randomEvolvedForm) { current = randomEvolvedForm; continue; }
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
                    if (evolvedForm) current = evolvedForm;
                }
                if (!evolvedForm) break;
            }
        } while (possibleEvolutions.length > 0);
        return current;
    };

    // T-142 r3 — does the team still want a dedicated support? Driven by the up-front doubles plan
    // (context.doublesWantsSupport, rolled in resolveTrainerTeam) — NOT the late-emerging identity. Secure
    // exactly ONE; a favourite ace doesn't count toward the quota. Returns 1 (wants one, has none) or 0.
    function dedicatedSupportNeed(team) {
        if (!context.doublesWantsSupport) return 0;
        const have = (team || []).filter(m => !m.__favourite && DETECTORS.dedicatedSupport((m && m.pokemon) || m)).length;
        return have >= 1 ? 0 : 1;
    }

    function choosePokemonFromDefinition(trainerMonDefinition) {
        const { team, foundMega, storedIds } = context;
        // T-109 — a DOUBLES trainer's power budget is measured on the doubles tier scale (poke.tierDoubles /
        // poke.ratingDoubles, T-097). CONTEXTUAL-tier slots stay on singles until T-111 adds
        // contextualRatingsDoubles. Singles trainers are byte-identical (doublesFmt=false → the singles reads).
        const doublesFmt = /double/i.test(trainer.battleType || '');
        const pokeTier = p => (doublesFmt && p.tierDoubles) ? p.tierDoubles : p.rating.tier;
        const pokeAbs  = p => (doublesFmt && typeof p.ratingDoubles === 'number') ? p.ratingDoubles : p.rating.absoluteRating;
        const pokeCtx  = (p, cap) => (doublesFmt && p.contextualRatingsDoubles) ? p.contextualRatingsDoubles[cap] : p.contextualRatings?.[cap]; // T-111
        let pokemonStrictList = [];
        let pokemonLooseList = [];
        let chosenTrainerMon;
        let isEncounterPool = false;

        if (trainerMonDefinition.oneOf) {
            // filter(Boolean): a named species absent from this run's pool (e.g. a mega gated out of a
            // favourite matcher) drops out instead of leaving an undefined that the filters would crash on.
            pokemonLooseList = trainerMonDefinition.oneOf.map(p => pokemonList.find(pl => pl.id === p)).filter(Boolean);
        } else if (trainerMonDefinition.specific) {
            const specificPokemon = pokemonList.find(p => p.id === trainerMonDefinition.specific);
            if (specificPokemon) pokemonStrictList = [specificPokemon];
        } else if (trainerMonDefinition.specificIfTier) {
            const specificPokemon = pokemonList.find(p => p.id === trainerMonDefinition.specificIfTier);
            let qualifies = false;
            if (specificPokemon && trainerMonDefinition.contextualTier) {
                const cap = nearestCap(trainer.level);
                const contextual = pokeCtx(specificPokemon, cap);
                qualifies = !!(contextual
                    && trainerMonDefinition.contextualTier.includes(contextual.tier)
                    && TIER_SEQ.indexOf(pokeTier(specificPokemon)) <= TIER_SEQ.indexOf(contextual.tier));
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
            isEncounterPool = true;
        } else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_TREECKO) {
            pokemonStrictList = [pokemonList.find(p => p.id === starters[1])];
        } else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_TORCHIC) {
            pokemonStrictList = [pokemonList.find(p => p.id === starters[2])];
        } else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_MUDKIP) {
            pokemonStrictList = [pokemonList.find(p => p.id === starters[0])];
        } else if (trainerMonDefinition.special === 'PLAYER_LEGEND_TREECKO') {
            pokemonStrictList = [staticRewards.legend1];
        } else if (trainerMonDefinition.special === 'PLAYER_LEGEND_TORCHIC') {
            pokemonStrictList = [staticRewards.legend2];
        } else if (trainerMonDefinition.special === 'PLAYER_LEGEND_MUDKIP') {
            pokemonStrictList = [staticRewards.legend3];
        } else if (trainerMonDefinition.special === TRAINER_REPEAT_ID) {
            const repeatedId = storedIds[trainerMonDefinition.id];
            if (repeatedId) {
                let repeatedPokemon = pokemonList.find(p => p.id === repeatedId);
                // T-106 — reverse-order continuity: an EARLIER appearance repeats the authoritative
                // (later) roster DEVOLVED to the most-evolved form legal at this level (Champion
                // Metagross → Granite-Cave Metang), instead of the forward tryEvolve of the old model.
                if (repeatedPokemon && trainerMonDefinition.devolveToLevel) {
                    repeatedPokemon = devolveToLevel(pokemonList, repeatedPokemon, trainer.level);
                }
                if (repeatedPokemon) pokemonStrictList = [repeatedPokemon];
            }
        } else if (trainerMonDefinition.special === TRAINER_POKE_MEGA_FROM_STONE) {
            const megaStone = megaReplacementLog[trainerMonDefinition.megaStone];
            const mega = pokemonList.filter(p => p.evolutionData.megaItem === megaStone);
            if (mega.length === 1) pokemonStrictList = mega;
        } else {
            pokemonLooseList = [...pokemonList];
        }

        // General filters on the loose list
        if (trainerMonDefinition.isMega) {
            pokemonLooseList = pokemonLooseList.filter(p => p.evolutionData.isMega);
        } else {
            pokemonLooseList = pokemonLooseList.filter(p => !p.evolutionData.isMega);
        }
        if (trainerMonDefinition.absoluteTier) {
            const before = pokemonLooseList;
            let inTier = before.filter(p => trainerMonDefinition.absoluteTier.includes(pokeTier(p)));
            // T-142 r2 — doubles support tier-flex (owner-validated): doubles support mons are intentionally
            // a tier below the attackers they enable (a UU/OU support on an Ubers team). If the team STILL
            // wants a dedicated support (identity's dedicatedSupport min unmet) and none is in-tier, admit
            // dedicatedSupport mons from exactly ONE tier down — they still pass the later type/restriction
            // filters. Only the FIRST support is flexed in (min, not max); a 2nd out-of-budget support is
            // left to drop. Singles unaffected (doublesFmt=false).
            if (doublesFmt && dedicatedSupportNeed(team) > 0 && !inTier.some(p => DETECTORS.dedicatedSupport(p))) {
                const oneDown = tiersOneBelow(trainerMonDefinition.absoluteTier);
                const flexed = before.filter(p => oneDown.includes(pokeTier(p)) && DETECTORS.dedicatedSupport(p));
                if (flexed.length) { inTier = inTier.concat(flexed); context.supportFlexed = true; }
            }
            pokemonLooseList = inTier;
        }
        if (trainerMonDefinition.maxBaseTier) {
            const allowedBaseTiers = tiersUpTo(trainerMonDefinition.maxBaseTier);
            pokemonLooseList = pokemonLooseList.filter(p => {
                const baseFormId = p.evolutionData?.megaBaseForm;
                if (!baseFormId) return false;
                const baseForm = pokemonList.find(b => b.id === baseFormId);
                return baseForm && allowedBaseTiers.includes(pokeTier(baseForm));
            });
        }
        if (trainerMonDefinition.contextualTier) {
            const cap = nearestCap(trainer.level);
            pokemonLooseList = pokemonLooseList.filter(p => {
                const contextual = pokeCtx(p, cap);
                return contextual
                    && trainerMonDefinition.contextualTier.includes(contextual.tier)
                    && TIER_SEQ.indexOf(pokeTier(p)) <= TIER_SEQ.indexOf(contextual.tier);
            });
        }
        if (trainerMonDefinition.evoType) {
            pokemonLooseList = pokemonLooseList.filter(p => {
                let result = false;
                trainerMonDefinition.evoType.forEach(evoType => {
                    if (evoType === EVO_TYPE_LC)         result = result || p.evolutionData.isLC;
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
        // Only pre-filter the random pool to mega-capable pokemon when filling a tryMega slot.
        // Skip for encounter slots — the pokemon is fixed by game-world logic; the post-selection
        // block will mega-evolve it if possible, and gracefully skip mega if not.
        if (trainerMonDefinition.tryMega && !foundMega && !isEncounterPool) {
            pokemonLooseList = pokemonLooseList.filter(hasValidMega);
        }
        if (trainerMonDefinition.tryEvolve) {
            pokemonLooseList = pokemonLooseList.map(p => tryEvolve(p, trainerMonDefinition.tryMega && !foundMega));
            pokemonStrictList = pokemonStrictList.map(p => tryEvolve(p, trainerMonDefinition.tryMega && !foundMega));
        }

        // Trainer restrictions (type / ability / no-repeat) reduce the loose pool FIRST, so they are
        // enforced by BOTH the main pick below AND the family-relaxation fallback (B-028: they were
        // previously applied only to the family-deduped list, so an empty type-filtered pool fell through
        // to the RAW pool and picked an off-type mon — a Rock gym could field a non-Rock mon).
        (trainer.restrictions || []).forEach(restriction => {
            if (restriction === TRAINER_RESTRICTION_NO_REPEATED_TYPE) {
                // B-027 — team members are { pokemon, ... } wrappers; read parsedTypes off `.pokemon`
                // (was `p.parsedTypes` on the wrapper → always undefined → the restriction never fired).
                const selectedTypes = new Set(team.map(p => (p.pokemon || p).parsedTypes || []).flat());
                pokemonLooseList = pokemonLooseList.filter(p => !p.parsedTypes.some(t => selectedTypes.has(t)));
            } else if (restriction === TRAINER_RESTRICTION_ALLOW_ONLY_TYPES && trainer.types) {
                pokemonLooseList = pokemonLooseList.filter(p => p.parsedTypes.some(t => trainer.types.includes(t)));
            } else if (restriction === TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES && trainer.abilities) {
                pokemonLooseList = pokemonLooseList.filter(p => p.parsedAbilities.some(a => trainer.abilities.includes(a)));
            }
        });

        // Family-based dedup
        if (pokemonLooseList.length > 0) {
            const familyDedup = (loosePokemon) => {
                const candidateFamily = getFamilyGroup(loosePokemon.family);
                const candidateBase   = loosePokemon.evolutionData?.megaBaseForm || loosePokemon.id;
                return !team.find(teamPokemon => {
                    if (getFamilyGroup(teamPokemon.pokemon.family) === candidateFamily) return true;
                    if (teamPokemon.pokemon.id === candidateBase) return true;
                    return false;
                });
            };
            pokemonStrictList = [...pokemonStrictList, ...pokemonLooseList.filter(familyDedup)];
        }

        const getRatingForSort = (poke) => {
            if (trainerMonDefinition.contextualTier) {
                const cap = nearestCap(trainer.level);
                return pokeCtx(poke, cap)?.absoluteRating ?? pokeAbs(poke); // T-109/T-111 — doubles: contextual doubles
            }
            return pokeAbs(poke); // T-109 — doubles trainers sort their absoluteTier picks by ratingDoubles
        };

        if (pokemonStrictList.length > 0) {
            chosenTrainerMon = trainerMonDefinition.pickBest
                ? pokemonStrictList.sort((a, b) => getRatingForSort(b) - getRatingForSort(a))[0]
                : pickCandidate(pokemonStrictList);
        } else if (pokemonLooseList.length > 0) {
            // Strict list was empty (all candidates had the same family as someone on the team).
            // Apply family dedup again here; only repeat a family if truly no other option remains.
            const familyFiltered = pokemonLooseList.filter(loosePokemon => {
                const candidateFamily = getFamilyGroup(loosePokemon.family);
                const candidateBase   = loosePokemon.evolutionData?.megaBaseForm || loosePokemon.id;
                return !team.find(teamPokemon => {
                    if (getFamilyGroup(teamPokemon.pokemon.family) === candidateFamily) return true;
                    if (teamPokemon.pokemon.id === candidateBase) return true;
                    return false;
                });
            });
            if (familyFiltered.length > 0) {
                chosenTrainerMon = trainerMonDefinition.pickBest
                    ? familyFiltered.sort((a, b) => getRatingForSort(b) - getRatingForSort(a))[0]
                    : pickCandidate(familyFiltered);
            }
            // else: all candidates excluded by family dedup — return undefined so
            // selectWithAutoFallback tiers down to find variety.
        }

        return chosenTrainerMon;
    }

    return choosePokemonFromDefinition;
}

module.exports = { createChooser };
