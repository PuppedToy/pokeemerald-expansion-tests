/**
 * Preset tag derivation (T-192, ADR-021). Tags are NEVER user-entered — they are computed from the
 * saved config so they can't drift from it or be falsified. The server is the authority: it writes
 * the presets.tag_* columns on every create/update and returns them. Three orthogonal dimensions,
 * each mirroring one config field:
 *   format ← config.battleFormat     ('singles' | 'doubles' | 'mixed')
 *   mode   ← config.runType          ('default' → 'normal' | 'nuzlocke' | 'soullink')
 *   wild   ← config.wildEncounterType ('deterministic' | 'classic')
 * Kept dependency-free so it unit-tests in isolation and mirrors the frontend's tiny copy (used only
 * for the synthetic Balanced card).
 */

export const TAG_FORMATS = ['singles', 'doubles', 'mixed'];
export const TAG_MODES = ['normal', 'nuzlocke', 'soullink'];
export const TAG_WILDS = ['deterministic', 'classic'];

const RUN_TYPE_TO_MODE = { default: 'normal', nuzlocke: 'nuzlocke', soullink: 'soullink' };

/** Derive { tag_format, tag_mode, tag_wild } from a config object. Unknown values fall back to the
 *  same defaults the frontend DEFAULTS use, so a partial/legacy config still yields valid tags. */
export function deriveTags(config) {
  const cfg = config && typeof config === 'object' ? config : {};
  const format = TAG_FORMATS.includes(cfg.battleFormat) ? cfg.battleFormat : 'singles';
  const mode = RUN_TYPE_TO_MODE[cfg.runType] ?? 'normal';
  const wild = TAG_WILDS.includes(cfg.wildEncounterType) ? cfg.wildEncounterType : 'deterministic';
  return { tag_format: format, tag_mode: mode, tag_wild: wild };
}
