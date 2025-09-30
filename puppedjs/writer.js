const fs = require('fs').promises;

const TIER_STRONG = 'STRONG';
const TOO_STRONG_POKEMON_THRESHOLD = 7.5;
const EVO_TYPE_LC_OF_3 = 'EVO_TYPE_LC_OF_3';

const startersFile = `${__dirname}\\..\\src\\starter_choose.c`;
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

const GOOD_STARTER_TRIOS = [
    ['GRASS', 'FIRE', 'WATER'],
    ['GRASS', 'ROCK', 'BUG'],
    ['FIGHTING', 'PSYCHIC', 'DARK'],
    ['WATER', 'GROUND', 'ELECTRIC'],
    ['FIGHTING', 'FAIRY', 'STEEL'],
    ['FIGHTING', 'FLYING', 'ICE'],
    ['FIGHTING', 'ROCK', 'FLYING'],
    ['FIRE', 'GROUND', 'GRASS'],
    ['FIRE', 'ROCK', 'GRASS'],
    ['FIRE', 'WATER', 'GRASS'],
    ['FIRE', 'GROUND', 'ICE'],
    ['FIRE', 'ROCK', 'STEEL'],
    ['GRASS', 'FLYING', 'ROCK'],
    ['GRASS', 'POISON', 'GROUND'],
    ['GRASS', 'ICE', 'ROCK'],
    ['ICE', 'GROUND', 'ROCK'],
    ['ICE', 'STEEL', 'GROUND'],
];

const TYPES = {
    FIRE: [],
    WATER: [],
    GRASS: [],
    ELECTRIC: [],
    ICE: [],
    FIGHTING: [],
    POISON: [],
    GROUND: [],
    FLYING: [],
    PSYCHIC: [],
    BUG: [],
    ROCK: [],
    DARK: [],
    STEEL: [],
    FAIRY: [],
    // Non useful types
    NORMAL: [],
    GHOST: [],
    DRAGON: [],
};

async function writer(pokemonList, moves, abilitiesRatings) {
    const elegiblePokemonForStarters = [];
    const notTooStrongPokemonLC = [];
    pokemonList.forEach(poke => {
        if (
            poke.evolutionData.type === EVO_TYPE_LC_OF_3
            && poke.evolutionData.isLC
            && poke.rating.bestEvoTier === TIER_STRONG
        ) {
            poke.parsedTypes.forEach(type => {
                if (!TYPES[type]) {
                    TYPES[type] = [];
                }
                TYPES[type].push(poke.id);
            });
        }

        if (poke.evolutionData.isLC && poke.rating.bestEvoRating <= TOO_STRONG_POKEMON_THRESHOLD) {
            notTooStrongPokemonLC.push(poke.id);
        }
    });

    // If there's any empty type, warn a log and remove every good trio that includes that type
    const emptyTypes = Object.entries(TYPES).filter(([type, pokes]) => pokes.length === 0).map(([type]) => type);
    if (emptyTypes.length > 0) {
        console.log(`The following types have no eligible pokemon for starters: ${emptyTypes.join(', ')}`);
        for (let i = GOOD_STARTER_TRIOS.length - 1; i >= 0; i--) {
            const trio = GOOD_STARTER_TRIOS[i];
            if (trio.some(type => emptyTypes.includes(type))) {
                GOOD_STARTER_TRIOS.splice(i, 1);
            }
        }
    }

    if (GOOD_STARTER_TRIOS.length === 0) {
        console.log('No good starter trios available due to missing types.');
        return;
    }

    // Pick a random good trio
    const randomTrio = GOOD_STARTER_TRIOS[Math.floor(Math.random() * GOOD_STARTER_TRIOS.length)];
    randomTrio.forEach(type => {
        const pokesOfType = TYPES[type];
        const randomPoke = pokesOfType[Math.floor(Math.random() * pokesOfType.length)];
        elegiblePokemonForStarters.push(randomPoke);
    });
    
    // Pick 9 other unique pokemon from notTooStrongPokemonLC that are not in elegiblePokemonForStarters
    const alreadyChosenSet = new Set(elegiblePokemonForStarters);
    const chosenExtraPokemon = [];
    alreadyChosenSet.add(...elegiblePokemonForStarters);
    while (chosenExtraPokemon.length < 9 && notTooStrongPokemonLC.length > 0) {
        const randomIndex = Math.floor(Math.random() * notTooStrongPokemonLC.length);
        const randomPoke = notTooStrongPokemonLC[randomIndex];
        if (!alreadyChosenSet.has(randomPoke)) {
            chosenExtraPokemon.push(randomPoke);
            alreadyChosenSet.add(randomPoke);
        }
        // Remove the considered pokemon from the pool to avoid infinite loops
        notTooStrongPokemonLC.splice(randomIndex, 1);
    }

    let newStartersFile = await fs.readFile(startersFile, 'utf8');

    // Edit starterMonText with starters
    newStartersFile = newStartersFile.replace(
        starterMonText,
        `static const u16 sStarterMon[STARTER_MON_COUNT] =
{
    ${elegiblePokemonForStarters[0]},
    ${elegiblePokemonForStarters[1]},
    ${elegiblePokemonForStarters[2]},
};`
    );

    // Edit starterMonText with extra starters
    newStartersFile = newStartersFile.replace(
        starterExtraMonText,
        `static const u16 sStarterExtraMon[STARTER_EXTRA_COUNT] =
{
    ${chosenExtraPokemon.join(',\n    ')},
};`
    );

    // Edit starterExtraCountText with actual count of extra starters
    newStartersFile = newStartersFile.replace(
        starterExtraCountText,
        `#define STARTER_EXTRA_COUNT ${chosenExtraPokemon.length}`
    );

    await fs.writeFile(startersFile, newStartersFile, 'utf8');
    console.log('Starter pokemon updated successfully.');
}

module.exports = writer;
