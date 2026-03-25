import { Stack, Text, Spinner, HStack, Box, Center } from "@chakra-ui/react";
import { useContext, useState, useEffect, useRef } from "react";

// TYPES
import type { Channel } from "@/provider/ChannelProvider";
import type { AuthInfo, AuthError } from "@/provider/AuthProvider";

// CONTEXTS
import { ChannelContext } from "@/provider/ChannelProvider";
import { AuthContext } from "@/provider/AuthProvider";
import { ViewerContext } from "@/provider/ViewerProvider";

// COMPONENTS
import { MediaPlayer } from '../components/MediaPlayer';
import { ChannelList } from "@/components/ChannelList";
import { SideContainer } from "@/components/SideContainer";
import { NoChannels } from "@/components/NoChannels";
import { MarqueeMessage } from "@/components/MarqueeMessage";

import '../css/Main.css';

const screenSizes = ["Small", "Normal", "Large", "Huge"];
const refreshTime = 30000;
const useDev: boolean = true;
let refreshInterval: number | undefined

export const Main = () => {
    const { auth, logout, setupAuth } = useContext(AuthContext);
    const { getChannels, setChannel, channels, setChannels, channel } = useContext(ChannelContext);
    const { join, viewers, ping, watch } = useContext(ViewerContext);

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const setup = async (auth: AuthInfo) => {
        const channels = await getChannels(false, auth ? auth.token : null, true) as Channel[];
        if (channels.length > 0) {
            const firstChannel: Channel = channels[0];
            const joined = await join(firstChannel.key);
            if (!joined) {
                return;
            } else {
                setChannel(firstChannel.key);
                await ping();
            }
        }
        setChannels(channels);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoading(false);
        refreshInterval = setInterval(async () => {
            setRefreshing(true);
            const channels = await getChannels(false, auth ? auth.token : null, true) as Channel[];
            await ping();
            setChannels(channels);
            setRefreshing(false);
        }, refreshTime);
    }

    const getChannelCount = (key: string) => {
        const channelViewers = viewers.filter(viewer => viewer.channel === key);
        return channelViewers.length;
    }

    useEffect(() => {
        setupAuth().then((auth: AuthInfo)  => {
            setup(auth);
        }).catch((err: AuthError) => {
            console.error(err);
        });
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    }, []);

    if (loading) {
        return (
            <Center>
                <Box bg='bg' shadow='md' borderWidth={1} borderRadius={12} padding={8}>
                    <Stack gap={4}>
                        <Center>
                            <Spinner />
                        </Center>
                        <Text>Loading channels...</Text>
                    </Stack>
                </Box>
            </Center>
        )
    }
    return (
        <div>
            {
                (channels.length > 0 && !loading) ? 
                <Stack padding={12}>
                    <HStack gap={6}>
                        <Stack gap={12}>
                            <MediaPlayer url={`https://video.clam-tube.com/stream/${channel}.m3u8`}/>
                        </Stack>
                        <Stack alignSelf={'flex-start'}>
                            <SideContainer updating={refreshing} logout={auth ? logout : undefined} totalCount={viewers.length} contents={
                                <ChannelList onChannelSelected={async (key) => {
                                    await watch(key);
                                    setChannel(key);
                                }} channels={channels} getChannelCount={getChannelCount}/>
                            }/>
                        </Stack>
                    </HStack>
                </Stack> : <NoChannels onReloadPressed={async () => {
                    const channels = await getChannels(false, auth ? auth.token : null, true) as Channel[];
                    setChannels(channels);
                }}/>
            }
        </div>
    )
}