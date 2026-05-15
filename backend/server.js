import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Stub — will be implemented once the backend pipeline is wired up.
app.post('/api/randomize', (_req, res) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

app.listen(PORT, () => {
    console.log(`Randomizer server running on http://localhost:${PORT}`);
});
