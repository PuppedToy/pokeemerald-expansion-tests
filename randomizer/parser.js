'use strict';

const {
    EVO_TYPE_MEGA, EVO_TYPE_LC_OF_2, EVO_TYPE_LC_OF_3,
    EVO_TYPE_NFE_OF_3, EVO_TYPE_LAST_OF_2, EVO_TYPE_LAST_OF_3, EVO_TYPE_SOLO,
    POKE_FORMS, FAMILY_TYPE_MACROS,
} = require('./constants');

// Parse a `.types = MON_TYPES(...)` value into an array of real type names. Strips a trailing comment,
// the MON_TYPES(...) wrapper and the TYPE_ prefix, and resolves config-driven family-type macros
// (e.g. RALTS_FAMILY_TYPE2) to their concrete type so nothing downstream sees a raw macro (B-010).
function parseMonTypes(rawTypes) {
    return String(rawTypes)
        .replace(/\/\/.*$/, '').trim()
        .replace(/MON_TYPES\(/, '').replace(/\)/, '')
        .split(',').map(s => s.trim()).filter(Boolean)
        .map(t => t.replace('TYPE_', ''))
        .map(t => FAMILY_TYPE_MACROS[t] ?? t);
}

const evoIsLC = (evolutionType) => evolutionType === EVO_TYPE_LC_OF_3 || evolutionType === EVO_TYPE_LC_OF_2;
const evoIsNFE = (evolutionType) => evoIsLC(evolutionType) || evolutionType === EVO_TYPE_NFE_OF_3;
const evoIsFinal = (evolutionType) => evolutionType === EVO_TYPE_SOLO || evolutionType === EVO_TYPE_LAST_OF_3 || evolutionType === EVO_TYPE_LAST_OF_2 || evolutionType === EVO_TYPE_MEGA;

const SUPPORTED_PROPERTIES = [
    'baseHP',
    'baseAttack',
    'baseDefense',
    'baseSpeed',
    'baseSpAttack',
    'baseSpDefense',
    'types',
    'abilities',
    'speciesName',
    'levelUpLearnset',
    'teachableLearnset',
    'evolutions',
    'natDexNum',
    'isAlolanForm',
    'isGalarianForm',
    'isHisuianForm',
    'isPaldeanForm',
];

const FIXED_PROPERTIES = {
    catchRate: '255',
    expYield: '0',
};

// Families still fully skipped. UNOWN/SCATTERBUG/FLABEBE/FURFROU/MILCERY moved to COSMETIC_FAMILIES
// (T-154). Genesect/Arceus/Type:Null moved to COSMETIC_FAMILIES; Minior/Burmy/Ogerpon re-enabled by
// T-155/T-157. Nothing is fully removed any more.
const REMOVED_FAMILIES = [];

// Families reduced to a SINGLE form: only the FIRST species per natDexNum is kept, later same-dex forms
// are dropped (so they neither randomize independently nor emit one docs entry each — the docs path has
// no natDexNum collapse). Covers two cases with the same mechanism:
//   • T-154 cosmetic strips — Unown, Scatterbug/Spewpa/Vivillon, Flabébé/Floette/Florges, Furfrou,
//     Milcery/Alcremie. The kept form is the first-declared of each stage (Unown; the ICY_SNOW / RED
//     lines; Furfrou Natural; Milcery + Strawberry-Vanilla-Cream Alcremie), keeping evo chains consistent.
//   • T-155 base-only families — Genesect (base kept; its Drive forms are banned and Drives are not
//     placed as items).
const COSMETIC_FAMILIES = [
    'P_FAMILY_UNOWN',
    'P_FAMILY_SCATTERBUG',
    'P_FAMILY_FLABEBE',
    'P_FAMILY_FURFROU',
    'P_FAMILY_MILCERY',
    'P_FAMILY_GENESECT',
    // T-156 — Arceus: only the Normal form spawns/exists; the 17 other type forms are banned. The
    // "becomes type X with a Plate" behaviour is modelled virtually at the trainer/rater level via the
    // held Plate + Multitype ability, not by placing 18 species. Normal is the first-declared form (kept).
    'P_FAMILY_ARCEUS',
    // T-158 — Type: Null / Silvally: keep Type: Null (Normal) + Silvally-Normal (first form); the 17
    // Silvally type forms are banned. Silvally shares Arceus's Multitype+Plate treatment (its ability is
    // changed RKS System→Multitype in the C data), so the rater handles it like Arceus.
    'P_FAMILY_TYPE_NULL',
];

