import { describe, it, expect, vi } from 'vitest';
import { act } from '@testing-library/react';
import { MediaPlayer } from '@/components/MediaPlayer';
import { renderWithChakra } from '@/test/renderWithChakra';

const player = vi.hoisted(() => ({ props: {} as Record<string, any> }));

vi.mock('react-player', () => ({
    default: (props: Record<string, any>) => {
        player.props = props;
        return null;
    },
}));

describe('MediaPlayer', () => {
    it('starts unmuted at full volume', () => {
        renderWithChakra(<MediaPlayer url="https://example.com/a.m3u8" />);
        expect(player.props.muted).toBe(false);
        expect(player.props.volume).toBe(1);
    });

    it('fills the frame so stream changes cannot resize it', () => {
        renderWithChakra(<MediaPlayer url="https://example.com/a.m3u8" />);
        expect(player.props.width).toBe('100%');
        expect(player.props.height).toBe('100%');
    });

    it('draws holiday lights outside the frame that clips the video', () => {
        const { container } = renderWithChakra(<MediaPlayer url="https://example.com/a.m3u8" />, { settings: { holidayLights: true } });
        expect(container.querySelector('svg.holiday-lights')).toBeInTheDocument();
        expect(container.querySelector('.player-frame svg.holiday-lights')).toBeNull();
    });

    it('has no holiday lights or their padding by default', () => {
        const { container } = renderWithChakra(<MediaPlayer url="https://example.com/a.m3u8" />);
        expect(container.querySelector('svg.holiday-lights')).toBeNull();
        expect(container.querySelector('.holiday-frame')).toBeNull();
    });

    it('keeps the mute and volume the viewer chose when it re-renders', () => {
        renderWithChakra(<MediaPlayer url="https://example.com/a.m3u8" />);
        act(() => {
            player.props.onVolumeChange({ currentTarget: { muted: true, volume: 0.4 } });
        });
        expect(player.props.muted).toBe(true);
        expect(player.props.volume).toBe(0.4);
    });
});
