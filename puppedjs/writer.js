const fs = require('fs').promises;
const path = require('path');

const TIER_STRONG = 'STRONG';
const TIER_AVERAGE = 'AVERAGE';
const TOO_STRONG_POKEMON_THRESHOLD = 7.5;
const EVO_TYPE_LC_OF_3 = 'EVO_TYPE_LC_OF_3';
const MAX_MEGA_EVO_STONES = 3;

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

const PERFECT_STARTER_TRIOS = [
    ['GRASS', 'FIRE', 'WATER'],
    ['FIGHTING', 'PSYCHIC', 'DARK'],
];

const GOOD_STARTER_TRIOS = [
    ['GRASS', 'ROCK', 'BUG'],
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
            && (poke.rating.bestEvoTier === TIER_STRONG || poke.rating.bestEvoTier === TIER_AVERAGE)
            && (!poke.rating.megaEvoRating || poke.rating.megaEvoRating <= 8)
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

    // 50% of perfect forward and backwards type weakness in perfect trios
    // The other 50% is for any type trio that only fulfills supereffective but not resistant backwards
    const usedTrios = Math.random() < 0.5 ? PERFECT_STARTER_TRIOS : GOOD_STARTER_TRIOS;

    const emptyTypes = Object.entries(TYPES).filter(([type, pokes]) => pokes.length === 0).map(([type]) => type);
    if (emptyTypes.length > 0) {
        for (let i = usedTrios.length - 1; i >= 0; i--) {
            const trio = usedTrios[i];
            if (trio.some(type => emptyTypes.includes(type))) {
                usedTrios.splice(i, 1);
            }
        }
    }

    if (usedTrios.length === 0) {
        console.log('No good starter trios available due to missing types.');
        return;
    }

    // Pick a random good trio
    const randomTrio = usedTrios[Math.floor(Math.random() * usedTrios.length)];
    randomTrio.forEach(type => {
        const pokesOfType = TYPES[type];
        const randomPoke = pokesOfType[Math.floor(Math.random() * pokesOfType.length)];
        elegiblePokemonForStarters.push(randomPoke);
    });

    const starters = [
        elegiblePokemonForStarters[0],
        elegiblePokemonForStarters[1],
        elegiblePokemonForStarters[2],
    ];
    
    // Pick 9 other unique pokemon from notTooStrongPokemonLC that are not in elegiblePokemonForStarters
    const alreadyChosenSet = new Set(starters);
    const chosenExtraPokemon = [];
    const shuffledNotTooStrongPokemonLC = notTooStrongPokemonLC
        .filter(p => !alreadyChosenSet.has(p))
        .sort(() => 0.5 - Math.random());
    let nextIndex = 0;
    while (chosenExtraPokemon.length < 9 && shuffledNotTooStrongPokemonLC.length > 0) {
        const randomPoke = shuffledNotTooStrongPokemonLC[nextIndex];
        if (!alreadyChosenSet.has(randomPoke)) {
            if (chosenExtraPokemon.length === 8) {
                // The last pokemon must have mega evolution
                const hasMegaEvo = pokemonList.find(p => p.id === randomPoke && p.evolutionData.megaEvos && p.evolutionData.megaEvos.length > 0);
                if (!hasMegaEvo) {
                    nextIndex += 1;
                    continue;
                }
            }
            chosenExtraPokemon.push(randomPoke);
            alreadyChosenSet.add(randomPoke);
        }
        // Remove the considered pokemon from the pool to avoid infinite loops
        shuffledNotTooStrongPokemonLC.splice(nextIndex, 1);
    }

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

    const route111File = path.resolve(__dirname, '..', 'data', 'maps', 'Route111', 'map.json');
    let route111Data = await fs.readFile(route111File, 'utf8');

    const chosenPokemonThatHaveMegaEvo = [...starters, ...chosenExtraPokemon].map((pokeId) =>
        pokemonList.find(p => p.id === pokeId),
    ).filter(p => p && p.evolutionData.megaEvos && p.evolutionData.megaEvos.length > 0);
    const itemDataList = [
        'ITEM_SCEPTILITE',
        'ITEM_BLAZIKENITE',
        'ITEM_SWAMPERTITE',
    ];

    for (let i = 0; i < Math.min(chosenPokemonThatHaveMegaEvo.length, MAX_MEGA_EVO_STONES); i++) {
        const poke = chosenPokemonThatHaveMegaEvo[i];
        const megaEvos = poke.evolutionData.megaEvos;
        const chosenMegaEvo = megaEvos[Math.floor(Math.random() * megaEvos.length)];
        const megaItem = pokemonList.find(p => p.id === chosenMegaEvo).evolutionData.megaItem;
        route111Data = route111Data.replace(itemDataList[i], megaItem);
    }

    await fs.writeFile(route111File, route111Data, 'utf8');
    console.log('Route 111 map updated with new starter mega stones.');
    // @TODO Replace mega stone trainers & rival
}

module.exports = writer;
