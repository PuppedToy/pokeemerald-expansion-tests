'use strict';

const writer = require('./writer');
const { loadConfig } = require('./config');
const rng = require('./rng');
const { runPokedexModule } = require('./modules/pokedexModule');
const { runTrainersModule } = require('./modules/trainersModule');
const { runStartersModule } = require('./modules/startersModule');
const { runWildModule } = require('./modules/wildModule');
const wild = require('./wild');
const { selectTrades } = require('./trades');
const { romSeed: deriveRomSeed } = require('./seeds');

const config = loadConfig();
rng.seed(config.seed);
console.log(`Seed: ${config.seed}`);

const isDebug = process.argv.includes('--debug');

async function run() {
    // Modules shared across all ROMs (generated once when sharedModules >= N)
    const sharedPokedex  = config.sharedModules >= 2 ? await runPokedexModule(config) : null;
    const sharedTrainers = config.sharedModules >= 3 && sharedPokedex
        ? runTrainersModule(sharedPokedex, config) : null;
    const sharedStarters = config.sharedModules >= 4 && sharedPokedex
        ? runStartersModule(sharedPokedex.pokes) : null;
    const sharedWild     = config.sharedModules >= 5 && sharedStarters
        ? runWildModule(sharedPokedex.pokes, sharedStarters, wild) : null;

    for (let i = 0; i < config.numROMs; i++) {
        const pokedex  = sharedPokedex  ?? await runPokedexModule(config);
        const trainers = sharedTrainers ?? runTrainersModule(pokedex, config);
        const starters = sharedStarters ?? runStartersModule(pokedex.pokes);
        const wildArtifact = sharedWild ?? runWildModule(pokedex.pokes, starters, wild);
        // T-194 — decide the 4 town trades for this ROM (deterministic per ROM seed) and hand them to
        // the writer for the docs sub-cards and the trade-data write.
        const trades = selectTrades({
            pokemonList: pokedex.pokes,
            wildArtifact,
            wildMaps: wild.maps,
            capLevels: pokedex.capLevels,
            seed: deriveRomSeed((config.seed >>> 0), i),
            diagnostics: null,
        });
        await writer(pokedex, trainers, starters, wildArtifact, isDebug, null, null, '', null, trades);
    }
}

run();
