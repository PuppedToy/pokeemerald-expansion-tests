// Client-side ROM store + hashing (T-053, ADR-013).
//
// The user's vanilla ROM lives ONLY in the browser's IndexedDB — it is never uploaded. We hash it here
// (SHA-1) so the server can attest ownership from the hash alone, and we keep the bytes locally to apply
// the BPS patch in the browser at download time. HackDex-style: pick the ROM once, reuse it forever.

const DB = 'emeraldcut';
const STORE = 'kv';
const ROM_KEY = 'rom';

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
