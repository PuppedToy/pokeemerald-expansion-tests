'use strict';

const rng = require('./rng');
const wild = require('./wild.js');
const trainers = require('./trainers.js');
const {
    EVO_TYPE_SOLO,
    NATURES,
    GENERIC_DEVIATION,
    MEGA_TRAINERS,
    PALAFIN_ZERO_ID,
    PALAFIN_HERO_ID,
} = require('./constants');
const { chooseMoveset, adjustMoveset, rateItemForAPokemon, isSuperEffective, chooseNature, palafinEffectivePoke } = require('./rating.js');
const { BANNED_SPECIES_FOR_PICKING } = require('./modules/wildModule');
const { sample, canLearnMove, usesStrategicNature, usesStrategicAbility } = require('./modules/utils');
const { pickTrainerMonAbility } = require('./modules/trainerAbility');
const { selectWithAutoFallback } = require('./modules/trainerFallback');
const { createChooser } = require('./modules/trainerSelector');
const { applyLeadLogic } = require('./modules/trainerTeamOrder');
const { typeMainColors } = require('./trainerColors');
const { noopDiagnostics, DIAGNOSTIC_CODES } = require('./diagnostics');

const CONTEXTUAL_TIER_SEQ = ['MAGIKARP', 'ZU', 'PU', 'NU', 'RU', 'UU', 'OU', 'UBERS', 'LEGEND', 'AG'];

function filterByNearestContextualTier(list, requestedTiers, cap) {
    const tryFilter = (tiers) => list.filter(p => {
        const contextual = p.contextualRatings?.[cap];
        return contextual && tiers.includes(contextual.tier);
    });

    const exact = tryFilter(requestedTiers);
    if (exact.length > 0) return exact;

    const indices = requestedTiers.map(t => CONTEXTUAL_TIER_SEQ.indexOf(t)).filter(i => i !== -1);
    if (indices.length === 0) return list;

    const minIdx = Math.min(...indices);
    const maxIdx = Math.max(...indices);

    for (let d = 1; d < CONTEXTUAL_TIER_SEQ.length; d++) {
        if (maxIdx + d < CONTEXTUAL_TIER_SEQ.length) {
            const up = tryFilter([CONTEXTUAL_TIER_SEQ[maxIdx + d]]);
            if (up.length > 0) return up;
        }
        if (minIdx - d >= 0) {
            const down = tryFilter([CONTEXTUAL_TIER_SEQ[minIdx - d]]);
            if (down.length > 0) return down;
        }
    }
    return list;
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

function djb2Hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0;
    return h;
}

// Builds the simplified (pokemon → pokemon.id) trainer map that becomes the bundle's
// single source of truth.
//
// The in-game ordering layer (random shuffle + applyLeadLogic) is ALWAYS applied here
// (unless the trainer is preventShuffle), because the ROM consumes this team verbatim.
// `showExactPositions` only affects the DOCS DISPLAY, not the in-game order:
//   - ON  → docs show the in-game order (no separate displayTeam; viewer uses `team`).
//   - OFF → docs show the pre-shuffle (default) order, carried in `displayTeam`.
function buildTrainersResultsSimplified(trainersResults, { showExactPositions, baseRngSeed }) {
    const simplify = (team) => team.map(teamEntry => ({
        ...teamEntry,
        pokemon: teamEntry.pokemon.id,
    }));

    const result = {};
    Object.entries(trainersResults).forEach(([trainerId, trainerData]) => {
        const preShuffleTeam = trainerData.team;
        let ingameTeam = preShuffleTeam;

        if (!trainerData.preventShuffle) {
            const shuffleSeed = (baseRngSeed ^ Math.imul(djb2Hash(trainerId + ':shuffle'), 0x9E3779B9)) >>> 0;
            rng.seed(shuffleSeed);
            ingameTeam = [...preShuffleTeam].sort(() => rng.random() - 0.5);
            ingameTeam = applyLeadLogic(ingameTeam, () => rng.random());
        }

        const entry = { ...trainerData, team: simplify(ingameTeam) };
        if (!showExactPositions && !trainerData.preventShuffle) {
            entry.displayTeam = simplify(preShuffleTeam);
        }
        result[trainerId] = entry;
    });
    return result;
}

