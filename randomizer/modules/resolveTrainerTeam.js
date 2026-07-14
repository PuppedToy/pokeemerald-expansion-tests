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
    TRAINER_REPEAT_ID,
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
const { makeArchetypePicker, BIAS_MIN_SOPH } = require('./archetypePicker');
const { planMemberRoleMove, planMemberAbility, WEATHER_ROCK_BY_SETTER, ELECTRIC_MOVES } = require('./archetypeRefine');
const { getTrainerSeed } = require('./trainerSeeds');
const { resolveFavourites } = require('./favouriteClaim');
const { gimmickHolds, gimmickFallbackChain, ensureMoveSetter, teamWeather, emergentWeatherSubtype, weatherHolds, isWeatherAbuser } = require('./gimmickPlan');
const { WEATHER_REQUIRED_ABUSERS } = require('./weatherConstants');
const { getArchetypeModel } = require('../archetypes');
const { noopTeamAudit, createTeamAudit } = require('../teamAudit');
const { noopDiagnostics, DIAGNOSTIC_CODES } = require('../diagnostics');

const SEED_SOPH_FLOOR = 0.6; // T-126 — min sophistication for a SEEDED trainer, so its identity builds

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
        audit = noopTeamAudit(), // T-117 — decision-trace collector (no-op unless auditing)
    } = deps;

    const storedIds = {};
    const pokeIdIVCache = {};
    // T-132 — the weather each resolved trainer actually established (subtype | null), keyed by id. A tag
    // partner with `abusePartnerWeather` reads its ally's entry to decide what weather to ABUSE (Tabitha
    // Mossdeep follows Maxie's sun). The caller must resolve the ally BEFORE the dependent (see writerDocs).
    const committedWeather = {};

    function generateIVs(breedTier, pokeId, cache = pokeIdIVCache) {
        if (pokeId && cache[pokeId]) return cache[pokeId];
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
        if (pokeId) cache[pokeId] = ivs;
        return ivs;
    }

    // T-132 / ADR-017 — resolve ONE attempt at a gimmick: build the team under `archetypeSeed`, writing
    // ONLY to the passed-in isolated state (`attemptStoredIds`, `attemptIVCache`, `attemptAudit`, and the
    // caller's cloned `trainer` for its mutable `tms`/`bag`). The orchestrator (resolveTrainerTeam) decides
    // whether to COMMIT this attempt or discard it and try the next fallback. `teamDefs` (favourite-claimed
    // pool) is seed-independent and resolved once by the orchestrator.
    function runAttempt(trainer, teamDefs, archetypeSeed, attemptStoredIds, attemptIVCache, attemptAudit) {
        const team = [];
        const storedIds = attemptStoredIds;
        // T-105/T-107 — the sophistication weight lives on the context; the archetype picker biases the fill
        // toward the emerged identity, degrading to a plain sample at low soph / no identity. T-126 — a
        // SEEDED trainer floors soph so it builds its identity regardless of game position.
        const context = {
            team, foundMega: false, storedIds,
            sophistication: archetypeSeed ? Math.max(sophistication(trainer), SEED_SOPH_FLOOR) : sophistication(trainer),
            archetypeSeed,
            weatherPicks: [], // T-135 — the picker records each abuser slot's ranking here, for the audit log
        };
        const archetypeModel = getArchetypeModel(/double/i.test(trainer.battleType || '') ? 'doubles' : 'singles');
        const pickCandidate = makeArchetypePicker({ model: archetypeModel, context, ctx: { moves } });
        attemptAudit.beginTeam({
            trainerId: trainer.id, label: trainer.label || null, class: trainer.class || null,
            level: trainer.level, battleType: trainer.battleType || 'singles',
            sophistication: context.sophistication, seed: context.archetypeSeed,
        });
        const choosePokemonFromDefinition = createChooser(pokemonList, trainer, context, {
            starters, staticRewards, replacementLog, megaReplacementLog, isSuperEffective, pickCandidate,
        });
        teamDefs.forEach((trainerMonDefinition, slotIndex) => {
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
                // T-106 — only AUTHORITATIVE slots write the continuity channel; a REPEAT_ID slot is a
                // pure CONSUMER (it reuses a stored mon, possibly devolved). Re-storing its devolved form
                // would corrupt the source for a later, higher-level echo (Granite-Cave lvl-22 Metang
                // overwriting the Champion's Metagross before the lvl-59 partner reads it).
                if (trainerMonDefinition.special !== TRAINER_REPEAT_ID) {
                    if (trainerMonDefinition.id) storedIds[trainerMonDefinition.id] = chosenTrainerMon.id;
                    if (baseFormMon.id) storedIds[baseFormMon.id] = chosenTrainerMon.id;
                }

                const effectiveBreedTier = trainerMonDefinition.breedTier || trainer.breedTier || null;
                const pokeId = trainerMonDefinition.id || null;
                const newTeamMember = {
                    pokemon: baseFormMon,
                    // Prefer the WINNING def's item/nature (effectiveDef) over the top-level slot's, so a
                    // fallback rung that carries its own item/nature keeps them (T-128 — a favourite chain
                    // built as a slot + fallback: Solgaleo→Room Service, its Solrock fallback→Light Clay).
                    // Identical to before whenever no fallback fired (effectiveDef === the slot) or the
                    // winning rung sets neither field.
                    item: megaItem || (effectiveDef && effectiveDef.item) || trainerMonDefinition.item || null,
                    nature: (effectiveDef && effectiveDef.nature) || trainerMonDefinition.nature || null,
                    moves: megaMoves,
                    breedTier: effectiveBreedTier,
                    pokeId,
                    ivs: generateIVs(effectiveBreedTier, pokeId, attemptIVCache),
                    // T-135 — a FORCED pick (the favourite ace) shouldn't consume the "pick 2 good ranked
                    // abusers" budget; the picker excludes it from the abuser-slot count.
                    __favourite: !!(trainerMonDefinition && trainerMonDefinition.__favourite),
                };

                // B-030 — a move INJECTED beyond chooseMoveset's own (already TM-gated) selection must
                // still respect the incremental bag: a teachable-only move is allowed only if the trainer
                // currently holds that TM (trainer.tms). Level-up moves reachable at the trainer's level are
                // always fine. Without this, a def's tryToHaveMove or an archetype role move (e.g.
                // pivotUser → Volt Switch) could teach a TM the player hasn't had access to yet.
                const injectableMove = move =>
                    (chosenTrainerMon.learnset || []).some(lu => lu.move === move && lu.level <= trainer.level)
                    || ((chosenTrainerMon.teachables || []).includes(move) && (trainer.tms || []).includes(move));

                if (effectiveDef?.tryToHaveMove) {
                    effectiveDef.tryToHaveMove.forEach(moveToLearn => {
                        if (injectableMove(moveToLearn) && !newTeamMember.moves.includes(moveToLearn)) {
                            newTeamMember.moves.push(moveToLearn);
                        }
                    });
                }
                // T-107 (107d) — identity-aware refinement: give this mon the one archetype role move
                // the emerged team identity still needs, as a fixed move so chooseMoveset fits it in
                // (quality preserved). Pure + gated by sophistication → no-op early game. The role planner
                // is passed the trainer's accessible TMs + level so it only offers reachable moves (B-030).
                const roleMove = planMemberRoleMove({
                    species: chosenTrainerMon,
                    team,
                    model: archetypeModel,
                    ctx: { moves, tms: trainer.tms || [], level: trainer.level },
                    sophistication: context.sophistication,
                    seed: context.archetypeSeed,
                });
                if (roleMove && injectableMove(roleMove) && !newTeamMember.moves.includes(roleMove)) {
                    newTeamMember.moves.push(roleMove);
                }
                // T-124 (Wattson) — electric terrain: every mon prefers an electric attacking move.
                if (context.archetypeSeed && context.archetypeSeed.electricTerrain) {
                    const em = ELECTRIC_MOVES.find(mv => canLearnMove(chosenTrainerMon, mv, trainer.level) && !newTeamMember.moves.includes(mv));
                    if (em) newTeamMember.moves.push(em);
                }

                // T-065: single SSOT helper (fallback-aware — uses effectiveDef.abilities, so a
                // weather-abuser fallback keeps its weather ability instead of a generic one).
                // `ability` (the pick on the chosen/mega form) stays in scope for the downstream
                // moveset/nature/item code below.
                // T-132 (owner) — on a weather attempt, the ability picker is WEATHER-AWARE: an off-weather
                // ability scores 0 (a Drizzle mon never sets rain on a snow team; a Swift Swimmer isn't
                // "used" on a sand team) and the ACTIVE weather's ability is preferred (Leaf Guard in sun).
                const wxAbilitySubtype = context.archetypeSeed && (context.archetypeSeed.gimmicks || []).includes('weather')
                    ? context.archetypeSeed.weather || null : null;
                const { ability, originalAbility } = pickTrainerMonAbility({
                    chosenTrainerMon,
                    baseFormMon,
                    trainerAbilities: trainer.abilities,
                    effectiveDef,
                    level: trainer.level,
                    abilities,
                    // T-124 — identity-aware: a weather-crystallised team's setter gets the weather ability
                    // and its abusers the matching one (rain→Swift Swim, …), so the gimmick is real.
                    preferredAbilities: planMemberAbility({
                        species: chosenTrainerMon, team, model: archetypeModel,
                        ctx: { moves }, sophistication: context.sophistication, seed: context.archetypeSeed,
                    }),
                    weatherSubtype: wxAbilitySubtype,
                });
                newTeamMember.ability = originalAbility;

                // T-125 — a weather setter holds the rock that extends its weather (Damp/Heat/Smooth/Icy).
                // Soph-gated so early-game is byte-identical; only fills an empty item slot.
                if (!newTeamMember.item && context.sophistication >= BIAS_MIN_SOPH && WEATHER_ROCK_BY_SETTER[ability]) {
                    newTeamMember.item = itemIdToName(WEATHER_ROCK_BY_SETTER[ability]);
                }
                // T-125 (Wattson) — Electric Seed on a defensive mon (Def boost on entry in electric terrain).
                if (!newTeamMember.item && context.sophistication >= BIAS_MIN_SOPH
                    && context.archetypeSeed && context.archetypeSeed.electricTerrain
                    && (chosenTrainerMon.baseHP + chosenTrainerMon.baseDefense + chosenTrainerMon.baseSpDefense) >= 285
                    && Math.max(chosenTrainerMon.baseAttack || 0, chosenTrainerMon.baseSpAttack || 0) <= 95) {
                    newTeamMember.item = itemIdToName('ITEM_ELECTRIC_SEED');
                }
                // T-124 — Room Service on a fast mon in a Trick Room team (its Speed drops when TR is set).
                if (!newTeamMember.item && context.sophistication >= BIAS_MIN_SOPH
                    && context.archetypeSeed && (context.archetypeSeed.gimmicks || []).includes('trick_room')
                    && (chosenTrainerMon.baseSpeed || 0) > 60) {
                    newTeamMember.item = itemIdToName('ITEM_ROOM_SERVICE');
                }

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
                // T-132 — under a tentative weather tag (a weather-seeded/crystallised attempt), build every
                // member AS IF the weather is already up, even before the setter lands. The setter is often
                // picked LATER than its abusers (setters live in the high-tier slots), so without this the
                // early abusers see no weather and the rater never surfaces their synergy moves (Blizzard/
                // Aurora Veil/Weather Ball/Solar Beam/Thunder) — which is the ONLY abuser path snow & sand
                // have (no boosted-STAB, per docs/research/weather.md). The attempt is discarded anyway if no
                // setter ultimately materialises, so assuming the tag is safe. Soph-gated → early game intact.
                const taggedWeather = context.sophistication >= BIAS_MIN_SOPH
                    && context.archetypeSeed && (context.archetypeSeed.gimmicks || []).includes('weather')
                    && context.archetypeSeed.weather;
                if (taggedWeather) selCtx[taggedWeather] = true;

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
                attemptAudit.recordSlot({
                    priorTeam: team, chosenMon: chosenTrainerMon, member: newTeamMember, roleMove,
                    model: archetypeModel, ctx: { moves }, seed: context.archetypeSeed,
                    // T-106/T-117 — provenance for the backwards-continuity audit: the slot def + the
                    // authoritative species stored under its id (so the log can show inherited-by-ID and
                    // devolved-from when this slot echoes a later appearance).
                    def: trainerMonDefinition,
                    storedSpecies: trainerMonDefinition.id ? storedIds[trainerMonDefinition.id] : null,
                });
                team.push(newTeamMember);
            }
        });

        // T-075 — the flagship "team of 5" diagnostic: after resolving every slot, a team
        // that came back shorter than its definition means one or more slots were dropped.
        // One summary event per trainer (the per-slot detail is in TRAINER_SLOT_DROPPED).
        const expectedTeamSize = teamDefs.length;
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

        // RC1 (T-132) — if this weather attempt built its abusers but has NO setter (common when
        // `mutateAbilities` scattered the setter ABILITY out of this trainer's pool), retrofit a suboptimal
        // themed MOVE-setter so the setter + 2-abusers condition can hold. Done BEFORE finishTeam (and the
        // returned team) so BOTH the audit and the orchestrator's gimmickHolds see the real committed team.
        // SKIPPED for abuse-only (a tag partner needs no setter — its ally sets the weather).
        const wxSubtype = context.archetypeSeed && (context.archetypeSeed.gimmicks || []).includes('weather')
            && !context.archetypeSeed.abuseOnly && context.archetypeSeed.weather;
        if (wxSubtype && ensureMoveSetter(team, wxSubtype)) attemptAudit.relabelWeather(team, wxSubtype);

        attemptAudit.finishTeam({ team, model: archetypeModel, ctx: { moves }, seed: context.archetypeSeed, weatherPicks: context.weatherPicks });
        return team;
    }

    // Resolves one trainer's full team (array of team members). Does NOT handle `trainer.copy` or build
    // the trainersResults entry — the caller owns those.
    //
    // T-132 / ADR-017 — attempt-based: a gimmicked trainer TRIES its gimmick (and, for weather, the other
    // weathers) and DROPS it if the success condition can't be met, committing the first attempt that holds.
    // Each attempt runs on ISOLATED state (a storedIds/IV-cache overlay + a throwaway audit + a cloned
    // trainer for its mutable tms/bag); only the committed attempt's side effects reach the shared state, so
    // failed attempts never corrupt continuity. Non-gimmick trainers take exactly one attempt — byte-
    // identical to before.
    function resolveTrainerTeam(trainer) {
        // Favourites are seed-independent, so claim the pool slots ONCE, up front (see favouriteClaim.js).
        let teamDefs = trainer.team;
        const favChains = trainer.favourites
            || (trainer.favourite && trainer.favourite.length ? [trainer.favourite] : null);
        if (favChains && favChains.length) {
            teamDefs = resolveFavourites(trainer.team, favChains, {
                pokemonList, level: trainer.level, types: trainer.types || null,
                favouriteIds: trainer.favourites ? (trainer.favouriteIds || []) : (trainer.favouriteId ? [trainer.favouriteId] : []),
            });
        }

        let baseSeed = trainer.archetypeSeed || getTrainerSeed(trainer.id);
        // T-132 — a TAG partner abuses its ALLY's actual weather (Tabitha Mossdeep follows Maxie). Overrides
        // the trainer's own seed: if the ally established a weather W → abuse it (abuseOnly: no setter of its
        // own); if the ally set no weather → a normal team (no forced sand). The ally MUST be resolved first
        // (writerDocs defers the dependent), so committedWeather[ally] is populated by now.
        if (trainer.abusePartnerWeather) {
            const w = committedWeather[trainer.abusePartnerWeather];
            baseSeed = w
                ? { base: (baseSeed && baseSeed.base) || 'bulky_offense', gimmicks: ['weather'], weather: w, abuseOnly: true }
                : null;
        }
        const variants = gimmickFallbackChain(baseSeed, trainer.id);

        // One isolated attempt: build the team under `variantSeed` on a private storedIds/IV overlay + a
        // throwaway audit + a cloned trainer (its mutable tms/bag). Only a COMMITTED attempt's side effects
        // reach the shared state (the orchestrator decides which). Reused by the fallback chain and the
        // emergent-weather probe below.
        function tryVariant(variantSeed) {
            const attemptStoredIds = { ...storedIds };
            const attemptIVCache = { ...pokeIdIVCache };
            const attemptAudit = createTeamAudit();
            const attemptTrainer = {
                ...trainer,
                tms: [...(trainer.tms || [])],
                bag: trainer.bag ? [...trainer.bag] : trainer.bag,
            };
            const team = runAttempt(attemptTrainer, teamDefs, variantSeed, attemptStoredIds, attemptIVCache, attemptAudit);
            return { team, attemptStoredIds, attemptIVCache, attemptTrainer, attemptAudit };
        }

        let chosen = null;
        let chosenIdx = 0;
        for (let i = 0; i < variants.length; i++) {
            const variantSeed = variants[i];
            chosen = tryVariant(variantSeed);
            chosenIdx = i;
            const gimmick = variantSeed && variantSeed.gimmicks && variantSeed.gimmicks[0];
            const isLast = i === variants.length - 1;
            // The move-setter retrofit already ran inside runAttempt (before its audit), so `chosen.team` here
            // is the real committed team — commit the first attempt that satisfies its gimmick (or the final).
            const abuseOnly = !!(variantSeed && variantSeed.abuseOnly);
            if (isLast || !gimmick || gimmickHolds(gimmick, chosen.team, { moves, abuseOnly }, (variantSeed && variantSeed.weather) || null)) break;
        }
        let committedSeed = variants[chosenIdx];

        // T-136 — EMERGENT weather on a NON-DEDICATED team. If this trainer had no weather intent of its own
        // yet its committed plain build FIELDED a natural setter (mutated abilities scatter Drizzle/Drought/…,
        // or a move-setter emerged) — and it's sophisticated enough — opportunistically try to build THAT
        // weather properly (setter + 2 hard-ranked abusers), reusing the seeded machinery via a synthetic
        // `emergent` seed. Commit the weather build only if it HOLDS; otherwise keep the plain team and note
        // on its trace that weather was considered + dropped (so the decision log reports it — the owner's ask).
        const emergentSub = emergentWeatherSubtype({
            committedSeed, abusePartner: !!trainer.abusePartnerWeather,
            soph: sophistication(trainer), team: chosen.team,
        });
        if (emergentSub) {
            const emergentSeed = {
                base: (committedSeed && committedSeed.base) || 'bulky_offense',
                gimmicks: ['weather'], weather: emergentSub, emergent: true,
            };
            const wx = tryVariant(emergentSeed);
            if (weatherHolds(wx.team, { moves }, emergentSub)) {
                chosen = wx;
                committedSeed = emergentSeed;
            } else {
                const trace = chosen.attemptAudit.all()[0];
                if (trace) {
                    const abusers = wx.team.filter(m => isWeatherAbuser(m, emergentSub)).length;
                    trace.emergentWeatherDropped = { subtype: emergentSub, abusers, required: WEATHER_REQUIRED_ABUSERS };
                }
            }
        }

        // T-132/T-130 — if the trainer's intended gimmick was ROLLED BACK (the committed attempt no longer
        // carries it), record that on the committed audit trace so the log still shows it was tried + dropped.
        const baseGimmick = baseSeed && baseSeed.gimmicks && baseSeed.gimmicks[0];
        const committedHasGimmick = committedSeed && (committedSeed.gimmicks || []).length > 0;
        if (baseGimmick && !committedHasGimmick) {
            const trace = chosen.attemptAudit.all()[0];
            if (trace) trace.rolledBack = { gimmick: baseGimmick, attempts: chosenIdx };
        }

        // Commit the chosen attempt's side effects to the shared, cross-trainer state.
        Object.assign(storedIds, chosen.attemptStoredIds);
        Object.assign(pokeIdIVCache, chosen.attemptIVCache);
        trainer.tms = chosen.attemptTrainer.tms;
        trainer.bag = chosen.attemptTrainer.bag;
        audit.absorb(chosen.attemptAudit);
        // T-132 — record the weather this trainer actually established, so a tag partner (Tabitha) resolved
        // AFTER it can abuse it. Based on the committed team's real setter (ability or move), else null.
        committedWeather[trainer.id] = teamWeather(chosen.team);
        return chosen.team;
    }

    return { resolveTrainerTeam, generateIVs, storedIds, sophisticationFor: sophistication };
}

module.exports = { createTeamResolver, normalizeTrainerBagTms };
