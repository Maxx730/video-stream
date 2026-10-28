import { useEffect, useState } from 'react';
import { Stack, HStack, Text, Box } from '@chakra-ui/react';
import '../css/Comments.css';

const SCORE_COUNT = 10;
const REFRESH_TIME = 60000;
const EMPTY = '-';

export interface Highscore {
    name: string,
    score: number,
    created_at: string,
}

export const padScores = (scores: Array<Highscore>, n: number = SCORE_COUNT): Array<Highscore | null> => {
    return Array.from({ length: n }, (_, i) => scores[i] ?? null);
};

export const Highscores = () => {
    const [scores, setScores] = useState<Array<Highscore>>([]);

    useEffect(() => {
        const getScores = async () => {
            try {
                const response = await fetch(`/highscores/?limit=${SCORE_COUNT}`);
                if (!response.ok) return;
                const data: { scores: Array<Highscore> } = await response.json();
                setScores(data.scores ?? []);
            } catch {
                // keep showing the last scores we loaded
            }
        };
        getScores();
        const interval = setInterval(getScores, REFRESH_TIME);
        return () => clearInterval(interval);
    }, []);

    return (
        <Stack gap={2}>
            <Text fontSize="sm" fontWeight="semibold" textAlign="center">Naval Blitz Highscores</Text>
            <Box className="comments-list">
                {padScores(scores).map((entry, i) => (
                    <HStack key={i} gap={3} paddingX={2} data-testid="highscore-row">
                        <Text fontSize="sm" color="fg.subtle" width={6}>{i + 1}.</Text>
                        <Text fontSize="sm" fontWeight="bold" flex={1} truncate>{entry?.name || EMPTY}</Text>
                        <Text fontSize="sm" fontFamily="mono">{entry?.score ?? EMPTY}</Text>
                    </HStack>
                ))}
            </Box>
        </Stack>
    );
};
