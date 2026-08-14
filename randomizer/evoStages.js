'use strict';

// ADR-026 — a species' stage comes from its DEGREE in the evolution graph.
//
// The old rule (`parser.getEvolutionType`) read a species' index inside `evoTree[its own family]`:
// no tree ⇒ SOLO, index 0 ⇒ LC, in the stage-1 array ⇒ NFE, anything else ⇒ LAST. That is only
// correct while the family string agrees with the graph, and on 20 edges it does not — which is how
// Cursola and Weezing-Galar ended up classified as non-evolving mons, and Sliggoo-Hisui as a first
// stage. See randomizer/docs/families-and-forms.md.
//
// The `_OF_2` / `_OF_3` half of the vocabulary means "how long is this line", which downstream still
// needs: `evoLevelWriter` picks its stage adjustment from it and `wildModule` fills starter slots by
// `lineLength`. Here it is the LONGEST path through the mon, so a branch of different lengths is
// measured by its own arm.

const { buildEvoGraph } = require('./evoGraph');
const {
    EVO_TYPE_MEGA, EVO_TYPE_SOLO,
    EVO_TYPE_LC_OF_2, EVO_TYPE_LC_OF_3,
    EVO_TYPE_NFE_OF_3, EVO_TYPE_LAST_OF_2, EVO_TYPE_LAST_OF_3,
} = require('./constants');

const MEGA_ID = /_(MEGA|PRIMAL|MEGA_X|MEGA_Y)$/;
const GUARD = 32;

/**
 * @param {Array<{id: string, evolutions?: Array}>} pokemonList
 * @returns {(id: string) => string} the EVO_TYPE_* for a species id
 */
function classifyStages(pokemonList) {
    const graph = buildEvoGraph(pokemonList);
    const heights = new Map();   // longest path DOWN from a species, in edges
    const depths = new Map();    // longest path UP to a base form, in edges

    const measure = (id, map, next, seen = new Set()) => {
        if (map.has(id)) return map.get(id);
        if (seen.has(id) || seen.size > GUARD) return 0;   // malformed data must not hang a run
        seen.add(id);
        const steps = next(id).map(other => 1 + measure(other, map, next, seen));
        const value = steps.length ? Math.max(...steps) : 0;
        map.set(id, value);
        return value;
    };

    const heightOf = id => measure(id, heights, graph.childrenOf);
    const depthOf = id => measure(id, depths, graph.parentsOf);

    return function stageOf(id) {
        if (MEGA_ID.test(id)) return EVO_TYPE_MEGA;
        if (!graph.has(id)) return EVO_TYPE_SOLO;

        const isFirst = graph.isFirstStage(id);
        const isFinal = graph.isFinalStage(id);

        if (isFirst && isFinal) return EVO_TYPE_SOLO;
        if (isFirst) return heightOf(id) >= 2 ? EVO_TYPE_LC_OF_3 : EVO_TYPE_LC_OF_2;
        if (!isFinal) return EVO_TYPE_NFE_OF_3;   // anything with a parent AND a child is a middle stage
        return depthOf(id) >= 2 ? EVO_TYPE_LAST_OF_3 : EVO_TYPE_LAST_OF_2;
    };
}

module.exports = { classifyStages };
