import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarqueeMessage } from '@/components/MarqueeMessage';

describe('MarqueeMessage', () => {
    it('renders the message text', () => {
        render(<MarqueeMessage message="Hello, world!" />);
        const instances = screen.getAllByText('Hello, world!');
        expect(instances.length).toBeGreaterThan(0);
    });

    it('renders the message twice for the seamless scroll animation', () => {
        render(<MarqueeMessage message="Scrolling text" />);
        const instances = screen.getAllByText('Scrolling text');
        expect(instances).toHaveLength(2);
    });

    it('renders the default message when none is provided', () => {
        // @ts-expect-error testing default fallback
        render(<MarqueeMessage />);
        const instances = screen.getAllByText('Default Message');
        expect(instances).toHaveLength(2);
    });

    it('renders the marquee container element', () => {
        const { container } = render(<MarqueeMessage message="test" />);
        expect(container.querySelector('.marqueeContainer')).toBeInTheDocument();
    });

    it('renders two marqueeContent divs', () => {
        const { container } = render(<MarqueeMessage message="test" />);
        expect(container.querySelectorAll('.marqueeContent')).toHaveLength(2);
    });
});
