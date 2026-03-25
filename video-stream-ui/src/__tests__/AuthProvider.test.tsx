import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import Cookies from 'js-cookie';
import { AuthProvider, AuthContext } from '@/provider/AuthProvider';

vi.mock('js-cookie', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
    },
}));

const mockCookies = vi.mocked(Cookies);

afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
});

function TestConsumer() {
    return (
        <AuthContext.Consumer>
            {(ctx) => (
                <div>
                    <span data-testid="token">{ctx.auth?.token ?? 'null'}</span>
                    <button data-testid="set-token" onClick={() => ctx.setToken('tok123')}>set token</button>
                    <button data-testid="do-logout" onClick={() => ctx.logout()}>do logout</button>
                    <button data-testid="check-token" onClick={async () => {
                        const result = await ctx.checkToken();
                        (document.getElementById('check-result') as HTMLElement).textContent = JSON.stringify(result);
                    }}>check token</button>
                    <span id="check-result"></span>
                </div>
            )}
        </AuthContext.Consumer>
    );
}

function renderProvider() {
    return render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );
}

describe('AuthProvider', () => {
    describe('setToken', () => {
        it('updates auth state with the new token', async () => {
            renderProvider();
            await act(async () => {
                screen.getByTestId('set-token').click();
            });
            expect(screen.getByTestId('token').textContent).toBe('tok123');
        });

        it('stores the token in a cookie with secure and sameSite flags', async () => {
            renderProvider();
            await act(async () => {
                screen.getByTestId('set-token').click();
            });
            expect(mockCookies.set).toHaveBeenCalledWith(
                'ctAuth',
                'tok123',
                { secure: true, sameSite: 'strict' }
            );
        });
    });

    describe('checkToken', () => {
        it('returns the token when a cookie exists', async () => {
            mockCookies.get.mockReturnValue('stored-token');
            renderProvider();
            await act(async () => {
                screen.getByTestId('check-token').click();
            });
            await waitFor(() => {
                const result = JSON.parse(screen.getByText(/^\{/).textContent!);
                expect(result.token).toBe('stored-token');
            });
        });

        it('returns an error object when no cookie exists', async () => {
            mockCookies.get.mockReturnValue(undefined);
            renderProvider();
            await act(async () => {
                screen.getByTestId('check-token').click();
            });
            await waitFor(() => {
                const result = JSON.parse(screen.getByText(/^\{/).textContent!);
                expect(result.err).toBe(403);
            });
        });
    });

    describe('logout', () => {
        it('removes the auth cookie', async () => {
            vi.stubGlobal('location', { href: '' });
            renderProvider();
            await act(async () => {
                screen.getByTestId('do-logout').click();
            });
            expect(mockCookies.remove).toHaveBeenCalledWith('ctAuth');
        });

        it('redirects to /login', async () => {
            const mockLocation = { href: '' };
            vi.stubGlobal('location', mockLocation);
            renderProvider();
            await act(async () => {
                screen.getByTestId('do-logout').click();
            });
            expect(mockLocation.href).toBe('/login');
        });
    });
});
