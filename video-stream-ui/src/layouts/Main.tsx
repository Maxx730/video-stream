import { Stack, SegmentGroup, Flex, ProgressCircle, Text, Spinner, AbsoluteCenter, Link } from "@chakra-ui/react";
import { useContext, useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/util/utils";
import { getSizeValue } from "@/util/values";

// TYPES
import type { Channel } from "@/provider/ChannelProvider";
import type { Viewer } from "@/provider/ViewerProvider";

// CONTEXTS
import { ChannelContext } from "@/provider/ChannelProvider";
import { AuthContext } from "@/provider/AuthProvider";
import { ViewerContext } from "@/provider/ViewerProvider";

// COMPONENTS
import { SideTabs } from "@/components/SideTabs";
import { MediaPlayer } from '../components/MediaPlayer';
import LoadingIndicator from "@/components/LoadingIndicator";
import { ChannelList } from "@/components/ChannelList";
import { SideContainer } from "@/components/SideContainer";

import '../css/Main.css';
import { NoChannels } from "@/components/NoChannels";

const screenSizes = ["Small", "Normal", "Large", "Huge"];

export const Main = () => {
    const { auth, logout } = useContext(AuthContext);
    const { getChannels, channels, channel, setChannels } = useContext(ChannelContext);
    const { viewers, getViewers, join } = useContext(ViewerContext);


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

    const setup = async () => {
        const channels = await getChannels(true, auth ? auth.token : null) as Channel[];
        if (channels.length > 0) {
            const firstChannel: Channel = channels[0];
            const joined = await join(firstChannel.key);
            if (!joined) {
                // Display error message that we were not able to 
                // join the video channel
                return;
            } else {
                const viewerResponse = await getViewers() as { error: string } | Viewer[];
                if ('error' in viewerResponse) {
                    return;
                } else {
                    
                }
            }
        }
        setChannels(channels);
    }

    const getChannelCount = (key: string) => {
        return 5;
    }


    useEffect(() => {
        setup();
    }, []);

    return (
        <div className={`main-frame ${isMobile && 'mobile-device'}`}>
            <SideContainer updating={true} logout={auth ? logout : undefined} contents={
                <ChannelList onChannelSelected={() => {}} channels={channels} getChannelCount={getChannelCount}/>
            }/>
        </div>
    )
}