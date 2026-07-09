// Client-side ROM store + hashing (T-053, ADR-013; T-080).
//
// The user's vanilla ROM lives ONLY in the browser's IndexedDB — it is never uploaded. We hash it here
// (SHA-1) and validate it entirely client-side against the known official dumps; "I have a ROM" is a
// purely frontend fact (the backend does not track or gate on it). The bytes are kept locally to apply
// the BPS patch in the browser at download time. HackDex-style: pick the ROM once, reuse it forever.

const DB = 'emeraldcut';
const STORE = 'kv';
const ROM_KEY = 'rom';

// Accepted official Pokémon Emerald dumps — SHA-1s from the No-Intro "Nintendo - Game Boy Advance"
// DAT (serials AGB-BPE*). Ownership is an attestation, not DRM (a BPS patch is inert without a genuine
// base ROM), so validating the client-computed hash locally is sufficient (T-080, was backend T-037).
export const KNOWN_EMERALD_SHA1 = new Set([
  'f3ae088181bf583e55daf962a92bb46f4f1d07b7', // Pokémon - Emerald Version (USA, Europe)   [BPEE]
  'd7cf8f156ba9c455d164e1ea780a6bf1945465c2', // Pocket Monsters - Emerald (Japan)          [BPEJ]
  '61c2eb2b380b1a75f0c94b767a2d4c26cd7ce4e3', // Pokémon - Smaragd-Edition (Germany)        [BPED]
  'ca666651374d89ca439007bed54d839eb7bd14d0', // Pokémon - Version Émeraude (France)        [BPEF]
  '1692db322400c3141c5de2db38469913ceb1f4d4', // Pokémon - Versione Smeraldo (Italy)        [BPEI]
  'fe1558a3dcb0360ab558969e09b690888b846dd9', // Pokémon - Edición Esmeralda (Spain)        [BPES]
]);

/** True when a SHA-1 hex matches a known official Emerald dump (case-insensitive). */
export function isKnownEmeraldRom(sha1) {
  return KNOWN_EMERALD_SHA1.has(String(sha1).toLowerCase());
}

function db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function kvGet(key) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const r = d.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    r.onsuccess = () => resolve(r.result ?? null);
    r.onerror = () => reject(r.error);
  });
}

async function kvSet(key, val) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function kvDel(key) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function asU8(bytes) {
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

/** SHA-1 hex of the given bytes (Web Crypto — client-side, no upload). */
export async function sha1Hex(bytes) {
  const digest = await crypto.subtle.digest('SHA-1', asU8(bytes));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Persist the ROM in IndexedDB and return its SHA-1 hex. */
export async function putRom(bytes) {
  const u8 = asU8(bytes);
  await kvSet(ROM_KEY, u8);
  return sha1Hex(u8);
}

/** The stored ROM bytes, or null if the user hasn't provided one yet. */
export async function getRom() {
  const v = await kvGet(ROM_KEY);
  return v == null ? null : asU8(v);
}

export async function hasRom() {
  return (await getRom()) != null;
}

export async function clearRom() {
  try { await kvDel(ROM_KEY); } catch { /* best effort */ }
}
