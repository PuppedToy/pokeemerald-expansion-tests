'use strict';

// ADR-026 — the evolution graph is the source of truth for identity, stage classification, best
// evolution and base form. It is built from each species' own `evolutions[]` array and never from
// the `family` string, which comes from the upstream `#if P_FAMILY_…` block and disagrees with the
// real graph on 20 edges (see randomizer/docs/families-and-forms.md).
//
// Edges are directed pre-evolution → evolution. Only targets present in the supplied list become
// edges, so a species filtered out of a run simply is not reachable — the graph never invents a mon.
//
// Megas are deliberately absent: nothing declares an `.evolutions` entry pointing at a mega, they
// are keyed off `natDexNum` instead. Mega attachment is its own concern (T-281).

const GUARD = 32;   // bounds every walk; malformed data must not hang a run

/**
 * Build the directed evolution graph over `pokemonList`.
 * @param {Array<{id: string, evolutions?: Array<{pokemon: string}>}>} pokemonList
 */
function buildEvoGraph(pokemonList) {
    const ids = new Set(pokemonList.map(p => p.id));
    const parents = new Map();    // id → [parent id]  (in list order, so it is deterministic)
    const children = new Map();   // id → [child id]
    for (const id of ids) { parents.set(id, []); children.set(id, []); }

    for (const poke of pokemonList) {
        for (const evo of (poke.evolutions || [])) {
            const target = evo && evo.pokemon;
            if (!target || !ids.has(target) || target === poke.id) continue;
            if (!children.get(poke.id).includes(target)) children.get(poke.id).push(target);
            if (!parents.get(target).includes(poke.id)) parents.get(target).push(poke.id);
        }
    }

    const get = (map, id) => map.get(id) || [];

    /** Every species reachable by walking edges from `id` in `direction`, excluding `id` itself. */
    function walk(id, direction) {
        const map = direction === 'up' ? parents : children;
        const seen = new Set();
        let frontier = get(map, id);
        for (let depth = 0; depth < GUARD && frontier.length; depth++) {
            const next = [];
            for (const node of frontier) {
                if (seen.has(node) || node === id) continue;
                seen.add(node);
                next.push(...get(map, node));
            }
            frontier = next;
        }
        return [...seen];
    }

    return {
        /** Direct pre-evolutions. Several when the species is a convergence point (Mothim). */
        parentsOf: id => [...get(parents, id)],
        /** Direct evolutions. Several when the species branches (Eevee, Koffing). */
        childrenOf: id => [...get(children, id)],
        /** Nothing evolves into it. */
        isFirstStage: id => get(parents, id).length === 0,
        /** It evolves into nothing. */
        isFinalStage: id => get(children, id).length === 0,
        /** Every form this species can actually become, at any depth. Excludes itself. */
        forwardReachable: id => walk(id, 'down'),
        /** Every form this species can have come from, at any depth. Excludes itself. */
        backwardReachable: id => walk(id, 'up'),
        /** The in-degree-0 ancestors — the forms a player would have to start from. */
        baseFormsOf: id => {
            if (get(parents, id).length === 0) return [id];
            return walk(id, 'up').filter(a => get(parents, a).length === 0);
        },
        /** Whether the species is in the graph at all. */
        has: id => ids.has(id),
    };
}

module.exports = { buildEvoGraph };
