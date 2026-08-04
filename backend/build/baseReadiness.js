/**
 * Base-artifact readiness (T-246).
 *
 * Since T-244 every delivered ROM is injected into `base/pokeemerald.{gba,map,sym}`, which are **build
 * artifacts, not source**: gitignored (`*.gba`, `*.map`, `*.sym`), too big for git, and produced by one
 * `make && make syms` on a machine with the toolchain. So a box can be perfectly deployed and still have
 * no base — which is exactly the state the production box was found in when T-244 landed.
 *
 * Without this check that state surfaces as *every user's build failing* at ROM time, one request at a
 * time, with the real cause buried in a per-ROM log. With it, the boot log says what is missing and how to
 * install it, and the worker does not start — so requests wait in the queue and drain when the base
 * arrives, instead of marching to `failed`.
 *
 * Provisioning is documented in docs/base-rom-provisioning.md (`deploy/build-base.sh`).
 */

import fs from 'node:fs';
import path from 'node:path';

/** The three artifacts, and how make.js resolves them (mirrors make.js `resolveBasePaths`). */
export function baseArtifactPaths({ repoRoot, env = process.env }) {
  return {
    rom: env.INJECT_BASE_ROM || path.join(repoRoot, 'base', 'pokeemerald.gba'),
    map: env.INJECT_BASE_MAP || path.join(repoRoot, 'base', 'pokeemerald.map'),
    sym: env.INJECT_BASE_SYM || path.join(repoRoot, 'base', 'pokeemerald.sym'),
  };
}

/**
 * Is this box able to inject? Checks presence and non-emptiness — an empty file is a half-finished copy,
 * which fails later and more confusingly than an absent one.
 *
 * The three must come from the SAME build (the `.map`/`.sym` name the addresses inside that exact ROM), a
 * claim no filesystem check can verify; the injector proves it per table at inject time by reading its
 * anchors back out of the ROM. What is checkable here is that they exist at all.
 */
export function checkBaseReadiness({ repoRoot, env = process.env, fileSystem = fs } = {}) {
  const paths = baseArtifactPaths({ repoRoot, env });
  const missing = [];
  const sizes = {};
  for (const [kind, p] of Object.entries(paths)) {
    let size = -1;
    try {
      const st = fileSystem.statSync(p);
      size = st.isFile() ? st.size : -1;
    } catch { /* absent */ }
    sizes[kind] = size;
    if (size <= 0) missing.push({ kind, path: p, reason: size === 0 ? 'empty' : 'absent' });
  }
  return { ready: missing.length === 0, missing, paths, sizes };
}

/** The boot message. Kept here (not inlined in server.js) so its wording is testable. */
export function baseReadinessMessage(result) {
  if (result.ready) return null;
  const lines = [
    'The prebuilt base ROM is missing, so no ROM can be injected (T-244: injection is the only build path).',
    ...result.missing.map((m) => `  · ${m.kind}: ${m.path} (${m.reason})`),
    'The build worker will NOT start: requests stay queued instead of failing one by one.',
    'Install it with deploy/build-base.sh (see docs/base-rom-provisioning.md), then restart the app.',
  ];
  return lines.join('\n');
}
