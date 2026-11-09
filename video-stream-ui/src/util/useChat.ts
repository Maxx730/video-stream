import { useCallback, useEffect, useRef, useState } from 'react';
import { buildChatSocketURL } from '@/util/utils';

export interface ChatMessage {
    id: number,
    channel: string,
    displayName: string,
    text: string,
    created_at: string
}

export type ChatStatus = 'connecting' | 'ready' | 'unauthorized';

const CLOSE_UNAUTHORIZED = 4401;
const CONNECT_TIMEOUT_MS = 10000;
const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;
const MAX_MESSAGES = 200;

const ERROR_TEXT: Record<string, string> = {
    rate_limited: "You're sending messages too quickly.",
    invalid: "That message couldn't be sent.",
    not_joined: "That message couldn't be sent.",
    server_error: 'Something went wrong. Please try again.',
};

// History and live messages can overlap, so messages are keyed by id.
const mergeMessages = (current: Array<ChatMessage>, incoming: Array<ChatMessage>) => {
    const byId = new Map(current.map((message) => [message.id, message]));
    incoming.forEach((message) => byId.set(message.id, message));
    return [...byId.values()].sort((a, b) => a.id - b.id).slice(-MAX_MESSAGES);
};

export const useChat = (token: string | null, channel: string | undefined) => {
    const [messages, setMessages] = useState<Array<ChatMessage>>([]);
    const [status, setStatus] = useState<ChatStatus>('connecting');
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const readyRef = useRef(false);
    const channelRef = useRef(channel);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        let retryDelay = INITIAL_RETRY_MS;
        let retryTimer: ReturnType<typeof setTimeout>;
        let connectTimer: ReturnType<typeof setTimeout>;

        const connect = () => {
            setStatus('connecting');
            const socket = new WebSocket(buildChatSocketURL());
            socketRef.current = socket;
            connectTimer = setTimeout(() => socket.close(), CONNECT_TIMEOUT_MS);

            socket.onopen = () => {
                clearTimeout(connectTimer);
                if (!cancelled) socket.send(JSON.stringify({ type: 'auth', token }));
            };

            socket.onmessage = (event) => {
                if (cancelled) return;
                const data = JSON.parse(event.data);
                if (data.type === 'ready') {
                    retryDelay = INITIAL_RETRY_MS;
                    readyRef.current = true;
                    setStatus('ready');
                    setError(null);
                    if (channelRef.current) socket.send(JSON.stringify({ type: 'join', channel: channelRef.current }));
                } else if (data.type === 'history' && data.channel === channelRef.current) {
                    setMessages((current) => mergeMessages(current, data.messages));
                } else if (data.type === 'message' && data.message.channel === channelRef.current) {
                    setMessages((current) => mergeMessages(current, [data.message]));
                } else if (data.type === 'error') {
                    setError(ERROR_TEXT[data.code] ?? ERROR_TEXT.server_error);
                }
            };

            socket.onclose = (event) => {
                clearTimeout(connectTimer);
                readyRef.current = false;
                if (cancelled) return;
                if (event.code === CLOSE_UNAUTHORIZED) {
                    setStatus('unauthorized');
                    return;
                }
                setStatus('connecting');
                retryTimer = setTimeout(connect, retryDelay);
                retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
            };
        };

        connect();

        return () => {
            cancelled = true;
            clearTimeout(retryTimer);
            clearTimeout(connectTimer);
            readyRef.current = false;
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, [token]);

    useEffect(() => {
        channelRef.current = channel;
        setMessages([]);
        setError(null);
        if (readyRef.current && channel) {
            socketRef.current?.send(JSON.stringify({ type: 'join', channel }));
        }
    }, [channel]);

    const sendMessage = useCallback((text: string) => {
        if (!readyRef.current || !socketRef.current) return false;
        setError(null);
        socketRef.current.send(JSON.stringify({ type: 'message', text }));
        return true;
    }, []);

    return { messages, status, error, sendMessage };
};
