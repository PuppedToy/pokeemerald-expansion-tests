# Wild-encounter generation (sweep / "batidas") — T-162

How wild encounters are randomized, and the `deterministic` / `classic` option.

## Two decoupled stages

1. **Selection** — `randomizer/modules/wildModule.js` `buildWildPlan()` (called from `runWildModule`)
   produces a **plan keyed by template species**: `wildPlan[templateSpecies] = [pickedIds]`.
2. **Application** — `randomizer/writer.js` `applyWildPlanToEncounters()` re-fills every slot in
   `src/data/wild_encounters.json` that currently holds a template species with that template's picks
   (distributed to equalise probability), preserving each slot's level/rate. Runs only in the ROM
   builder (`make.js` → `writer()`); `analyze.js` only builds the docs viewer.

The plan is keyed by **template species**, not by map id, because the placement follows *where the
template sits in the JSON* — exactly like the legacy text substitution it replaces. wild.js map ids do
**not** all match the JSON (split maps like Granite Cave / Victory Road / Ever Grande live under
per-floor ids), so a map-id-keyed writer would silently drop those zones.

## The data (`randomizer/wild.js`)

- `replacementTypes` — named tier×evo buckets, `{ replace: [TIER_*], type: [EVO_TYPE_*] }`.
- `replacements` — each **template species** (the base species authored into `wild_encounters.json`) →
  a replacementType.
- `maps` — per zone, which template sits in each method (`land`, `surf`, `underwater`, `old`, `good`,
  `super`) plus static `special*`. Each method's template is unique to that zone/method; only `super`
  templates are shared across zones (that's how the super rod is shared).

## The sweep ("batidas")

`buildWildPlan(pokemonList, wildConfig, { reservedFamilies, pokemonPerZone, onPick })`:

- **Pools** — one per replacementType, family-keyed, built with the same filter the module always used
  (`rating.bestEvoTier` ∈ tiers **and** the evo-stage flags `isLC/isNFE/SOLO/isFinal`), excluding megas
  and `reservedFamilies` (families already taken by starters / gym rewards / statics — never wild).
- **Rounds** — for `round` in `0..N-1`, sweep every zone/method once, drawing the round-th species. So
  round 0 gives every zone its first species before any zone gets a second → duplication (if any) is
  spread across all zones. `N = pokemonPerZone` (deterministic ⇒ 1).
- **Per-method caps** — a method never exceeds its physical slot count: land ≤ 12, surf/underwater ≤ 5,
  old rod ≤ 2, good rod ≤ 3 (`WILD_METHOD_SLOTS`). Super rod = one shared species per template.
- **Draw + overflow** — while a pool still has unused families it dedups **globally** (no family placed
  twice as a wild). When its unique supply runs out it flips to *overflow* and cycles its full base
  again, allowing spread duplicates. A single-tier pool (e.g. `[RU]×[LC]`) overflows sooner than a
  multi-tier one (`[RU,NU,PU]×[LC]`) simply because its base is smaller — matching the "regenerate the
  small pool, lean on the others first" design.
- **onPick** — records the family (for the returned `alreadyChosenFamilies`) and mega-evo gating level.

Determinism: one seeded mulberry32 stream (`rng.js`, seeded once in `generate.js`), consumed via
`sample`. Same seed + config ⇒ identical plan. Super templates are picked first, then the rounds.

## The writer (`applyWildPlanToEncounters`)

Parses `wild_encounters.json`, and for each encounter table (`land_mons`, `water_mons`,
`rock_smash_mons`, `fishing_mons`) groups its slots by the species currently in them; any group whose
species is a plan template is re-filled with that template's picks via `distributeSpeciesAcrossSlots`.
Older bundles (no `wildPlan`) fall back to the legacy whole-file `substituteWildSpecies`.

**Equiprobable distribution.** Per-slot probabilities are hard-coded GBA engine constants (not editable
via JSON), so equiprobability is approximated by grouping slots: assign each slot (heaviest rate first)
to the currently-lightest species, so each species' summed probability is ≈ equal. When #species =
#slots (e.g. surf with N ≥ 5) it degrades to the raw slot rates — unavoidable.

Levels/rates/slot counts are **never** changed — only the `species` string. The N species in a zone
share that zone's authored level.

## The option (frontend → pipeline)

`wildEncounterType` (`deterministic` | `classic`) + `pokemonPerZone` (default 5). Flows
`config-form.js` → both `toModuleConfig`s (`randomizer-worker.cjs` + `backend/generator.js`) →
`runWildModule(..., moduleConfig)`. See `randomization-options.md`.

- **deterministic** (default) — 1 species per zone/method; predictable each run.
- **classic** — `pokemonPerZone` species per zone (capped per method), spread to be ≈ equally likely.
  The input is **2–12** (12 = the land encounter-slot count; above it nothing changes).

**Guarantee — deterministic ≡ classic with `pokemonPerZone` = 1.** `wildEncounterType` has exactly one
effect in the pipeline (`runWildModule`): it sets `pokemonPerZone` (deterministic → 1). Both modes then
call `buildWildPlan(..., pokemonPerZone: 1|N)`, a pure function of the seed — nothing else branches on
the mode. So for a given seed the deterministic plan is byte-identical to classic-with-N=1 (locked by a
test in `wildModule.test.js`). The UI floors the classic input at 2 only because N=1 there would just be
Deterministic.

Super rod and static/legendary encounters are unchanged in both modes.

## Known limitations / follow-ups

- **Docs viewer surfaces the full classic list (B-041).** `replacementLog[template]` (the *first* pick)
  is still used wherever a single species is needed, but the docs viewer now shows every species a
  classic zone/method can yield: `redactWildPokes` (`docsVisibility.js`) emits
  `route.methodSpecies[method] = [all distinct picks]` and `frontend/template.html` renders one
  capturable slot per species (`encounterSlots`/`slotSpecies`; representative keeps the plain method
  slot key, extras get `method#i`). Deterministic mode (one pick) is unchanged.
- **5 dead wild.js entries.** `Route104 surf` (POOCHYENA) and `Victory Road B1F` old/good/surf/super
  (MOLTRES/ZAPDOS/ARTICUNO/LUGIA) reference template species that don't appear anywhere in
  `wild_encounters.json`, so they are never placed — the same as the legacy substitution (it found no
  occurrence either). Not a regression; left as-is.
