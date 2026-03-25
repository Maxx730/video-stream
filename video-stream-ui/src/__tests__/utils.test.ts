import { describe, it, expect, vi, afterEach } from 'vitest';
import { isDev, buildRequestURL } from '@/util/utils';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('isDev', () => {
    it('returns true on localhost', () => {
        // jsdom defaults to http://localhost/ so origin doesn't contain live.clam-tube
        expect(isDev()).toBe(true);
    });

    it('returns false when origin contains live.clam-tube', () => {
        vi.stubGlobal('location', { ...window.location, origin: 'https://live.clam-tube.com' });
        expect(isDev()).toBe(false);
    });
});

describe('buildRequestURL', () => {
    it('returns http with port when on localhost', () => {
        vi.stubGlobal('location', { ...window.location, host: 'localhost:3000', hostname: 'localhost' });
        expect(buildRequestURL('2278')).toBe('http://localhost:2278');
    });

    it('returns https without port when on a production domain', () => {
        vi.stubGlobal('location', { ...window.location, host: 'video.clam-tube.com', hostname: 'video.clam-tube.com' });
        expect(buildRequestURL('2278')).toBe('https://video.clam-tube.com');
    });

    it('uses the provided port number on localhost', () => {
        vi.stubGlobal('location', { ...window.location, host: 'localhost:3000', hostname: 'localhost' });
        expect(buildRequestURL('9999')).toBe('http://localhost:9999');
    });
});
