import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { createChatServer, AuthUnavailableError } from '../index';

const USERS = {
    alice: { id: 1, displayName: 'alice' },
    bob: { id: 2, displayName: 'bob' },
    legacy: { id: 3 },
    expired: { id: 4, displayName: 'expired', exp: 1 },
    expiring: { id: 5, displayName: 'expiring', exp: Date.now() / 1000 + 0.2 },
};

const createFakePool = () => {
    const rows = [];
    return {
        rows,
        query: async (sql, params) => {
            if (sql.includes('INSERT')) {
                const [user_id, display_name, channel, text] = params;
                const row = { id: String(rows.length + 1), user_id, display_name, channel, text, created_at: new Date().toISOString() };
                rows.push(row);
                return { rows: [row] };
            }
            return { rows: rows.filter((r) => r.channel === params[0]).reverse().slice(0, 50) };
        },
    };
};

const verifyToken = async (token) => {
    if (token === 'unavailable') throw new AuthUnavailableError('down');
    return USERS[token] ?? null;
};

describe('chat server', () => {
    let wss;
    let pool;
    let url;
    const clients = [];

    const startServer = async (options = {}) => {
        pool = createFakePool();
        wss = createChatServer({ pool, verifyToken, port: 0, ...options });
        await new Promise((resolve) => wss.on('listening', resolve));
        url = `ws://127.0.0.1:${wss.address().port}/chat/ws`;
    };

    const connect = (options = {}) => new Promise((resolve, reject) => {
        const ws = new WebSocket(url, options);
        const client = { ws, inbox: [], waiters: [] };
        client.closed = new Promise((done) => ws.on('close', (code) => done(code)));
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            const index = client.waiters.findIndex((w) => w.type === message.type);
            if (index >= 0) client.waiters.splice(index, 1)[0].resolve(message);
            else client.inbox.push(message);
        });
        ws.on('open', () => resolve(client));
        ws.on('error', reject);
        clients.push(client);
    });

    const next = (client, type) => {
        const index = client.inbox.findIndex((m) => m.type === type);
        if (index >= 0) return Promise.resolve(client.inbox.splice(index, 1)[0]);
        return new Promise((resolve) => client.waiters.push({ type, resolve }));
    };

    const emit = (client, payload) => client.ws.send(JSON.stringify(payload));

    const joined = async (token, channel) => {
        const client = await connect();
        emit(client, { type: 'auth', token });
        await next(client, 'ready');
        emit(client, { type: 'join', channel });
        await next(client, 'history');
        return client;
    };

    beforeEach(() => startServer());

    afterEach(async () => {
        clients.splice(0).forEach((c) => c.ws.terminate());
        await new Promise((resolve) => wss.close(resolve));
    });

    it('closes the socket for an invalid token', async () => {
        const client = await connect();
        emit(client, { type: 'auth', token: 'nobody' });
        expect(await client.closed).toBe(4401);
    });

    it('closes the socket when the first message is not auth', async () => {
        const client = await connect();
        emit(client, { type: 'join', channel: 'stuff' });
        expect(await client.closed).toBe(4401);
    });

    it('closes the socket for an already expired token', async () => {
        const client = await connect();
        emit(client, { type: 'auth', token: 'expired' });
        expect(await client.closed).toBe(4401);
    });

    it('closes with try-again-later when auth is unavailable', async () => {
        const client = await connect();
        emit(client, { type: 'auth', token: 'unavailable' });
        expect(await client.closed).toBe(1013);
    });

    it('closes the socket if no auth arrives in time', async () => {
        await new Promise((resolve) => wss.close(resolve));
        await startServer({ authTimeoutMs: 20 });
        const client = await connect();
        expect(await client.closed).toBe(4401);
    });

    it('rejects connections from unknown origins', async () => {
        await expect(connect({ origin: 'https://evil.example' })).rejects.toThrow();
    });

    it('accepts the Vite dev origin', async () => {
        const client = await connect({ origin: 'http://localhost:5173' });
        expect(client.ws.readyState).toBe(WebSocket.OPEN);
    });

    it('falls back to User-<id> for tokens without a display name', async () => {
        const client = await connect();
        emit(client, { type: 'auth', token: 'legacy' });
        expect((await next(client, 'ready')).displayName).toBe('User-3');
    });

    it('handles auth and join sent without waiting', async () => {
        const client = await connect();
        emit(client, { type: 'auth', token: 'alice' });
        emit(client, { type: 'join', channel: 'stuff' });
        expect((await next(client, 'history')).channel).toBe('stuff');
    });

    it('sends history oldest first on join', async () => {
        const alice = await joined('alice', 'stuff');
        emit(alice, { type: 'message', text: 'first' });
        await next(alice, 'message');
        emit(alice, { type: 'message', text: 'second' });
        await next(alice, 'message');

        const bob = await connect();
        emit(bob, { type: 'auth', token: 'bob' });
        emit(bob, { type: 'join', channel: 'stuff' });
        const history = await next(bob, 'history');
        expect(history.messages.map((m) => m.text)).toEqual(['first', 'second']);
    });

    it('delivers messages only within a channel', async () => {
        const alice = await joined('alice', 'stuff');
        const sameRoom = await joined('bob', 'stuff');
        const otherRoom = await joined('bob', 'other');

        emit(alice, { type: 'message', text: 'hello stuff' });
        expect((await next(sameRoom, 'message')).message.text).toBe('hello stuff');

        emit(otherRoom, { type: 'message', text: 'hello other' });
        expect((await next(otherRoom, 'message')).message.text).toBe('hello other');
    });

    it('moves a socket to the new channel when it joins again', async () => {
        const alice = await joined('alice', 'stuff');
        const mover = await joined('bob', 'stuff');
        emit(mover, { type: 'join', channel: 'other' });
        await next(mover, 'history');

        emit(alice, { type: 'message', text: 'left behind' });
        await next(alice, 'message');
        emit(mover, { type: 'message', text: 'moved' });
        expect((await next(mover, 'message')).message.text).toBe('moved');
    });

    it('ignores a display name supplied by the client', async () => {
        const alice = await joined('alice', 'stuff');
        emit(alice, { type: 'message', text: 'hi', displayName: 'bob', user_id: 2 });
        const { message } = await next(alice, 'message');
        expect(message.displayName).toBe('alice');
        expect(pool.rows[0].user_id).toBe(1);
    });

    it('rejects messages before joining a channel', async () => {
        const client = await connect();
        emit(client, { type: 'auth', token: 'alice' });
        await next(client, 'ready');
        emit(client, { type: 'message', text: 'hi' });
        expect((await next(client, 'error')).code).toBe('not_joined');
    });

    it.each([['blank', '   '], ['too long', 'x'.repeat(201)], ['not text', 42]])('rejects a %s message', async (_, text) => {
        const alice = await joined('alice', 'stuff');
        emit(alice, { type: 'message', text });
        expect((await next(alice, 'error')).code).toBe('invalid');
        expect(pool.rows).toHaveLength(0);
    });

    it('accepts a message at the maximum length and trims it', async () => {
        const alice = await joined('alice', 'stuff');
        emit(alice, { type: 'message', text: `  ${'x'.repeat(200)}  ` });
        expect((await next(alice, 'message')).message.text).toHaveLength(200);
    });

    it('rate limits a socket after 5 messages', async () => {
        const alice = await joined('alice', 'stuff');
        for (let i = 0; i < 6; i++) emit(alice, { type: 'message', text: `m${i}` });
        expect((await next(alice, 'error')).code).toBe('rate_limited');
        expect(pool.rows).toHaveLength(5);
    });

    it('reports invalid JSON without closing an authenticated socket', async () => {
        const alice = await joined('alice', 'stuff');
        alice.ws.send('not json');
        expect((await next(alice, 'error')).code).toBe('invalid');
        expect(alice.ws.readyState).toBe(WebSocket.OPEN);
    });

    it('closes the socket when the token expires', async () => {
        const client = await joined('expiring', 'stuff');
        await new Promise((resolve) => setTimeout(resolve, 300));
        emit(client, { type: 'message', text: 'too late' });
        expect(await client.closed).toBe(4401);
        expect(pool.rows).toHaveLength(0);
    });

    it('survives an oversized message from a client', async () => {
        const alice = await joined('alice', 'stuff');
        alice.ws.send('x'.repeat(5000));
        expect(await alice.closed).toBe(1009);
        const bob = await joined('bob', 'stuff');
        expect(bob.ws.readyState).toBe(WebSocket.OPEN);
    });
});
