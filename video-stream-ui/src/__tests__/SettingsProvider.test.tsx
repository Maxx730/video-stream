import { useContext } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsContext, SettingsProvider } from '@/provider/SettingsProvider';

const KEY = 'ctSettings';

const Consumer = () => {
    const { settings, setBoolValue } = useContext(SettingsContext);
    return (
        <button onClick={() => setBoolValue('darkMode', true)}>
            {settings.darkMode ? 'dark' : 'light'}
        </button>
    );
};

const LightsConsumer = () => {
    const { getBoolValue, setBoolValue } = useContext(SettingsContext);
    return (
        <button onClick={() => setBoolValue('holidayLights', true)}>
            {getBoolValue('holidayLights') ? 'lights on' : 'lights off'}
        </button>
    );
};

const renderProvider = () => render(<SettingsProvider><Consumer /></SettingsProvider>);

describe('SettingsProvider', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('saves changes to localStorage', async () => {
        renderProvider();
        await userEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('button')).toHaveTextContent('dark');
        expect(JSON.parse(localStorage.getItem(KEY) as string)).toEqual({ darkMode: true, holidayLights: false });
    });

    it('defaults holiday lights to off, even with older saved settings', () => {
        localStorage.setItem(KEY, JSON.stringify({ darkMode: true }));
        render(<SettingsProvider><LightsConsumer /></SettingsProvider>);
        expect(screen.getByRole('button')).toHaveTextContent('lights off');
    });

    it('saves and reloads the holiday lights setting', async () => {
        const first = render(<SettingsProvider><LightsConsumer /></SettingsProvider>);
        await userEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('button')).toHaveTextContent('lights on');
        first.unmount();
        render(<SettingsProvider><LightsConsumer /></SettingsProvider>);
        expect(screen.getByRole('button')).toHaveTextContent('lights on');
    });

    it('loads saved settings on mount', () => {
        localStorage.setItem(KEY, JSON.stringify({ darkMode: true }));
        renderProvider();
        expect(screen.getByRole('button')).toHaveTextContent('dark');
    });

    it('falls back to defaults when saved settings are corrupt', () => {
        localStorage.setItem(KEY, 'not json');
        renderProvider();
        expect(screen.getByRole('button')).toHaveTextContent('light');
    });

    it('keeps working when storage is blocked', async () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
        renderProvider();
        await userEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('button')).toHaveTextContent('dark');
    });
});
