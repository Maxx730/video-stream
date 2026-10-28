import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import { Highscores, padScores } from '@/components/Highscores';
import { renderWithChakra } from '@/test/renderWithChakra';

const stubFetch = (impl: () => Promise<unknown>) => {
    vi.stubGlobal('fetch', vi.fn(impl));
};

describe('Highscores', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders the "Naval Blitz Highscores" heading', () => {
        stubFetch(() => new Promise(() => {}));
        renderWithChakra(<Highscores />);
        expect(screen.getByText('Naval Blitz Highscores')).toBeInTheDocument();
    });

    it('shows loaded scores and dashes for the empty rows', async () => {
        stubFetch(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ scores: [{ name: 'Max', score: 385, created_at: '2026-10-24T05:37:41.263Z' }] })
        }));
        renderWithChakra(<Highscores />);
        expect(await screen.findByText('Max')).toBeInTheDocument();
        const rows = screen.getAllByTestId('highscore-row');
        expect(rows).toHaveLength(10);
        expect(within(rows[0]).getByText('385')).toBeInTheDocument();
        rows.slice(1).forEach(row => {
            expect(within(row).getAllByText('-')).toHaveLength(2);
        });
    });

    it('shows 10 rows of dashes when the request fails', async () => {
        stubFetch(() => Promise.reject(new Error('offline')));
        renderWithChakra(<Highscores />);
        const rows = screen.getAllByTestId('highscore-row');
        expect(rows).toHaveLength(10);
        rows.forEach(row => {
            expect(within(row).getAllByText('-')).toHaveLength(2);
        });
    });
});

describe('padScores', () => {
    it('pads to 10 entries with null', () => {
        const padded = padScores([{ name: 'Max', score: 385, created_at: '' }]);
        expect(padded).toHaveLength(10);
        expect(padded[0]?.name).toBe('Max');
        expect(padded.slice(1).every(entry => entry === null)).toBe(true);
    });
});
