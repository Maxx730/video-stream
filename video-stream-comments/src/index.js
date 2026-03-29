const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const origins = [
    "https://video.clam-tube.com",
    "http://video.clam-tube.com",
    "https://dev.clam-tube.com",
    "http://dev.clam-tube.com",
    "https://localhost:3000",
    "http://localhost:3000"
];

const app = express();
app.use(express.json());
app.use(cors({
    origin: origins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const PORT = process.env.PORT || 2279;
const MAX_LENGTH = 200;

const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'postgres',
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'auth',
    password: process.env.POSTGRES_PASSWORD || 'authpass',
    database: process.env.POSTGRES_DB || 'authdb',
});

pool.on('error', (err) => {
    console.error('Unexpected Postgres error', err);
    process.exit(1);
});

async function ensureSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            text TEXT NOT NULL,
            channel VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now()
        )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS comments_channel_idx ON comments (channel, created_at DESC)`);
}

app.get('/comments/', async (req, res) => {
    const channel = req.query.channel;
    if (!channel) {
        return res.status(400).json({ error: 'channel is required' });
    }
    try {
        const result = await pool.query(
            'SELECT id, text, created_at FROM comments WHERE channel = $1 ORDER BY created_at DESC LIMIT 50',
            [channel]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /comments error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/comments/', async (req, res) => {
    const { text, channel } = req.body;
    if (!text || !channel) {
        return res.status(400).json({ error: 'text and channel are required' });
    }
    if (text.trim().length === 0 || text.length > MAX_LENGTH) {
        return res.status(400).json({ error: `text must be between 1 and ${MAX_LENGTH} characters` });
    }
    try {
        const result = await pool.query(
            'INSERT INTO comments (text, channel) VALUES ($1, $2) RETURNING id, text, created_at',
            [text.trim(), channel]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /comments error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function start() {
    try {
        await ensureSchema();
        app.listen(PORT, () => {
            console.log(`Comments server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}

start();
