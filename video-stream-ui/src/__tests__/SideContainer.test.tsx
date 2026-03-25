import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SideContainer } from '@/components/SideContainer';
import { renderWithChakra } from '@/test/renderWithChakra';

describe('SideContainer', () => {
    it('shows the Sign Out button when a logout function is provided', () => {
        renderWithChakra(
            <SideContainer contents={<div />} logout={() => {}} updating={false} totalCount={0} />
        );
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('shows the Sign In button when logout is undefined', () => {
        renderWithChakra(
            <SideContainer contents={<div />} logout={undefined} updating={false} totalCount={0} />
        );
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('calls the logout function when Sign Out is clicked', async () => {
        const logout = vi.fn();
        renderWithChakra(
            <SideContainer contents={<div />} logout={logout} updating={false} totalCount={0} />
        );
        await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
        expect(logout).toHaveBeenCalledTimes(1);
    });

    it('displays the total viewer count', () => {
        renderWithChakra(
            <SideContainer contents={<div />} logout={undefined} updating={false} totalCount={7} />
        );
        expect(screen.getByText('7 Viewer(s)')).toBeInTheDocument();
    });

    it('renders the contents slot', () => {
        renderWithChakra(
            <SideContainer contents={<div data-testid="slot-content">hello</div>} logout={undefined} updating={false} totalCount={0} />
        );
        expect(screen.getByTestId('slot-content')).toBeInTheDocument();
    });

    it('shows a loading spinner when updating is true', () => {
        const { container } = renderWithChakra(
            <SideContainer contents={<div />} logout={undefined} updating={true} totalCount={0} />
        );
        // Chakra Spinner renders an element with role="status" or a spinner class
        expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
    });
});
