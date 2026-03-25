import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoChannels } from '@/components/NoChannels';
import { renderWithChakra } from '@/test/renderWithChakra';

describe('NoChannels', () => {
    it('renders the "No Streams" heading', () => {
        renderWithChakra(<NoChannels onReloadPressed={() => {}} />);
        expect(screen.getByText('No Streams')).toBeInTheDocument();
    });

    it('renders the descriptive message', () => {
        renderWithChakra(<NoChannels onReloadPressed={() => {}} />);
        expect(screen.getByText(/No one else is streaming right now/i)).toBeInTheDocument();
    });

    it('renders the Refresh button', () => {
        renderWithChakra(<NoChannels onReloadPressed={() => {}} />);
        expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    it('calls onReloadPressed when Refresh is clicked', async () => {
        const onReload = vi.fn();
        renderWithChakra(<NoChannels onReloadPressed={onReload} />);
        await userEvent.click(screen.getByText('Refresh'));
        expect(onReload).toHaveBeenCalledTimes(1);
    });

    it('does not throw when no onReloadPressed prop is given', () => {
        expect(() => renderWithChakra(<NoChannels onReloadPressed={() => {}} />)).not.toThrow();
    });
});
