import { Stack, SegmentGroup, Flex, ProgressCircle, Text, Spinner, AbsoluteCenter, HStack, Box, Center } from "@chakra-ui/react";
import { useContext, useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/util/utils";
import { getSizeValue } from "@/util/values";

// TYPES
import type { Channel } from "@/provider/ChannelProvider";
import type { Viewer } from "@/provider/ViewerProvider";
import type { AuthInfo, AuthError } from "@/provider/AuthProvider";

// CONTEXTS
import { ChannelContext } from "@/provider/ChannelProvider";
import { AuthContext } from "@/provider/AuthProvider";
import { ViewerContext } from "@/provider/ViewerProvider";

// COMPONENTS
import { SideTabs } from "@/components/SideTabs";
import { MediaPlayer } from '../components/MediaPlayer';
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ChannelList } from "@/components/ChannelList";
import { SideContainer } from "@/components/SideContainer";
import { UpdateLogs } from "@/components/UpdateLogs";
import { NoChannels } from "@/components/NoChannels";

import '../css/Main.css';

const screenSizes = ["Small", "Normal", "Large", "Huge"];
const refreshTime = 5000;
let refreshInterval: number | undefined

export const Main = () => {
    const { auth, logout, setupAuth } = useContext(AuthContext);
    const { getChannels, setChannel, channels, setChannels, channel } = useContext(ChannelContext);
    const { updateViewers, getViewers, join, viewers, ping } = useContext(ViewerContext);

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [effectState, setEffectState] = useState<string>("NONE");
    const [screenSize, setScreenSize] = useState<string>(screenSizes[0]);
    const changeRef = useRef<NodeJS.Timeout | null>(null);
    const [playing, setPlaying] = useState(true);
    const isMobile = useIsMobile();
    const [params, setParams] = useState<string | Array<string>>([]);

    // RENDER METHODS
    const renderTop = () => {
        return (
            <div className="top-frame">
                {asyncLoading && <LoadingIndicator />}
                <div className="top-section center">
                    <SegmentGroup.Root defaultValue={screenSize} onValueChange={details => {
                        setScreenSize(details.value || "Normal");
                    }}>
                        <SegmentGroup.Indicator />
                        <SegmentGroup.Items items={screenSizes} />
                    </SegmentGroup.Root>
                </div>
            </div>
        )
    }
    const renderControls = () => {
        return (
            <div className="header-frame">
                <Flex justify={"space-between"}>
                    <div>
                        
                    </div>
                    <div>

                    </div>
                    <Stack>
                        {
                            channels && channels.length > 0 && renderChannelControls()
                        }
                    </Stack>
                </Flex>
            </div>
        )
    }
    const renderPlayer = () => {
        return <MediaPlayer isMobile={isMobile} playing={playing} effect={effectState} size={screenSize} url={getChannelURL()}/>;
    }
    const renderChannelControls = () => {
        return (
            <>

            </>
        )
    }
    const renderBusyScreen = () => {
        return (
            <div className="busy-frame">
                <Stack align={'center'}>
                    <ProgressCircle.Root value={null} size="sm">
                        <ProgressCircle.Circle>
                            <ProgressCircle.Track />
                            <ProgressCircle.Range strokeLinecap={'round'} />
                        </ProgressCircle.Circle>
                    </ProgressCircle.Root>
                    <Text>
                        Loading...
                    </Text>
                </Stack>
            </div>
        )
    }
    const renderPlayerScreen = () => {
        if (loading) {
            return renderBusyScreen();
        }
        return (
            <Stack>
                {!isMobile && renderTop()}
                {renderPlayer()}
                {renderControls()}
            </Stack>
        );
    }
    const renderContentScreen = () => {
        return (
            <div className={`main-contents`}>
                <div className={`main-content`}>
                    <div className="content-column"  style={{
                        width: getSizeValue(screenSize)
                    }}>
                        {channels.length > 0 ? renderPlayerScreen() : <NoChannels/>}
                    </div>
                    {!isBigScreen() && channels.length > 0 &&   
                    <div className="content-column" style={{
                        width: '320px'
                    }}>
                        <SideTabs onChannelSelected={key => {
                            watch(key);
                        }}/>
                    </div>}
                </div>
            </div>
        )
    }
    const renderLoading = () => {
        return (
            <AbsoluteCenter>
                <Stack alignItems={'center'}>
                    <Spinner/>
                    <Text>Loading...</Text>
                </Stack>
            </AbsoluteCenter>
        )
    }

    // UTIL
    const isBigScreen = () => {
        return (screenSize === "Large" || screenSize === "Huge")
    }

    const setup = async (auth: AuthInfo) => {
        const channels = await getChannels(false, auth ? auth.token : null, true) as Channel[];
        if (channels.length > 0) {
            const firstChannel: Channel = channels[0];
            const joined = await join(firstChannel.path);
            if (!joined) {
                return;
            } else {
                setChannel(firstChannel.key);
                const viewerResponse = await getViewers() as { error: string } | Viewer[];
                if ('error' in viewerResponse) {
                    return;
                } else {
                    
                }
            }
        }
        setChannels(channels);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoading(false);
        refreshInterval = setInterval(async () => {
            setRefreshing(true);
            const channels = await getChannels(false, auth ? auth.token : null, true) as Channel[];
            const viewerResponse = await getViewers() as { error: string } | Viewer[];
            await new Promise(resolve => setTimeout(resolve, 3000));
            await ping();
            updateViewers(viewerResponse as Viewer[]);
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
        <div className={`main-frame ${isMobile && 'mobile-device'}`}>
            {
                (channels.length > 0 && !loading) ? 
                <Stack>
                    <HStack>
                        <Stack gap={12}>
                            <MediaPlayer url={`https://video.clam-tube.com/stream/${channel}.m3u8`}/>
                            <UpdateLogs/>
                        </Stack>
                        <Stack alignSelf={'flex-start'}>
                            <SideContainer updating={refreshing} logout={auth ? logout : undefined} totalCount={viewers.length} contents={
                                <ChannelList onChannelSelected={async (key) => {
                                    await join(key);
                                    setChannel(key);
                                }} channels={channels} getChannelCount={getChannelCount}/>
                            }/>
                        </Stack>
                    </HStack>
                </Stack> : <NoChannels />
            }
        </div>
    )
}