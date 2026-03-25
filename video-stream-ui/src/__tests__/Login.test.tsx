import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '@/layouts/Login';
import { AuthContext } from '@/provider/AuthProvider';
import { renderWithChakra } from '@/test/renderWithChakra';

const mockCheckToken = vi.fn();
const mockLogin = vi.fn();
const mockSetToken = vi.fn();

const authContextValue = {
    auth: { token: null },
    user: { id: -1, expires: -1 },
    checkToken: mockCheckToken,
    login: mockLogin,
    setToken: mockSetToken,
    logout: vi.fn(),
    setupAuth: vi.fn(),
};

function renderLogin() {
    return renderWithChakra(
        <AuthContext.Provider value={authContextValue}>
            <Login setScreen={() => {}} />
        </AuthContext.Provider>
    );
}

beforeEach(() => {
    // No token by default — show the login form
    mockCheckToken.mockResolvedValue({ err: 403, message: 'user not authorized' });
});

afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
});

describe('Login', () => {
    it('renders the email and password fields', async () => {
        const { container } = renderLogin();
        await waitFor(() => expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument());
        expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    });

    it('renders the Sign In button', async () => {
        renderLogin();
        await waitFor(() => expect(screen.getByText('Sign In')).toBeInTheDocument());
    });

    it('renders the Continue as Guest link', async () => {
        renderLogin();
        await waitFor(() => expect(screen.getByText('Continue as Guest')).toBeInTheDocument());
    });

    it('redirects to / when Continue as Guest is clicked', async () => {
        const mockLocation = { href: '' };
        vi.stubGlobal('location', mockLocation);
        renderLogin();
        await waitFor(() => screen.getByText('Continue as Guest'));
        await userEvent.click(screen.getByText('Continue as Guest'));
        expect(mockLocation.href).toBe('/');
    });

    it('redirects to / automatically when a token already exists', async () => {
        const mockLocation = { href: '' };
        vi.stubGlobal('location', mockLocation);
        mockCheckToken.mockResolvedValue({ token: 'existing-token' });
        renderLogin();
        await waitFor(() => expect(mockLocation.href).toBe('/'));
    });

    it('calls login with the form field values on Sign In', async () => {
        mockLogin.mockResolvedValue({ status: 200, token: 'abc123' });
        mockSetToken.mockImplementation(() => {});
        const mockLocation = { href: '' };
        vi.stubGlobal('location', mockLocation);

        renderLogin();
        await waitFor(() => screen.getByText('Sign In'));
        await userEvent.click(screen.getByText('Sign In'));

        // The form pre-fills with the default state values
        await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
        expect(typeof mockLogin.mock.calls[0][0]).toBe('string');
        expect(typeof mockLogin.mock.calls[0][1]).toBe('string');
    });

    it('shows an error message on failed login', async () => {
        mockLogin.mockResolvedValue({ status: 401 });
        renderLogin();
        await waitFor(() => screen.getByText('Sign In'));
        await userEvent.click(screen.getByText('Sign In'));
        await waitFor(() => expect(screen.getByText('Authentication Error')).toBeInTheDocument());
    });
});
