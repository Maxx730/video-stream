import { useEffect, useRef, useState } from 'react';
import { Box, Card, HStack, IconButton, Input, Stack, Text } from '@chakra-ui/react';
import { FaArrowUp } from 'react-icons/fa6';
import { useChat } from '@/util/useChat';
import type { ChatStatus } from '@/util/useChat';

const MAX_LENGTH = 200;
const BOTTOM_THRESHOLD_PX = 24;

const EMPTY_TEXT: Record<ChatStatus, string> = {
    connecting: 'Connecting to chat...',
    ready: 'No messages yet.',
    unauthorized: 'Your session has expired. Sign in again to chat.',
};

const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface ChatBoxProps {
    token: string | null,
    channel: string | undefined
}

export const ChatBox = ({ token, channel }: ChatBoxProps) => {
    const { messages, status, error, sendMessage } = useChat(token, channel);
    const [text, setText] = useState('');
    const listRef = useRef<HTMLDivElement>(null);
    const stickToBottomRef = useRef(true);
    const canSend = status === 'ready' && !!channel;

    // Follow new messages unless the user has scrolled up to read older ones.
    useEffect(() => {
        if (messages.length === 0) stickToBottomRef.current = true;
        const list = listRef.current;
        if (list && stickToBottomRef.current) list.scrollTop = list.scrollHeight;
    }, [messages]);

    const handleScroll = () => {
        const list = listRef.current;
        if (!list) return;
        stickToBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < BOTTOM_THRESHOLD_PX;
    };

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed || !canSend) return;
        if (sendMessage(trimmed)) setText('');
    };

    return (
        <Card.Root size="sm" width="100%">
            <Card.Body>
                <Box h="160px" overflowY="auto" ref={listRef} onScroll={handleScroll} data-testid="chat-messages">
                    {messages.length === 0 ? (
                        <Text fontSize="xs" color="fg.subtle">{EMPTY_TEXT[status]}</Text>
                    ) : (
                        <Stack gap={2}>
                            {messages.map((message) => (
                                <Box key={message.id}>
                                    <HStack gap={2} align="baseline">
                                        <Text fontSize="sm" fontWeight="bold" truncate>{message.displayName}</Text>
                                        <Text fontSize="xs" color="fg.subtle" flexShrink={0}>{formatTime(message.created_at)}</Text>
                                    </HStack>
                                    <Text fontSize="sm" wordBreak="break-word">{message.text}</Text>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Card.Body>
            <Card.Footer>
                <Stack gap={1} width="100%">
                    <HStack gap={2} width="100%">
                        <Input
                            size="sm"
                            placeholder="Send a message..."
                            aria-label="Message"
                            maxLength={MAX_LENGTH}
                            value={text}
                            disabled={!canSend}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                        />
                        <IconButton size="sm" aria-label="Send message" disabled={!canSend || !text.trim()} onClick={handleSend}>
                            <FaArrowUp />
                        </IconButton>
                    </HStack>
                    {error && <Text fontSize="xs" color="fg.error">{error}</Text>}
                </Stack>
            </Card.Footer>
        </Card.Root>
    );
};