// Pure docs computation — same trainer resolution as writer.js but no file I/O.
// baseRngSeed: when non-null, per-slot RNG reseeding is applied (shared trainer determinism).
async function writerDocs(pokedexArtifact, trainersArtifact, startersArtifact, wildArtifact, baseRngSeed = null, options = {}) {
    const showExactPositions = options.showExactPositions === true;
    // T-075 — structured diagnostics sink. Defaults to a no-op so callers that don't wire
    // one (the ROM-write path, older tests) behave exactly as before.
    const diag = options.diag || noopDiagnostics();
    let { pokes: pokemonList, moves, abilities } = pokedexArtifact;
    const { trainersData: rawTrainersData, itemAssignments } = trainersArtifact;
    const { starters } = startersArtifact;
    const { extraStarters, gymRewards, staticRewards, replacementLog: wildReplacementLog, foundMegaEvos: wildFoundMegaEvos } = wildArtifact;

    // Palafin Hero (battle-only, banned) is the stat/type source for the placed Zero form —
    // capture it before the ban filter strips it from pokemonList.
    const palafinHero = pokemonList.find(poke => poke.id === PALAFIN_HERO_ID);

    pokemonList = pokemonList.filter(poke => !BANNED_SPECIES_FOR_PICKING.includes(poke.id));

    // NOTE: evolution levels are NOT rolled here. They are a property of the pokedex and are
    // chosen exactly once, when the pokedex is created (see randomizer/generate.js → makePokedex),
    // so every ROM's trainer resolution uses the same levels that get serialized into the bundle.
    // Rolling them here (once per ROM, under the per-ROM rng.seed) was B-017: teams resolved
    // against a per-ROM roll while the bundle stored only the last ROM's — producing illegal
    // evolved mons (e.g. a level-15 trainer with a Ludicolo) and divergent shared-trainer teams.

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
                colors: trainer.colors,   // T-044 — copied team, but this trainer's own card colours
                battleType: trainer.battleType || 'singles',   // T-087/ADR-014
            };
            return;
        }

        const team = [];
        const context = { team, foundMega: false, storedIds };
        const choosePokemonFromDefinition = createChooser(pokemonList, trainer, context, {
            starters, staticRewards, replacementLog, megaReplacementLog, isSuperEffective,
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

        trainersResults[trainer.id] = {
            level: trainer.level,
            label: trainer.label || null,
            class: trainer.class || 'Red Back',
            reward: (trainer.reward || []).map(r => {
                if (r.startsWith('SPECIES_')) return nameify((replacementLog[r] || r).replace('SPECIES_', ''));
                if (r.startsWith('ITEM_')) return itemIdToName(megaReplacementLog[r]);
                if (r.startsWith('TM_')) return 'TM ' + nameify(r.replace('TM_', ''));
                if (r.startsWith('GYM_REWARD_')) return pokeRewardReplacements[parseInt(r.replace('GYM_REWARD_', '')) - 1].name;
                return r;
            }) || [],
            isBoss: trainer.isBoss || false,
            isPartner: trainer.isPartner || false,
            location: trainer.location || null,
            colors: trainer.colors,   // T-044 — docs-viewer card colours (SSOT: trainerColors.js)
            team,
            preventShuffle: trainer.preventShuffle || false,
            battleType: trainer.battleType || 'singles',   // T-087/ADR-014
            choiceBattle: trainer.choiceBattle || null,    // T-116 — Run & Bun E4 choice info
        };
    });

    // Build trainersResultsSimplified (pokemon object → pokemon.id). The in-game ordering
    // layer is always applied here; showExactPositions only controls the docs display.
    const trainersResultsSimplified = buildTrainersResultsSimplified(trainersResults, {
        showExactPositions,
        baseRngSeed,
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

    // T-044 — type main colours (move chips) for the browser doc-builder to inject.
    // SSOT is trainerColors.js; both runtimes derive the same values.
    return { trainersResultsSimplified, wildPokes: maps, typeColors: typeMainColors() };
}

module.exports = { writerDocs, filterByNearestContextualTier, buildTrainersResultsSimplified };
