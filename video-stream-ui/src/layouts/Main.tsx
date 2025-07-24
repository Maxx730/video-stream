import { Heading, Stack, HStack, SegmentGroup, Switch, Flex, NumberInput, IconButton } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { serverContextInstance } from "@/provider/ServerProvider";
import { getSizeValue } from "@/util/values";

import { MediaPlayer } from '../components/MediaPlayer';

import '../css/Main.css';
import { LuMinus, LuPlus } from "react-icons/lu";

const screenSizes = ["Small", "Normal", "Large"];

export const Main = () => {
    const { getChannelURL, currentChannel } = useContext(serverContextInstance);
    const [effectState, setEffectState] = useState<string>("NONE");
    const [screenSize, setScreenSize] = useState<string>(screenSizes[1])

    const renderHeader = () => {
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
                    <div>
                        <NumberInput.Root defaultValue="1" min={1} unstyled spinOnPress={false}>
                            <HStack gap="2">
                                <NumberInput.DecrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                    <LuMinus />
                                </IconButton>
                                </NumberInput.DecrementTrigger>
                                <NumberInput.ValueText textAlign="center" fontSize="lg" minW="3ch" />
                                <NumberInput.IncrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                    <LuPlus />
                                </IconButton>
                                </NumberInput.IncrementTrigger>
                            </HStack>
                        </NumberInput.Root>
                    </div>
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