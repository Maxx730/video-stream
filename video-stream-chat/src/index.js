const { WebSocketServer, WebSocket } = require('ws');
const { Pool } = require('pg');

const origins = [
    "https://video.clam-tube.com",
    "http://video.clam-tube.com",
    "https://dev.clam-tube.com",
    "http://dev.clam-tube.com",
    "https://localhost:3000",
    "http://localhost:3000",
    "http://localhost:5173"
];

const PORT = Number(process.env.PORT || 2280);
const WS_PATH = '/chat/ws';
const MAX_PAYLOAD_BYTES = 4096;
const MAX_LENGTH = 200;
const MAX_CHANNEL_LENGTH = 255;
const HISTORY_LIMIT = 50;
const AUTH_TIMEOUT_MS = 5000;
const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW_MS = 10000;
const HEARTBEAT_MS = 30000;
const TOKEN_PATTERN = /^[\w.-]+$/;

const CLOSE_UNAUTHORIZED = 4401;
const CLOSE_TRY_AGAIN_LATER = 1013;

class AuthUnavailableError extends Error {}

// Returns the token's payload, null if the token is invalid, or throws AuthUnavailableError.
const createTokenVerifier = (authUrl) => async (token) => {
    let response;
    try {
        response = await fetch(`${authUrl}/verify`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
        });
    } catch (err) {
        throw new AuthUnavailableError(err.message);
    }
    if (response.status === 401) return null;
    if (!response.ok) throw new AuthUnavailableError(`auth responded ${response.status}`);
    const data = await response.json();
    return data.valid === true ? data.user : null;
};

async function ensureSchema(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
            id BIGSERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            display_name TEXT NOT NULL,
            channel VARCHAR(${MAX_CHANNEL_LENGTH}) NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now()
        )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS chat_messages_channel_idx ON chat_messages (channel, created_at DESC)`);
}

const toMessage = (row) => ({
    id: Number(row.id),
    channel: row.channel,
    displayName: row.display_name,
    text: row.text,
    created_at: row.created_at,
});

const send = (ws, payload) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
};

const sendError = (ws, code, message) => send(ws, { type: 'error', code, message });

const isExpired = (user) => typeof user.exp === 'number' && Date.now() / 1000 >= user.exp;

const createChatServer = ({ pool, verifyToken, port = PORT, authTimeoutMs = AUTH_TIMEOUT_MS }) => {
    const wss = new WebSocketServer({
        port,
        path: WS_PATH,
        maxPayload: MAX_PAYLOAD_BYTES,
        // Non-browser clients send no Origin; they still have to present a valid token.
        verifyClient: ({ origin }) => !origin || origins.includes(origin),
    });

    const authenticate = async (ws, message) => {
        clearTimeout(ws.authTimer);
        if (message.type !== 'auth' || typeof message.token !== 'string' || !TOKEN_PATTERN.test(message.token)) {
            ws.close(CLOSE_UNAUTHORIZED, 'unauthorized');
            return;
        }
        let user;
        try {
            user = await verifyToken(message.token);
        } catch (err) {
            console.error('Token verification failed', err);
            ws.close(CLOSE_TRY_AGAIN_LATER, 'auth unavailable');
            return;
        }
        if (!user || !Number.isInteger(user.id) || isExpired(user)) {
            ws.close(CLOSE_UNAUTHORIZED, 'unauthorized');
            return;
        }
        ws.user = { id: user.id, exp: user.exp, displayName: user.displayName || `User-${user.id}` };
        send(ws, { type: 'ready', displayName: ws.user.displayName });
    };

    const join = async (ws, channel) => {
        if (typeof channel !== 'string' || channel.length === 0 || channel.length > MAX_CHANNEL_LENGTH) {
            sendError(ws, 'invalid', 'channel is required');
            return;
        }
        // Set before reading history so nothing is missed; a message can arrive just before
        // the history that also contains it, so clients should de-duplicate by id.
        ws.channel = channel;
        const result = await pool.query(
            `SELECT id, channel, display_name, text, created_at FROM chat_messages
             WHERE channel = $1 ORDER BY created_at DESC, id DESC LIMIT ${HISTORY_LIMIT}`,
            [channel]
        );
        send(ws, { type: 'history', channel, messages: result.rows.map(toMessage).reverse() });
    };

    const isRateLimited = (ws) => {
        const now = Date.now();
        ws.sentAt = ws.sentAt.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
        if (ws.sentAt.length >= RATE_LIMIT_COUNT) return true;
        ws.sentAt.push(now);
        return false;
    };

    const postMessage = async (ws, rawText) => {
        if (!ws.channel) {
            sendError(ws, 'not_joined', 'join a channel first');
            return;
        }
        const text = typeof rawText === 'string' ? rawText.trim() : '';
        if (text.length === 0 || text.length > MAX_LENGTH) {
            sendError(ws, 'invalid', `text must be between 1 and ${MAX_LENGTH} characters`);
            return;
        }
        if (isRateLimited(ws)) {
            sendError(ws, 'rate_limited', 'slow down');
            return;
        }
        const channel = ws.channel;
        const result = await pool.query(
            `INSERT INTO chat_messages (user_id, display_name, channel, text) VALUES ($1, $2, $3, $4)
             RETURNING id, channel, display_name, text, created_at`,
            [ws.user.id, ws.user.displayName, channel, text]
        );
        const payload = { type: 'message', message: toMessage(result.rows[0]) };
        wss.clients.forEach((client) => {
            if (client.user && client.channel === channel) send(client, payload);
        });
    };

    const handleMessage = async (ws, raw) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        let message;
        try {
            message = JSON.parse(raw.toString());
        } catch {
            message = null;
        }
        if (!ws.user) {
            await authenticate(ws, message ?? {});
            return;
        }
        if (message === null || typeof message !== 'object') {
            sendError(ws, 'invalid', 'messages must be JSON objects');
            return;
        }
        if (isExpired(ws.user)) {
            ws.close(CLOSE_UNAUTHORIZED, 'token expired');
            return;
        }
        try {
            if (message.type === 'join') await join(ws, message.channel);
            else if (message.type === 'message') await postMessage(ws, message.text);
            else sendError(ws, 'invalid', 'unknown message type');
        } catch (err) {
            console.error('Chat message error', err);
            sendError(ws, 'server_error', 'something went wrong');
        }
    };

    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.sentAt = [];
        ws.queue = Promise.resolve();
        ws.authTimer = setTimeout(() => ws.close(CLOSE_UNAUTHORIZED, 'auth timeout'), authTimeoutMs);

        ws.on('pong', () => { ws.isAlive = true; });
        ws.on('error', (err) => console.error('Chat socket error', err.message));
        ws.on('close', () => clearTimeout(ws.authTimer));
        // Handled one at a time so a client can send auth, join and message without waiting.
        ws.on('message', (raw) => {
            ws.queue = ws.queue.then(() => handleMessage(ws, raw));
        });
    });

    const heartbeat = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) {
                ws.terminate();
                return;
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, HEARTBEAT_MS);
    wss.on('close', () => clearInterval(heartbeat));

    return wss;
};

async function start() {
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

    try {
        await ensureSchema(pool);
        const verifyToken = createTokenVerifier(process.env.AUTH_URL || 'http://auth:2278');
        const wss = createChatServer({ pool, verifyToken });
        wss.on('listening', () => {
            console.log(`Chat server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}

module.exports = { createChatServer, AuthUnavailableError };

if (require.main === module) {
    start();
}
