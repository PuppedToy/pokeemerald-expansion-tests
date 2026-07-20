const fs = require('fs').promises;
const path = require('path');
const rng = require('./rng');

const wild = require('./wild.js');
const trainers = require('./trainers.js');
const {
    OUTPUT_DIR,
    TEMPLATE_FILE,
    TEMPLATE_TRAINERS_REPLACEMENT,
    TEMPLATE_POKEMON_REPLACEMENT,
    TEMPLATE_WILDPOKES_REPALCEMENT,
    TEMPLATE_MOVES_REPLACEMENT,
    TEMPLATE_ABILITIES_REPLACEMENT,
    TEMPLATE_ITEMS_REPLACEMENT,
    TEMPLATE_COLORS_REPLACEMENT,
    MEGA_TRAINERS,
    PALAFIN_HERO_ID,
} = require('./constants');
const { typeMainColors } = require('./trainerColors');
const { BANNED_SPECIES_FOR_PICKING, resolveRewardMegaStone } = require('./modules/wildModule');
const { displayNameToItemConst } = require('./itemRandomizer');
const { createTeamResolver, normalizeTrainerBagTms } = require('./modules/resolveTrainerTeam');
const { nameizyPokemonId } = require('./parser');
const { createSophisticationScale } = require('./modules/sophistication');
const { applyLeadLogic } = require('./modules/trainerTeamOrder');

const items = require('./items.js');
const { savePokemonData } = require('./pokemonWriter.js');
const { writeEvoLevels } = require('./evoLevelWriter.js');
const { applyStarterNames } = require('./starterNameWriter.js');

const startersFile = path.resolve(__dirname, '..', 'src', 'starter_choose.c');

const starterMonText = `static const u16 sStarterMon[STARTER_MON_COUNT] =
{
    SPECIES_TREECKO,
    SPECIES_TORCHIC,
    SPECIES_MUDKIP,
};`;

const starterExtraMonText = `static const u16 sStarterExtraMon[STARTER_EXTRA_COUNT] =
{
    SPECIES_BAGON,
    SPECIES_KABUTOPS,
    SPECIES_LARVITAR,
    SPECIES_BELDUM,
    SPECIES_SCYTHER,
    SPECIES_RALTS,
    SPECIES_SHROOMISH,
    SPECIES_NOIBAT,
    SPECIES_SNORUNT,
};`;

const starterExtraCountText = '#define STARTER_EXTRA_COUNT 9';

// Static replacements

const regirockReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'DesertRuins', 'scripts.inc');
const regirockReplacementText = 'SPECIES_REGIROCK';

const regiceReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'IslandCave', 'scripts.inc');
const regiceReplacementText = 'SPECIES_REGICE';

const registeelReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'AncientTomb', 'scripts.inc');
const registeelReplacementText = 'SPECIES_REGISTEEL';

const mewReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'NewMauville_Entrance', 'scripts.inc');
const mewReplacementText = 'SPECIES_MEW';

const gymMonReplacement = 'GYM_REWARD_MON';
const gymNameReplacement = 'GYM_REWARD_NAME';
const gymItemReplacement = 'GYM_REWARD_ITEM';
const pokemonRewardFiles = [
    path.resolve(__dirname, '..', 'data', 'maps', 'RustboroCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'DewfordTown_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'MauvilleCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'LavaridgeTown_Gym_1F', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'PetalburgCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'FortreeCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'MossdeepCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'SootopolisCity_Gym_1F', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'SlateportCity_OceanicMuseum_2F', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'Route119_WeatherInstitute_2F', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'LilycoveCity', 'scripts.inc'),
];

const skyPillarTopReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'SkyPillar_Top', 'scripts.inc');
const scriptMenuReplacementFile = path.resolve(__dirname, '..', 'src', 'data', 'script_menu.h');
const legend1ReplacementText = 'SPECIES_LEGEND1';
const legend2ReplacementText = 'SPECIES_LEGEND2';
const legend3ReplacementText = 'SPECIES_LEGEND3';

const mapsBase = path.resolve(__dirname, '..', 'data', 'maps');
const routeFiles = [
    path.resolve(mapsBase, 'Route103', 'map.json'),
    path.resolve(mapsBase, 'Route109', 'map.json'),
    path.resolve(mapsBase, 'Route110', 'map.json'),
    path.resolve(mapsBase, 'Route111', 'map.json'),
    path.resolve(mapsBase, 'Route112', 'map.json'),
    path.resolve(mapsBase, 'Route113', 'map.json'),
    path.resolve(mapsBase, 'Route114', 'map.json'),
    path.resolve(mapsBase, 'Route115', 'map.json'),
    path.resolve(mapsBase, 'Route116', 'map.json'),
    path.resolve(mapsBase, 'Route117', 'map.json'),
    path.resolve(mapsBase, 'Route118', 'map.json'),
    path.resolve(mapsBase, 'Route119', 'map.json'),
    path.resolve(mapsBase, 'Route120', 'map.json'),
    path.resolve(mapsBase, 'Route121', 'map.json'),
    path.resolve(mapsBase, 'Route125', 'map.json'),
    path.resolve(mapsBase, 'Route126', 'map.json'),
    path.resolve(mapsBase, 'Route127', 'map.json'),
    path.resolve(mapsBase, 'VictoryRoad_B1F', 'map.json'),
    path.resolve(mapsBase, 'PetalburgCity', 'map.json'),
    path.resolve(mapsBase, 'RustboroCity', 'map.json'),
    path.resolve(mapsBase, 'VerdanturfTown', 'map.json'),
    path.resolve(mapsBase, 'MauvilleCity', 'map.json'),
    path.resolve(mapsBase, 'DewfordTown', 'map.json'),
    path.resolve(mapsBase, 'SlateportCity', 'map.json'),
    path.resolve(mapsBase, 'LilycoveCity', 'map.json'),
    path.resolve(mapsBase, 'ScorchedSlab', 'map.json'),
];

