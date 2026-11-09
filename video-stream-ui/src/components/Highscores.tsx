import { useEffect, useState } from 'react';
import { Stack, Text, Box } from '@chakra-ui/react';
import '../css/Highscores.css';

const SCORE_COUNT = 3;
const REFRESH_TIME = 60000;
const EMPTY = '-';
const SPARKLES = [
    { left: '6%', top: '4%', animationDelay: '0s' },
    { left: '82%', top: '10%', animationDelay: '0.7s' },
    { left: '18%', top: '46%', animationDelay: '1.3s' },
    { left: '74%', top: '58%', animationDelay: '0.35s' },
    { left: '46%', top: '30%', animationDelay: '1.7s' },
];

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
            <Box className="podium">
                {padScores(scores).map((entry, i) => (
                    <Box key={i} className={`podium-place place-${i + 1}`} data-testid="highscore-row">
                        <Text fontSize="sm" fontWeight="bold" textAlign="center" width="100%" truncate>{entry?.name || EMPTY}</Text>
                        <Text fontSize="sm" fontFamily="mono" textAlign="center">{entry?.score ?? EMPTY}</Text>
                        <Box className="podium-pedestal">
                            <span className="podium-rank">{i + 1}</span>
                        </Box>
                        {entry && SPARKLES.map((style, s) => (
                            <span key={s} className="sparkle" style={style} aria-hidden="true" />
                        ))}
                    </Box>
                ))}
            </Box>
        </Stack>
    );
};
