import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Serve frontend/ (includes frontend/data/base-data.json and frontend/js/randomizer.bundle.js)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── ROM production (Phase H — not yet implemented) ────────────────────────────
// The frontend generates the session bundle entirely in the browser.
// This endpoint will receive a ready bundle and compile ROMs from it.

app.post('/api/produce', (_req, res) => {
    res.status(501).json({ error: 'ROM production not yet implemented' });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`Randomizer server running on http://localhost:${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log('Note: run `node build.js` first to generate base-data.json and randomizer.bundle.js');
});
