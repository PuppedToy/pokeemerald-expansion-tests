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
    topSupportMoves,
} = require('../rating.js');
const { sample, canLearnMove, usesStrategicNature } = require('./utils');
const { pickTrainerMonAbility } = require('./trainerAbility');
const { selectWithAutoFallback } = require('./trainerFallback');
const { createChooser } = require('./trainerSelector');
const { makeArchetypePicker, BIAS_MIN_SOPH } = require('./archetypePicker');
const { planMemberRoleMove, planMemberAbility, planForwardChoiceItem, planTerrainSynergyMove, planTerrainSeedClaim, planPerishComboMove, WEATHER_ROCK_BY_SETTER, ELECTRIC_MOVES } = require('./archetypeRefine');
const { getTrainerSeed } = require('./trainerSeeds');
const { resolveFavourites } = require('./favouriteClaim');
const { gimmickHolds, gimmickFallbackChain, ensureMoveSetter, teamWeather, emergentGimmick, weatherHolds, isWeatherAbuser, GIMMICK_SPEC } = require('./gimmickPlan');
const { WEATHER_REQUIRED_ABUSERS } = require('./weatherConstants');
const { consumeLinkedUnit, expandLinkedPacks } = require('./itemLinks');
const { getArchetypeModel } = require('../archetypes');
const { noopTeamAudit, createTeamAudit } = require('../teamAudit');
const { noopDiagnostics, DIAGNOSTIC_CODES } = require('../diagnostics');

const SEED_SOPH_FLOOR = 0.6; // T-126 — min sophistication for a SEEDED trainer, so its identity builds
// T-142 r3 — fraction of STEERED doubles teams that are hyper-aggressive (NO dedicated support). Rolled
// up front per trainer (see below) because the emergent identity resolves too late to secure a support.
const DOUBLES_HYPER_CHANCE = 0.25;
// T-141 r4 — a dedicated support's moveset should BE support: inject up to this many of its best support
// moves (quality-ranked) as fixed moves so chooseMoveset builds the set around them (owner: "el moveset
// debería saber que su rol es support"), leaving one slot for a coverage/attacking move.
const SUPPORT_MOVES_TO_INJECT = 3;
// Items that LOCK a mon out of status moves (Assault Vest blocks all status; Choice locks into one move) —
// forbidden for a dedicated support, whose whole job is spamming support moves (owner: AV on a support is
// wrong). Matched by display name (the item-name form used throughout the resolver).
const SUPPORT_FORBIDDEN_ITEMS = new Set(['Assault Vest', 'Choice Band', 'Choice Specs', 'Choice Scarf']);

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

