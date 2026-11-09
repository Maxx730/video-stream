import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsDialog } from '@/components/SettingsDialog';
import { SettingsProvider } from '@/provider/SettingsProvider';
import { renderWithChakra } from '@/test/renderWithChakra';

describe('SettingsDialog holiday lights switch', () => {
    const openDialog = async () => {
        renderWithChakra(<SettingsProvider><SettingsDialog /></SettingsProvider>);
        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        return screen.findByRole('checkbox', { name: 'Holiday lights' });
    };

    beforeEach(() => {
        localStorage.clear();
    });

    it('is off by default', async () => {
        expect(await openDialog()).not.toBeChecked();
    });

    it('saves the setting when turned on', async () => {
        const toggle = await openDialog();
        await userEvent.click(toggle);
        expect(toggle).toBeChecked();
        expect(JSON.parse(localStorage.getItem('ctSettings') as string).holidayLights).toBe(true);
    });

    it('shows a saved setting as on', async () => {
        localStorage.setItem('ctSettings', JSON.stringify({ holidayLights: true }));
        expect(await openDialog()).toBeChecked();
    });
});

describe('SettingsDialog', () => {
    it('is closed at first', () => {
        renderWithChakra(<SettingsDialog />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens from the Settings button and shows the title', async () => {
        renderWithChakra(<SettingsDialog />);
        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('closes from the close button', async () => {
        renderWithChakra(<SettingsDialog />);
        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        await screen.findByRole('dialog');
        await userEvent.click(screen.getByRole('button', { name: 'Close settings' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
});
