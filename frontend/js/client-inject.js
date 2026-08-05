// Client-side ROM production (T-249) — the browser builds its own ROMs, the server builds nothing.
//
// The randomizer already runs here (frontend/js/randomizer.bundle.js in a Worker); this closes the loop by
// running the INJECTOR here too, so a run needs no server compute at all:
//
//   1. `/client/manifest.json` says which base build the artifacts belong to (`buildId` = the base's sha256).
//   2. The base ROM is `vanilla + base.bps`, reconstructed locally with the codec ADR-013 already put in the
//      browser, and cached in IndexedDB under that buildId. **The 32 MB base is never served** — what is
//      served is one immutable patch, the same for every user and every run, instead of one patch per ROM
//      per run as today.
//   3. `base-offsets.json` + `base-sources.json` (48 KB + 650 KB gzipped) are the injector's other inputs.
//   4. injector.bundle.js, in a Worker, writes the bundle's data into a copy of the base — the same modules
//      the build box runs, so the output is byte-identical (verified: T-249's browser check).
//
// Deliberately NOT wired into the normal delivery flow by default: the request queue is where beta gating,
// quotas and the "your ROM is ready" email live, and moving delivery off the server is a product decision,
// not a technical one. `clientInjectEnabled()` is the flag; see `deliverLocally` for what it replaces.

import { getRom, getBase, putBase } from './rom-store.js';

const MANIFEST_URL = '/client/manifest.json';

let codec = null;
const loadCodec = () => (codec ||= import('./bps.bundle.js').then((m) => (m.applyBps ? m : m.default)));

let manifestPromise = null;

/**
 * While BETA is on, `/client/` is gated exactly like building is — accepted invite only, see
 * backend/beta/clientArtifactsGate.js. Every request for an artifact therefore carries the caller's token;
 * a refusal comes back as a non-ok response, which `clientArtifactManifest` turns into `null` so the caller
 * falls back to the server queue instead of failing the run.
 */
const authHeaders = (token) => (token ? { authorization: `Bearer ${token}` } : {});

/**
 * The artifact set the server is currently offering, or null when this deployment has none (no base built,
 * or the artifacts were not generated for it).
 */
export function clientArtifactManifest({ refresh = false, authToken = null } = {}) {
  if (refresh) manifestPromise = null;
  manifestPromise ||= fetch(MANIFEST_URL, { cache: 'no-store', headers: authHeaders(authToken) })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  return manifestPromise;
}


/**
 * Is client-side injection turned on for this browser?
 *
 * Opt-in per browser (`?clientInject=1` sticks it in localStorage, `?clientInject=0` clears it) so it can
 * be exercised in production without changing what anyone else gets.
 */
export function clientInjectEnabled() {
  try {
    const param = new URLSearchParams(location.search).get('clientInject');
    if (param === '1') localStorage.setItem('clientInject', '1');
    if (param === '0') localStorage.removeItem('clientInject');
    return localStorage.getItem('clientInject') === '1';
  } catch {
    return false;
  }
}

/**
 * The base ROM, from the local cache or reconstructed from the user's vanilla ROM + `base.bps`.
 *
 * @param {object} manifest        from clientArtifactManifest()
 * @param {Function} [onProgress]  (step, detail) — 'cache' | 'patch-fetch' | 'patch-apply'
 * @returns {Uint8Array}
 */
export async function ensureBaseRom(manifest, onProgress = () => {}, authToken = null) {
  const cached = await getBase(manifest.buildId);
  if (cached) {
    onProgress('cache', 'hit');
    return cached;
  }

  const vanilla = await getRom();
  if (!vanilla) {
    throw new Error('Client-side injection needs your Emerald ROM: it is what the base is built from, and it never leaves this browser.');
  }
  onProgress('patch-fetch', manifest.artifacts.bps.bytes);
  const res = await fetch(`/client/${manifest.artifacts.bps.file}`, { headers: authHeaders(authToken) });
  if (!res.ok) throw new Error(`base.bps download failed (${res.status})`);
  const patch = new Uint8Array(await res.arrayBuffer());

  onProgress('patch-apply', manifest.romBytes);
  const { applyBps } = await loadCodec();
  // applyBps verifies the SOURCE checksum, so a ROM that is not the vanilla this patch was made from
  // fails here rather than producing a base that would inject into nonsense.
  const base = applyBps(patch, vanilla);
  await putBase(manifest.buildId, base);
  return base;
}

