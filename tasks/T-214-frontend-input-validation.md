---
id: T-214
title: Validate every randomizer config input (sensible ranges + a clear bad-value policy)
status: proposed        # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.6.0
links: [T-081, T-052, T-192]
blocked-by: []
---

# T-214 — Validate every randomizer config input

## Context

The settings form (`frontend/js/config-form.js`, one big template literal in `_build()`; read by
`getConfig()` :515-623) already has **two** partial validation layers from [T-081](T-081-settings-number-validation.md):

1. **Blur-clamp** — a delegated `change` listener (`:2109-2115`) runs `_clampNumberInput` (`:762-769`) →
   `clampToRange(value, el.min, el.max)` (`:363-371`). Fires on blur only (no per-keystroke feedback), clamps
   to the field's HTML `min`/`max`, and **skips `type="range"` sliders**.
2. **Clamp-on-read** — `getConfig()` re-clamps via `_intField(sel, def, min, max)` (`:750-756`) and the
   `_read*` helpers (`_readPrices`, `_readEvoLevels`, `_readMutationProbs`, `_readDocsVisibility`, …).

**Today, invalid input is handled inconsistently:** only an invalid **seed** / **universe-seed** *blocks*
generation (`getConfig()` returns `null` → `_save` no-ops, `:540/:545`); **everything else is silently clamped
or defaulted**, with no inline error, red highlight, or `aria-invalid` anywhere. Several inputs have real gaps
(below). This task closes the gaps and, first, agrees the **bad-value policy** with the owner.

> **VALIDATE WITH OWNER BEFORE STARTING** (per request). The per-input analysis + the proposed policy below are a
> proposal; the acceptance criteria are finalised after the owner picks a handling model.

## The decision to make first — how do we treat nonsensical values?

Three models (pick one as the default; a few fields may deviate):