const REMOVED_SPECIES = [
    'SPECIES_PICHU_SPIKY_EARED',
    'SPECIES_PIKACHU_COSPLAY',
    'SPECIES_PIKACHU_ROCK_STAR',
    'SPECIES_PIKACHU_BELLE',
    'SPECIES_PIKACHU_POP_STAR',
    'SPECIES_PIKACHU_PHD',
    'SPECIES_PIKACHU_LIBRE',
    'SPECIES_PIKACHU_ORIGINAL',
    'SPECIES_PIKACHU_HOENN',
    'SPECIES_PIKACHU_SINNOH',
    'SPECIES_PIKACHU_UNOVA',
    'SPECIES_PIKACHU_KALOS',
    'SPECIES_PIKACHU_ALOLA',
    'SPECIES_PIKACHU_PARTNER',
    'SPECIES_PIKACHU_WORLD',
    'SPECIES_PIKACHU_GMAX',
    'SPECIES_PIKACHU_STARTER',
    'SPECIES_EEVEE_STARTER',
    'SPECIES_CRAMORANT_GORGING',
    'SPECIES_CRAMORANT_GULPING',
    'SPECIES_EISCUE_NOICE',
    'SPECIES_MIMIKYU_BUSTED',
    'SPECIES_ZYGARDE_10_POWER_CONSTRUCT',
    // T-155 — Minior: keep only the Red color pair (Meteor placeable, Core rated-but-banned); the
    // other six colors are cosmetic. Both forms of the kept pair must parse (the rater reads Core's
    // stats via the effective-poke special-case), so Minior can't use the COSMETIC_FAMILIES strip.
    'SPECIES_MINIOR_METEOR_ORANGE',
    'SPECIES_MINIOR_METEOR_YELLOW',
    'SPECIES_MINIOR_METEOR_GREEN',
    'SPECIES_MINIOR_METEOR_BLUE',
    'SPECIES_MINIOR_METEOR_INDIGO',
    'SPECIES_MINIOR_METEOR_VIOLET',
    'SPECIES_MINIOR_CORE_ORANGE',
    'SPECIES_MINIOR_CORE_YELLOW',
    'SPECIES_MINIOR_CORE_GREEN',
    'SPECIES_MINIOR_CORE_BLUE',
    'SPECIES_MINIOR_CORE_INDIGO',
    'SPECIES_MINIOR_CORE_VIOLET',
    // B-040 — Mothim has no cloak forms. MOTHIM_PLANT/SANDY/TRASH are byte-identical dupes and
    // SPECIES_MOTHIM aliases MOTHIM_PLANT, so only Plant (the base Mothim) is kept; all three Burmy
    // cloaks evolve into it (Sandy/Trash stone-evo targets are remapped via EVOLUTION_TARGET_ALIASES).
    // (Wormadam's three cloak forms are genuinely different types and are NOT collapsed.)
    'SPECIES_MOTHIM_SANDY',
    'SPECIES_MOTHIM_TRASH',
];

const CUSTOM_FAMILIES = {
    SPECIES_NIDORAN_M: 'P_FAMILY_NIDORAN_M',
    SPECIES_NIDORINO: 'P_FAMILY_NIDORAN_M',
    SPECIES_NIDOKING: 'P_FAMILY_NIDORAN_M',
    SPECIES_NIDORAN_F: 'P_FAMILY_NIDORAN_F',
    SPECIES_NIDORINA: 'P_FAMILY_NIDORAN_F',
    SPECIES_NIDOQUEEN: 'P_FAMILY_NIDORAN_F',
    // Regional forms that evolve from a non-regional base — share the base's family
    SPECIES_RAICHU_ALOLA:    'P_FAMILY_PIKACHU',
    SPECIES_EXEGGUTOR_ALOLA: 'P_FAMILY_EXEGGCUTE',
    SPECIES_MAROWAK_ALOLA:   'P_FAMILY_CUBONE',
    SPECIES_TYPHLOSION_HISUI: 'P_FAMILY_CYNDAQUIL',
    SPECIES_SAMUROTT_HISUI:  'P_FAMILY_OSHAWOTT',
    SPECIES_LILLIGANT_HISUI: 'P_FAMILY_PETILIL',
    SPECIES_BRAVIARY_HISUI:  'P_FAMILY_RUFFLET',
    SPECIES_AVALUGG_HISUI:   'P_FAMILY_BERGMITE',
    SPECIES_DECIDUEYE_HISUI: 'P_FAMILY_ROWLET',
};

