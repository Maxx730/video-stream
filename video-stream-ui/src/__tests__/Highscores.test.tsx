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
        expect(rows).toHaveLength(3);
        expect(within(rows[0]).getByText('385')).toBeInTheDocument();
        rows.slice(1).forEach(row => {
            expect(within(row).getAllByText('-')).toHaveLength(2);
        });
    });

    it('only requests the top three scores', () => {
        stubFetch(() => new Promise(() => {}));
        renderWithChakra(<Highscores />);
        expect(fetch).toHaveBeenCalledWith('/highscores/?limit=3');
    });

    it('sparkles only on places with a score', async () => {
        stubFetch(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ scores: [{ name: 'Max', score: 385, created_at: '2026-10-24T05:37:41.263Z' }] })
        }));
        renderWithChakra(<Highscores />);
        await screen.findByText('Max');
        const rows = screen.getAllByTestId('highscore-row');
        expect(rows[0].querySelectorAll('.sparkle').length).toBeGreaterThan(0);
        rows.slice(1).forEach(row => {
            expect(row.querySelectorAll('.sparkle')).toHaveLength(0);
        });
    });

    it('shows 3 places of dashes when the request fails', async () => {
        stubFetch(() => Promise.reject(new Error('offline')));
        renderWithChakra(<Highscores />);
        const rows = screen.getAllByTestId('highscore-row');
        expect(rows).toHaveLength(3);
        rows.forEach(row => {
            expect(within(row).getAllByText('-')).toHaveLength(2);
        });
    });
});

describe('padScores', () => {
    it('pads to 3 entries with null', () => {
        const padded = padScores([{ name: 'Max', score: 385, created_at: '' }]);
        expect(padded).toHaveLength(3);
        expect(padded[0]?.name).toBe('Max');
        expect(padded.slice(1).every(entry => entry === null)).toBe(true);
    });
});
