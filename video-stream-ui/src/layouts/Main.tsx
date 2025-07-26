import { Stack, SegmentGroup, Flex } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { serverContextInstance } from "@/provider/ServerProvider";
import { getSizeValue } from "@/util/values";
import { ViewCount } from "@/components/ViewCount";
import { ChannelControl } from "@/components/ChannelControl";
import { MediaPlayer } from '../components/MediaPlayer';

import '../css/Main.css';
import { NoChannels } from "@/components/NoChannels";

const screenSizes = ["Small", "Normal", "Large"];

export const Main = () => {
    const { getChannelURL, channels, currentChannel, setCurrentChannel } = useContext(serverContextInstance);
    const [effectState, setEffectState] = useState<string>("NONE");
    const [screenSize, setScreenSize] = useState<string>(screenSizes[1])

    const renderTop = () => {
        return (
            <Flex>
                
            </Flex>
        )
    }
    const renderControls = () => {
        return (
            <div className="header-frame">
                <Flex justify={"space-between"}>
                    <div>
                        <SegmentGroup.Root defaultValue={screenSize} onValueChange={details => {
                            setScreenSize(details.value || "Normal");
                        }}>
                            <SegmentGroup.Indicator />
                            <SegmentGroup.Items items={screenSizes} />
                        </SegmentGroup.Root>
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
        return <MediaPlayer effect={effectState} size={screenSize} url={getChannelURL()}/>;
    }
    const renderChannelControls = () => {
        return (
            <>
                <ChannelControl onChannelChange={setCurrentChannel} maxChannel={channels.length || 1}/>
                <ViewCount count={channels[currentChannel].viewerCount}/>
            </>
        )
    }
    return (
        <div className="main-frame" style={{
            width: getSizeValue(screenSize)
        }}>
            {channels.length > 0 ? 
            <Stack>
                {renderTop()}
                {renderPlayer()}
                {renderControls()}
            </Stack> :
            <NoChannels/>}
        </div>
    )
}