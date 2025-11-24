import { Stack, SegmentGroup, Flex, ProgressCircle, Text } from "@chakra-ui/react";
import { useContext, useState, useEffect, useRef } from "react";
import { serverContextInstance } from "@/provider/ServerProvider";
import { getSizeValue } from "@/util/values";
import { SideTabs } from "@/components/SideTabs";
import { MediaPlayer } from '../components/MediaPlayer';
import { useIsMobile } from "@/util/utils";
import DebugStats from "../components/DebugStats";

import '../css/Main.css';
import { NoChannels } from "@/components/NoChannels";

const screenSizes = ["Small", "Normal", "Large", "Huge"];

export const Main = () => {
    const { getChannelURL, channels, setCurrentChannel, loading, watch } = useContext(serverContextInstance);
    const [effectState, setEffectState] = useState<string>("NONE");
    const [screenSize, setScreenSize] = useState<string>(screenSizes[1]);
    const changeRef = useRef<NodeJS.Timeout | null>(null);
    const [playing, setPlaying] = useState(true);
    const isMobile = useIsMobile();

    // RENDER METHODS
    const renderTop = () => {
        return (
            <div className="top-frame">
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
            <div className={`main-content`}>
                <div className="content-column"  style={{
                    width: getSizeValue(screenSize)
                }}>
                    {channels.length > 0 ? renderPlayerScreen() : <NoChannels/>}
                </div>
                {!isBigScreen() &&   
                <div className="content-column" style={{
                    width: '320px'
                }}>
                    <SideTabs onChannelSelected={key => {
                        watch(key);
                    }}/>
                </div>}
            </div>
        )
    }

    // UTIL
    const isBigScreen = () => {
        return (screenSize === "Large" || screenSize === "Huge")
    }


    useEffect(() => {
        return () => {
            if (changeRef.current) {
                clearTimeout(changeRef.current);
            }
        }
    }, []);

    return (
        <div className={`main-frame ${isMobile && 'mobile-device'}`}>
            {renderContentScreen()}
            <DebugStats />
        </div>
    )
}