const REMOVED_MOVES = [
    'MOVE_NONE',
    'MOVE_BREAKNECK_BLITZ',
    'MOVE_ALL_OUT_PUMMELING',
    'MOVE_SUPERSONIC_SKYSTRIKE',
    'MOVE_ACID_DOWNPOUR',
    'MOVE_TECTONIC_RAGE',
    'MOVE_CONTINENTAL_CRUSH',
    'MOVE_SAVAGE_SPIN_OUT',
    'MOVE_NEVER_ENDING_NIGHTMARE',
    'MOVE_CORKSCREW_CRASH',
    'MOVE_INFERNO_OVERDRIVE',
    'MOVE_HYDRO_VORTEX',
    'MOVE_BLOOM_DOOM',
    'MOVE_GIGAVOLT_HAVOC',
    'MOVE_SHATTERED_PSYCHE',
    'MOVE_SUBZERO_SLAMMER',
    'MOVE_DEVASTATING_DRAKE',
    'MOVE_BLACK_HOLE_ECLIPSE',
    'MOVE_TWINKLE_TACKLE',
    'MOVE_CATASTROPIKA',
    'MOVE_10000000_VOLT_THUNDERBOLT',
    'MOVE_10_000_000_VOLT_THUNDERBOLT',
    'MOVE_STOKED_SPARKSURFER',
    'MOVE_EXTREME_EVOBOOST',
    'MOVE_PULVERIZING_PANCAKE',
    'MOVE_GENESIS_SUPERNOVA',
    'MOVE_SINISTER_ARROW_RAID',
    'MOVE_MALICIOUS_MOONSAULT',
    'MOVE_OCEANIC_OPERETTA',
    'MOVE_SPLINTERED_STORMSHARDS',
    'MOVE_LETS_SNUGGLE_FOREVER',
    'MOVE_CLANGOROUS_SOULBLAZE',
    'MOVE_GUARDIAN_OF_ALOLA',
    'MOVE_SEARING_SUNRAZE_SMASH',
    'MOVE_MENACING_MOONRAZE_MAELSTROM',
    'MOVE_LIGHT_THAT_BURNS_THE_SKY',
    'MOVE_SOUL_STEALING_7_STAR_STRIKE',
    'MOVE_MAX_GUARD',
    'MOVE_MAX_STRIKE',
    'MOVE_MAX_KNUCKLE',
    'MOVE_MAX_AIRSTREAM',
    'MOVE_MAX_OOZE',
    'MOVE_MAX_QUAKE',
    'MOVE_MAX_ROCKFALL',
    'MOVE_MAX_FLUTTERBY',
    'MOVE_MAX_PHANTASM',
    'MOVE_MAX_STEELSPIKE',
    'MOVE_MAX_FLARE',
    'MOVE_MAX_GEYSER',
    'MOVE_MAX_OVERGROWTH',
    'MOVE_MAX_LIGHTNING',
    'MOVE_MAX_MINDSTORM',
    'MOVE_MAX_HAILSTORM',
    'MOVE_MAX_WYRMWIND',
    'MOVE_MAX_DARKNESS',
    'MOVE_MAX_STARFALL',
    'MOVE_G_MAX_VINE_LASH',
    'MOVE_G_MAX_WILDFIRE',
    'MOVE_G_MAX_CANNONADE',
    'MOVE_G_MAX_BEFUDDLE',
    'MOVE_G_MAX_VOLT_CRASH',
    'MOVE_G_MAX_GOLD_RUSH',
    'MOVE_G_MAX_CHI_STRIKE',
    'MOVE_G_MAX_TERROR',
    'MOVE_G_MAX_FOAM_BURST',
    'MOVE_G_MAX_RESONANCE',
    'MOVE_G_MAX_CUDDLE',
    'MOVE_G_MAX_REPLENISH',
    'MOVE_G_MAX_MALODOR',
    'MOVE_G_MAX_MELTDOWN',
    'MOVE_G_MAX_DRUM_SOLO',
    'MOVE_G_MAX_FIREBALL',
    'MOVE_G_MAX_HYDROSNIPE',
    'MOVE_G_MAX_WIND_RAGE',
    'MOVE_G_MAX_GRAVITAS',
    'MOVE_G_MAX_STONESURGE',
    'MOVE_G_MAX_VOLCALITH',
    'MOVE_G_MAX_TARTNESS',
    'MOVE_G_MAX_SWEETNESS',
    'MOVE_G_MAX_SANDBLAST',
    'MOVE_G_MAX_STUN_SHOCK',
    'MOVE_G_MAX_CENTIFERNO',
    'MOVE_G_MAX_SMITE',
    'MOVE_G_MAX_SNOOZE',
    'MOVE_G_MAX_FINALE',
    'MOVE_G_MAX_STEELSURGE',
    'MOVE_G_MAX_DEPLETION',
    'MOVE_G_MAX_ONE_BLOW',
    'MOVE_G_MAX_RAPID_FLOW'
];

function processLineForDefinitions(line, definitions) {
    const regex = new RegExp(`^#define\\s+(.*?)\\s+(.*)$`);
    const match = line.match(regex);
    if (match) {
        const [, key, value] = match;
        definitions[key] = value.trim();
    }
}

// B-040 — canonicalize evolution targets that are removed cosmetic dupes onto the kept base species,
// so an evolution pointing at a dropped form (e.g. Burmy Sandy → Mothim Sandy) resolves to the real one.
const EVOLUTION_TARGET_ALIASES = {
    SPECIES_MOTHIM_SANDY: 'SPECIES_MOTHIM_PLANT',
    SPECIES_MOTHIM_TRASH: 'SPECIES_MOTHIM_PLANT',
};

const evoRegex = /{EVO_(.*?), (.*?), (.*?)(?:}|,)/;
function parseEvo(familyId, pokeId, line, evoTree) {
    const match = line.match(evoRegex);
    if (match) {
        const [, method, param, rawPokemon] = match;
        const pokemon = EVOLUTION_TARGET_ALIASES[rawPokemon.trim()] || rawPokemon.trim();
        // Frist time, create the family
        if (!evoTree[familyId]) {
            evoTree[familyId] = [pokeId, [pokemon]];
        }
        else {
            // If family already exists and I'm the base form, it's a branch evo
            if (evoTree[familyId][0] === pokeId) {
                evoTree[familyId][1].push(pokemon);
            }
            // If family already exists and I'm in the first evo stage, it's a 3-stage evo
            else if (evoTree[familyId][1].includes(pokeId)) {
                // If it's the first time we see a 3rd stage evo, create the array
                if (evoTree[familyId].length == 2) {
                    evoTree[familyId].push([pokemon]);
                }
                // Otherwise it's a branch for the 3rd stage evo
                else {
                    evoTree[familyId][2].push(pokemon);
                }
            }
            // Family already exists and I'm not in the first stage, so I'm a 2-stage evo
            // WTF does that mean?
            else {
                console.log(`Warning: Unexpected evo structure for family ${familyId} and poke ${pokeId}
                > ${line}`);
            }
        }
        const evo = {
            method: method.trim(),
            param: param.trim(),
            pokemon: pokemon.trim(),
        };
        // Capture an optional IF_MIN_LEVEL condition (used to level-gate stone evolutions).
        const minLevelMatch = line.match(/IF_MIN_LEVEL,\s*(\d+)/);
        if (minLevelMatch) {
            evo.minLevel = minLevelMatch[1];
        }
        return evo;
    }
    return null;
}

