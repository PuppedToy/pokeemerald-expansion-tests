/**
 * Produce / status / download routes (T-025). Wires the handlers behind the
 * auth + verified + owns-rom gate. The filesystem ops (persist the bundle, read
 * the output zip, delete files) are injected so the handlers stay testable.
 */

import express from 'express';
import { randomUUID } from 'node:crypto';
import { requireAuth, requireVerified, requireOwnsRom } from '../auth/middleware.js';
import { classify } from '../queue/scheduler.js';
import { validateBundle } from '../build/bundleSchema.js';
import { handleProduce, handleStatus, handleDownload, handleNotifyOnReady, handleCancel } from './handlers.js';

export function createProduceRouter({
  requests, users, jwtSecret,
  persistBundle, readOutput, removeFile,
  idGen = () => randomUUID(), avgRomSecs,
}) {
  const router = express.Router();
  const auth = requireAuth(jwtSecret);

  router.post(
    '/produce',
    auth, requireVerified(users), requireOwnsRom(users),
    express.json({ limit: '50mb' }),
    handleProduce({ requests, classify, validateBundle, persistBundle, idGen, avgRomSecs }),
  );

  router.post('/notify-on-ready', auth, handleNotifyOnReady({ requests }));
  router.post('/cancel', auth, handleCancel({ requests, removeFile }));
  router.get('/status', auth, handleStatus({ requests, avgRomSecs }));
  router.get('/download', auth, handleDownload({ requests, readOutput, removeFile }));

  return router;
}
