'use strict';

const writer = require('./writer');
const { loadConfig } = require('./config');
const rng = require('./rng');
const { runPokedexModule } = require('./modules/pokedexModule');
const { runTrainersModule } = require('./modules/trainersModule');
const { runStartersModule } = require('./modules/startersModule');

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

    for (let i = 0; i < config.numROMs; i++) {
        const pokedex  = sharedPokedex  ?? await runPokedexModule(config);
        const trainers = sharedTrainers ?? runTrainersModule(pokedex, config);
        const starters = sharedStarters ?? runStartersModule(pokedex.pokes);
        await writer(pokedex, trainers, starters, isDebug);
    }
}

run();