// T-153 — Capture multi-line `#define NAME(params) { ... }` (and paramless `#define NAME { ... }`)
// species-info macros so `[SPECIES_X] = NAME(args)` invocations can be expanded inline. Many families
// (Arceus, Minior, Mothim, Alcremie, Unown, Furfrou, Scatterbug/Spewpa, Ogerpon, Genesect) define
// their species this way; without expansion those species have no `.field` lines and no closing
// `},`, so parseSpeciesFile silently drops them. Returns { NAME: { params, body } } where body is the
// macro lines with trailing `\` stripped. Only struct-shaped macros (open `{`, set at least one
// `.field`) are kept, so unrelated function-like macros are ignored.
function parseSpeciesInfoMacros(text) {
    const lines = text.split('\n');
    const macros = {};
    for (let i = 0; i < lines.length; i++) {
        const header = lines[i].match(/^#define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?\s*\\\s*$/);
        if (!header) continue;
        const name = header[1];
        const params = header[2] ? header[2].split(',').map(s => s.trim()).filter(Boolean) : [];
        const body = [];
        let j = i + 1;
        while (j < lines.length) {
            const cont = /\\\s*$/.test(lines[j]);
            body.push(lines[j].replace(/\\\s*$/, ''));
            if (!cont) break;
            j++;
        }
        i = j;
        // Keep any macro whose body sets at least one `.field`. This covers both full-struct macros
        // (open `{`) and brace-less field fragments nested inside them (e.g. MINIOR_MISC_INFO,
        // ALCREMIE_MISC_INFO, ARCEUS_ICON). Utility macros (SHADOW/FOOTPRINT/OVERWORLD) set no
        // `.field` and are skipped.
        if (body.some(l => /^\s*\.\w+\s*=/.test(l))) {
            macros[name] = { params, body };
        }
    }
    return macros;
}

// Is `trimmed` (a body line with any trailing comma removed) a bare invocation of a captured macro?
// Returns the regex match [full, name, argString] or null.
function matchMacroInvocation(trimmed, macros) {
    const m = trimmed.replace(/,\s*$/, '').trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\((.*)\))?$/);
    return m && macros[m[1]] ? m : null;
}

// Recursively expand a species-info macro into its field lines, substituting params->args and
// expanding any nested fragment macros (e.g. MINIOR_CORE_SPECIES_INFO nests MINIOR_MISC_INFO;
// ALCREMIE_REGULAR_SPECIES_INFO nests ALCREMIE_MISC_INFO). `depth` guards against cycles.
function expandMacroBody(name, args, macros, depth = 0) {
    const macro = macros[name];
    if (!macro || depth > 12) return null;
    const subst = {};
    macro.params.forEach((p, idx) => { subst[p] = args[idx] !== undefined ? args[idx] : ''; });
    // Longest param name first so a shorter name that is a prefix of another can't shadow it.
    const alts = [...macro.params].sort((a, b) => b.length - a.length);
    const re = alts.length ? new RegExp('\\b(' + alts.join('|') + ')\\b', 'g') : null;
    const out = [];
    for (const bodyLine of macro.body) {
        let l = re ? bodyLine.replace(re, (_, p) => subst[p]) : bodyLine;
        l = l.replace(/\s*##\s*/g, ''); // resolve C token-paste (e.g. SPECIES_SPEWPA_##pattern)
        const nested = matchMacroInvocation(l.trim(), macros);
        if (nested) {
            const nestedArgs = nested[2] !== undefined ? splitTopLevelArgs(nested[2]) : [];
            const nestedLines = expandMacroBody(nested[1], nestedArgs, macros, depth + 1);
            if (nestedLines) { out.push(...nestedLines); continue; }
        }
        out.push(l);
    }
    return out;
}

// Split a macro argument list on top-level commas only (so nested `MON_TYPES(a, b)` etc. stay intact).
function splitTopLevelArgs(argString) {
    const args = [];
    let depth = 0, cur = '';
    for (const ch of argString) {
        if (ch === '(' || ch === '{' || ch === '[') { depth++; cur += ch; }
        else if (ch === ')' || ch === '}' || ch === ']') { depth--; cur += ch; }
        else if (ch === ',' && depth === 0) { args.push(cur.trim()); cur = ''; }
        else cur += ch;
    }
    if (cur.trim() !== '') args.push(cur.trim());
    return args;
}

// T-153 — Given a species header line `[SPECIES_X] = NAME(args),`, return the captured macro body with
// params substituted by args (and the trailing `}` turned into `},` so the species commits when the
// main loop reaches it). Returns null if the RHS is not a known species-info macro invocation (e.g. an
// inline `[SPECIES_X] =` header, whose struct body is on the following lines).
function expandSpeciesMacro(line, macros) {
    const rhs = line.slice(line.indexOf('=') + 1).trim().replace(/,\s*$/, '');
    const m = rhs.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\((.*)\))?$/);
    if (!m || !macros[m[1]]) return null;
    const args = m[2] !== undefined ? splitTopLevelArgs(m[2]) : [];
    const expanded = expandMacroBody(m[1], args, macros, 0);
    if (!expanded) return null;
    // Turn the struct's closing `}` into `},` so the main loop commits the species.
    return expanded.map(l => (l.trim() === '}' ? '    },' : l));
}

