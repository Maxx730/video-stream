import { useEffect, useState } from 'react';
import { Stack, Blockquote, Heading, Text } from '@chakra-ui/react';
import { getRandomQuote, Quotes } from '../data/empty_quotes';
import type { MovieQuote } from '../data/empty_quotes';
import '../css/NoChannels.css';

export const NoChannels = () => {
    const [randomQuote, setRandomQuote] = useState<MovieQuote>({
        quote: "",
        source: ""
    });
    useEffect(() => {
        setRandomQuote(getRandomQuote(Quotes))
    }, []);
    return (
        <div className="no-channels-frame">
            <Stack gap={6}>
                <Stack>
                    <Heading>
                        No Streams
                    </Heading>
                    <Text>
                        You're the star of the show... but the audience hasn't arrived yet. No one else is streaming right now!
                    </Text>
                </Stack>
            </Stack>
        </div>
    )
}