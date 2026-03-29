import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app, viewers, pruneViewers, listViewers, getViewerCount } from '../index';

// Reset the in-memory viewers array before each test
beforeEach(() => {
    viewers.length = 0;
});

// Helper to add a viewer directly
const addViewer = (ip: string, channel: string, pingOffsetMs = 0) => {
    viewers.push({
        ip,
        name: `User-${ip}`,
        ping: new Date(Date.now() - pingOffsetMs),
        channel,
    });
};

// ─── Fix 1: getViewerCount uses filter, not map ───────────────────────────────

describe('getViewerCount', () => {
    it('returns 0 when no viewers on channel', () => {
        addViewer('1.1.1.1', 'other-channel');
        expect(getViewerCount('my-channel')).toBe(0);
    });

    it('counts only viewers on the given channel', () => {
        addViewer('1.1.1.1', 'channel-a');
        addViewer('2.2.2.2', 'channel-a');
        addViewer('3.3.3.3', 'channel-b');
        expect(getViewerCount('channel-a')).toBe(2);
        expect(getViewerCount('channel-b')).toBe(1);
    });

    it('does not return wrong length (was returning full array length via map)', () => {
        addViewer('1.1.1.1', 'channel-a');
        addViewer('2.2.2.2', 'channel-b');
        // If broken (using .map), this would return 2 instead of 1
        expect(getViewerCount('channel-a')).toBe(1);
    });
});

// ─── Fix 2: pruneViewers safely removes stale entries ────────────────────────

describe('pruneViewers', () => {
    it('removes viewers whose last ping is older than the timeout (300s)', () => {
        const staleOffset = 301 * 1000; // 301 seconds ago
        addViewer('1.1.1.1', 'ch', staleOffset);
        addViewer('2.2.2.2', 'ch', 0);
        pruneViewers();
        expect(viewers.length).toBe(1);
        expect(viewers[0].ip).toBe('2.2.2.2');
    });

    it('keeps viewers whose last ping is within the timeout', () => {
        addViewer('1.1.1.1', 'ch', 10000); // 10 seconds ago — still active
        addViewer('2.2.2.2', 'ch', 10000);
        pruneViewers();
        expect(viewers.length).toBe(2);
    });

    it('handles pruning an empty array without error', () => {
        expect(() => pruneViewers()).not.toThrow();
        expect(viewers.length).toBe(0);
    });

    it('does not skip entries (was mutating array during iteration)', () => {
        const staleOffset = 400 * 1000;
        // Add 4 stale viewers — old bug would skip every other one
        addViewer('1.1.1.1', 'ch', staleOffset);
        addViewer('2.2.2.2', 'ch', staleOffset);
        addViewer('3.3.3.3', 'ch', staleOffset);
        addViewer('4.4.4.4', 'ch', staleOffset);
        pruneViewers();
        expect(viewers.length).toBe(0);
    });
});

// ─── Fix 5: listViewers marks correct viewer as current ───────────────────────

describe('listViewers', () => {
    it('marks the viewer matching requestIp as current=true', () => {
        addViewer('10.0.0.1', 'ch');
        addViewer('10.0.0.2', 'ch');
        const result = JSON.parse(listViewers('10.0.0.1'));
        const current = result.find((v: { name: string; current: boolean }) => v.current === true);
        expect(current).toBeDefined();
        expect(current.name).toBe('User-10.0.0.1');
    });

    it('marks all others as current=false', () => {
        addViewer('10.0.0.1', 'ch');
        addViewer('10.0.0.2', 'ch');
        const result = JSON.parse(listViewers('10.0.0.1'));
        const others = result.filter((v: { current: boolean }) => v.current === false);
        expect(others.length).toBe(1);
        expect(others[0].name).toBe('User-10.0.0.2');
    });

    it('marks all as current=false when requestIp is null', () => {
        addViewer('10.0.0.1', 'ch');
        const result = JSON.parse(listViewers(null));
        expect(result[0].current).toBe(false);
    });

    it('does not expose ip field to clients', () => {
        addViewer('10.0.0.1', 'ch');
        const result = JSON.parse(listViewers('10.0.0.1'));
        expect(result[0].ip).toBeUndefined();
    });
});

// ─── Fix 3: /join uses X-Real-IP header ──────────────────────────────────────

describe('POST /join', () => {
    it('registers a viewer using X-Real-IP header', async () => {
        const res = await request(app)
            .post('/join')
            .set('X-Real-IP', '5.5.5.5')
            .send({ channel: 'test-ch' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(viewers.some(v => v.ip === '5.5.5.5')).toBe(true);
    });

    it('does not register the same viewer twice', async () => {
        await request(app).post('/join').set('X-Real-IP', '5.5.5.5').send({ channel: 'ch' });
        await request(app).post('/join').set('X-Real-IP', '5.5.5.5').send({ channel: 'ch' });
        expect(viewers.filter(v => v.ip === '5.5.5.5').length).toBe(1);
    });
});

// ─── Fix 3: /ping uses X-Real-IP and updates ping timestamp ─────────────────

describe('GET /ping', () => {
    it('updates the ping timestamp for the requesting viewer', async () => {
        addViewer('7.7.7.7', 'ch', 60000); // added 1 minute ago
        const before = viewers[0].ping.getTime();
        await request(app).get('/ping').set('X-Real-IP', '7.7.7.7');
        expect(viewers[0].ping.getTime()).toBeGreaterThan(before);
    });

    it('returns viewer list with current=true for requesting IP', async () => {
        addViewer('7.7.7.7', 'ch');
        addViewer('8.8.8.8', 'ch');
        const res = await request(app).get('/ping').set('X-Real-IP', '7.7.7.7');
        const body = JSON.parse(res.text);
        const me = body.find((v: { name: string; current: boolean }) => v.name === 'User-7.7.7.7');
        expect(me.current).toBe(true);
    });

    it('does not crash when viewer is not found', async () => {
        const res = await request(app).get('/ping').set('X-Real-IP', '9.9.9.9');
        expect(res.status).toBe(200);
    });
});

// ─── /watch returns updated viewer list ──────────────────────────────────────

describe('POST /watch', () => {
    it('updates the viewer channel and returns viewer list', async () => {
        addViewer('6.6.6.6', 'old-channel');
        const res = await request(app)
            .post('/watch')
            .set('X-Real-IP', '6.6.6.6')
            .send({ channel: 'new-channel' });
        expect(res.status).toBe(200);
        expect(viewers[0].channel).toBe('new-channel');
    });

    it('returns 404 when viewer is not registered', async () => {
        const res = await request(app)
            .post('/watch')
            .set('X-Real-IP', '99.99.99.99')
            .send({ channel: 'ch' });
        expect(res.status).toBe(404);
    });
});

// ─── /viewers returns list without ip field ───────────────────────────────────

describe('GET /viewers', () => {
    it('returns all viewers without exposing IPs', async () => {
        addViewer('1.2.3.4', 'ch');
        const res = await request(app).get('/viewers').set('X-Real-IP', '1.2.3.4');
        const body = JSON.parse(res.text);
        expect(body.length).toBe(1);
        expect(body[0].ip).toBeUndefined();
        expect(body[0].name).toBe('User-1.2.3.4');
    });
});
