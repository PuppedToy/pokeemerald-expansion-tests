import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TOP_KEYS, REQUIRED_ARTIFACTS, SUPPORTED_FORMAT_VERSIONS } from '../build/bundleSchema.js';

// T-191 / ADR-020 — deterministic bundle-contract drift check.
//
// CONTRACT_SNAPSHOT is the committed record of the STRUCTURAL bundle contract (the shape the
// untrusted-input validator enforces and the ROM builder consumes). If you change the bundle's
// shape — add/remove a top-level key, change the required artifacts, or change the supported format
// versions — this test fails ON PURPOSE. Updating the snapshot below is the conscious moment to
// decide: is the change backward-compatible, or does it break older bundles? If it breaks them, bump
// the bundle `formatVersion` in the randomizer's bundle() + add the new value to
// SUPPORTED_FORMAT_VERSIONS + add a migration transform (deferred until first needed).
//
// Out of scope by design: config *field additions*. Old bundles simply lack a new option and fall
// back to its default, so adding config options is backward-compatible and must NOT require a bump.
const CONTRACT_SNAPSHOT = {
  topKeys: ['appVersion', 'config', 'formatVersion', 'generatedAt', 'roms', 'sessionId', 'sharedData'],
  requiredArtifacts: ['pokedex', 'starters', 'trainers', 'wild'],
  supportedFormatVersions: [2],
};

const sorted = (a) => [...a].sort();

test('bundle STRUCTURAL contract matches the committed snapshot (drift trip-wire)', () => {
  const live = {
    topKeys: sorted(TOP_KEYS),
    requiredArtifacts: sorted(REQUIRED_ARTIFACTS),
    supportedFormatVersions: sorted(SUPPORTED_FORMAT_VERSIONS),
  };
  const expected = {
    topKeys: sorted(CONTRACT_SNAPSHOT.topKeys),
    requiredArtifacts: sorted(CONTRACT_SNAPSHOT.requiredArtifacts),
    supportedFormatVersions: sorted(CONTRACT_SNAPSHOT.supportedFormatVersions),
  };
  assert.deepEqual(
    live,
    expected,
    'Bundle STRUCTURAL contract changed. If intentional: update CONTRACT_SNAPSHOT above and decide '
    + 'whether it breaks older bundles — if so, bump the bundle formatVersion in the randomizer '
    + 'bundle(), add it to SUPPORTED_FORMAT_VERSIONS, and add a migration transform. (Config field '
    + 'additions are backward-compatible and are intentionally not part of this contract.)',
  );
});
