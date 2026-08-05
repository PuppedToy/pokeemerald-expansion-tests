'use strict';

/**
 * romData — which of a bundle's artifacts one ROM gets, and with which seed (T-249).
 *
 * This used to live inside `make.js`'s inject path. It moved here because the browser injector needs the
 * same answer, and the answer is not a detail: the injector re-runs the writers' own functions, so the
 * per-ROM RNG seed decides values that end up in the ROM. Two copies of this would be two randomizers.
 *
 * Pure and fs-free, so it bundles: the seed derivations themselves live in `randomizer/seeds.js`, shared
 * with `generate.js` (T-189) so the compile path, the inject path and the docs can never disagree.
 */

const { deriveSeed, romSeed: deriveRomSeed, trainerBaseSeed } = require('../seeds');

/**
 * One artifact for one ROM: `'shared'`/`'global'` take the bundle's shared copy, `'player-N'` that
 * player's, anything else is the ROM's own inline artifact.
 */
function resolveArtifact(value, sharedData, key) {
    if (value === 'shared' || value === 'global') return sharedData[key];
    if (typeof value === 'string' && value.startsWith('player-')) {
        const playerIndex = parseInt(value.split('-')[1], 10);
        return sharedData.players[playerIndex][key];
    }
    return value;
}

/**
 * The RNG seed this ROM is injected under, by trainer-sharing level: shared/player trainers key off
 * `universeSeed` (identical across the ROMs that share them), per-ROM trainers off a run-seed-derived
 * per-ROM seed. `universeSeed` defaults to the run seed for bundles predating the two-tier model.
 */
function resolveRomSeed(rom, seed, universeSeed = seed) {
    const t = rom.artifacts.trainers;
    if (t === 'shared' || t === 'global') return universeSeed;
    if (typeof t === 'string' && t.startsWith('player-')) {
        return deriveSeed(universeSeed, parseInt(t.split('-')[1], 10));
    }
    return deriveRomSeed(seed, rom.romIndex);
}

/** The baseRngSeed writer() uses for per-slot trainer reseeding — must match generate.js so docs == ROM. */
function resolveTrainingBaseSeed(rom, seed, universeSeed = seed) {
    return trainerBaseSeed(rom.artifacts.trainers, { universeSeed, unshared: null });
}

/**
 * Everything `injectRom({ data })` reads, for one ROM of a bundle, plus the seed the caller must seed the
 * RNG with before injecting.
 *
 * @returns {{ data: object, romSeed: number }}
 */
function injectionDataFor({ rom, bundle, seed, universeSeed = seed }) {
    const shared = bundle.sharedData || {};
    return {
        data: {
            pokedex: resolveArtifact(rom.artifacts.pokedex, shared, 'pokedex'),
            trainers: resolveArtifact(rom.artifacts.trainers, shared, 'trainers'),
            starters: resolveArtifact(rom.artifacts.starters, shared, 'starters'),
            wild: rom.artifacts.wild,
            config: bundle.config || {},
            artifacts: rom.artifacts,
            baseRngSeed: resolveTrainingBaseSeed(rom, seed, universeSeed),
            docs: rom.docs,
        },
        romSeed: resolveRomSeed(rom, seed, universeSeed),
    };
}

module.exports = { injectionDataFor, resolveArtifact, resolveRomSeed, resolveTrainingBaseSeed };
