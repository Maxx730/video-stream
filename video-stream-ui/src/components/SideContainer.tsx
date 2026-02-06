import { Box, Button, Tag, Stack, HStack, Spinner, Switch } from "@chakra-ui/react"
import { MdExitToApp, MdLogin } from "react-icons/md";
import { SettingsContext } from "@/provider/SettingsProvider";
import { useContext } from "react";


interface SideContainerProps {
    contents: React.ReactNode,
    logout: (() => void) | undefined | null,
    updating: boolean | undefined | null,
    totalCount: number
}

export const SideContainer = ({ contents, logout, updating, totalCount = 0 }: SideContainerProps) => {
    const { settings, setBoolValue } = useContext(SettingsContext);
    const renderLoginLogout = () => {
        return (
            logout ? 
            <Button onClick={logout} variant={'outline'}>
                <MdExitToApp/>
                Sign Out
            </Button> : <Button disabled={true} onClick={() => {
                window.location.href = '/login';
            }} variant={'outline'}>
                <MdLogin/>
                Sign In
            </Button>
        );
    }
    return (
        <Box width={320}>
            <Stack gap={2}>
                <Stack>
                    <HStack minH={8}>
                        <Box flex={1}>{updating && <Spinner marginTop={2} marginLeft={2} size={'xs'}/>}</Box>
                    </HStack>
                    <HStack height={10}>
                        <Tag.Root alignSelf={'flex-start'}>
                            <Tag.Label>
                                {totalCount} Viewer(s)
                            </Tag.Label>
                        </Tag.Root>
                        <Box flex={1}/>
                        {renderLoginLogout()}
                    </HStack>                    
                </Stack>
                {contents}
            </Stack>
        </Box>
    )
}