- **A. Silent clamp (today's behaviour).** Out-of-range snaps to the nearest bound on blur/read; no message.
  Simplest, but the user never learns their value changed.
- **B. Clamp + visible feedback (recommended).** Snap to bounds AND show a small inline "adjusted to N" hint +
  `aria-invalid`/red border while out of range. Non-blocking: generation always proceeds with safe values.
- **C. Block until valid.** Out-of-range disables Generate with an inline error until fixed (like seed does
  today). Safest data, but more friction; overkill for values that have an obvious safe clamp.

**Recommendation: B as the default**, keeping **C only for the structural blockers** (non-integer seed /
universe-seed, which can't be safely clamped). Live feedback should fire on `input` (per-keystroke) for the
worst offenders, not just `change`.

## Known gaps to fix (from the input audit)

- **Sliders read unclamped:** `#difficultySlider` (raw `parseInt`, `:526`), `#balance-chance` (`:534`) and
  `#move-mutation-chance` (`:556`) are `type="range"`, so `_clampNumberInput` skips them and the read applies
  **no explicit clamp** — only native browser bounding. A tampered/imported value passes through.
- **Evolution tables/stages read unclamped:** `#evo-stage-*`, and the per-tier `#evo-base-<TIER>-{min,max}` /
  `#evo-mod-<TIER>-{min,max}` are read with `parseFloat`→default and **no read-time clamp** (`_readEvoLevels`
  readTable `:882-885`, stages `:897-901`). Also **`max < min` per tier is not enforced** (unlike the evo
  scalars, where `max = Math.max(min, …)`).
- **No upper bound on money/prices/seeds:** rewards (`#reward-*`) and all shop prices declare `min="0"` but **no
  HTML `max`**, so the blur-clamp enforces only the floor; the `999999` ceiling exists only at read (`_intField`).
  Seeds/universe-seed have **no upper bound at all** (should be uint32: `0..4294967295`).
- **Nickname textareas:** no hard validation — 12-char + "letters/digits/spaces only" and low-pool are only
  **advisory banners** (`:2008-2037`), never enforced (the randomizer drops offenders downstream).
- **Unbounded starter count:** extra-starter rows add/remove with no min/max (`#add-starter` `:2192`).
- **Cross-field consistency:** `singlesPercent` only matters for `battleFormat === 'mixed'`; evo tier `min≤max`;
  nuzlocke/soul-link counts already clamped but their *combinations* (total ROMs) aren't sanity-checked.

## Per-input analysis (sensible / nonsensical / proposed handling)

Legend for handling: **clamp** = snap to [min,max] (model B, with the inline hint); **block** = model C;
**enum** = restrict to option list (already safe); **dep** = dependency enable/disable; **soft** = advisory only.

### Run type / counts
| Input | Sensible | Nonsensical | Proposed |
|---|---|---|---|
| `run-type` radio, `battle-format` radio, `wild-encounter-type` radio | one of the options | anything else | enum (fallback to default — already safe) |
| `#nz-numroms` | 2–10 | <2, >10, blank | clamp (already `_intField 2,10`) + visible hint |
| `#sl-numplayers` | 2–8 | out of range | clamp (already `2,8`) |
| `#sl-roms-per-player` | 1–10 | out of range | clamp (already `1,10`) |
| share checkboxes (nuzlocke + soul-link) | bool | — | dep (cascades already enforced) |
| **total ROMs** (numPlayers×romsPerPlayer, or numROMs) | ≤ some sane cap (e.g. 60, matches the slow-queue warning) | huge counts | soft warn (there's already a slow-queue warning, T-172) — confirm cap |

### Battle format
| `#singles-percent` | 0–100 | out of range; **irrelevant unless mixed** | clamp `0,100`; ignore/disable unless `mixed` |
| `#league-runandbun`, `#mixed-sequential-split` | bool | — | dep (only meaningful in doubles/mixed) |

### Wild encounters
| `#pokemon-per-zone` | 2–12 | out of range | clamp (already `2,12`) |

### Difficulty
| `#difficultySlider` | 1–13 | **read unclamped** | **fix**: read-clamp `1,13` |
| `#nonBossQualitySlider` | -6–0 | out of range | clamp (already `-6,0`) |
| `#boss-team-size` / `#non-boss-team-size` | 1–6 | out of range | clamp (already `1,6`) |
| `#boss-level-modifier` / `#non-boss-level-modifier` | -30–30 | out of range | clamp (already `-30,30`) |

### Rebalance + mutation
| `#rebalance` (+ `#mutate-*` category checkboxes) | bool | — | dep (gates the rest) |
| `#balance-chance` | 0–100% | **read unclamped** | **fix**: read-clamp `0,100` |
| `#mutprob-<key>` ×11 | 0–100% (0–200% for `moveRatingDeviation`) | out of range | clamp (already `[0, f.max]`) |

### Move mutation
| `#mutate-moves` (+ `#mutate-power/accuracy/type/category`) | bool | — | dep |
| `#move-mutation-chance` | 0–100% | **read unclamped** | **fix**: read-clamp `0,100` |
| `#move-power/accuracy/type/category-chance` | 0–100% | out of range | clamp (already `0,100`) |

### Evolution levels
| `#evo-enabled` | bool | — | dep |
| `#evo-min` / `#evo-max` | 1–100, `min ≤ max` | inverted / out of range | clamp + enforce `max ≥ min` (scalars already do; **verify**) |
| `#evo-deviation` | 0–1 | out of range | clamp (already `0,1`) |
| `#evo-stage-*` | -1–1 | **read unclamped** | **fix**: read-clamp `-1,1` |
| `#evo-base-<TIER>-{min,max}` (10 tiers) | 1–100, `min ≤ max` | **read unclamped, max<min allowed** | **fix**: read-clamp `1,100` + per-tier `max ≥ min` |
| `#evo-mod-<TIER>-{min,max}` (9 tiers) | -1–1, `min ≤ max` | **read unclamped** | **fix**: read-clamp `-1,1` + `max ≥ min` |

### Trainers & bosses
| `#gyms-type-changed` | 0–8 | out of range | clamp (already `0,8`) |
| `#e4-type-changed` | 0–4 | out of range | clamp (already `0,4`) |
| `#champion-type-change-pct` | 0–100% | out of range | clamp (already `0,100`) |
| `#disable-steven-tag-battle` | bool | — | — |
| `#aqua-type-*` / `#magma-type-*` (5 each) | a type or RANDOM | — | enum (already safe) |

### Economy (rewards + shop prices)
| `#reward-normal/boss/gym`, `#reward-relearn` | 0–999999 | negative; **no HTML max today** | **fix**: add HTML `max` so the blur-clamp caps too; confirm the ceiling |
| `#price-ball-*` / `#price-mint-*` / `#price-ability-*` / `#price-tm-*` (~35) | 0–999999 | negative; no HTML max | **fix**: same — add HTML `max`, single shared bound |

### Starters
| `#starter-quality` | enum | — | enum (already safe) |
| per-row `.starter-tier/kind/length` selects | enum | — | enum (already safe) |
| **number of extra-starter rows** | 0–? (cap, e.g. 12) | unbounded | **fix**: cap the row count |

### Nicknames
| enable / mode / dependency checkboxes | bool | — | dep (cascades already enforced) |
| `#nickname-pool-*` textareas | non-empty enough to cover named entities; names ≤12 chars; letters/digits/spaces | too-few names; overlong/illegal names | **soft today** — owner decides: keep advisory banners, or **enforce** (block/strip). Recommend keep advisory + optionally strip illegal chars on read |

### Docs visibility
| 21 `#dv-*` checkboxes | bool | — | dep (master toggles grey children) |
| `#hide-pokemon-count` | 1–5 | out of range | clamp (already `1,5`) |

### Seeds
| `#seed` | integer 0–4294967295 (uint32) | non-integer (blocks); **no upper bound today** | **keep block** on non-integer + **add uint32 upper bound** |
| `#universe-seed` | same, nuzlocke/soul-link only | same | same |

## Proposed implementation

1. **Single source of bounds.** Add a small `FIELD_BOUNDS` map (id → {min,max,type}) so the HTML `min`/`max`,
   the blur-clamp, and the read-clamp all derive from one place (today the HTML and `_intField` bounds can
   diverge — e.g. prices' `999999`). Extend `_clampNumberInput` to also handle `type="range"` (read-clamp path)
   and to close the slider/evo gaps.
2. **Read-time clamp for the gaps:** difficulty, balance-chance, move-mutation-chance, all evo stage/tier
   tables; enforce `max ≥ min` per evo tier; uint32 bound on seeds; HTML `max` on money/prices.
3. **Feedback (model B):** on `input`, mark out-of-range with `aria-invalid` + a red border + a tiny "adjusted
   to N" hint; snap on blur. Non-blocking. Keep the seed/universe-seed **block** (model C) as the only hard stop.
4. **Cross-field:** ignore `singlesPercent` unless mixed; cap the starter-row count; keep the existing nuzlocke/
   soul-link cascades + slow-queue warning.
5. **Tests:** extend `frontend/__tests__/config-validation.test.js` — a table-driven test asserting every
   bounded field clamps at read (esp. the previously-unclamped sliders/evo tables), `max ≥ min` for evo tiers,
   uint32 seeds, and that generation is blocked only for the seed cases. Reuse the drift-guard idea from T-213
   (every numeric config key has a declared bound).

Acceptance criteria (**to finalise with the owner after the policy is chosen**):
- [ ] Owner picks the bad-value model (A/B/C) and the money/price/starter caps + nickname enforce-vs-advisory.
- [ ] Every numeric input is bounded at BOTH the blur-clamp and read layers from one `FIELD_BOUNDS` source; the
      previously-unclamped sliders + evo tables are covered; evo tiers enforce `max ≥ min`; seeds are uint32.
- [ ] Out-of-range values are handled per the chosen model (feedback and/or block) consistently; no field is
      silently wrong.
- [ ] `frontend/__tests__/config-validation.test.js` extended (table-driven) and green; no horizontal overflow.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Task created (proposed). Audited every input in `config-form.js` (full inventory above) and
  the two existing validation layers (blur-clamp T-081 + read-clamp `_intField`/`_read*`). Identified the real
  gaps (unclamped sliders + evo tables, no money/price/seed upper bound, unbounded starter count, advisory-only
  nicknames) and drafted a per-input policy. **Awaiting the owner's choice of bad-value model before starting.**

## Outcome

<!-- Filled when closing. -->