// T-154 — pre-scan for the cosmetic-strip drop-set: within each COSMETIC_FAMILIES block, resolve every
// species' natDexNum (expanding macros/fragments exactly as the main pass does) and mark all but the
// first species of each natDexNum for dropping. Returning the drop-set lets the main loop skip those
// species at the header — like REMOVED_SPECIES — before any evolution is parsed, so it is independent
// of whether `.natDexNum` precedes or follows `.evolutions` (Floette declares evolutions first) and
// leaves the evoTree completely untouched by dropped forms.
function computeCosmeticDropIds(lines, macros) {
    const drop = new Set();
    const seenDex = new Set();
    let family = null;
    let curId = null;
    const stream = lines.slice(); // macro splicing mutates a private copy
    for (let i = 0; i < stream.length; i++) {
        const line = stream[i];
        if (line.startsWith('#if P_FAMILY_')) { family = line.split(' ')[1]; curId = null; continue; }
        if (!family || !COSMETIC_FAMILIES.includes(family)) continue;
        if (line.startsWith('    [')) {
            curId = line.split('[')[1].split(']')[0];
            const expanded = expandSpeciesMacro(line, macros);
            if (expanded) stream.splice(i + 1, 0, ...expanded);
            continue;
        }
        if (!curId) continue;
        const bm = matchMacroInvocation(line.trim(), macros);
        if (bm) {
            const bmArgs = bm[2] !== undefined ? splitTopLevelArgs(bm[2]) : [];
            const bmLines = expandMacroBody(bm[1], bmArgs, macros, 0);
            if (bmLines) { stream.splice(i + 1, 0, ...bmLines); continue; }
        }
        if (line.startsWith('        .natDexNum')) {
            const dex = line.trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            const key = `${family}|${dex}`;
            if (seenDex.has(key)) drop.add(curId); else seenDex.add(key);
            curId = null;
        }
    }
    return drop;
}

function parseSpeciesFile(genSpeciesFileText, definitions, evoTree) {
    const lines = genSpeciesFileText.split('\n');
    const speciesMacros = parseSpeciesInfoMacros(genSpeciesFileText);
    const cosmeticDropIds = computeCosmeticDropIds(lines, speciesMacros); // T-154
    const pokemonList = [];
    let currentPokemon;
    let currentFamily;
    let currentEvos;
    for (let i = 0; i < lines.length; i++) {
        processLineForDefinitions(lines[i], definitions);
        if (lines[i].startsWith('#if P_FAMILY_')) {
            currentFamily = lines[i].split(' ')[1];
            if (REMOVED_FAMILIES.includes(currentFamily)) {
                console.log(`Skipping family ${currentFamily}`);
                currentFamily = null;
            }
            continue;
        }
        if (!currentFamily) continue;
        if (lines[i].startsWith('    [')) {
            currentPokemon = {
                id: lines[i].split('[')[1].split(']')[0],
                family: currentFamily,
            }
            if (CUSTOM_FAMILIES[currentPokemon.id]) {
                currentPokemon.family = CUSTOM_FAMILIES[currentPokemon.id];
            }
            else {
                let form = null;
                POKE_FORMS.forEach(pokeForm => {
                    if (currentPokemon.id.endsWith(`_${pokeForm}`)) {
                        form = pokeForm;
                        currentPokemon.family = `${currentFamily}_${pokeForm}`;
                    }
                });
                currentPokemon.form = form;
            }
            if (
                REMOVED_SPECIES.includes(currentPokemon.id)
                || currentPokemon.id.includes('_GMAX')
                || currentPokemon.id.includes('_TOTEM')
                || currentPokemon.id.endsWith('_TERA') // T-157 — Ogerpon battle-only Terastal forms
                || cosmeticDropIds.has(currentPokemon.id) // T-154 — non-first cosmetic form
            ) {
                console.log(`Skipping species ${currentPokemon.id}`);
                currentPokemon = null;
                continue;
            }
            // T-153 — if the species is defined via a species-info macro (`= FOO_SPECIES_INFO(args)`),
            // expand the captured macro body inline so its `.field` lines parse like an inline struct.
            const expanded = expandSpeciesMacro(lines[i], speciesMacros);
            if (expanded) {
                lines.splice(i + 1, 0, ...expanded);
            }
        }
        if (!currentPokemon) continue;
        // T-153 — a fragment/species macro invoked on its own line inside an inline struct body
        // (e.g. inline Vivillon uses `VIVILLON_MISC_INFO(...)`); expand it in place so its fields parse.
        const bodyMacro = matchMacroInvocation(lines[i].trim(), speciesMacros);
        if (bodyMacro) {
            const bmArgs = bodyMacro[2] !== undefined ? splitTopLevelArgs(bodyMacro[2]) : [];
            const bmLines = expandMacroBody(bodyMacro[1], bmArgs, speciesMacros, 0);
            if (bmLines) {
                lines.splice(i + 1, 0, ...bmLines);
                continue;
            }
        }
        if (lines[i].includes('.evolutions = EVOLUTION(')) {
            currentEvos = [
                parseEvo(currentPokemon.family, currentPokemon.id, lines[i], evoTree),
            ];
            continue;
        }
        if (lines[i].startsWith('        .')) {
            if (currentEvos) {
                currentPokemon.evolutions = currentEvos.filter(e => e !== null);
                currentEvos = null;
            }
            const currentProperty = lines[i].trim().split('.')[1].split(' ')[0];
            const currentValue = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            if (SUPPORTED_PROPERTIES.includes(currentProperty) && !currentPokemon[currentProperty]) {
                currentPokemon[currentProperty] = currentValue;
            }
            continue;
        }
        if (currentEvos) {
            const parsedEvo = parseEvo(currentPokemon.family, currentPokemon.id, lines[i], evoTree);
            if (parsedEvo) {
                currentEvos.push(parsedEvo);
                continue;
            }
        }
        if (lines[i].startsWith('    },')) {
            if (currentEvos) {
                currentPokemon.evolutions = currentEvos.filter(e => e !== null);
                currentEvos = null;
            }
            pokemonList.push(currentPokemon);
            currentPokemon = null;
        }
    }
    return pokemonList;
}

