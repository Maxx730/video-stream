import { Heading, Stack, HStack, Button, Input, Clipboard } from '@chakra-ui/react';
import { useState } from 'react';


import '../css/Token.css';

export const Token = () => {
    const [streamKey, setStreamKey] = useState("");
    return (
        <div className="token-frame">
            <Stack>
                <Heading>
                    Generate Streaming Token
                </Heading>
                <HStack>
                    <Button onClick={() => {
                        setStreamKey("TESTING")
                    }}>
                        Generate
                    </Button>
                    <Input value={streamKey} readOnly={true}/>
                    <Clipboard.Root value={streamKey}>
                        <Clipboard.Trigger asChild>
                            <Button variant="surface" size="sm">
                            <Clipboard.Indicator />
                            </Button>
                        </Clipboard.Trigger>
                    </Clipboard.Root>
                </HStack>
            </Stack>
        </div>
    )
}