function nameify(text) {
    return text
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function itemIdToName(itemId) {
    // remove "ITEM_" prefix, Swap _ for ' ' and capitalize the first letter of each word
    return nameify(itemId.replace('ITEM_', ''));
}

// DJB2 hash — used for per-slot RNG reseeding when trainers are shared across ROMs
// Returns a map of speciesId → unique placeholder string for two-pass wild substitution.
// Uses counter-based IDs (not RNG) so this never advances the shared RNG state.
function buildWildPlaceholderMap(entries) {
    const result = {};
    entries.forEach(([speciesId], idx) => {
        result[speciesId] = `WILDPOKE_P${idx}`;
    });
    return result;
}

// Apply the two-pass wild-encounter species substitution to a wild_encounters.json
// blob. Returns the rewritten content.
//
// Both passes anchor their match with word boundaries (\b). This is essential:
// otherwise a token that is a substring-prefix of a longer token corrupts it.
// e.g. placeholder WILDPOKE_P1 is a prefix of WILDPOKE_P10..P19 and WILDPOKE_P100.. ,
// so an unanchored /WILDPOKE_P1/g rewrites the start of WILDPOKE_P19 and leaves a
// stray "9" glued onto the replacement species (SPECIES_FOO9 — undeclared at build
// time). The same hazard applies in pass 1 to any base species that is a prefix of
// another (SPECIES_TAUROS vs SPECIES_TAUROS_PALDEA_COMBAT). Species ids and
// placeholders are all [A-Z0-9_]+ (no regex metacharacters), so \b anchoring is
// sufficient and correct — the surrounding "/,/space/} are all non-word characters.
function substituteWildSpecies(content, wildReplacementLog) {
    let result = content;
    const placeholders = buildWildPlaceholderMap(Object.entries(wildReplacementLog));

    // Pass 1: replace each original species with a unique placeholder to avoid chained substitutions.
    Object.keys(wildReplacementLog).forEach((speciesId) => {
        result = result.replace(new RegExp('\\b' + speciesId + '\\b', 'g'), placeholders[speciesId]);
    });

    // Pass 2: replace placeholders with the actual replacement species.
    Object.entries(placeholders).forEach(([speciesId, placeholder]) => {
        result = result.replace(new RegExp('\\b' + placeholder + '\\b', 'g'), wildReplacementLog[speciesId]);
    });

    return result;
}

// T-162 — structural wild-encounter writer. Distributes `speciesList` (length ≤ #slots) across the
// given slot indices so each species' summed per-slot encounter rate is as equal as possible
// (greedy: assign each slot, heaviest first, to the currently-lightest species). Only the `species`
// string is overwritten — each slot keeps its authored min_level/max_level. RNG-free.
function distributeSpeciesAcrossSlots(mons, slotIdx, rates, speciesList) {
    const valid = slotIdx.filter(i => i >= 0 && i < mons.length);
    const L = speciesList.length;
    if (L === 0 || valid.length === 0) return;
    const groups = Array.from({ length: L }, () => ({ total: 0, slots: [] }));
    const order = [...valid].sort((a, b) => (rates[b] || 0) - (rates[a] || 0));
    for (const s of order) {
        let g = 0;
        for (let i = 1; i < L; i++) if (groups[i].total < groups[g].total) g = i;
        groups[g].total += (rates[s] || 0);
        groups[g].slots.push(s);
    }
    groups.forEach((grp, i) => grp.slots.forEach(s => { mons[s].species = speciesList[i]; }));
}

// T-162 — apply a sweep plan to a parsed wild_encounter group (mutates & returns it). The plan is
// keyed by TEMPLATE species: wildPlan[templateSpecies] = [pickedIds]. For every slot in the JSON
// that currently holds a template species, that method's slots are re-filled with the template's
// picks (distributed to equalise probability), preserving each slot's level. This mirrors the legacy
// species substitution — placement follows where the template sits in the JSON, not wild.js map ids
// (which don't match for split maps) — but writes N species per zone instead of one. Rock-smash and
// any species not in the plan are left untouched; a shared super template fills every slot holding it.
function applyWildPlanToEncounters(group, wildPlan) {
    if (!group || !Array.isArray(group.encounters)) return group;
    const fields = group.fields || [];
    const tableRates = {
        land_mons: (fields.find(f => f.type === 'land_mons') || {}).encounter_rates || [],
        water_mons: (fields.find(f => f.type === 'water_mons') || {}).encounter_rates || [],
        rock_smash_mons: (fields.find(f => f.type === 'rock_smash_mons') || {}).encounter_rates || [],
        fishing_mons: (fields.find(f => f.type === 'fishing_mons') || {}).encounter_rates || [],
    };
    const plan = wildPlan || {};

    for (const enc of group.encounters) {
        for (const table of Object.keys(tableRates)) {
            const block = enc[table];
            if (!block || !Array.isArray(block.mons)) continue;
            // Group this table's slots by the species currently in them (captured before mutating).
            const slotsBySpecies = new Map();
            block.mons.forEach((m, i) => {
                if (!slotsBySpecies.has(m.species)) slotsBySpecies.set(m.species, []);
                slotsBySpecies.get(m.species).push(i);
            });
            for (const [species, slotIdx] of slotsBySpecies) {
                const picks = plan[species];
                if (picks && picks.length > 0) {
                    distributeSpeciesAcrossSlots(block.mons, slotIdx, tableRates[table], picks);
                }
            }
        }
    }
    return group;
}

// Build the trainersResults structure from the pre-resolved docs teams stored in the bundle
// (rom.docs.trainersResultsSimplified). The docs already hold every fully-resolved member
// (species, item, nature, moves, IVs, ability) so the ROM is guaranteed to match the docs —
// this is the single source of truth that removes the RNG re-resolution desync entirely.
// The only transformation needed is mapping the species id back to its pokemon object, since
// the .party formatter reads pokemon.name. Consumes no RNG.
// T-087/ADR-014 — set a trainer's `Double Battle:` header line from its resolved battle type.
// `battleType` is 'singles' | 'doubles'; anything else (undefined) leaves the header untouched, so
// bundles predating the field behave exactly as before. Replaces an existing line, else inserts it
// before the `AI:` line (or before the header's trailing blank line as a last resort).
function applyDoubleBattleHeader(headerBlock, battleType) {
    if (battleType !== 'singles' && battleType !== 'doubles') return headerBlock;
    const desired = `Double Battle: ${battleType === 'doubles' ? 'Yes' : 'No'}`;
    if (/^Double Battle:.*$/m.test(headerBlock)) {
        return headerBlock.replace(/^Double Battle:.*$/m, desired);
    }
    if (/^AI:.*$/m.test(headerBlock)) {
        return headerBlock.replace(/^(AI:.*)$/m, `${desired}\n$1`);
    }
    return headerBlock.replace(/(\r?\n\r?\n)/, `\n${desired}$1`);
}

// T-087 — safety net for ADR-014's ≥2-mon rule: a trainer marked doubles whose written team has
// fewer than 2 members is emitted as singles (a double battle needs two Pokémon).
function effectiveBattleType(battleType, teamLength) {
    if (battleType === 'doubles' && teamLength < 2) return 'singles';
    return battleType;
}

function buildTrainersResultsFromDocs(docsTrainers, pokemonList) {
    const byId = new Map(pokemonList.map(p => [p.id, p]));
    const result = {};
    Object.entries(docsTrainers).forEach(([trainerId, td]) => {
        result[trainerId] = {
            level: td.level,
            class: td.class,
            reward: td.reward || [],
            isBoss: td.isBoss || false,
            isPartner: td.isPartner || false,
            label: td.label || null,
            location: td.location || null,
            battleType: td.battleType || 'singles',   // T-087/ADR-014
            choiceBattle: td.choiceBattle || null,     // T-116 — Run & Bun E4 choice info
            team: (td.team || []).map(member => ({
                ...member,
                // B-045 — use the override-aware name so a fallback keeps a collapsed cosmetic form's
                // base name ("Vivillon", not "Vivillon Icy Snow") if it is missing from the pokedex.
                pokemon: byId.get(member.pokemon)
                    || { id: member.pokemon, name: nameizyPokemonId(member.pokemon) },
            })),
        };
    });
    return result;
}

// Resolve the ordered mint pools used to replace the route mail items, as ITEM_ consts.
// The order is chosen once at bundle-creation time (randomizeItems) and stored on
// itemAssignments as display names; here we just convert it back. Falls back to the
// static pools (definition order) for older bundles / when not provided. No RNG.
function resolveMailMints(itemAssignments, items) {
    const toConsts = (stored, pool) => (stored && stored.length)
        ? stored.map(displayNameToItemConst)
        : [...pool];
    return {
        wood: toConsts(itemAssignments.woodMailMints, items.midMints),
        wave: toConsts(itemAssignments.waveMailMints, items.strongDefMints),
        mech: toConsts(itemAssignments.mechMailMints, items.strongAtkMints),
    };
}

// baseRngSeed: when non-null, the RNG is reseeded at the start of each trainer slot
// using hash(baseRngSeed, trainer.id, slotIndex). This makes tier-based slots
// deterministic across ROMs that share a trainer artifact but differ in wild data.
// docs: when provided (bundle mode), trainer teams are taken verbatim from the pre-resolved
// docs instead of re-resolved via RNG — guaranteeing the ROM matches the bundle's docs.
async function writer(pokedexArtifact, trainersArtifact, startersArtifact, wildArtifact, isDebug, baseRngSeed = null, docs = null, runNs = '', starterNaming = null) {
    let { pokes: pokemonList, moves, abilities, items } = pokedexArtifact;
    // Deep-clone trainersData — mega trainer processing splices entries in-place,
    // which would corrupt the shared artifact when the same trainers object is used across ROMs.
    const { trainersData: _rawTrainersData, itemAssignments } = trainersArtifact;
    const trainersData = JSON.parse(JSON.stringify(_rawTrainersData));
    const { starters } = startersArtifact;
    const { extraStarters, gymRewards, staticRewards, replacementLog: wildReplacementLog, wildPlan, foundMegaEvos: wildFoundMegaEvos } = wildArtifact;

    // Palafin Hero is banned from picking (battle-only) but is the stat/type source for the
    // placed Zero form. Capture it before the ban filter strips it from pokemonList.
    const palafinHero = pokemonList.find(poke => poke.id === PALAFIN_HERO_ID);

    pokemonList = pokemonList.filter(poke => !BANNED_SPECIES_FOR_PICKING.includes(poke.id));

    // In bundle mode the evo levels were already chosen at bundle-creation time and
    // are stored on pokemonList[].evolutions[].param — write those verbatim (no RNG).
    // In randomize/analyze mode (no docs) roll them fresh.
    console.log(docs ? 'Writing evolution levels from bundle...' : 'Randomizing evolution levels...');
    await writeEvoLevels(pokemonList, { recompute: !docs });

    console.log('Updating starter pokemon...');

    let newStartersFile = await fs.readFile(startersFile, 'utf8');

    // Edit starterMonText with starters
    newStartersFile = newStartersFile.replace(
        starterMonText,
        `static const u16 sStarterMon[STARTER_MON_COUNT] =
{
    ${starters[0]},
    ${starters[1]},
    ${starters[2]},
};`
    );

    // Edit starterMonText with extra starters
    newStartersFile = newStartersFile.replace(
        starterExtraMonText,
        `static const u16 sStarterExtraMon[STARTER_EXTRA_COUNT] =
{
    ${extraStarters.join(',\n    ')},
};`
    );

    // Edit starterExtraCountText with actual count of extra starters
    newStartersFile = newStartersFile.replace(
        starterExtraCountText,
        `#define STARTER_EXTRA_COUNT ${extraStarters.length}`
    );

    // T-068 — in bundle mode with the nickname feature on, rewrite the nickname/gender arrays from the
    // bundle's per-ROM naming. When starterNaming is null (analyze/randomize mode, or feature off) the
    // committed vanilla defaults stay (empty names, MON_GENDERLESS) → unchanged behavior.
    if (starterNaming) {
        newStartersFile = applyStarterNames(newStartersFile, starterNaming, extraStarters.length);
    }

    await fs.writeFile(startersFile, newStartersFile, 'utf8');
    console.log('Starter pokemon updated successfully.');

    console.log(starters);
    console.log(extraStarters);

    const pokeRewardReplacements = [
        gymRewards.gym1,
        gymRewards.gym2,
        gymRewards.gym3,  // index 2 — gives mega stone
        gymRewards.gym4,
        gymRewards.gym5,
        gymRewards.gym6,
        gymRewards.gym7,
        gymRewards.gym8,
        gymRewards.slateportGrunts, // index 8 — gives mega stone
        gymRewards.shellyReward,    // index 9 — gives mega stone
        gymRewards.wallyLilycove,
    ];

    const replacementLog = {};
    for (let i = 0; i < pokemonRewardFiles.length; i++) {
        const gymFile = pokemonRewardFiles[i];
        let gymFileData = await fs.readFile(gymFile, 'utf8');
        gymFileData = gymFileData.replace(new RegExp(gymMonReplacement, 'g'), pokeRewardReplacements[i].id);
        gymFileData = gymFileData.replace(new RegExp(gymNameReplacement, 'g'), pokeRewardReplacements[i].name);
        if (i === 2 || i === 8 || i === 9) { // Mauville City Gym, Slateport Grunts, and Shelly give a mega stone
            // The stone was chosen at bundle-creation time and stored on the reward; read it
            // (no RNG). Fall back to a deterministic resolution for older bundles / randomize mode.
            const chosenItem = pokeRewardReplacements[i].megaStone
                || resolveRewardMegaStone(pokeRewardReplacements[i], pokemonList);
            if (chosenItem) {
                gymFileData = gymFileData.replace(new RegExp(gymItemReplacement, 'g'), chosenItem);
            }
            else {
                console.log(`No mega evolution found for ${pokeRewardReplacements[i].id}, keeping original item.`);
            }
        }
        await fs.writeFile(gymFile, gymFileData, 'utf8');
        replacementLog[`SPECIES_GYM${i + 1}_REWARD`] = pokeRewardReplacements[i].id;
    }

    if (staticRewards.regirock) {
        let regirockFileData = await fs.readFile(regirockReplacementFile, 'utf8');
        regirockFileData = regirockFileData.replace(new RegExp(regirockReplacementText, 'g'), staticRewards.regirock.id);
        await fs.writeFile(regirockReplacementFile, regirockFileData, 'utf8');
        replacementLog['SPECIES_REGIROCK'] = staticRewards.regirock.id;
    }

    if (staticRewards.regice) {
        let regiceFileData = await fs.readFile(regiceReplacementFile, 'utf8');
        regiceFileData = regiceFileData.replace(new RegExp(regiceReplacementText, 'g'), staticRewards.regice.id);
        await fs.writeFile(regiceReplacementFile, regiceFileData, 'utf8');
        replacementLog['SPECIES_REGICE'] = staticRewards.regice.id;
    }

    if (staticRewards.mew) {
        let mewFileData = await fs.readFile(mewReplacementFile, 'utf8');
        mewFileData = mewFileData.replace(new RegExp(mewReplacementText, 'g'), staticRewards.mew.id);
        await fs.writeFile(mewReplacementFile, mewFileData, 'utf8');
        replacementLog['SPECIES_MEW'] = staticRewards.mew.id;
    }

    if (staticRewards.registeel) {
        let registeelFileData = await fs.readFile(registeelReplacementFile, 'utf8');
        registeelFileData = registeelFileData.replace(new RegExp(registeelReplacementText, 'g'), staticRewards.registeel.id);
        await fs.writeFile(registeelReplacementFile, registeelFileData, 'utf8');
        replacementLog['SPECIES_REGISTEEL'] = staticRewards.registeel.id;
    }

    let skyPillarTopFileData = await fs.readFile(skyPillarTopReplacementFile, 'utf8');
    let scriptMenuFileData = await fs.readFile(scriptMenuReplacementFile, 'utf8');

    if (staticRewards.legend1) {
        skyPillarTopFileData = skyPillarTopFileData.replace(new RegExp(legend1ReplacementText, 'g'), staticRewards.legend1.id);
        scriptMenuFileData = scriptMenuFileData.replace(new RegExp(legend1ReplacementText, 'g'), staticRewards.legend1.name);
        replacementLog['SPECIES_LEGEND1'] = staticRewards.legend1.id;
    }

    if (staticRewards.legend2) {
        skyPillarTopFileData = skyPillarTopFileData.replace(new RegExp(legend2ReplacementText, 'g'), staticRewards.legend2.id);
        scriptMenuFileData = scriptMenuFileData.replace(new RegExp(legend2ReplacementText, 'g'), staticRewards.legend2.name);
        replacementLog['SPECIES_LEGEND2'] = staticRewards.legend2.id;
    }

    if (staticRewards.legend3) {
        skyPillarTopFileData = skyPillarTopFileData.replace(new RegExp(legend3ReplacementText, 'g'), staticRewards.legend3.id);
        scriptMenuFileData = scriptMenuFileData.replace(new RegExp(legend3ReplacementText, 'g'), staticRewards.legend3.name);
        replacementLog['SPECIES_LEGEND3'] = staticRewards.legend3.id;
    }

    await fs.writeFile(skyPillarTopReplacementFile, skyPillarTopFileData, 'utf8');
    await fs.writeFile(scriptMenuReplacementFile, scriptMenuFileData, 'utf8');

    // Routes replacements — selection was done in wildModule.
    // T-162: when the wild artifact carries a per-zone sweep plan, build the JSON structurally
    // (variable species per zone). Older bundles (no wildPlan) fall back to the legacy whole-file
    // species substitution so they still build identically.
    let wildEncountersFileContent = await fs.readFile((wild.file), 'utf8');

    if (wildPlan && Object.keys(wildPlan).length > 0) {
        const parsedWild = JSON.parse(wildEncountersFileContent);
        const group = (parsedWild.wild_encounter_groups || []).find(g => g.label === 'gWildMonHeaders')
            || (parsedWild.wild_encounter_groups || [])[0];
        if (group) applyWildPlanToEncounters(group, wildPlan);
        wildEncountersFileContent = JSON.stringify(parsedWild, null, 2) + '\n';
    } else {
        // Two-pass placeholder substitution (see substituteWildSpecies for why).
        wildEncountersFileContent = substituteWildSpecies(wildEncountersFileContent, wildReplacementLog);
    }

    // Record the applied replacements for the documentation log (representative pick per template).
    Object.entries(wildReplacementLog).forEach(([speciesId, replacementId]) => {
        replacementLog[speciesId] = replacementId;
    });

    await fs.writeFile((wild.file), wildEncountersFileContent, 'utf8');
    console.log('Wild encounters updated successfully.');

    // Items

    // Replace the route mail items with the pre-chosen mint order (no RNG): the order was
    // decided at bundle-creation time and stored on itemAssignments. Consume it sequentially
    // across all route files (awaited, deterministic — not fire-and-forget).
    const mailMints = resolveMailMints(itemAssignments, items);
    let woodIdx = 0, waveIdx = 0, mechIdx = 0;
    for (const routeFile of routeFiles) {
        let routeFileContent = await fs.readFile(routeFile, 'utf8');

        routeFileContent = routeFileContent.replace(/ITEM_WOOD_MAIL/g, () => mailMints.wood[woodIdx++ % mailMints.wood.length]);
        routeFileContent = routeFileContent.replace(/ITEM_WAVE_MAIL/g, () => mailMints.wave[waveIdx++ % mailMints.wave.length]);
        routeFileContent = routeFileContent.replace(/ITEM_MECH_MAIL/g, () => mailMints.mech[mechIdx++ % mailMints.mech.length]);

        await fs.writeFile(routeFile, routeFileContent, 'utf8');
    }

    // Sort mega evos
    const foundMegaEvos = [...wildFoundMegaEvos].sort((a, b) => a.level - b.level);
    
    // Assign mega evos to trainers
    const megaTrainers = MEGA_TRAINERS;
    const megaReplacementLog = {};
    const megaRemoveLog = [];
    
    const megaTrainerFilesContent = {};
    async function removeMegaTrainer(megaTrainer) {
        // data/maps/_map_/map.json
        let mapJson = megaTrainerFilesContent[megaTrainer.map];
        if (!mapJson) {
            const mapJsonPath = path.resolve(__dirname, '..', 'data', 'maps', megaTrainer.map, 'map.json');
            const mapJsonContent = await fs.readFile(mapJsonPath, 'utf8');
            mapJson = JSON.parse(mapJsonContent);
        }
        mapJson.object_events = mapJson.object_events.filter(
            event => event.script !== megaTrainer.script
            && event.trainer_sight_or_berry_tree_id !== `ITEM_MEGA_${megaTrainer.id}`
        );
        megaTrainerFilesContent[megaTrainer.map] = mapJson;
        const trainerIndex = trainersData.findIndex(trainer => trainer.id === megaTrainer.trainer);
        if (trainerIndex >= 0) {
            trainersData.splice(trainerIndex, 1);
        }
        console.log(`Removed mega trainer ${megaTrainer.id} from map ${megaTrainer.map}.`);
        megaRemoveLog.push(megaTrainer.id);
    }

    /* megaEvo structure:
        {
            family: poke.family,
            megaFormId: megaForm.id,
            baseFormId: baseForm.id,
            item: megaForm.evolutionData.megaItem,
            level: Math.max(levelFound, evolveLevel),
        }
    */
    async function updateMegaTrainer(megaTrainer, megaEvo) {
        let mapJson = megaTrainerFilesContent[megaTrainer.map];
        if (!mapJson) {
            const mapJsonPath = path.resolve(__dirname, '..', 'data', 'maps', megaTrainer.map, 'map.json');
            const mapJsonContent = await fs.readFile(mapJsonPath, 'utf8');
            mapJson = JSON.parse(mapJsonContent);
        }
        mapJson.object_events.forEach(event => {
            if (event.trainer_sight_or_berry_tree_id === `ITEM_MEGA_${megaTrainer.id}`) {
                event.trainer_sight_or_berry_tree_id = megaEvo.item;
            }
        });
        megaTrainerFilesContent[megaTrainer.map] = mapJson;
        megaReplacementLog[`ITEM_MEGA_${megaTrainer.id}`] = megaEvo.item;
        console.log(`Assigned mega evolution ${megaEvo.megaFormId} to mega trainer ${megaTrainer.id} on map ${megaTrainer.map}.`);
    }

    let nextMegaEvo = foundMegaEvos.shift();
    for (let i = 0; i < megaTrainers.length; i++) {
        const foundTrainer = trainersData.find(trainer => trainer.id === megaTrainers[i].trainer);
        if (!foundTrainer) {
            throw new Error(`Could not find trainer with id ${megaTrainers[i].trainer} to assign mega evolution.`);
        }
        const level = foundTrainer.level;

        if (!nextMegaEvo || nextMegaEvo.level > level) {
            await removeMegaTrainer(megaTrainers[i]);
            continue;
        }

        await updateMegaTrainer(megaTrainers[i], nextMegaEvo);
        
        // End condition
        if (!foundMegaEvos.length) {
            nextMegaEvo = null;
            continue;
        }
        nextMegaEvo = foundMegaEvos.shift();
    }

    const contentEntries = Object.entries(megaTrainerFilesContent);
    for (let i = 0; i < contentEntries.length; i++) {
        const [map, mapJson] = contentEntries[i];
        const mapJsonPath = path.resolve(__dirname, '..', 'data', 'maps', map, 'map.json');
        await fs.writeFile(
            mapJsonPath,
            JSON.stringify(mapJson, null, 2),
            'utf8'
        );
    }

    // Trainers

    let trainersFileContent = await fs.readFile(trainers.file, 'utf8');
    let partnersFileContent = await fs.readFile(trainers.partnersFile, 'utf8');
    const trainersResults = {};

    if (docs) {
        // Single source of truth: take the fully-resolved teams from the bundle's docs
        // instead of re-resolving them via RNG. Guarantees the ROM matches the docs.
        Object.assign(trainersResults, buildTrainersResultsFromDocs(docs.trainersResultsSimplified, pokemonList));
    } else {
    const sophistication = createSophisticationScale(trainersData);
    const { resolveTrainerTeam } = createTeamResolver({
        pokemonList, moves, abilities, starters, staticRewards,
        replacementLog, wildPlan, megaReplacementLog, baseRngSeed, palafinHero,
        sophistication,
    });
    trainersData.forEach(trainer => {
        normalizeTrainerBagTms(trainer);

        if (trainer.copy) {
            const target = trainersResults[trainer.copy];
            trainersResults[trainer.id] = {
                level: target.level,
                isBoss: target.isBoss,
                team: [...target.team],
                class: trainer.class,
                colors: trainer.colors,   // T-044 — copied team, but this trainer's own card colours
                battleType: trainer.battleType || 'singles',   // T-116 — Brendan shares May's battle type
            };
            return;
        }

        const team = resolveTrainerTeam(trainer);

        trainersResults[trainer.id] = {
            level: trainer.level,
            class: trainer.class || 'Red Back',
            reward: (trainer.reward || []).map(r => {
                if (r.startsWith('SPECIES_')) {
                    return nameify((replacementLog[r] || r).replace('SPECIES_', ''));
                }
                if (r.startsWith('ITEM_')) {
                    const megaStone = megaReplacementLog[r];
                    return itemIdToName(megaStone);
                }
                if (r.startsWith('TM_')) {
                    return 'TM ' + nameify(r.replace('TM_', ''));
                }
                if (r.startsWith('GYM_REWARD_')) {
                    const gymIndex = parseInt(r.replace('GYM_REWARD_', '')) - 1;
                    return pokeRewardReplacements[gymIndex].name;
                }
                return r;
            }) || [],
            isBoss: trainer.isBoss || false,
            isPartner: trainer.isPartner || false,
            location: trainer.location || null,
            colors: trainer.colors,   // T-044 — docs-viewer card colours (SSOT: trainerColors.js)
            team,
            battleType: trainer.battleType || 'singles',   // T-087/ADR-014
        };
    });
    }

    Object.entries(trainersResults).forEach(([trainerId, trainerData]) => {
        let shuffledTeam = [...trainerData.team];
        if (isDebug) {
            trainerData.level = 5;
            shuffledTeam = [shuffledTeam[0]];
        }
        else if (!docs) {
            shuffledTeam = shuffledTeam.sort(() => rng.random() - 0.5);
            shuffledTeam = applyLeadLogic(shuffledTeam, () => rng.random());
        }

        const generatedTeamTextLines = shuffledTeam.map(teamEntry => {
            const lines = [
                teamEntry.item ? `${teamEntry.pokemon.name} @ ${teamEntry.item}` : teamEntry.pokemon.name,
            ];
            if (teamEntry.ability) {
                lines.push(`Ability: ${teamEntry.ability}`);
            }
            lines.push(`Level: ${trainerData.level}`);
            if (teamEntry.nature) {
                lines.push(`Nature: ${teamEntry.nature}`);
            }
            const iv = teamEntry.ivs;
            lines.push(`IVs: ${iv.hp} HP / ${iv.atk} Atk / ${iv.def} Def / ${iv.spa} SpA / ${iv.spd} SpD / ${iv.spe} Spe`);
            if (teamEntry.moves && teamEntry.moves.length > 0) {
                const moveNames = teamEntry.moves.slice(0, 4)
                    .map(m => moves[m] ? moves[m].name : m);
                lines.push(`- ${moveNames.join('\n- ')}`);
            }
            return [...lines, ''];
        }).flat().join('\n');
        
        /* Trainers will be like this
        === TRAINER_ELIJAH ===
        Name: ELIJAH
        Class: Bird Keeper
        Pic: Bird Keeper
        Gender: Male
        Music: Cool
        Double Battle: No
        AI: Check Bad Move

        Zigzagoon
        Level: 5
        IVs: 0 HP / 0 Atk / 0 Def / 0 SpA / 0 SpD / 0 Spe

        === OTHER TRAINER ===
        */

        // Find the trainer name, keep all the content after it until the first pokemon, which will be always after blank line
        // Replace everything up to === OTHER TRAINER === or end of file with the generated team

        const replaceRegex = new RegExp(`(=== ${trainerId} ===[\\s\\S\\n\\r]*?[\\n\\r][\\n\\r])([\\s\\S\\n\\r]*?)(===|$)`, 'g');
        // Group 1 is the text to keep before the team
        // Group 2 is the text to replace (the team)
        // Group 3 is the === of the next trainer or end of file, to keep as is
        // Mind, Group 2 could appear multiple times in the file and I want to replace this specific trainer
        // T-087/ADR-014 — rewrite the header's `Double Battle:` line from the trainer's battle type
        // (with the ≥2-mon safety net based on the actually-written team); partners keep their header.
        const effBattleType = effectiveBattleType(trainerData.battleType, shuffledTeam.length);
        const replacer = (match, header, _team, tail) =>
            `${trainerData.isPartner ? header : applyDoubleBattleHeader(header, effBattleType)}${generatedTeamTextLines}\n${tail}`;
        if (trainerData.isPartner) {
            partnersFileContent = partnersFileContent.replace(replaceRegex, replacer);
        }
        else {
            trainersFileContent = trainersFileContent.replace(replaceRegex, replacer);
        }
    });

    await fs.writeFile((trainers.file), trainersFileContent, 'utf8');
    await fs.writeFile((trainers.partnersFile), partnersFileContent, 'utf8');
    console.log('Trainers updated successfully.');

    // Write teachable_learnsets.h LAST among src/ writes so its timestamp is newer than
    // all data/**/*.inc files. The Makefile's TEACHABLE_DEPS includes those .inc files —
    // if any .inc is newer than teachable_learnsets.h, make_teachables.py regenerates it,
    // wiping the expanded teachables. Writing it last prevents that.
    console.log('Writing expanded teachable learnsets to file...');
    await savePokemonData(pokemonList);

    // Verify timestamp ordering against ALL TEACHABLE_DEPS from the Makefile:
    //   $(ALL_LEARNABLES_JSON)  tools/learnset_helpers/build/all_learnables.json
    //   $(shell find data/ -type f -name "*.inc")
    //   include/constants/tms_hms.h
    //   include/config/pokemon.h
    //   src/pokemon.c
    // If any dep is newer than teachable_learnsets.h, make_teachables.py will overwrite it.
    // NOTE: the shell scripts now also run `touch teachable_learnsets.h` after node finishes,
    // which is the definitive guard. This check is purely diagnostic.
    {
        const repoRoot = path.resolve(__dirname, '..');
        const teachablePath = path.resolve(repoRoot, 'src', 'data', 'pokemon', 'teachable_learnsets.h');
        const teachableStat = await fs.stat(teachablePath);
        const teachableTime = teachableStat.mtimeMs;

        const { execSync } = require('child_process');
        const knownDeps = [
            'tools/learnset_helpers/build/all_learnables.json',
            'include/constants/tms_hms.h',
            'include/config/pokemon.h',
            'src/pokemon.c',
        ];
        const warnings = [];

        // Check known static deps
        for (const depFile of knownDeps) {
            try {
                const st = await fs.stat(path.resolve(repoRoot, depFile));
                if (st.mtimeMs > teachableTime) {
                    warnings.push(`"${depFile}" (${new Date(st.mtimeMs).toISOString()})`);
                }
            } catch (_) { /* file may not exist yet */ }
        }

        // Check all data/**/*.inc files
        try {
            const incFiles = execSync('find data/ -type f -name "*.inc"', {
                cwd: repoRoot,
                encoding: 'utf8',
            }).trim().split('\n').filter(Boolean);
            for (const incFile of incFiles) {
                const st = await fs.stat(path.resolve(repoRoot, incFile));
                if (st.mtimeMs > teachableTime) {
                    warnings.push(`"${incFile}" (${new Date(st.mtimeMs).toISOString()})`);
                }
            }
        } catch (e) {
            console.warn('[TEACHABLE-DEBUG] Could not scan data/*.inc timestamps:', e.message);
        }

        if (warnings.length > 0) {
            console.warn(`[TEACHABLE-TIMESTAMP-WARNING] teachable_learnsets.h (${new Date(teachableTime).toISOString()}) is OLDER than these TEACHABLE_DEPS — make_teachables.py may overwrite the expanded teachables:`);
            warnings.forEach(w => console.warn(`  NEWER: ${w}`));
        } else {
            console.log(`[TEACHABLE-TIMESTAMP-OK] teachable_learnsets.h (${new Date(teachableTime).toISOString()}) is newer than all TEACHABLE_DEPS. Make will NOT regenerate it.`);
        }
    }

    // Single source of truth: the docs template lives at frontend/template.html (the file the
    // browser serves via fetch('/template.html')). The Node/analyze path reads the same file so
    // the two runtimes never drift. out.html is still written into OUTPUT_DIR below.
    let htmlOutputTemplate = await fs.readFile(path.resolve(__dirname, '..', 'frontend', TEMPLATE_FILE), 'utf8');

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
    // T-163 — the out.html viewer shows the docs-visibility-redacted teams (viewerTrainers) when a
    // bundle's docs are present; the analyze.js path (docs=null) has no config, so it shows the full
    // teams built above (default visibility). The ROM itself always uses the FULL trainersResults.
    const docsTrainers = (docs && docs.viewerTrainers) ? docs.viewerTrainers : trainersResultsSimplified;
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_TRAINERS_REPLACEMENT, `<script>const trainersData = ${JSON.stringify(docsTrainers)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'trainers.js'), `const trainersData = ${JSON.stringify(docsTrainers, null, 4)};`, 'utf8');
    // T-044 — move-chip type colours (SSOT: trainerColors.js). Injected here for out.html;
    // the browser doc-builder (frontend/js/app.js) injects the same from rom.docs.typeColors.
    const typeColorsData = typeMainColors();
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_COLORS_REPLACEMENT, `<script>const typeColors = ${JSON.stringify(typeColorsData)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'colors.js'), `const typeColors = ${JSON.stringify(typeColorsData, null, 4)};`, 'utf8');
    // T-111 — the viewer never reads the per-cap contextual maps (it uses poke.rating.tier /
    // poke.tierDoubles); ship a slimmed copy so out.html doesn't carry ~10 MB × 2 of dead data.
    // Copy (don't mutate pokemonList — savePokemonData above already ran off the full objects).
    const docPokes = pokemonList.map(p => { const o = { ...p }; delete o.contextualRatings; delete o.contextualRatingsDoubles; return o; });
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_POKEMON_REPLACEMENT, `<script>const pokes = ${JSON.stringify(docPokes)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'pokes.js'), `const pokes = ${JSON.stringify(docPokes, null, 4)};`, 'utf8');
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_MOVES_REPLACEMENT, `<script>const movesData = ${JSON.stringify(moves)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'moves.js'), `const movesData = ${JSON.stringify(moves, null, 4)};`, 'utf8');
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_ABILITIES_REPLACEMENT, `<script>const abilitiesData = ${JSON.stringify(abilities)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'abilities.js'), `const abilitiesData = ${JSON.stringify(abilities, null, 4)};`, 'utf8');
    // T-078 — item descriptions (name-keyed) for held-item / reward hover tooltips. Same injection in
    // the browser doc-builder (frontend/js/app.js) from pokedex.items.
    const itemsData = items || {};
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_ITEMS_REPLACEMENT, `<script>const itemsData = ${JSON.stringify(itemsData)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'items.js'), `const itemsData = ${JSON.stringify(itemsData, null, 4)};`, 'utf8');
    const maps = wild.maps.map(({ id, ...keys }) => {
        const result = {
            id,
        };
        Object.entries(keys).forEach(([key, value]) => {
            if (value !== undefined) {
                result[key] = replacementLog[value];
            }
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
    // Extract static/legendary encounter entries to reposition them geographically.
    // Object.assign mutates and returns the extracted entry so we can add props inline.
    const extractMap = (id, extra = {}) => {
        const idx = maps.findIndex(m => m.id === id);
        return idx !== -1 ? Object.assign(maps.splice(idx, 1)[0], extra) : null;
    };
    const desertRuinsEntry = extractMap('MAP_DESERT_RUINS',   { label: 'Desert Ruins',  staticEncounter: true });
    const islandCaveEntry  = extractMap('MAP_ISLAND_CAVE',    { label: 'Island Cave',   staticEncounter: true });
    const newMauvilleEntry = extractMap('MAP_NEW_MAUVILLE',   { label: 'New Mauville',  staticEncounter: true });
    const ancientTombEntry = extractMap('MAP_ANCIENT_TOMB',   { label: 'Ancient Tomb',  staticEncounter: true });
    const skyPillarEntry   = extractMap('MAP_SKY_PILLAR_TOP', { label: 'Sky Pillar Top', legendaryEncounter: true });
    const route123Entry    = extractMap('MAP_ROUTE123');

    // Insertions: groups sharing the same afterMap are listed in REVERSE desired order so
    // repeated splices at idx+1 yield the correct final sequence.
    const insertions = [
        // Route 116 → Roxanne
        { afterMap: 'MAP_ROUTE116', entry: { id: 'BOSS_ROXANNE_REWARD',          label: 'Roxanne Reward',          boss: true, special1: pokeRewardReplacements[0].id } },
        // Route 106 → Brawly (before Granite Cave)
        { afterMap: 'MAP_ROUTE106', entry: { id: 'BOSS_BRAWLY_REWARD',           label: 'Brawly Reward',           boss: true, special1: pokeRewardReplacements[1].id } },
        // Route 109 → Slateport Grunts
        { afterMap: 'MAP_ROUTE109', entry: { id: 'BOSS_SLATEPORT_GRUNTS_REWARD', label: 'Slateport Grunts Reward', boss: true, special1: pokeRewardReplacements[8].id } },
        // Route 118 → Wattson
        { afterMap: 'MAP_ROUTE118', entry: { id: 'BOSS_WATTSON_REWARD',          label: 'Wattson Reward',          boss: true, special1: pokeRewardReplacements[2].id } },
        // Route 114 group (reverse order → final: Flannery, Desert Ruins, Norman, Island Cave)
        { afterMap: 'MAP_ROUTE114', entry: islandCaveEntry },
        { afterMap: 'MAP_ROUTE114', entry: { id: 'BOSS_NORMAN_REWARD',           label: 'Norman Reward',           boss: true, special1: pokeRewardReplacements[4].id } },
        { afterMap: 'MAP_ROUTE114', entry: desertRuinsEntry },
        { afterMap: 'MAP_ROUTE114', entry: { id: 'BOSS_FLANNERY_REWARD',         label: 'Flannery Reward',         boss: true, special1: pokeRewardReplacements[3].id } },
        // Island Cave → New Mauville (processed after Island Cave is placed)
        { afterMap: 'MAP_ISLAND_CAVE', entry: newMauvilleEntry },
        // Route 119 → Shelly
        { afterMap: 'MAP_ROUTE119', entry: { id: 'BOSS_SHELLY_REWARD',           label: 'Shelly Reward',           boss: true, special1: pokeRewardReplacements[9].id } },
        // Route 120 group (reverse order → final: Winona, Ancient Tomb)
        { afterMap: 'MAP_ROUTE120', entry: ancientTombEntry },
        { afterMap: 'MAP_ROUTE120', entry: { id: 'BOSS_WINONA_REWARD',           label: 'Winona Reward',           boss: true, special1: pokeRewardReplacements[5].id } },
        // Route 121 → Wally Lilycove
        { afterMap: 'MAP_ROUTE121', entry: { id: 'BOSS_WALLY_LILYCOVE',          label: 'Wally Lilycove Reward',   boss: true, special1: pokeRewardReplacements[10].id } },
        // Route 124 → Tate & Liza (before Route 125)
        { afterMap: 'MAP_ROUTE124', entry: { id: 'BOSS_TATE_LIZA_REWARD',        label: 'Tate & Liza Reward',      boss: true, special1: pokeRewardReplacements[6].id } },
        // Route 129 group (reverse order → final: Sky Pillar, Juan, Route 123)
        { afterMap: 'MAP_ROUTE129', entry: route123Entry },
        { afterMap: 'MAP_ROUTE129', entry: { id: 'BOSS_JUAN_REWARD',             label: 'Juan Reward',             boss: true, special1: pokeRewardReplacements[7].id } },
        { afterMap: 'MAP_ROUTE129', entry: skyPillarEntry },
    ];
    for (const { afterMap, entry } of insertions) {
        const idx = maps.findIndex(m => m.id === afterMap);
        if (idx !== -1) {
            maps.splice(idx + 1, 0, entry);
        } else {
            maps.push(entry);
        }
    }
    // T-163 — use the docs-visibility-redacted encounter maps from the bundle's docs when present
    // (hidden statics/rewards/zones removed, per-method species behind placeholders); the analyze.js
    // path (docs=null) falls back to the full inline maps built above (default visibility).
    const docsWild = (docs && docs.wildPokes) ? docs.wildPokes : maps;
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_WILDPOKES_REPALCEMENT, `<script>const wildPokes = ${JSON.stringify(docsWild)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'wildpokes.js'), `const wildPokes = ${JSON.stringify(docsWild, null, 4)};`, 'utf8');

    // T-005 — bake the per-run localStorage namespace into the doc so runs don't collide.
    // Left intact (token still present) when runNs is empty → template falls back to shared keys.
    if (runNs) {
        htmlOutputTemplate = htmlOutputTemplate.split('%%DOC_RUN_NS%%').join(runNs);
    }

    // @TODO Out name depends on a param
    const outFile = path.resolve(__dirname, OUTPUT_DIR, 'out.html');
    await fs.writeFile(outFile, htmlOutputTemplate, 'utf8');

    // Print all megas found in foundMegaEvos set
    for (const megaEvoId of foundMegaEvos) {
        console.log(`Found Mega Evolution used in trainers: ${megaEvoId}`);
    }

    console.log(`Output HTML file generated at ${outFile}`);
}

// T-005 — per-run localStorage namespace. Generated docs persist UI state (pokedex
// filters, nuzlocke tracker, nav) in localStorage. Without a namespace every doc shares
// the same keys, so two runs opened in the same browser/origin collide. This derives a
// stable id (baked into the doc via the %%DOC_RUN_NS%% token) so each run owns its own
// storage bucket. The browser path (frontend/js/app.js) mirrors this formula.
// Returns '' for empty input → the template then falls back to the legacy shared keys.
function docRunNamespace({ seed, playerIndex, romIndex } = {}) {
    const parts = [];
    if (seed !== undefined && seed !== null && String(seed) !== '') parts.push(`s${seed}`);
    if (playerIndex !== undefined && playerIndex !== null) parts.push(`p${playerIndex}`);
    if (romIndex !== undefined && romIndex !== null) parts.push(`r${romIndex}`);
    return parts.join('-').replace(/[^A-Za-z0-9_-]/g, '');
}

module.exports = writer;
module.exports.docRunNamespace = docRunNamespace;
module.exports.buildWildPlaceholderMap = buildWildPlaceholderMap;
module.exports.substituteWildSpecies = substituteWildSpecies;
module.exports.applyWildPlanToEncounters = applyWildPlanToEncounters;   // T-162
module.exports.distributeSpeciesAcrossSlots = distributeSpeciesAcrossSlots; // T-162
module.exports.buildTrainersResultsFromDocs = buildTrainersResultsFromDocs;
module.exports.resolveMailMints = resolveMailMints;
module.exports.applyDoubleBattleHeader = applyDoubleBattleHeader;   // T-087/ADR-014
module.exports.effectiveBattleType = effectiveBattleType;          // T-087/ADR-014
