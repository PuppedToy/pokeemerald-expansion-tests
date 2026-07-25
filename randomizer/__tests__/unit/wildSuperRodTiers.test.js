'use strict';

// T-203 — the super-rod encounters on two route groups are bumped from UU to "NFE or LC OU".
// The change lives in wild.js config: each route's `super` template maps (via replacements →
// replacementTypes) to the competitive tier the slot draws from. This test resolves that whole
// chain per route so it can't silently drift.

const wildData = require('../../wild');

// Resolve a route id's super-rod slot → its replacementType definition.
function superTypeForRoute(routeId) {
    const map = wildData.maps.find(m => m.id === routeId);
    expect(map).toBeDefined();
    const template = map.super;
    expect(template).toBeDefined();
    const typeName = wildData.replacements[template];
    expect(typeName).toBeDefined();
    const def = wildData.replacementTypes[typeName];
    expect(def).toBeDefined();
    return def;
}

// Owner spec (T-203)
const GROUP_A = ['MAP_ROUTE106', 'MAP_ROUTE109', 'MAP_ROUTE110', 'MAP_ROUTE117', 'MAP_ROUTE118'];
const GROUP_B = ['MAP_ROUTE111', 'MAP_ROUTE112', 'MAP_JAGGED_PASS', 'MAP_ROUTE113', 'MAP_ROUTE114', 'MAP_ROUTE119', 'MAP_ROUTE120'];

describe('T-203 — super-rod route groups draw from NFE/LC OU', () => {
    test.each([...GROUP_A, ...GROUP_B])('%s super-rod slot draws from the OU (NFE/LC) pool, not UU', (routeId) => {
        const def = superTypeForRoute(routeId);
        expect(def.replace).toEqual(['OU']);
        expect(def.replace).not.toContain('UU');
        expect(def.type).toEqual(expect.arrayContaining(['EVO_TYPE_NFE', 'EVO_TYPE_LC']));
    });

    test('Group A and Group B share one super template each (PUPITAR / GABITE)', () => {
        const aTemplates = new Set(GROUP_A.map(id => wildData.maps.find(m => m.id === id).super));
        const bTemplates = new Set(GROUP_B.map(id => wildData.maps.find(m => m.id === id).super));
        expect([...aTemplates]).toEqual(['SPECIES_PUPITAR']);
        expect([...bTemplates]).toEqual(['SPECIES_GABITE']);
    });

    test('the other super-rod band (SHELGON) is untouched — stays UU', () => {
        // SPECIES_SHELGON is a different route band the owner did not bump; guard against over-reach.
        const def = wildData.replacementTypes[wildData.replacements['SPECIES_SHELGON']];
        expect(def.replace).toEqual(['UU']);
    });
});
