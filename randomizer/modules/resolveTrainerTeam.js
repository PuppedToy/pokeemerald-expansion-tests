'use strict';

// T-104 — the single team-resolution seam.
//
// `writer.js` (legacy no-docs path) and `writerDocs.js` (the production path that builds the
// bundle's docs SSOT) historically carried two ~200-line copies of the same per-trainer team
// resolution loop and had drifted before (see modules/trainerAbility.js:1-13). This module is the
// one home for that loop; both callers now delegate here so they can never diverge again. It is a
// behaviour-preserving extraction of writerDocs.js's loop (the version exercised by the
// cross-ROM determinism gate) — same RNG consumption, same picks, byte-identical team output.
//
// What stays with each caller: the `trainer.copy` handling and the `trainersResults[id]` metadata
// assembly (the meta differs — writerDocs carries `label`/`choiceBattle`, writer carries the
// randomize-mode reward mapping). Only the TEAM is resolved here.
//
// Diagnostics are routed through the injected `diag` sink (T-075). writerDocs passes its real sink;
// writer.js passes none, so it defaults to a no-op — matching that path's non-structured behaviour.

const rng = require('../rng');
const {
    EVO_TYPE_SOLO,
    NATURES,
    GENERIC_DEVIATION,
    PALAFIN_ZERO_ID,
} = require('../constants');
const {
    chooseMoveset,
    adjustMoveset,
    rateItemForAPokemon,
    isSuperEffective,
    chooseNature,
    palafinEffectivePoke,
} = require('../rating.js');
const { sample, canLearnMove, usesStrategicNature } = require('./utils');
const { pickTrainerMonAbility } = require('./trainerAbility');
const { selectWithAutoFallback } = require('./trainerFallback');
const { createChooser } = require('./trainerSelector');
const { makeArchetypePicker } = require('./archetypePicker');
const { planMemberRoleMove } = require('./archetypeRefine');
const { getArchetypeModel } = require('../archetypes');
const { noopDiagnostics, DIAGNOSTIC_CODES } = require('../diagnostics');

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

function djb2Hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0;
    return h;
}

// Moves any `TM_*` entries out of a trainer's bag and into `trainer.tms` (as `MOVE_*`). Mutates the
// trainer in place. Runs for every trainer (including `copy` trainers) exactly as before.
function normalizeTrainerBagTms(trainer) {
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
}

