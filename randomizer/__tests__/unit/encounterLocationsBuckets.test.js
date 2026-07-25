'use strict';

// T-200 — the three location buckets must exactly partition ENCOUNTER_LOCATIONS (no overlap, no gap), so
// the two nickname toggles (auto-location = wild+static, trades&gifts = gifts) together cover every map.

const {
    ENCOUNTER_LOCATIONS, WILD_ROUTE_LOCATIONS, STATIC_LOCATIONS, GIFT_LOCATIONS,
} = require('../../data/encounterLocations');

test('bucket sizes', () => {
    expect(WILD_ROUTE_LOCATIONS).toHaveLength(120);
    expect(STATIC_LOCATIONS).toHaveLength(4);
    expect(GIFT_LOCATIONS).toHaveLength(10);
    expect(ENCOUNTER_LOCATIONS).toHaveLength(134);
});

test('buckets partition ENCOUNTER_LOCATIONS exactly (no overlap, no gap)', () => {
    const union = [...WILD_ROUTE_LOCATIONS, ...STATIC_LOCATIONS, ...GIFT_LOCATIONS];
    expect(new Set(union).size).toBe(union.length);                       // no map in two buckets
    expect([...union].sort()).toEqual([...ENCOUNTER_LOCATIONS].sort());    // together = the whole set
});
