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

    it('keeps the mute and volume the viewer chose when it re-renders', () => {
        renderWithChakra(<MediaPlayer url="https://example.com/a.m3u8" />);
        act(() => {
            player.props.onVolumeChange({ currentTarget: { muted: true, volume: 0.4 } });
        });
        expect(player.props.muted).toBe(true);
        expect(player.props.volume).toBe(0.4);
    });
});
