import { Stack, SegmentGroup, Flex, ProgressCircle, Text } from "@chakra-ui/react";
import { useContext, useState, useEffect, useRef } from "react";
import { serverContextInstance } from "@/provider/ServerProvider";
import { getSizeValue } from "@/util/values";
import { ViewCount } from "@/components/ViewCount";
import { SideTabs } from "@/components/SideTabs";
import { MediaPlayer } from '../components/MediaPlayer';

import '../css/Main.css';
import { NoChannels } from "@/components/NoChannels";

const screenSizes = ["Small", "Normal", "Large", "Huge"];

export const Main = () => {
    const { getChannelURL, channels, viewCount, setCurrentChannel, loading } = useContext(serverContextInstance);
    const [effectState, setEffectState] = useState<string>("NONE");
    const [screenSize, setScreenSize] = useState<string>(screenSizes[1]);
    const changeRef = useRef<NodeJS.Timeout | null>(null);
    const [playing, setPlaying] = useState(true);

    // RENDER METHODS
    const renderTop = () => {
        return (
            <div className="top-frame">
                <div className="top-section">
                    <ViewCount count={viewCount}/>
                </div>
                <div className="top-section center">
                    <SegmentGroup.Root defaultValue={screenSize} onValueChange={details => {
                        setScreenSize(details.value || "Normal");
                    }}>
                        <SegmentGroup.Indicator />
                        <SegmentGroup.Items items={screenSizes} />
                    </SegmentGroup.Root>
                </div>
                <div className="top-section">

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
        return <MediaPlayer playing={playing} effect={effectState} size={screenSize} url={getChannelURL()}/>;
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
                {renderTop()}
                {renderPlayer()}
                {renderControls()}
            </Stack>
        );
    }
    const renderContentScreen = () => {
        return (
            <div>
                <div className="content-column"  style={{
                    width: getSizeValue(screenSize)
                }}>
                    {channels.length > 0 ? renderPlayerScreen() : <NoChannels/>}
                </div>
                {!isBigScreen() &&   
                <div className="content-column" style={{
                    width: '320px'
                }}>
                    <SideTabs onChannelSelected={channel => {
                        setCurrentChannel(channel);
                        changeRef.current = setTimeout(() => {
                            
                        }, 1000);
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
        <div className="main-frame">
            <div className="main-contents">
                {channels.length > 0 ? renderContentScreen() : <NoChannels/>}
            </div>
        </div>
    )
}