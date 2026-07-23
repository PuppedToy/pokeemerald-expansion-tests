import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'node:crypto';

import { openDatabase } from './db/index.js';
import { createRequestsRepo } from './db/requests.js';
import { createRunsRepo } from './db/runs.js';
import { createFeedbackRepo } from './db/feedback.js';
import { createDiagnosticsRepo } from './db/diagnostics.js';
import { createPresetsRepo } from './db/presets.js';
import { createPresetLikesRepo } from './db/presetLikes.js';
import { createPresetViewsRepo } from './db/presetViews.js';
import { createUsersRepo } from './auth/users.js';
import { createTokensRepo } from './auth/tokens.js';
import { createAuthService } from './auth/service.js';
import { parseAdminEmails } from './auth/admin.js';
import { createAuthRouter } from './auth/routes.js';
import { createProduceRouter } from './produce/routes.js';
import { createFeedbackRouter } from './feedback/routes.js';
import { createDiagnosticsRouter } from './diagnostics/routes.js';
import { createPresetsRouter } from './presets/routes.js';
import { createMailer, brevoTransport } from './email/index.js';
import { createStorage } from './build/storage.js';
import { createBuildRom, killActiveBuild } from './build/buildRom.js';
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

// ── persistence + repositories (ADR-003) ───────────────────────────────────────
const db = openDatabase(process.env.DB_PATH || path.join(DATA_DIR, 'app.db'));
const users = createUsersRepo(db);
const tokens = createTokensRepo(db);
const requests = createRequestsRepo(db);
const runs = createRunsRepo(db);
const feedback = createFeedbackRepo(db);
const diagnostics = createDiagnosticsRepo(db);
const presets = createPresetsRepo(db);
const presetLikes = createPresetLikesRepo(db);
const presetViews = createPresetViewsRepo(db);

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

const worker = createWorker({ requests, runs, db, buildRom, mailer, users, baseUrl: BASE_URL });
worker.start();
startSweeper({ requests, diagnostics, removeFile: storage.removeFile });

// ── HTTP ────────────────────────────────────────────────────────────────────────
const app = express();

app.use('/api', createAuthRouter({
  service: authService, users, requests, runs, tokens, feedback, diagnostics,
  presets, presetLikes, presetViews, adminEmails: ADMIN_EMAILS, jwtSecret: JWT_SECRET,
  removeFile: (p) => storage.removeFile(p), db, killActiveBuild,
}));
app.use('/api', createFeedbackRouter({ feedback, jwtSecret: JWT_SECRET }));
app.use('/api', createDiagnosticsRouter({ diagnostics, jwtSecret: JWT_SECRET }));
app.use('/api', createPresetsRouter({
  presets, presetLikes, presetViews, users, jwtSecret: JWT_SECRET,
  adminEmails: ADMIN_EMAILS, idGen: () => randomUUID(),
}));
app.use('/api', createProduceRouter({
  requests, users, jwtSecret: JWT_SECRET,
  persistBundle: (id, b) => storage.persistBundle(id, b),
  readOutput: (r) => storage.readOutput(r),
  removeFile: (p) => storage.removeFile(p),
  killActiveBuild,
  idGen: () => randomUUID(),
}));

// static frontend (the randomizer + docs run in the browser)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, () => {
  console.log(`Pokémon Emerald Cut backend → ${BASE_URL}`);
  console.log(`  FAKE_BUILD=${FAKE_BUILD ? 'on (placeholder ROMs)' : 'off (real make)'}  data=${DATA_DIR}`);
  if (!process.env.BREVO_API_KEY) console.log('  email: dev console transport (set BREVO_API_KEY for real sends)');
});
