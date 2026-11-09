import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatBox } from '@/components/ChatBox';
import { renderWithChakra } from '@/test/renderWithChakra';

class FakeSocket {
    static instances: Array<FakeSocket> = [];
    onopen: (() => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;
    onclose: ((event: { code: number }) => void) | null = null;
    sent: Array<Record<string, unknown>> = [];
    closed = false;
    url: string;

    constructor(url: string) {
        this.url = url;
        FakeSocket.instances.push(this);
    }
    send(data: string) { this.sent.push(JSON.parse(data)); }
    close() { this.closed = true; }
    open() { act(() => this.onopen?.()); }
    receive(payload: unknown) { act(() => this.onmessage?.({ data: JSON.stringify(payload) })); }
    drop(code: number) { act(() => this.onclose?.({ code })); }
}

const latestSocket = () => FakeSocket.instances[FakeSocket.instances.length - 1];

const message = (id: number, text: string, channel = 'stuff') => ({
    id, channel, text, displayName: `user${id}`, created_at: '2026-11-09T20:00:00.000Z',
});

const connect = () => {
    const socket = latestSocket();
    socket.open();
    socket.receive({ type: 'ready', displayName: 'me' });
    return socket;
};

const renderConnected = () => {
    renderWithChakra(<ChatBox token="tok" channel="stuff" />);
    return connect();
};

const sendButton = () => screen.getByRole('button', { name: 'Send message' });
const input = () => screen.getByPlaceholderText('Send a message...');

describe('ChatBox', () => {
    beforeEach(() => {
        FakeSocket.instances = [];
        vi.stubGlobal('WebSocket', FakeSocket);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('shows a connecting state with sending disabled', () => {
        renderWithChakra(<ChatBox token="tok" channel="stuff" />);
        expect(screen.getByText('Chat')).toBeInTheDocument();
        expect(screen.getByText('Connecting to chat...')).toBeInTheDocument();
        expect(input()).toBeDisabled();
        expect(sendButton()).toBeDisabled();
    });

    it('authenticates on open, then joins the channel once ready', () => {
        renderWithChakra(<ChatBox token="tok" channel="stuff" />);
        const socket = latestSocket();
        expect(socket.url).toBe('ws://localhost:2280/chat/ws');
        socket.open();
        expect(socket.sent).toEqual([{ type: 'auth', token: 'tok' }]);
        socket.receive({ type: 'ready', displayName: 'me' });
        expect(socket.sent[1]).toEqual({ type: 'join', channel: 'stuff' });
    });

    it('shows the empty state when the channel has no history', () => {
        const socket = renderConnected();
        socket.receive({ type: 'history', channel: 'stuff', messages: [] });
        expect(screen.getByText('No messages yet.')).toBeInTheDocument();
    });

    it('renders history and live messages in order without duplicates', () => {
        const socket = renderConnected();
        socket.receive({ type: 'message', message: message(2, 'second') });
        socket.receive({ type: 'history', channel: 'stuff', messages: [message(1, 'first'), message(2, 'second')] });
        socket.receive({ type: 'message', message: message(3, 'third') });
        const list = within(screen.getByTestId('chat-messages'));
        expect(list.getAllByText(/first|second|third/).map((el) => el.textContent)).toEqual(['first', 'second', 'third']);
        expect(list.getByText('user1')).toBeInTheDocument();
    });

    it('ignores messages for another channel', () => {
        const socket = renderConnected();
        socket.receive({ type: 'message', message: message(1, 'elsewhere', 'other') });
        expect(screen.queryByText('elsewhere')).not.toBeInTheDocument();
    });

    it('sends the trimmed message on Enter and clears the input', async () => {
        const socket = renderConnected();
        await userEvent.type(input(), '  hello  {Enter}');
        expect(socket.sent).toContainEqual({ type: 'message', text: 'hello' });
        expect(input()).toHaveValue('');
    });

    it('sends with the button, which stays disabled for blank text', async () => {
        const socket = renderConnected();
        expect(sendButton()).toBeDisabled();
        await userEvent.type(input(), 'hi');
        await userEvent.click(sendButton());
        expect(socket.sent).toContainEqual({ type: 'message', text: 'hi' });
    });

    it('shows server errors', () => {
        const socket = renderConnected();
        socket.receive({ type: 'error', code: 'rate_limited', message: 'slow down' });
        expect(screen.getByText("You're sending messages too quickly.")).toBeInTheDocument();
    });

    it('clears messages and joins the new channel when the channel changes', async () => {
        const Harness = () => {
            const [channel, setChannel] = useState('stuff');
            return (
                <>
                    <button onClick={() => setChannel('other')}>switch</button>
                    <ChatBox token="tok" channel={channel} />
                </>
            );
        };
        renderWithChakra(<Harness />);
        const socket = connect();
        socket.receive({ type: 'history', channel: 'stuff', messages: [message(1, 'old room')] });
        await userEvent.click(screen.getByText('switch'));
        expect(screen.queryByText('old room')).not.toBeInTheDocument();
        expect(socket.sent).toContainEqual({ type: 'join', channel: 'other' });
    });

    it('does not reconnect after the session is rejected', () => {
        vi.useFakeTimers();
        const socket = renderConnected();
        socket.drop(4401);
        expect(screen.getByText('Your session has expired. Sign in again to chat.')).toBeInTheDocument();
        act(() => { vi.advanceTimersByTime(60000); });
        expect(FakeSocket.instances).toHaveLength(1);
    });

    it('reconnects and rejoins after a dropped connection', () => {
        vi.useFakeTimers();
        const first = renderConnected();
        first.drop(1006);
        expect(input()).toBeDisabled();
        act(() => { vi.advanceTimersByTime(1000); });
        expect(FakeSocket.instances).toHaveLength(2);
        const second = connect();
        expect(second.sent).toEqual([{ type: 'auth', token: 'tok' }, { type: 'join', channel: 'stuff' }]);
        expect(input()).toBeEnabled();
    });

    it('closes the socket on unmount without reconnecting', () => {
        vi.useFakeTimers();
        const { unmount } = renderWithChakra(<ChatBox token="tok" channel="stuff" />);
        const socket = latestSocket();
        unmount();
        expect(socket.closed).toBe(true);
        socket.onclose?.({ code: 1000 });
        act(() => { vi.advanceTimersByTime(60000); });
        expect(FakeSocket.instances).toHaveLength(1);
    });
});
