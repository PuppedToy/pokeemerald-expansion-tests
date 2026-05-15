import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createJob, getJob, subscribe, runGeneration } from './generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── Generation endpoints ──────────────────────────────────────────────────────

// Start a generation job. Returns { jobId } immediately; runs async.
app.post('/api/generate/start', (req, res) => {
    const config = req.body;
    if (!config || !config.runType) {
        return res.status(400).json({ error: 'Missing config.runType' });
    }
    const jobId = createJob();
    runGeneration(jobId, config).catch(() => {});
    res.json({ jobId });
});

// SSE stream for a job. Client opens EventSource to this URL.
app.get('/api/generate/stream', (req, res) => {
    const { jobId } = req.query;
    const job = getJob(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (payload) => res.write(`data: ${payload}\n\n`);

    if (job.status === 'done') {
        send(JSON.stringify({ event: 'progress', data: { progress: 100, step: 'Done' } }));
        send(JSON.stringify({ event: 'done' }));
        return res.end();
    }
    if (job.status === 'error') {
        send(JSON.stringify({ event: 'error', data: { message: job.error } }));
        return res.end();
    }

    send(JSON.stringify({ event: 'progress', data: { progress: job.progress, step: job.step } }));
    const unsubscribe = subscribe(jobId, send);
    req.on('close', unsubscribe);
});

// Return completed bundle JSON after 'done' SSE event.
app.get('/api/generate/bundle', (req, res) => {
    const { jobId } = req.query;
    const job = getJob(jobId);
    if (!job)                  return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'done') return res.status(409).json({ error: `Job status: ${job.status}` });

    const seed = job.result?.config?.seed ?? 'unknown';
    res.setHeader('Content-Disposition', `attachment; filename="session-bundle-${seed}.json"`);
    res.json(job.result);
});

// ── ROM production (Phase H — not yet implemented) ────────────────────────────

app.post('/api/produce', (_req, res) => {
    res.status(501).json({ error: 'ROM production not yet implemented' });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`Randomizer server running on http://localhost:${PORT}`);
});
