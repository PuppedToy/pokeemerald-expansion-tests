import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'node:crypto';

import { openDatabase } from './db/index.js';
import { createRequestsRepo } from './db/requests.js';
import { createRunsRepo } from './db/runs.js';
import { createFeedbackRepo } from './db/feedback.js';
import { createDiagnosticsRepo } from './db/diagnostics.js';
import { createDecisionLogsRepo } from './db/decisionLogs.js';
import { createPresetsRepo } from './db/presets.js';
import { createPresetLikesRepo } from './db/presetLikes.js';
import { createPresetViewsRepo } from './db/presetViews.js';
import { createBetaInvitesRepo } from './db/betaInvites.js';
import { createUsersRepo } from './auth/users.js';
import { createTokensRepo } from './auth/tokens.js';
import { createAuthService } from './auth/service.js';
import { parseAdminEmails } from './auth/admin.js';
import { createAuthRouter } from './auth/routes.js';
import { createConfigRouter } from './config/routes.js';
import { createBetaAdminRouter } from './beta/routes.js';
import { createClientArtifactsGate } from './beta/clientArtifactsGate.js';
import { createProduceRouter } from './produce/routes.js';
import { createFeedbackRouter } from './feedback/routes.js';
import { createDiagnosticsRouter } from './diagnostics/routes.js';
import { createDecisionLogRouter } from './decisionLog/routes.js';
import { createPresetsRouter } from './presets/routes.js';
import { createShellRouter } from './shell/routes.js';
import { createMailer, brevoTransport } from './email/index.js';
import { createStorage } from './build/storage.js';
import { createBuildRom, killActiveBuild } from './build/buildRom.js';
import { checkBaseReadiness, baseReadinessMessage } from './build/baseReadiness.js';
import { createWorker } from './queue/scheduler.js';
import { runOnStartup } from './lifecycle/recovery.js';
import { startSweeper } from './lifecycle/sweeper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
// Admins (T-192, ADR-021): comma-separated emails allowed to curate Official presets and moderate
// Community (unpublish/delete any preset). Empty by default → no admins.
const ADMIN_EMAILS = parseAdminEmails(process.env.ADMIN_EMAILS);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
// Fake build by default off production, so the flow is runnable without devkitARM (T-019 wires the real build).
const FAKE_BUILD = process.env.FAKE_BUILD === '1' || process.env.NODE_ENV !== 'production';
// Beta gate (T-216): while on, a not-yet-accepted user can prepare a bundle but it is HELD (never built)
// until an admin invite promotes it. Turning it off flushes every held run into the queue (below).
const BETA = process.env.BETA === 'true';

// ── persistence + repositories (ADR-003) ───────────────────────────────────────
const db = openDatabase(process.env.DB_PATH || path.join(DATA_DIR, 'app.db'));
const users = createUsersRepo(db);
const tokens = createTokensRepo(db);
const requests = createRequestsRepo(db);
const runs = createRunsRepo(db);
const feedback = createFeedbackRepo(db);
const diagnostics = createDiagnosticsRepo(db);
const decisionLogs = createDecisionLogsRepo(db);
const presets = createPresetsRepo(db);
const presetLikes = createPresetLikesRepo(db);
const presetViews = createPresetViewsRepo(db);
const betaInvites = createBetaInvitesRepo(db);

// ── email (ADR-007): real provider if configured, else a dev console transport ──
const transport = process.env.BREVO_API_KEY
  ? brevoTransport({
      apiKey: process.env.BREVO_API_KEY,
      sender: { name: 'Pokémon Emerald Cut', email: process.env.MAIL_FROM || 'no-reply@example.com' },
    })
  : { async send(m) { console.log(`\n[email:dev] → ${m.to}\n  ${m.subject}\n  ${m.text}\n`); return { id: 'dev' }; } };
const mailer = createMailer({ transport });

const authService = createAuthService({
  users, tokens, mailer, jwtSecret: JWT_SECRET,
  verifyUrl: (t) => `${BASE_URL}/verify.html?t=${t}`,
  resetUrl: (t) => `${BASE_URL}/reset.html?t=${t}`,
});

// ── build pipeline (ADR-005) ────────────────────────────────────────────────────
const storage = createStorage({ dataDir: DATA_DIR });
const buildRom = createBuildRom({ requests, storage, fake: FAKE_BUILD });

// recovery: in FAKE_BUILD the build never mutates the source tree, so skip the git
// restore (it would clobber a dev working tree); real builds use the default restore.
runOnStartup({ requests, restoreTree: FAKE_BUILD ? () => {} : undefined });

// T-216 — when BETA is OFF, nothing should stay held: promote every leftover `pending` request into its
// queue so builds resume normally. Idempotent (a no-op once none remain), so it's safe on every boot.
if (!BETA) {
  const held = requests.findByStates(['pending']);
  for (const r of held) requests.promotePending(r.id);
  if (held.length) console.log(`  beta: off → flushed ${held.length} held request(s) into the queue`);
}