/** The injector's other two inputs. Immutable per build, so the HTTP cache does the caching. */
async function fetchInjectorInputs(manifest, authToken = null) {
  const headers = authHeaders(authToken);
  const [offsets, sources] = await Promise.all([
    fetch(`/client/${manifest.artifacts.offsets.file}`, { headers }).then((r) => {
      if (!r.ok) throw new Error(`offsets download failed (${r.status})`);
      return r.json();
    }),
    fetch(`/client/${manifest.artifacts.sources.file}`, { headers }).then((r) => {
      if (!r.ok) throw new Error(`base sources download failed (${r.status})`);
      return r.json();
    }),
  ]);
  return { offsets, sources };
}

/** One Worker round trip. The base is TRANSFERRED in and the finished ROM transferred back — no copies. */
function injectInWorker({ baseRom, offsets, sources, bundle, romIndex }) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/js/injector.bundle.js');
    worker.onmessage = ({ data }) => {
      worker.terminate();
      if (data.type === 'done') resolve(data);
      else reject(new Error(data.message || 'injection failed'));
    };
    worker.onerror = (e) => { worker.terminate(); reject(new Error(e.message || 'injector worker crashed')); };
    const base = baseRom.buffer.slice(baseRom.byteOffset, baseRom.byteOffset + baseRom.byteLength);
    worker.postMessage({ type: 'inject', baseRom: base, offsets, sources, bundle, romIndex }, [base]);
  });
}

/**
 * Build every ROM of a bundle locally.
 *
 * Returns the same shape the server-delivery path assembles, so the archive builder does not care which
 * path produced it: `[{ serverName, gbaBytes, bpsBytes }]`. The `.bps` is computed here too — the user's
 * vanilla ROM is right here, and the full archive offers patches next to the ROMs.
 *
 * @param {object} bundle
 * @param {object} [opts]
 * @param {Function} [opts.onStep]  (key, state) for the delivery checklist
 * @param {boolean} [opts.withPatches=true]
 */
export async function injectBundleLocally(bundle, { onStep = () => {}, withPatches = true, authToken = null } = {}) {
  const manifest = await clientArtifactManifest({ authToken });
  if (!manifest) throw new Error('This deployment has no client-injection artifacts (no /client/manifest.json).');

  onStep('base', 'active');
  const baseRom = await ensureBaseRom(manifest, () => {}, authToken);
  const { offsets, sources } = await fetchInjectorInputs(manifest, authToken);
  onStep('base', 'done');

  onStep('inject', 'active');
  const { createBps } = withPatches ? await loadCodec() : {};
  const vanilla = withPatches ? await getRom() : null;
  const artifacts = [];
  for (let romIndex = 0; romIndex < bundle.roms.length; romIndex++) {
    // One base per ROM: the Worker writes the transferred buffer in place, so each ROM needs its own copy
    // (a 32 MB copy is cheaper than holding two bases plus a pristine one).
    const { rom, sha256 } = await injectInWorker({
      baseRom: new Uint8Array(baseRom), offsets, sources, bundle, romIndex,
    });
    const gbaBytes = new Uint8Array(rom);
    artifacts.push({
      serverName: `rom-${romIndex}.gba`,
      sha256,
      gbaBytes,
      bpsBytes: withPatches && vanilla && createBps ? createBps(vanilla, gbaBytes) : null,
    });
    onStep('inject', 'active', { done: romIndex + 1, of: bundle.roms.length });
  }
  onStep('inject', 'done');
  return artifacts;
}