// Finalizes a trainer's raw bag into the shape the resolver consumes. Mutates the trainer in place; runs for
// every trainer (including `copy` trainers) before resolution. Two jobs:
//   1. T-133 — expand any `linkedChoiceSample` PACK markers into flat units + link groups (each pick-group the
//      trainer holds becomes a bag-local pack; consuming one option later forgoes its siblings).
//   2. Move `TM_*` entries out of the bag into `trainer.tms` (as `MOVE_*`), routing TM packs to `tmLinks` and
//      item packs to `bagLinks` (a pack is homogeneous). Order-preserving → byte-identical when no packs.
function normalizeTrainerBagTms(trainer) {
    const { units, groups } = expandLinkedPacks(trainer.bag);
    const bag = [];
    const tms = trainer.tms ? [...trainer.tms] : [];
    for (const u of units) {
        if (typeof u === 'string' && u.startsWith('TM_')) tms.push(u.replace('TM_', 'MOVE_'));
        else bag.push(u);
    }
    const bagLinks = [];
    const tmLinks = [];
    for (const g of groups) {
        if (g.members.every(m => typeof m === 'string' && m.startsWith('TM_'))) {
            tmLinks.push({ members: g.members.map(m => m.replace('TM_', 'MOVE_')) });
        } else {
            bagLinks.push({ members: [...g.members] });
        }
    }
    trainer.bag = bag;
    trainer.tms = tms;
    trainer.bagLinks = bagLinks;
    trainer.tmLinks = tmLinks;
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
            supportPicks: [], // T-141 r4 — the picker records the dedicated-support ranking here, for the log
            itemLinkActivations: [], // T-133 — records when a linked pick-pack activated (siblings forgone)
        };
        // T-142 r3 — decide UP FRONT whether this doubles team is hyper-aggressive (no dedicated support)
        // or support-using. The emergent identity resolves too late to secure a support (an all-attacker
        // partial team crystallises hyper_offense first, min0), so we roll it here. Deterministic per
        // trainer (a hash of the id + base seed — NO rng consumed, so the per-slot RNG streams and every
        // other trainer are undisturbed). Only steered doubles teams get a plan; a DOUBLES_HYPER_CHANCE
        // minority go hyper-offense (no support). The hard-pick (picker) + tier-flex (selector) read it.
        if (/double/i.test(trainer.battleType || '') && context.sophistication >= BIAS_MIN_SOPH && baseRngSeed !== null) {
            const r = (djb2Hash(trainer.id + ':dbl-support-plan') ^ baseRngSeed) >>> 0;
            context.doublesWantsSupport = (r % 1000) / 1000 >= DOUBLES_HYPER_CHANCE;
        }
        const archetypeModel = getArchetypeModel(/double/i.test(trainer.battleType || '') ? 'doubles' : 'singles');
        const pickCandidate = makeArchetypePicker({ model: archetypeModel, context, ctx: { moves } });
        attemptAudit.beginTeam({
            trainerId: trainer.id, label: trainer.label || null, class: trainer.class || null,
            level: trainer.level, battleType: trainer.battleType || 'singles',
            sophistication: context.sophistication, seed: context.archetypeSeed,
        });
        const choosePokemonFromDefinition = createChooser(pokemonList, trainer, context, {
            starters, staticRewards, replacementLog, megaReplacementLog, isSuperEffective, pickCandidate,
            model: archetypeModel, moves, // T-142 r2 — doubles support tier-flex
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

                // T-141 r4 — is this mon (one of) the team's DEDICATED support? True when the up-front plan
                // wants support (steered doubles) AND this mon's support tier beats its offense (the tagged
                // supports). Drives its support moveset + the status-locking-item ban below. A pre-set
                // status-locking item (from a def/mega) is cleared so a legal item fills the slot instead.
                const isSupportMon = !!context.doublesWantsSupport && !!chosenTrainerMon.isSupportDoubles;
                if (isSupportMon && newTeamMember.item && SUPPORT_FORBIDDEN_ITEMS.has(newTeamMember.item)) {
                    newTeamMember.item = null;
                }

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
                // T-124 — SOFT surger-awareness (doubles only, so singles stays byte-identical): if the team
                // already fields a misty/grassy/psychic Surge setter, this mon prefers the terrain's signature
                // payoff move (Grassy Glide / Expanding Force / Misty Explosion). A light nudge, not a gimmick.
                if (/double/i.test(trainer.battleType || '')) {
                    const terrainMove = planTerrainSynergyMove({
                        species: chosenTrainerMon, team,
                        ctx: { tms: trainer.tms || [], level: trainer.level },
                        sophistication: context.sophistication,
                    });
                    if (terrainMove && injectableMove(terrainMove) && !newTeamMember.moves.includes(terrainMove)) {
                        newTeamMember.moves.push(terrainMove);
                    }
                }
                // T-141 r4 — a DEDICATED support plays support. When this mon's support tier beats its offense
                // (isSupportDoubles — the tagged supports) on a steered doubles team, inject its best support
                // moves (quality-ranked) as fixed moves so chooseMoveset builds a real support set around them
                // instead of an all-attacking one (owner: Calyrex was fielded with Leaf Storm/Psychic/Gyro
                // Ball/Close Combat + Assault Vest). Soph-gated (context.doublesWantsSupport is only set for
                // steered teams) → early game + singles untouched. Reachable-move gated (B-030) like roleMove.
                if (isSupportMon) {
                    const supMoves = topSupportMoves(chosenTrainerMon, {
                        filter: mv => injectableMove(mv) && !newTeamMember.moves.includes(mv),
                        limit: SUPPORT_MOVES_TO_INJECT,
                    });
                    supMoves.forEach(mv => { if (!newTeamMember.moves.includes(mv)) newTeamMember.moves.push(mv); });
                }
                // T-137 — electric-terrain gimmick: every mon prefers an electric attacking move (STAB/synergy).
                if (context.archetypeSeed && (context.archetypeSeed.gimmicks || []).includes('electric_terrain')) {
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

                // T-124 — PERISH-TRAP team-combo. SELF (a mon that itself traps — Shadow Tag / Arena Trap;
                // `ability` is the resolved battle ability, so a Mega Gengar counts) strongly prefers Perish
                // Song in BOTH formats (owner: singles Perish-Trap Gothitelle is a real set); the TEAMMATE
                // split (a support partner of a trapper) is DOUBLES-only. Injected as a fixed move →
                // chooseMoveset builds around it. NOT a gimmick — just moveset prioritisation. B-030-gated.
                {
                    const perishMove = planPerishComboMove({
                        species: chosenTrainerMon, memberAbility: ability, team,
                        ctx: { tms: trainer.tms || [], level: trainer.level },
                        sophistication: context.sophistication,
                        doubles: /double/i.test(trainer.battleType || ''),
                    });
                    if (perishMove && injectableMove(perishMove) && !newTeamMember.moves.includes(perishMove)) {
                        newTeamMember.moves.push(perishMove);
                    }
                }

                // T-133 — FORWARD (dependent) Choice claim: if this mon fills an offensive role the team wants
                // AND a Choice item is available in the bag, claim it NOW (link-aware) so chooseMoveset builds
                // an all-attacking set (the forward path T-129 couldn't do). Only when a Choice is actually in
                // the bag — the Choice role depends on the item existing. Enhanced items (rock/seed/room
                // service) are handled just below (T-125). Soph-gated inside the planner.
                // T-141 r4 — never claim a Choice item for a dedicated support (it would lock it into one move
                // and build an all-attacking set — the opposite of its role).
                if (!newTeamMember.item && !isSupportMon && trainer.bag && trainer.bag.length) {
                    const forwardChoice = planForwardChoiceItem({
                        species: chosenTrainerMon, team, model: archetypeModel, ctx: { moves },
                        sophistication: context.sophistication, seed: context.archetypeSeed, available: trainer.bag,
                    });
                    if (forwardChoice) {
                        newTeamMember.item = forwardChoice;
                        const act = consumeLinkedUnit(trainer.bag, trainer.bagLinks || [], forwardChoice);
                        if (act.activated && context.itemLinkActivations) {
                            context.itemLinkActivations.push({ species: chosenTrainerMon.id, used: forwardChoice, removed: act.removedSiblings, kind: 'item' });
                        }
                    }
                }

                // T-125 — a weather setter holds the rock that extends its weather (Damp/Heat/Smooth/Icy),
                // CLAIMED FROM THE BAG via the common link-aware path (the 4 rocks are one pick-group,
                // provisioned from the Slateport aqua grunts onward). A team with 2 setters places only ONE
                // rock: claiming it forgoes the pack's siblings, so the 2nd setter finds none. No rock in the
                // bag → no rock (born from the bag). Soph-gated; fills only an empty item slot.
                if (!newTeamMember.item && context.sophistication >= BIAS_MIN_SOPH && WEATHER_ROCK_BY_SETTER[ability]) {
                    const rockName = itemIdToName(WEATHER_ROCK_BY_SETTER[ability]);
                    if ((trainer.bag || []).includes(rockName)) {
                        newTeamMember.item = rockName;
                        const act = consumeLinkedUnit(trainer.bag, trainer.bagLinks || [], rockName);
                        if (act.activated && context.itemLinkActivations) {
                            context.itemLinkActivations.push({ species: chosenTrainerMon.id, used: rockName, removed: act.removedSiblings, kind: 'item' });
                        }
                    }
                }
                // T-125 — the ELECTRIC-TERRAIN gimmick SETTER holds Terrain Extender (extends the terrain
                // 5→8 turns — the terrain analogue of the weather rock), claimed from the bag (provisioned
                // from Wattson). Only the gimmick setter, only if the bag holds it. Runs BEFORE the seed
                // claim so the setter takes the Extender and a bulky teammate takes the seed.
                if (!newTeamMember.item && context.sophistication >= BIAS_MIN_SOPH
                    && context.archetypeSeed && (context.archetypeSeed.gimmicks || []).includes('electric_terrain')
                    && (ability === 'ELECTRIC_SURGE' || ability === 'HADRON_ENGINE')) {
                    const ext = itemIdToName('ITEM_TERRAIN_EXTENDER');
                    if ((trainer.bag || []).includes(ext)) {
                        newTeamMember.item = ext;
                        const act = consumeLinkedUnit(trainer.bag, trainer.bagLinks || [], ext);
                        if (act.activated && context.itemLinkActivations) {
                            context.itemLinkActivations.push({ species: chosenTrainerMon.id, used: ext, removed: act.removedSiblings, kind: 'item' });
                        }
                    }
                }
                // T-125 — a TERRAIN SEED (Electric/Grassy/Misty/Psychic) for a team that establishes a terrain
                // (any teammate's Surge ability / terrain move, or the electric_terrain gimmick). CLAIMED FROM
                // THE BAG (`choiceJosephSeeds`, from Wally Mauville onward), link-aware — generalises the old
                // electric-only direct-set to all four terrains + makes it team-surger-aware + bag-born. The
                // seed goes to a bulky low-offense mon or an Unburden abuser (a defensive on-entry boost).
                if (!newTeamMember.item && context.sophistication >= BIAS_MIN_SOPH) {
                    const seedName = planTerrainSeedClaim({
                        species: chosenTrainerMon, memberAbility: ability, team, archetypeSeed: context.archetypeSeed,
                        available: trainer.bag || [], sophistication: context.sophistication,
                    });
                    if (seedName) {
                        newTeamMember.item = seedName;
                        const act = consumeLinkedUnit(trainer.bag, trainer.bagLinks || [], seedName);
                        if (act.activated && context.itemLinkActivations) {
                            context.itemLinkActivations.push({ species: chosenTrainerMon.id, used: seedName, removed: act.removedSiblings, kind: 'item' });
                        }
                    }
                }
                // T-125 — a Trick Room ABUSER (a fast mon whose Speed should DROP under TR so it moves first)
                // claims a speed-control item FROM THE BAG: Room Service (best — lowers Speed when TR is set;
                // provisioned from Tate & Liza) preferred, else Iron Ball (halves Speed; via averageItemPool).
                // Lagging Tail was reviewed + dropped (marginal + unpooled). Born from the bag, consume-aware.
                if (!newTeamMember.item && context.sophistication >= BIAS_MIN_SOPH
                    && context.archetypeSeed && (context.archetypeSeed.gimmicks || []).includes('trick_room')
                    && (chosenTrainerMon.baseSpeed || 0) > 60) {
                    const trItem = ['Room Service', 'Iron Ball'].find(i => (trainer.bag || []).includes(i));
                    if (trItem) {
                        newTeamMember.item = trItem;
                        const act = consumeLinkedUnit(trainer.bag, trainer.bagLinks || [], trItem);
                        if (act.activated && context.itemLinkActivations) {
                            context.itemLinkActivations.push({ species: chosenTrainerMon.id, used: trItem, removed: act.removedSiblings, kind: 'item' });
                        }
                    }
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
                    // T-125 — terrain context from earlier teammates' surgers (mirrors the weather flags), so a
                    // mon built after a Surge setter rates its terrain-scaling moves (Rising Voltage / Expanding
                    // Force / Terrain Pulse / …) up. Format-agnostic.
                    electricTerrain: team.some(m => m.ability === 'ELECTRIC_SURGE' || m.ability === 'HADRON_ENGINE' || (m.moves || []).includes('MOVE_ELECTRIC_TERRAIN')),
                    grassyTerrain: team.some(m => m.ability === 'GRASSY_SURGE' || (m.moves || []).includes('MOVE_GRASSY_TERRAIN')),
                    psychicTerrain: team.some(m => m.ability === 'PSYCHIC_SURGE' || (m.moves || []).includes('MOVE_PSYCHIC_TERRAIN')),
                    mistyTerrain: team.some(m => m.ability === 'MISTY_SURGE' || (m.moves || []).includes('MOVE_MISTY_TERRAIN')),
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
                // T-133 — teaching a TM CONSUMES it from the bag respecting links: if the TM belongs to a
                // pick-pack (and has no loose/buyable copy), one unit of each pack sibling is forgone from THIS
                // trainer's tms. The mon's full moveset is already chosen here, so a mon that legitimately uses
                // two moves from one pack is never self-blocked (its moves are locked in before consumption).
                tmsUsed.forEach(tmUsed => {
                    const act = consumeLinkedUnit(trainer.tms || [], trainer.tmLinks || [], tmUsed);
                    if (act.activated && context.itemLinkActivations) {
                        context.itemLinkActivations.push({ species: chosenTrainerMon.id, used: tmUsed, removed: act.removedSiblings, kind: 'tm' });
                    }
                });

                if (!newTeamMember.item && trainer.bag && trainer.bag.length > 0) {
                    const movesetObjects = moveset.map(m => moves[m]);
                    const sortedBagItems = trainer.bag
                        // T-141 r4 — a dedicated support can't hold a status-locking item (Assault Vest / Choice).
                        .filter(bagItemId => !(isSupportMon && SUPPORT_FORBIDDEN_ITEMS.has(bagItemId)))
                        .map(bagItemId => ({
                            id: bagItemId,
                            rating: rateItemForAPokemon(bagItemId, battlePoke, ability, movesetObjects, trainer.level, trainer.bag.length, GENERIC_DEVIATION),
                        }))
                        .filter(bi => bi.rating > 0)
                        .sort((a, b) => b.rating - a.rating)
                        .map(bi => bi.id);
                    if (sortedBagItems.length > 0) {
                        newTeamMember.item = sortedBagItems[0];
                        // T-133 — same link-aware consumption as TMs: equipping one item from a pick-pack forgoes
                        // its siblings from this trainer's bag (a loose/buyable copy is spent first, no link).
                        const act = consumeLinkedUnit(trainer.bag, trainer.bagLinks || [], newTeamMember.item);
                        if (act.activated && context.itemLinkActivations) {
                            context.itemLinkActivations.push({ species: chosenTrainerMon.id, used: newTeamMember.item, removed: act.removedSiblings, kind: 'item' });
                        }
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
        if (wxSubtype && ensureMoveSetter(team, wxSubtype, { tms: trainer.tms || [], level: trainer.level })) attemptAudit.relabelWeather(team, wxSubtype);
        // T-137 — same move-setter retrofit for electric terrain / trick room (no ability-setter in the pool
        // → inject the terrain / Trick Room move on a non-abuser learner so the setter + 2-abusers holds).
        const seedGid = context.archetypeSeed && (context.archetypeSeed.gimmicks || []).find(g => GIMMICK_SPEC[g]);
        if (seedGid && !context.archetypeSeed.abuseOnly) {
            // T-138 — a FULL room retrofits 2 setters (redundancy); everything else 1.
            const setterCount = (seedGid === 'trick_room' && context.archetypeSeed.roomStyle === 'full') ? 2 : 1;
            // B-036 — pass the trainer's TMs + level so the setter-move retrofit is B-030-gated (it may only
            // inject Trick Room / Electric Terrain if the mon reaches it by level-up or the trainer HOLDS the TM).
            GIMMICK_SPEC[seedGid].ensureSetter(team, setterCount, { tms: trainer.tms || [], level: trainer.level });
        }

        attemptAudit.finishTeam({ team, model: archetypeModel, ctx: { moves }, seed: context.archetypeSeed, weatherPicks: context.weatherPicks, supportPicks: context.supportPicks, itemLinkActivations: context.itemLinkActivations, supportFlexed: context.supportFlexed, doublesWantsSupport: context.doublesWantsSupport });
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
                battleType: trainer.battleType || null, // T-109 — doubles trainers claim favourites by doubles tier
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
                // T-133 — clone the link groups too, so a rolled-back attempt's pack consumption never leaks
                // into the shared trainer (only a COMMITTED attempt writes them back below).
                bagLinks: (trainer.bagLinks || []).map(g => ({ members: [...g.members] })),
                tmLinks: (trainer.tmLinks || []).map(g => ({ members: [...g.members] })),
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
            const holdCtx = { moves, abuseOnly, roomStyle: (variantSeed && variantSeed.roomStyle) || null };
            if (isLast || !gimmick || gimmickHolds(gimmick, chosen.team, holdCtx, (variantSeed && variantSeed.weather) || null)) break;
        }
        let committedSeed = variants[chosenIdx];

        // T-136/T-137 — EMERGENT gimmick on a NON-DEDICATED team. If this trainer had no gimmick intent of its
        // own yet its committed plain build FIELDED a natural setter (weather / electric terrain — mutated
        // abilities scatter Drizzle/Drought/Electric-Surge…) or a slow-strong CORE (trick room) — and it's
        // sophisticated enough — opportunistically try to build THAT gimmick properly (setter + 2 hard-ranked
        // abusers), reusing the seeded machinery via a synthetic `emergent` seed. Commit only if it HOLDS;
        // else keep the plain team and note on its trace that it was considered + dropped (owner's ask).
        const emergent = emergentGimmick({
            committedSeed, abusePartner: !!trainer.abusePartnerWeather,
            soph: sophistication(trainer), team: chosen.team,
        });
        if (emergent) {
            const emergentSeed = {
                base: (committedSeed && committedSeed.base) || 'bulky_offense',
                gimmicks: [emergent.gimmick], emergent: true,
                ...(emergent.weather ? { weather: emergent.weather } : {}),
                ...(emergent.roomStyle ? { roomStyle: emergent.roomStyle } : {}),
            };
            const wx = tryVariant(emergentSeed);
            if (gimmickHolds(emergent.gimmick, wx.team, { moves, roomStyle: emergent.roomStyle || null }, emergent.weather || null)) {
                chosen = wx;
                committedSeed = emergentSeed;
            } else {
                const trace = chosen.attemptAudit.all()[0];
                if (trace) {
                    const sub = emergent.weather || emergent.gimmick.replace('_', ' ');
                    const abusers = emergent.gimmick === 'weather'
                        ? wx.team.filter(m => isWeatherAbuser(m, emergent.weather)).length
                        : wx.team.filter(m => GIMMICK_SPEC[emergent.gimmick].score(m) >= 2).length;
                    trace.emergentWeatherDropped = { subtype: sub, abusers, required: WEATHER_REQUIRED_ABUSERS };
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
        trainer.bagLinks = chosen.attemptTrainer.bagLinks; // T-133 — commit the reduced pack state too
        trainer.tmLinks = chosen.attemptTrainer.tmLinks;
        audit.absorb(chosen.attemptAudit);
        // T-132 — record the weather this trainer actually established, so a tag partner (Tabitha) resolved
        // AFTER it can abuse it. Based on the committed team's real setter (ability or move), else null.
        committedWeather[trainer.id] = teamWeather(chosen.team);
        return chosen.team;
    }

    return { resolveTrainerTeam, generateIVs, storedIds, sophisticationFor: sophistication };
}

module.exports = { createTeamResolver, normalizeTrainerBagTms };