// Concatenate every "..." segment of a C string literal (possibly spread over several lines,
// e.g. inside COMPOUND_STRING(...) or _(...)) into one human-readable string. The pokeemerald
// text control codes \n / \l / \p become spaces; escaped quotes/backslashes are unescaped.
function joinStringSegments(str) {
    const segments = [];
    const re = /"((?:\\.|[^"\\])*)"/g;
    let m;
    while ((m = re.exec(str)) !== null) segments.push(m[1]);
    return segments.join('')
        .replace(/\\[nlp]/g, ' ')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\s+/g, ' ')
        .trim();
}

// Map shared move-description constants (`static const u8 sXxxDescription[] = _(...)`,
// also the exported `const u8 gNotDoneYetDescription[]`) to their text, so a move whose
// .description points at one (e.g. `.description = sMegaDrainDescription,`) can be resolved.
function parseDescriptionConsts(text) {
    const consts = {};
    const re = /(?:static\s+)?const u8\s+(\w+)\s*\[\]\s*=\s*_\(([\s\S]*?)\);/g;
    let m;
    while ((m = re.exec(text)) !== null) consts[m[1]] = joinStringSegments(m[2]);
    return consts;
}

function parseMovesFile(movesFileText) {
    const lines = movesFileText.split('\n');
    const moves = {};
    const descConsts = parseDescriptionConsts(movesFileText);
    let currentMove;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('    [')) {
            currentMove = {
                id: lines[i].split('[')[1].split(']')[0],
                additionalEffects: [],
            };
            if (REMOVED_MOVES.includes(currentMove.id)) {
                console.log(`Skipping move ${currentMove.id}`);
                currentMove = null;
            }
            else {
                moves[currentMove.id] = currentMove;
            }
            continue;
        }
        if (!currentMove) continue;
        if (lines[i].startsWith('        .') && !lines[i].startsWith('        .additionalEffects =')) {
            const currentProperty = lines[i].trim().split('.')[1].split(' ')[0];
            // .description can be a single-line COMPOUND_STRING, a multi-line COMPOUND_STRING, or a
            // pointer to a shared const. Gather the whole RHS (a struct field always ends with a
            // trailing comma; intermediate string-literal lines end with a quote) before resolving.
            if (currentProperty === 'description') {
                let rhs = lines[i];
                while (!rhs.trimEnd().endsWith(',') && i < lines.length - 1) {
                    i++;
                    rhs += ' ' + lines[i];
                }
                if (rhs.includes('"')) {
                    currentMove.description = joinStringSegments(rhs);
                } else {
                    const token = rhs.slice(rhs.indexOf('=') + 1).replace(/,\s*$/, '').trim();
                    currentMove.description = descConsts[token] !== undefined ? descConsts[token] : '';
                }
                continue;
            }
            let currentValue = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            const compoundMatch = currentValue.match(/COMPOUND_STRING\("(.*)"\),?/);
            if (compoundMatch) {
                currentValue = compoundMatch[1];
            }
            currentMove[currentProperty] = currentValue;
        }
        if (lines[i].startsWith('            .moveEffect = ')) {
            const effect = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            currentMove.additionalEffects.push(effect);
        }
    }
    return moves;
}

// T-078: parse src/data/items.h into a { [displayName]: description } map. The generated docs render
// held items and rewards as display NAMES (e.g. "Choice Scarf"), not ITEM_ ids, so the tooltip lookup
// is keyed by name. Names use ITEM_NAME("…"); descriptions are single/multi-line COMPOUND_STRING or a
// shared description-const pointer — all resolved with the same helpers as parseMovesFile.
function parseItemsFile(itemsFileText) {
    const lines = itemsFileText.split('\n');
    const items = {};
    const descConsts = parseDescriptionConsts(itemsFileText);
    let current = null;
    const record = () => { if (current && current.name && current.description) items[current.name] = current.description; };

    for (let i = 0; i < lines.length; i++) {
        const headerMatch = lines[i].match(/^\s*\[(ITEM_[A-Z0-9_]+)\]\s*=/);
        if (headerMatch) { current = { name: '', description: '' }; continue; }
        if (!current) continue;

        const trimmed = lines[i].trim();
        if (trimmed.startsWith('.name = ')) {
            // ITEM_NAME("…") (or a bare COMPOUND_STRING) → the quoted segment(s).
            current.name = joinStringSegments(trimmed);
            record();
        } else if (trimmed.startsWith('.description = ')) {
            // Gather the whole RHS (multi-line COMPOUND_STRING ends on the trailing comma).
            let rhs = lines[i];
            while (!rhs.trimEnd().endsWith(',') && i < lines.length - 1) { i++; rhs += ' ' + lines[i]; }
            if (rhs.includes('"')) {
                current.description = joinStringSegments(rhs);
            } else {
                const token = rhs.slice(rhs.indexOf('=') + 1).replace(/,\s*$/, '').trim();
                current.description = descConsts[token] !== undefined ? descConsts[token] : '';
            }
            record();
        }
    }
    return items;
}

