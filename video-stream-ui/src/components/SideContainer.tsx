import { Box, Button, Tag, Stack, HStack, Spinner } from "@chakra-ui/react"
import { MdExitToApp, MdLogin } from "react-icons/md";


interface SideContainerProps {
    contents: React.ReactNode,
    logout: (() => void) | undefined | null,
    updating: boolean | undefined | null,
    totalCount: number
}

export const SideContainer = ({ contents, logout, updating, totalCount = 0 }: SideContainerProps) => {
    return (
        <Box width={320}>
            <Stack gap={2}>
                <HStack height={10}>
                    <Box flex={1}>{updating && <Spinner marginTop={2} marginLeft={2} css={{ "--spinner-track-color": "colors.gray.200" }} size={'xs'}/>}</Box>
                    {logout ? 
                    <Button onClick={logout} variant={'outline'}>
                        <MdExitToApp/>
                        Sign Out
                    </Button> : <Button onClick={() => {
                        window.location.href = '/login';
                    }} variant={'outline'}>
                        <MdLogin/>
                        Sign In
                    </Button>
                    }
                    <Tag.Root>
                        <Tag.Label>
                            {totalCount} Viewer(s)
                        </Tag.Label>
                    </Tag.Root>
                </HStack>
                {contents}
            </Stack>
        </Box>
    )
}