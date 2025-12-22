import { useEffect, useState, useContext } from 'react';
import { Stack, Button, Heading, Text, HStack, Spinner } from '@chakra-ui/react';
import { TbRefresh } from 'react-icons/tb';
import { getRandomQuote, Quotes } from '../data/empty_quotes';
import type { MovieQuote } from '../data/empty_quotes';
import { serverContextInstance } from '@/provider/ServerProvider';
import '../css/NoChannels.css';

export const NoChannels = () => {
    const { loading, reload } = useContext(serverContextInstance);
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
                <Stack gap={6}>
                    <Heading>
                        No Streams
                    </Heading>
                    <Text>
                        You're the star of the show... but the audience hasn't arrived yet. No one else is streaming right now!
                    </Text>
                    <HStack>
                        <Button onClick={reload}>
                            <TbRefresh/>
                            Refresh
                        </Button>
                    </HStack>
                </Stack>
            </Stack>
        </div>
    )
}