function parseLearnsetsFile(learnsetsFileText) {
    const learnsets = {};
    const lines = learnsetsFileText.split('\n');
    let currentLearnset;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('static const struct LevelUpMove ')) {
            currentLearnset = lines[i].replace(/.*?static const struct LevelUpMove (.+?)\[.*/, '$1');
            learnsets[currentLearnset] = [];
            continue;
        }
        if (lines[i].startsWith('    LEVEL_UP_MOVE(')) {
            const currentMove = lines[i].replace(/.*?LEVEL_UP_MOVE\((.*)\).*/, '$1').trim();
            const parts = currentMove.split(',').map(p => p.trim());
            learnsets[currentLearnset].push({
                level: parts[0],
                move: parts[1],
            });
        }
    }
    return learnsets;
}

function parseTeachableFile(teachableFileText) {
    const lines = teachableFileText.split('\n');
    const teachables = {};
    let currentTeachable;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('static const u16 ')) {
            currentTeachable = lines[i].replace(/.*?static const u16 (.+?)\[.*/, '$1');
            teachables[currentTeachable] = [];
            continue;
        }
        if (lines[i].includes('    MOVE_') && !lines[i].includes('MOVE_UNAVAILABLE')) {
            const currentMove = lines[i].trim().replace(/,$/, '').trim();
            teachables[currentTeachable].push(currentMove);
        }
    }

    return teachables;
}

function parseAbilitiesFile(abilitiesFileText) {
    const lines = abilitiesFileText.split('\n');
    const abilities = {};
    let currentAbility;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('    [')) {
            currentAbility = lines[i].split('[')[1].split(']')[0];
            abilities[currentAbility] = {
                name: '',
                description: '',
                rating: 0,
                breakable: false,
                cantBeCopied: false,
                cantBeOverwritten: false,
                cantBeSuppressed: false,
                cantBeSwapped: false,
                cantBeTraced: false,
                failsOnImposter: false,
            };
            continue;
        }
        if (!currentAbility) continue;
        if (lines[i].startsWith('        .aiRating = ')) {
            const rating = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            abilities[currentAbility].rating = parseFloat(rating);
        }
        if (lines[i].startsWith('        .name = ')) {
            const nameMatch = lines[i].trim().match(/\.name = \_\("(.*)"\),?/);
            if (nameMatch) {
                abilities[currentAbility].name = nameMatch[1];
            }
            else {
                abilities[currentAbility].name = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            }
        }
        if (lines[i].startsWith('        .description = ')) {
            const descMatch = lines[i].trim().match(/\.description = COMPOUND_STRING\("(.*)"\),?/);
            if (descMatch) {
                abilities[currentAbility].description = descMatch[1];
            }
            else {
                abilities[currentAbility].description = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            }
        }
        if (lines[i].startsWith('        .breakable = ')) {
            const breakable = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            abilities[currentAbility].breakable = breakable === 'TRUE';
        }
        if (lines[i].startsWith('        .cantBeCopied = ')) {
            abilities[currentAbility].cantBeCopied = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim() === 'TRUE';
        }
        if (lines[i].startsWith('        .cantBeOverwritten = ')) {
            abilities[currentAbility].cantBeOverwritten = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim() === 'TRUE';
        }
        if (lines[i].startsWith('        .cantBeSuppressed = ')) {
            abilities[currentAbility].cantBeSuppressed = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim() === 'TRUE';
        }
        if (lines[i].startsWith('        .cantBeSwapped = ')) {
            abilities[currentAbility].cantBeSwapped = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim() === 'TRUE';
        }
        if (lines[i].startsWith('        .cantBeTraced = ')) {
            abilities[currentAbility].cantBeTraced = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim() === 'TRUE';
        }
        if (lines[i].startsWith('        .failsOnImposter = ')) {
            abilities[currentAbility].failsOnImposter = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim() === 'TRUE';
        }
    }
    return abilities;
}

function parseMegaEvoStonesFile(megaEvosFileText) {
    const lines = megaEvosFileText.split('\n');
    const megaEvoStones = {};

    for (let i = 0; i < lines.length; i++) {
        if (
            lines[i].startsWith('    {FORM_CHANGE_BATTLE_MEGA_EVOLUTION_ITEM,    ')
            || lines[i].startsWith('    {FORM_CHANGE_BATTLE_PRIMAL_REVERSION,   ')
        ) {
            const parts = lines[i]
                .replace(/^\s*?\{FORM_CHANGE_BATTLE_.*?,\s*/, '')
                .replace(/\s*?\},\s*$/, '')
                .split(',')
                .map(p => p.trim());
            megaEvoStones[parts[0]] = parts[1];
        }
    }

    return megaEvoStones;
}