// Builds a resolver bound to one generation run's data. `storedIds` (ID-locked continuity) and the
// per-pokeId IV cache are shared across all trainers of the run, so create ONE resolver before the
// trainers loop and reuse it — exactly as the inlined loops declared these once outside the forEach.
//
// deps (per-run data): pokemonList, moves, abilities, starters, staticRewards, replacementLog,
// megaReplacementLog, baseRngSeed, palafinHero, an optional diag sink, and an optional
// `sophistication(trainer) -> [0,1]` scale (T-105 / ADR-016 §3). The scale defaults to a neutral
// `() => 1`, so team output is unchanged until the T-107 engine gates on `context.sophistication`.
function createTeamResolver(deps) {
    const {
        pokemonList,
        moves,
        abilities,
        starters,
        staticRewards,
        replacementLog,
        megaReplacementLog,
        baseRngSeed,
        palafinHero,
        diag = noopDiagnostics(),
        sophistication = () => 1,
    } = deps;

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

    // Resolves one trainer's full team (array of team members). Does NOT handle `trainer.copy` or
    // build the trainersResults entry — the caller owns those.
    function resolveTrainerTeam(trainer) {
        const team = [];
        // T-105/T-107 — the sophistication weight for this trainer lives on the shared context; the
        // archetype picker consumes it to bias the fill toward the emerged identity and degrades to a
        // plain sample at low sophistication / no identity (early-game byte-identical).
        const context = { team, foundMega: false, storedIds, sophistication: sophistication(trainer) };
        const archetypeModel = getArchetypeModel(/double/i.test(trainer.battleType || '') ? 'doubles' : 'singles');
        const pickCandidate = makeArchetypePicker({ model: archetypeModel, context, ctx: { moves } });
        const choosePokemonFromDefinition = createChooser(pokemonList, trainer, context, {
            starters, staticRewards, replacementLog, megaReplacementLog, isSuperEffective, pickCandidate,
        });
        trainer.team.forEach((trainerMonDefinition, slotIndex) => {
            if (baseRngSeed !== null) {
                const slotSeed = (baseRngSeed ^ Math.imul(djb2Hash(trainer.id + ':' + slotIndex), 0x9E3779B9)) >>> 0;
                rng.seed(slotSeed);
            }
            let { pokemon: chosenTrainerMon, effectiveDef } = selectWithAutoFallback(trainerMonDefinition, choosePokemonFromDefinition) ?? {};
            if (!chosenTrainerMon) {
                // T-075 — the slot found no pokemon after every fallback was exhausted. The slot
                // is dropped (accepted "team of 5" degradation); record it richly so it's auditable.
                diag.error(
                    DIAGNOSTIC_CODES.TRAINER_SLOT_DROPPED,
                    `No pokemon found for trainer ${trainer.id} slot ${slotIndex} — check definition`,
                    {
                        trainerId: trainer.id,
                        trainerName: trainer.label || trainer.id,
                        class: trainer.class || null,
                        level: trainer.level ?? null,
                        slotIndex,
                        definition: trainerMonDefinition,
                    },
                );
                return;
            }

            if (trainerMonDefinition.tryMega) {
                if (
                    (chosenTrainerMon.evolutionData.isFinal || chosenTrainerMon.evolutionData.type === EVO_TYPE_SOLO)
                    && chosenTrainerMon.evolutionData.megaEvos
                    && chosenTrainerMon.evolutionData.megaEvos.length > 0
                    && !context.foundMega
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
                    if (context.foundMega) {
                        chosenTrainerMon = baseFormMon;
                    } else {
                        if (chosenTrainerMon.id === 'SPECIES_RAYQUAZA_MEGA') {
                            megaItem = null;
                            megaMoves.push('MOVE_DRAGON_ASCENT');
                        } else if (chosenTrainerMon.evolutionData.megaItem) {
                            megaItem = itemIdToName(chosenTrainerMon.evolutionData.megaItem);
                        }
                        context.foundMega = true;
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

                if (effectiveDef?.tryToHaveMove) {
                    effectiveDef.tryToHaveMove.forEach(moveToLearn => {
                        if (canLearnMove(chosenTrainerMon, moveToLearn, trainer.level) && !newTeamMember.moves.includes(moveToLearn)) {
                            newTeamMember.moves.push(moveToLearn);
                        }
                    });
                }
                // T-107 (107d) — identity-aware refinement: give this mon the one archetype role move
                // the emerged team identity still needs, as a fixed move so chooseMoveset fits it in
                // (quality preserved). Pure + gated by sophistication → no-op early game.
                const roleMove = planMemberRoleMove({
                    species: chosenTrainerMon,
                    team,
                    model: archetypeModel,
                    ctx: { moves },
                    sophistication: context.sophistication,
                });
                if (roleMove && canLearnMove(chosenTrainerMon, roleMove, trainer.level) && !newTeamMember.moves.includes(roleMove)) {
                    newTeamMember.moves.push(roleMove);
                }

                // T-065: single SSOT helper (fallback-aware — uses effectiveDef.abilities, so a
                // weather-abuser fallback keeps its weather ability instead of a generic one).
                // `ability` (the pick on the chosen/mega form) stays in scope for the downstream
                // moveset/nature/item code below.
                const { ability, originalAbility } = pickTrainerMonAbility({
                    chosenTrainerMon,
                    baseFormMon,
                    trainerAbilities: trainer.abilities,
                    effectiveDef,
                    level: trainer.level,
                    abilities,
                });
                newTeamMember.ability = originalAbility;

                // T-013: this mon's own weather/herb is handled in the rater; here we add the weather
                // EARLIER teammates set (lingering setters only — primals like Desolate Land /
                // Primordial Sea are own-only) plus whether a Power Herb is available (held or in the
                // bag). Drives Solar Beam/Blade, Electro Shot, Weather Ball, Growth, Thunder, Blizzard,
                // Aurora Veil and the Meteor Beam / Geomancy combo.
                const selCtx = {
                    sun:  team.some(m => m.ability === 'DROUGHT' || m.ability === 'ORICHALCUM_PULSE' || (m.moves || []).includes('MOVE_SUNNY_DAY')),
                    rain: team.some(m => m.ability === 'DRIZZLE' || (m.moves || []).includes('MOVE_RAIN_DANCE')),
                    snow: team.some(m => m.ability === 'SNOW_WARNING' || (m.moves || []).includes('MOVE_HAIL') || (m.moves || []).includes('MOVE_SNOWSCAPE')),
                    sand: team.some(m => m.ability === 'SAND_STREAM' || (m.moves || []).includes('MOVE_SANDSTORM')),
                    powerHerb: newTeamMember.item === 'Power Herb' || (trainer.bag || []).includes('Power Herb'),
                };

                // Palafin Zero is placed but battles as Hero — use Hero stats/typing for the
                // stat-based decisions (moveset, item, nature) while keeping the placed species id.
                const battlePoke = (chosenTrainerMon.id === PALAFIN_ZERO_ID && palafinHero)
                    ? palafinEffectivePoke(chosenTrainerMon, palafinHero)
                    : chosenTrainerMon;
                let { moveset, tmsUsed } = chooseMoveset(
                    battlePoke, moves, trainer.level,
                    newTeamMember.moves, ability, newTeamMember.item, trainer.tms || [], 0.1,
                    selCtx,
                );
                tmsUsed.forEach(tmUsed => {
                    if (trainer.tms && trainer.tms.includes(tmUsed)) trainer.tms.splice(trainer.tms.indexOf(tmUsed), 1);
                });

                if (!newTeamMember.item && trainer.bag && trainer.bag.length > 0) {
                    const movesetObjects = moveset.map(m => moves[m]);
                    const sortedBagItems = trainer.bag
                        .map(bagItemId => ({
                            id: bagItemId,
                            rating: rateItemForAPokemon(bagItemId, battlePoke, ability, movesetObjects, trainer.level, trainer.bag.length, trainer.bannedItems || [], GENERIC_DEVIATION),
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
                    if (usesStrategicNature(trainer.level)) {
                        newTeamMember.nature = chooseNature(battlePoke, moveset, moves, ability, newTeamMember.item, GENERIC_DEVIATION);
                    } else {
                        newTeamMember.nature = sample(Object.values(NATURES)).name;
                    }
                }

                if (newTeamMember.item) {
                    moveset = adjustMoveset(battlePoke, trainer.level, moveset, newTeamMember.moves, moves, ability, newTeamMember.item, 0.1, selCtx);
                }
                newTeamMember.moves = moveset;
                team.push(newTeamMember);
            }
        });

        // T-075 — the flagship "team of 5" diagnostic: after resolving every slot, a team
        // that came back shorter than its definition means one or more slots were dropped.
        // One summary event per trainer (the per-slot detail is in TRAINER_SLOT_DROPPED).
        const expectedTeamSize = trainer.team.length;
        if (team.length < expectedTeamSize) {
            diag.warn(
                DIAGNOSTIC_CODES.TRAINER_TEAM_SHORT,
                `Trainer ${trainer.id} team is short: ${team.length}/${expectedTeamSize} slots filled`,
                {
                    trainerId: trainer.id,
                    trainerName: trainer.label || trainer.id,
                    class: trainer.class || null,
                    level: trainer.level ?? null,
                    expected: expectedTeamSize,
                    actual: team.length,
                    dropped: expectedTeamSize - team.length,
                },
            );
        }

        return team;
    }

    return { resolveTrainerTeam, generateIVs, storedIds, sophisticationFor: sophistication };
}

module.exports = { createTeamResolver, normalizeTrainerBagTms };
