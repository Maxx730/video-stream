import { HStack, IconButton, NumberInput, type SelectValueChangeDetails } from "@chakra-ui/react"
import { LuMinus, LuPlus } from "react-icons/lu"

interface ChannelControlProps {
    currentChannel?: number,
    maxChannel?: number
    onChannelChange?: Function
}

export const ChannelControl = ({
    currentChannel = 1,
    maxChannel = currentChannel + 1,
    onChannelChange = (channel: number) => null
}: ChannelControlProps) => {
    return (
        <NumberInput.Root onValueChange={(details: ValueChangeDetails) => {
            onChannelChange(details.valueAsNumber)
        }} defaultValue="1" min={currentChannel} max={maxChannel} unstyled spinOnPress={true}>
            <HStack gap="0">
                <NumberInput.DecrementTrigger asChild>
                <IconButton variant="subtle" size="sm">
                    <LuMinus />
                </IconButton>
                </NumberInput.DecrementTrigger>
                <NumberInput.ValueText textAlign="center" fontSize="lg" minW="3ch" />
                <NumberInput.IncrementTrigger asChild>
                <IconButton variant="subtle" size="sm">
                    <LuPlus />
                </IconButton>
                </NumberInput.IncrementTrigger>
            </HStack>
        </NumberInput.Root>
    )
}