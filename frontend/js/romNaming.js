// T-211 — single source of truth for download file naming.
//
// Convention (1-indexed everywhere):
//   • default / nuzlocke: roms are `rom-1`, `rom-2`, … at the archive root.
//   • soul-link: one folder per player (`player-1`, `player-2`, …); inside each, roms are renumbered
//     per player as `player-1-rom-1`, `player-1-rom-2`, … (nothing starts at 0).
//
// Server-built files (make.js) are 0-indexed `rom-{i}` / `player-{p}-rom-{i}`; `parseServerName`
// maps one back to its {playerIndex, romIndex} so the client can rename to the final convention.

export function isSoulLink(roms) {
  return (roms || []).some((r) => r.playerIndex !== undefined && r.playerIndex !== null);
}

/** The archive name of the run's bundle, always `bundle-<seed>.json`. */
export function bundleFileName(seed) {
  return `bundle-${seed}.json`;
}

/**
 * Final (1-indexed) name parts for a rom: `{ folder, base }`. `folder` is null unless soul-link.
 * `base` has no extension and no folder — callers add `.html`/`.gba`/`.bps` and choose the layout.
 */
export function romName(rom, roms) {
  if (rom.playerIndex !== undefined && rom.playerIndex !== null) {
    const p = rom.playerIndex + 1;
    const mine = roms
      .filter((r) => r.playerIndex === rom.playerIndex)
      .sort((a, b) => a.romIndex - b.romIndex);
    const n = mine.findIndex((r) => r.romIndex === rom.romIndex) + 1;
    return { folder: `player-${p}`, base: `player-${p}-rom-${n}` };
  }
  const sorted = [...roms].sort((a, b) => a.romIndex - b.romIndex);
  const n = sorted.findIndex((r) => r.romIndex === rom.romIndex) + 1;
  return { folder: null, base: `rom-${n}` };
}

/** Parse a server file name (`rom-{i}.ext` or `player-{p}-rom-{i}.ext`, any folder) → its rom identity. */
export function parseServerName(name) {
  const base = String(name).replace(/\.[^.]+$/, '').split('/').pop();
  let m = base.match(/^player-(\d+)-rom-(\d+)$/);
  if (m) return { playerIndex: Number(m[1]), romIndex: Number(m[2]) };
  m = base.match(/^rom-(\d+)$/);
  if (m) return { playerIndex: undefined, romIndex: Number(m[1]) };
  return null;
}

/** Find the bundle rom a server-named artifact belongs to. */
export function romForServerName(name, roms) {
  const id = parseServerName(name);
  if (!id) return null;
  return roms.find((r) =>
    r.romIndex === id.romIndex && (r.playerIndex ?? undefined) === (id.playerIndex ?? undefined)) || null;
}
