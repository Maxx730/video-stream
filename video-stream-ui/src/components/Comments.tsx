import { useContext, useEffect, useRef, useState } from 'react';
import { CommentsContext } from '@/provider/CommentsProvider';
import { Stack, HStack, Text, Input, IconButton, Box } from '@chakra-ui/react';
import { FaArrowUp } from 'react-icons/fa6';
import '../css/Comments.css';

const MAX_LENGTH = 200;

export const Comments = ({ channel }: { channel: string | undefined }) => {
    const { comments, getComments, postComment } = useContext(CommentsContext);
    const [text, setText] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!channel) return;
        getComments(channel);
    }, [channel]);

    const handleSubmit = async () => {
        const trimmed = text.trim();
        if (!trimmed || !channel) return;
        await postComment(trimmed, channel);
        setText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };

    const formatTime = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Stack gap={2}>
            <Text fontSize="sm" fontWeight="semibold" textAlign="center">Channel Comments</Text>
            <Box className="comments-list" ref={listRef}>
                {comments.length === 0 ? (
                    <Text fontSize="xs" color="fg.subtle" padding={2}>No comments yet.</Text>
                ) : (
                    comments.map(comment => (
                        <Box key={comment.id} className="comment-item">
                            <HStack gap={2} align="baseline">
                                <Text fontSize="sm" fontWeight="bold">Anonymous</Text>
                                <Text fontSize="xs" color="fg.subtle">{formatTime(comment.created_at)}</Text>
                            </HStack>
                            <Text fontSize="sm" fontFamily="mono">{comment.text}</Text>
                        </Box>
                    ))
                )}
            </Box>
            <Stack direction="row" gap={2}>
                <Input
                    size="sm"
                    placeholder="Add a comment..."
                    value={text}
                    maxLength={MAX_LENGTH}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <IconButton
                    size="sm"
                    variant="surface"
                    disabled={!text.trim() || !channel}
                    onClick={handleSubmit}
                    aria-label="Submit comment"
                >
                    <FaArrowUp />
                </IconButton>
            </Stack>
        </Stack>
    );
};