// B-040 — display-name overrides for species whose id-derived name would mislead. Mothim has no cloak
// forms (Sandy/Trash are removed dupes; only MOTHIM_PLANT / SPECIES_MOTHIM survives), so it renders as
// plain "Mothim" instead of "Mothim Plant".
//
// B-043 — the T-154 cosmetic strip keeps the FIRST-declared form per stage, whose id carries a form
// suffix (e.g. SPECIES_SPEWPA_ICY_SNOW). The strip's intent is that cosmetic forms vanish leaving only
// the base, and "Icy Snow" is a Vivillon-only wing pattern that Scatterbug/Spewpa never show — so the
// docs must render the plain base name. Override each kept representative to its base name. (Unown and
// Milcery keep the base id already, so they need no entry. Arceus Normal / Silvally Normal are type
// forms, not cosmetic, and are deliberately left id-derived per owner decision.)
const DISPLAY_NAME_OVERRIDES = {
    SPECIES_MOTHIM_PLANT: 'Mothim',
    SPECIES_SCATTERBUG_ICY_SNOW: 'Scatterbug',
    SPECIES_SPEWPA_ICY_SNOW: 'Spewpa',
    SPECIES_VIVILLON_ICY_SNOW: 'Vivillon',
    SPECIES_FLABEBE_RED: 'Flabebe',
    SPECIES_FLOETTE_RED: 'Floette',
    SPECIES_FLORGES_RED: 'Florges',
    SPECIES_FURFROU_NATURAL: 'Furfrou',
    SPECIES_ALCREMIE_STRAWBERRY_VANILLA_CREAM: 'Alcremie',
};

function nameizyPokemonId(pokeId) {
    if (DISPLAY_NAME_OVERRIDES[pokeId]) return DISPLAY_NAME_OVERRIDES[pokeId];
    let result = pokeId
        .replace('SPECIES_', '')
        .replace(/_/g, ' ')
        .toLowerCase();
    // Capitalize first letter and every letter after a space. Use the captured letter (not the whole
    // match, which includes the leading space) so multi-word names keep a single space (B-046).
    result = result.charAt(0).toUpperCase() + result.slice(1);
    result = result.replace(/ (\w)/g, function(_, c) { return ' ' + c.toUpperCase(); });
    return result;
}

function parseStat(stat, definitions = {}) {
    let trimmed = stat.trim();
    if (definitions[trimmed]) {
        trimmed = definitions[trimmed];
    }
    else if (trimmed.split(' + ').length && definitions[trimmed.split(' + ')[0]]) {
        const parts = trimmed.split(' + ');
        return parseStat(parts[0], definitions) + parseStat(parts[1], definitions);
    }
    else if (trimmed.split(' - ').length && definitions[trimmed.split(' - ')[0]]) {
        const parts = trimmed.split(' - ');
        return parseStat(parts[0], definitions) - parseStat(parts[1], definitions);
    }
    trimmed = trimmed.replace('(', '').replace(')', '').trim();
    if (trimmed.startsWith('P_UPDATED_STATS >= GEN_')) {
        const m = trimmed.match(/P_UPDATED_STATS >= GEN_[^?]+\?\s*?(\d+).*/);
        return m ? parseInt(m[1].trim(), 10) : '';
    }
    return parseInt(trimmed, 10);
}

function parseMoveStat(stat) {
    if (!stat) return 0;
    let trimmed = stat.trim();
    trimmed = trimmed.replace('(', '').replace(')', '').trim();
    if (trimmed.startsWith('B_UPDATED_MOVE_DATA >= GEN_')) {
        const m = trimmed.match(/B_UPDATED_MOVE_DATA >= GEN_[^?]+\?\s*?(\d+).*/);
        return m ? parseInt(m[1].trim(), 10) : '';
    }
    return parseInt(trimmed, 10);
}

function getEvolutionType(pokemon, evoTree) {
    if (!pokemon) {
        console.log('Warning: getEvolutionType called with null pokemon');
    }
    if (pokemon.id.match(/.*_(MEGA|PRIMAL|MEGA_X|MEGA_Y)$/)) {
        return EVO_TYPE_MEGA;
    }
    if (!evoTree[pokemon.family]) {
        return EVO_TYPE_SOLO;
    }
    const familyData = evoTree[pokemon.family];
    if (familyData.length === 2) {
        if (familyData[0] === pokemon.id) {
            return EVO_TYPE_LC_OF_2;
        }
        return EVO_TYPE_LAST_OF_2;
    }
    if (familyData.length === 3) {
        if (familyData[0] === pokemon.id) {
            return EVO_TYPE_LC_OF_3;
        }
        if (familyData[1].includes(pokemon.id)) {
            return EVO_TYPE_NFE_OF_3;
        }
        return EVO_TYPE_LAST_OF_3;
    }
    return EVO_TYPE_SOLO;
}

module.exports = {
    parseEvo,
    evoIsLC,
    evoIsNFE,
    evoIsFinal,
    parseSpeciesFile,
    parseMovesFile,
    parseItemsFile,
    parseLearnsetsFile,
    parseTeachableFile,
    parseAbilitiesFile,
    parseMegaEvoStonesFile,
    parseStat,
    parseMoveStat,
    parseMonTypes,
    nameizyPokemonId,
    getEvolutionType,
    processLineForDefinitions,
    FIXED_PROPERTIES,
    COSMETIC_FAMILIES,
};