// T-246 — a real build injects into base/pokeemerald.{gba,map,sym}, which are gitignored artifacts a
// deploy does not carry. If they are absent, starting the worker would walk the queue and fail every
// request; holding it keeps those requests queued until the base is installed and the app restarted.
const baseReadiness = FAKE_BUILD
  ? { ready: true, missing: [] }
  : checkBaseReadiness({ repoRoot: path.join(__dirname, '..') });

const worker = createWorker({ requests, runs, db, buildRom, mailer, users, baseUrl: BASE_URL });
if (baseReadiness.ready) {
  worker.start();
} else {
  console.error(`\n[base] ${baseReadinessMessage(baseReadiness)}\n`);
}
startSweeper({ requests, diagnostics, decisionLogs, removeFile: storage.removeFile });

// ── HTTP ────────────────────────────────────────────────────────────────────────
const app = express();

app.use('/api', createAuthRouter({
  service: authService, users, requests, runs, tokens, feedback, diagnostics, decisionLogs,
  presets, presetLikes, presetViews, adminEmails: ADMIN_EMAILS, jwtSecret: JWT_SECRET,
  removeFile: (p) => storage.removeFile(p), db, killActiveBuild,
}));
app.use('/api', createConfigRouter({ beta: BETA }));
// Beta admin panel (T-217): admin-only invite/accept/overview/search. Gated by ADMIN_EMAILS.
app.use('/api', createBetaAdminRouter({
  users, requests, betaInvites, mailer, adminEmails: ADMIN_EMAILS,
  jwtSecret: JWT_SECRET, baseUrl: BASE_URL, db,
  // T-246 — so "nothing is building" is answerable from the admin panel, not only from docker logs.
  baseReady: baseReadiness.ready,
}));
app.use('/api', createFeedbackRouter({ feedback, jwtSecret: JWT_SECRET }));
app.use('/api', createDiagnosticsRouter({ diagnostics, jwtSecret: JWT_SECRET }));
app.use('/api', createDecisionLogRouter({ decisionLogs, jwtSecret: JWT_SECRET }));
app.use('/api', createPresetsRouter({
  presets, presetLikes, presetViews, users, jwtSecret: JWT_SECRET,
  adminEmails: ADMIN_EMAILS, idGen: () => randomUUID(),
}));
app.use('/api', createProduceRouter({
  requests, users, jwtSecret: JWT_SECRET, beta: BETA,
  persistBundle: (id, b) => storage.persistBundle(id, b),
  readOutput: (r) => storage.readOutput(r),
  removeFile: (p) => storage.removeFile(p),
  killActiveBuild,
  idGen: () => randomUUID(),
}));

// static frontend (the randomizer + docs run in the browser). In production (or SERVE_DIST=1) the minified
// build (frontend/dist, produced by `node build.js` step 7 — T-220) is mounted FIRST so it shadows the
// hand-written source; the generated bundles/data/assets/template.min.html that live outside dist fall
// through to the frontend/ mount. Dev serves raw source. A missing dist/ simply falls through — safe.
// Client-side injection artifacts (T-249): base.bps + the injector's inputs for the base this box has
// installed, produced by randomizer/injector/buildClientArtifacts.js at base-build time. They live next to
// the base itself (base/, which update.sh deliberately does not carry) and are a function of that build, so
// everything except the manifest is immutable — the manifest is the freshness check that names the build.
// They are also gated exactly like building is (createClientArtifactsGate): this path bypasses the queue,
// so an unguarded /client/ would be a way around the beta invite gate that lives in handleProduce.
const CLIENT_ARTIFACTS_DIR = path.join(__dirname, '..', 'base', 'client');
app.use('/client', createClientArtifactsGate({ beta: BETA, users, jwtSecret: JWT_SECRET }), express.static(CLIENT_ARTIFACTS_DIR, {
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', path.basename(filePath) === 'manifest.json'
      ? 'no-store'
      : 'public, max-age=31536000, immutable');
  },
}));

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const SERVE_DIST = process.env.NODE_ENV === 'production' || process.env.SERVE_DIST === '1';
if (SERVE_DIST) app.use(express.static(path.join(FRONTEND_DIR, 'dist')));
app.use(express.static(FRONTEND_DIR));

// T-259 — the frontend's destinations are real paths (/features, /features/docs, /randomizer…), so a
// reload, a bookmark or a crawler on one of them must get the app shell back. Mounted after the static
// mounts so a real file always wins, and limited to the paths frontend/js/router.js declares — an
// unknown path keeps 404-ing instead of returning a page of HTML. Same router serves /robots.txt and
// /sitemap.xml, built from that route table plus BASE_URL.
app.use(createShellRouter({ frontendDir: FRONTEND_DIR, serveDist: SERVE_DIST, baseUrl: BASE_URL }));

app.listen(PORT, () => {
  console.log(`Pokémon Emerald Cut backend → ${BASE_URL}`);
  console.log(`  FAKE_BUILD=${FAKE_BUILD ? 'on (placeholder ROMs)' : 'off (real build)'}  data=${DATA_DIR}`);
  if (!FAKE_BUILD) console.log(`  build: injection${baseReadiness.ready ? '' : ' — BASE MISSING, worker held'}`);
  if (!process.env.BREVO_API_KEY) console.log('  email: dev console transport (set BREVO_API_KEY for real sends)');
});
