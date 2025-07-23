import { Heading, Stack, HStack, SegmentGroup, Switch, Flex } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { serverContextInstance } from "@/provider/ServerProvider";
import { getSizeValue } from "@/util/values";

import { MediaPlayer } from '../components/MediaPlayer';

import '../css/Main.css';

const screenSizes = ["Small", "Normal", "Large"];

export const Main = () => {
    const { getChannelURL } = useContext(serverContextInstance);
    const [effectState, setEffectState] = useState<string>("NONE");
    const [screenSize, setScreenSize] = useState<string>(screenSizes[1])

    const renderHeader = () => {
        return (
            <div className="header-frame">
                <Flex>
                    <Stack gap={0}>
                        <SegmentGroup.Root defaultValue={screenSize} onValueChange={details => {
                            setScreenSize(details.value || "Normal");
                        }}>
                            <SegmentGroup.Indicator />
                            <SegmentGroup.Items items={screenSizes} />
                        </SegmentGroup.Root>
                    </Stack>
                    <Stack>

                    </Stack>
                </Flex>
            </div>
        )
    }
    const renderPlayer = () => {
        return (
            <div>
                <MediaPlayer effect={effectState} size={screenSize} url={getChannelURL()}/>
            </div>
        )
    }
    return (
        <div className="main-frame" style={{
            width: getSizeValue(screenSize)
        }}>
            <Stack>
                {renderPlayer()}
                {renderHeader()}
            </Stack>
        </div>
    )
}