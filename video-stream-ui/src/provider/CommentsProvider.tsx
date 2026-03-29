import { createContext, useState } from 'react';
import { buildRequestURL } from '@/util/utils';

export interface Comment {
    id: number,
    text: string,
    created_at: string,
}

export interface CommentsContextInstance {
    comments: Comment[],
    getComments: (channel: string) => Promise<void>,
    postComment: (text: string, channel: string) => Promise<void>,
}

export const CommentsContextDefault: CommentsContextInstance = {
    comments: [],
    getComments: () => Promise.resolve(),
    postComment: () => Promise.resolve(),
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const CommentsContext = createContext<CommentsContextInstance>(CommentsContextDefault);
export const CommentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [comments, setComments] = useState<Comment[]>([]);

    const getComments = async (channel: string) => {
        const response = await fetch(`${buildRequestURL('2279')}/comments/?channel=${encodeURIComponent(channel)}`);
        if (!response.ok) return;
        const data = await response.json();
        setComments(data);
    };

    const postComment = async (text: string, channel: string) => {
        const response = await fetch(`${buildRequestURL('2279')}/comments/`, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ text, channel }),
        });
        if (!response.ok) return;
        const newComment = await response.json();
        setComments(prev => [newComment, ...prev]);
    };

    return (
        <CommentsContext.Provider value={{ comments, getComments, postComment }}>
            {children}
        </CommentsContext.Provider>
    );
};
