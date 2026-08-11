---
id: B-070
title: An exhausted gym/static reward pool crashes the run with a null dereference
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.5.0         # version where the bug was observed
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/wildModule.test.js
links: [T-264, B-068]
---

# B-070 — An exhausted gym/static reward pool crashes the run with a null dereference

## Symptom

Every gym-reward and static-reward pick in `randomizer/modules/wildModule.js` does
`sampleAndRemove(list)` and immediately dereferences the result:

```js
const gym1Replacement = sampleAndRemove(gym1ReplacementList);
alreadyChosenFamilySet.add(getFamilyGroup(gym1Replacement.family));
```

`sampleAndRemove` returns `null` for an empty array — deliberately, and other callers in the same file
check for it — so an exhausted pool ends the run with

```
TypeError: Cannot read properties of null (reading 'evolutionData')
    at devolveToBase (modules/utils.js:71:17)
    at Object.runWildModule (modules/wildModule.js:569:29)
```

which names neither the reward nor the reason. Found while fixing
[B-068](B-068-evolution-check-skipped-on-some-team-paths.md): tightening `checkValidEvo` narrowed the
gym-3 candidate pool, `wildModule.test.js`'s fixture emptied it, and the suite failed on that TypeError
instead of on a legible message. The B-068 predicate was corrected so the pool refilled, but the crash
is still one narrow filter away, and it is reachable in production through a small or heavily restricted
pokémon pool.

21 pick sites are affected: `gym1`–`gym8`, `slateportGrunts`, `shellyReward`, `wallyLilycove`,
`regirock`, `regice`, `mew`, `registeel`, `legend1`–`legend3`, and the three `rivalLegend*` draws.

The **extra-starters** block in the same function is not affected — it already guards every pick with
`if (pool.length > 0)` and gives slot 1 a fallback ladder ending in an explicit
`throw new Error('No UBERS or OU LC pokemon found for extra starters slot 1.')`. That is the house
pattern the reward blocks skipped.

## Root cause

Two things, one on top of the other.

**The missing guard.** Each reward assumed its filtered pool was non-empty. Nothing enforced that, and
`sampleAndRemove` reports emptiness by returning `null`, which the reward blocks never checked.

**What actually empties a pool.** Each filter opens with
`!alreadyChosenFamilySet.has(getFamilyGroup(poke.family))` — the one-family-per-run rule — and that set
grows with every starter, gym reward and static reward already handed out. It is the first constraint to
bite, and unlike the tier/evolution-shape constraints it is a *preference*: a repeated family is a
cosmetic loss, not an invalid reward. So the pool was being emptied by the one clause that should have
been the first to yield.

## Fix

Each reward now states its filter **once**, without the dedup clause, and a new `takeReward` helper
applies the ladder:

1. the family-deduped list — unchanged, still mutated by removal so repeated draws from one pool keep
   dedupe-by-removal (gym3 twice, gym4/5, gym7/8, the four strongSolo picks, the three legends);
2. the same filter **without** the dedup, skipping anything already handed out — a repeated family beats
   losing the reward — with a `REWARD_FAMILY_REUSED` warning;
3. for a **required** reward only, a species another reward already got, with a `REWARD_POOL_EMPTY` error.
   This rung exists because required and optional rewards share pools and the required one is not always
   drawn first: `wallyLilycove` is drawn last out of the same pool as the three regis, so a thin pool
   would otherwise have killed the run on its final draw;
4. otherwise: `throw` for a required reward, naming it; `null` plus a `REWARD_POOL_EMPTY` error for an
   optional one.

The required/optional split follows what the pipeline downstream can take. The eleven gym rewards are
required — `writer.js` reads `.id` off every one of them to regenerate `gGymRewards[]`. The statics
(regis, Mew, the three Sky Pillar legends) are optional: `writer.js` already falls back to the vanilla
species for each, so an unfillable one degrades to null and the run finishes with a vanilla Regirock.
`rivalLegend*` now filters nulls out of its shuffle pool rather than handing a rival an empty ace.

**Byte-identical for every healthy run**, which is what makes this safe: rung 1 is the old code verbatim,
and rungs 2–4 build nothing and draw no RNG until rung 1 comes back empty. Verified by fingerprinting the
full ROM output (artifacts + docs, timestamps stripped) for seeds 11, 3333 and 2231547897 before and
after — identical in all three.

Regression tests live in `randomizer/__tests__/unit/wildModule.test.js`, reusing that file's existing
reward fixture rather than duplicating a 100-line pokémon list (the fixture is the single home of that
shape). They cover: a claimed family reusing itself, an unfillable gym reward raising a message that
names it, static rewards degrading to null with a diagnostic while the required `wallyLilycove` from the
same pool still resolves, a healthy pool producing four distinct rewards and zero diagnostics, and
missing legends leaving the rival aces null. Verified RED before the fix — the first three died with
`TypeError: Cannot read properties of null (reading 'family')` — and GREEN after.
