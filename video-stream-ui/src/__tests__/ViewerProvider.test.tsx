import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { ViewerProvider, ViewerContext } from '@/provider/ViewerProvider';
import type { Viewer } from '@/provider/ViewerProvider';

afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    cleanup();
});

const MOCK_VIEWERS: Viewer[] = [
    { name: 'User-1111', ping: new Date(), channel: 'ch-a', current: true },
    { name: 'User-2222', ping: new Date(), channel: 'ch-b', current: false },
];

function TestConsumer() {
    return (
        <ViewerContext.Consumer>
            {(ctx) => (
                <div>
                    <span data-testid="count">{ctx.viewers.length}</span>
                    <span data-testid="first-name">{ctx.viewers[0]?.name ?? ''}</span>
                    <span data-testid="first-current">{String(ctx.viewers[0]?.current ?? '')}</span>
                    <button data-testid="do-ping" onClick={async () => {
                        const result = await ctx.ping();
                        (document.getElementById('ping-result') as HTMLElement).textContent = JSON.stringify(result);
                    }}>ping</button>
                    <button data-testid="do-watch" onClick={() => ctx.watch('ch-b')}>watch</button>
                    <button data-testid="do-join" onClick={async () => {
                        const ok = await ctx.join('ch-a');
                        (document.getElementById('join-result') as HTMLElement).textContent = String(ok);
                    }}>join</button>
                    <span id="ping-result"></span>
                    <span id="join-result"></span>
                </div>
            )}
        </ViewerContext.Consumer>
    );
}

function renderProvider() {
    return render(
        <ViewerProvider>
            <TestConsumer />
        </ViewerProvider>
    );
}

// ─── Fix 6: ping() returns Viewer[] and updates state ────────────────────────

describe('ViewerProvider - ping', () => {
    it('updates viewer state with the response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue(MOCK_VIEWERS),
        }));
        renderProvider();
        await act(async () => {
            screen.getByTestId('do-ping').click();
        });
        await waitFor(() => {
            expect(screen.getByTestId('count').textContent).toBe('2');
        });
    });

    it('returns Viewer[] from the promise (Fix 6)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue(MOCK_VIEWERS),
        }));
        renderProvider();
        await act(async () => {
            screen.getByTestId('do-ping').click();
        });
        await waitFor(() => {
            const result = JSON.parse(
                (document.getElementById('ping-result') as HTMLElement).textContent || '[]'
            );
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('User-1111');
        });
    });

    it('marks the current viewer via the current flag from the server', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue(MOCK_VIEWERS),
        }));
        renderProvider();
        await act(async () => {
            screen.getByTestId('do-ping').click();
        });
        await waitFor(() => {
            expect(screen.getByTestId('first-current').textContent).toBe('true');
        });
    });

    it('calls /ping endpoint', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue([]),
        });
        vi.stubGlobal('fetch', mockFetch);
        renderProvider();
        await act(async () => {
            screen.getByTestId('do-ping').click();
        });
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/ping'));
        });
    });
});

// ─── watch() posts to /watch and updates viewers ─────────────────────────────

describe('ViewerProvider - watch', () => {
    it('posts to /watch with the channel key', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue(MOCK_VIEWERS),
        });
        vi.stubGlobal('fetch', mockFetch);
        renderProvider();
        await act(async () => {
            screen.getByTestId('do-watch').click();
        });
        await waitFor(() => {
            const call = mockFetch.mock.calls[0];
            expect(call[0]).toContain('/watch');
            expect(JSON.parse(call[1].body).channel).toBe('ch-b');
        });
    });

    it('updates viewer state after watch', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue(MOCK_VIEWERS),
        }));
        renderProvider();
        await act(async () => {
            screen.getByTestId('do-watch').click();
        });
        await waitFor(() => {
            expect(screen.getByTestId('count').textContent).toBe('2');
        });
    });
});

// ─── join() posts to /join ────────────────────────────────────────────────────

describe('ViewerProvider - join', () => {
    it('posts to /join with the channel key', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue({ success: true }),
        });
        vi.stubGlobal('fetch', mockFetch);
        renderProvider();
        await act(async () => {
            screen.getByTestId('do-join').click();
        });
        await waitFor(() => {
            const call = mockFetch.mock.calls[0];
            expect(call[0]).toContain('/join');
            expect(JSON.parse(call[1].body).channel).toBe('ch-a');
        });
    });

    it('returns true on success', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue({ success: true }),
        }));
        renderProvider();
        await act(async () => {
            screen.getByTestId('do-join').click();
        });
        await waitFor(() => {
            expect((document.getElementById('join-result') as HTMLElement).textContent).toBe('true');
        });
    });
});
