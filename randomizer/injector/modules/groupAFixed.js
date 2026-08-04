'use strict';

/**
 * The `group-a-fixed` injection module (T-239) — Group A of the base+injection strategy: the outputs
 * that are a fixed-offset overwrite in the base, needing no repointing.
 *
 * One registry entry, six writers, each mirroring its compile-path counterpart:
 *
 * | sub-module      | writes                                        | compile-path reference          |
 * |-----------------|-----------------------------------------------|---------------------------------|
 * | species         | stats / types / abilities + held-item strip    | pokemonWriter.editSpeciesFile   |
 * | moves           | power / accuracy / type / category             | moveWriter.editMovesFile        |
 * | evolutions      | level param + stone IF_MIN_LEVEL               | evoLevelWriter.writeEvoLevels   |
 * | wildEncounters  | the species of each encounter slot             | writer.applyWildPlanToEncounters|
 * | itemPrices      | gItemsInfo[].price                             | itemPriceWriter                 |
 * | tmMoves         | gTMHMItemMoveIds[].moveId                      | tmRandomizer.writeTMsFromList   |
 *
 * The context is built once (constants + layout + the base-anchor check), so a layout that does not
 * match this base stops all six before any of them writes a byte.
 *
 * Not in Group A despite the strategy table: the **starter trio** belongs to the
 * `trades-starters-nicknames` entry (T-242), and **route/mail items** stopped being a map-data edit when
 * T-236 moved item placement into `gItemPicks` (T-243) — writer.js's mail-mint loop matches nothing in
 * `data/maps/**` any more.
 */

const { buildInjectionContext } = require('../context');
const { injectSpeciesInfo } = require('./species');
const { injectMoveData } = require('./moves');
const { injectEvolutions } = require('./evolutions');
const { injectWildEncounters } = require('./wildEncounters');
const { injectItemPrices } = require('./itemPrices');
const { injectTmMoves } = require('./tmMoves');

/**
 * @param {object} args  `{ rom, offsetMap, data, log }` as the registry calls it (injector/index.js)
 * @param {object} [args.sources]  base sources to use instead of reading the tree — `{ encountersJson,
 *        itemsSource, patchedItemsSource, speciesSources }`. Two writers derive their bytes by running the compile
 *        path's own function over a base source file; production reads those files, a harness can hand
 *        them in.
 * @returns {object} per-sub-module write counts, for the caller's log
 */
function applyGroupAFixed({ rom, offsetMap, data = {}, log = () => {}, sources = {}, baseSources = null }) {
    const ctx = buildInjectionContext({ rom, offsetMap, data, log, baseSources });
    return {
        species: injectSpeciesInfo(ctx, { speciesSources: sources.speciesSources || null }),
        moves: injectMoveData(ctx),
        evolutions: injectEvolutions(ctx, { speciesSources: sources.speciesSources || null }),
        wildEncounters: injectWildEncounters(ctx, { encountersJson: sources.encountersJson || null }),
        itemPrices: injectItemPrices(ctx, {
            itemsSource: sources.itemsSource || null,
            patchedSource: sources.patchedItemsSource || null,
        }),
        tmMoves: injectTmMoves(ctx),
    };
}

module.exports = { applyGroupAFixed };
