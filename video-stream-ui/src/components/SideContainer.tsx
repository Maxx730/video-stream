import { Box, Button, Link, Stack, HStack, Spinner } from "@chakra-ui/react"
import { MdExitToApp } from "react-icons/md";


interface SideContainerProps {
    contents: React.ReactNode,
    logout: (() => void) | undefined | null,
    updating: boolean | undefined | null
}

export const SideContainer = ({ contents, logout, updating }: SideContainerProps) => {
    return (
        <Box width={320}>
            <Stack gap={2}>
                {JSON.stringify(logout)}
                <HStack>
                    {updating && <Spinner />}
                    {logout && 
                    <Button onClick={logout} variant={'outline'}>
                        <MdExitToApp/>
                        Sign Out
                    </Button>}
                </HStack>
                {contents}
            </Stack>
        </Box>
    )
}