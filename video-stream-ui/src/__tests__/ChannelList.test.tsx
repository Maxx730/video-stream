import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChannelList } from '@/components/ChannelList';
import { renderWithChakra } from '@/test/renderWithChakra';
import type { Channel } from '@/provider/ServerProvider';

const makeChannel = (overrides: Partial<Channel> = {}): Channel => ({
    key: 'test_stream',
    title: 'Test Stream',
    desc: 'A test channel',
    path: '/stream/test_stream.m3u8',
    started: new Date(),
    ...overrides,
});

describe('ChannelList', () => {
    it('renders the Channels column header', () => {
        renderWithChakra(
            <ChannelList channels={[]} onChannelSelected={() => {}} getChannelCount={() => 0} />
        );
        expect(screen.getByText('Channels')).toBeInTheDocument();
    });

    it('renders a row for each channel', () => {
        const channels = [
            makeChannel({ key: 'stream_one' }),
            makeChannel({ key: 'stream_two' }),
        ];
        renderWithChakra(
            <ChannelList channels={channels} onChannelSelected={() => {}} getChannelCount={() => 0} />
        );
        expect(screen.getByText('stream_one')).toBeInTheDocument();
        expect(screen.getByText('stream_two')).toBeInTheDocument();
    });

    it('shows the channel description', () => {
        const channels = [makeChannel({ desc: 'My cool stream' })];
        renderWithChakra(
            <ChannelList channels={channels} onChannelSelected={() => {}} getChannelCount={() => 0} />
        );
        expect(screen.getByText('My cool stream')).toBeInTheDocument();
    });

    it('shows "No Description" when desc is empty', () => {
        const channels = [makeChannel({ desc: '' })];
        renderWithChakra(
            <ChannelList channels={channels} onChannelSelected={() => {}} getChannelCount={() => 0} />
        );
        expect(screen.getByText('No Description')).toBeInTheDocument();
    });

    it('calls onChannelSelected with the channel key when the eye button is clicked', async () => {
        const onSelect = vi.fn();
        const channels = [makeChannel({ key: 'my_channel' })];
        renderWithChakra(
            <ChannelList channels={channels} onChannelSelected={onSelect} getChannelCount={() => 0} />
        );
        const buttons = screen.getAllByRole('button');
        await userEvent.click(buttons[0]);
        expect(onSelect).toHaveBeenCalledWith('my_channel');
    });

    it('displays the viewer count returned by getChannelCount', () => {
        const channels = [makeChannel({ path: '/stream/test.m3u8' })];
        renderWithChakra(
            <ChannelList channels={channels} onChannelSelected={() => {}} getChannelCount={() => 42} />
        );
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders nothing in the body when channels array is empty', () => {
        const { container } = renderWithChakra(
            <ChannelList channels={[]} onChannelSelected={() => {}} getChannelCount={() => 0} />
        );
        expect(container.querySelectorAll('tbody tr')).toHaveLength(0);
    });
});
