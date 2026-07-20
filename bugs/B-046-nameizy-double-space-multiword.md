---
id: B-046
title: nameizyPokemonId emits a double space in every multi-word species name
status: fixing          # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-07-20
updated: 2026-07-20
found-in: 0.5.0         # version where the bug was observed
fixed-in:               # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/cosmeticFamilyStrip.test.js  # "B-046 — multi-word species names use a single space"
links: [B-043, T-170]   # B-043 noted this quirk as out-of-scope; T-170 surfaced it via the writer fallback
---

# B-046 — nameizyPokemonId emits a double space in every multi-word species name

## Symptom

`parser.nameizyPokemonId` — the canonical id→display-name transform used by the docs — returns a
**double space** between words for any multi-word (non-overridden) species name:

- `SPECIES_ARCEUS_NORMAL` → `"Arceus  Normal"` (expected `"Arceus Normal"`)
- `SPECIES_SILVALLY_NORMAL` → `"Silvally  Normal"`, `SPECIES_TYPE_NULL` → `"Type  Null"`
- `SPECIES_DEERLING_SPRING` → `"Deerling  Spring"`, all Sawsbuck/Burmy/Wormadam seasonal/cloak forms
- `SPECIES_NIDORAN_F` → `"Nidoran  F"`, `SPECIES_MR_MIME` → `"Mr  Mime"`

These render verbatim in the docs. The quirk was noted and explicitly deferred in B-043 (scope note),
and `cosmeticFamilyStrip.test.js` currently masks it with a `.replace(/\s+/g, ' ')` normalization on
the Arceus assertion.

Reproduce: `node -e "console.log(JSON.stringify(require('./randomizer/parser').nameizyPokemonId('SPECIES_ARCEUS_NORMAL')))"`
→ `"Arceus  Normal"`.

## Root cause

The capitalize-after-space pass reuses the whole match (which includes the leading space) when
rebuilding the string:

```js
result = result.replace(/ (\w)/g, function(m) { return ' ' + m.toUpperCase(); });
```

`m` is `" n"` (space + letter), so `' ' + m.toUpperCase()` yields `"  N"` — the original space plus a
newly-prepended one. The intended replacement should use the captured letter, not the full match.

## Fix

Fixed under T-170. In `randomizer/parser.js` `nameizyPokemonId`, the capitalize-after-space pass now
uses the captured letter instead of the whole match:

```js
result = result.replace(/ (\w)/g, function(_, c) { return ' ' + c.toUpperCase(); });
```

Regression test `randomizer/__tests__/unit/cosmeticFamilyStrip.test.js` ("B-046 — multi-word species
names use a single space") verified FAIL before (`"Arceus  Normal"`) / PASS after; the pre-existing
Arceus assertion in the same file had its `.replace(/\s+/g, ' ')` mask removed. Full suite green.
