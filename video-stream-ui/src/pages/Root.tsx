import { useState } from 'react';
import { Theme } from '@chakra-ui/react';

// PROVIDERS
import { ServerProvider } from "@/provider/ServerProvider";
import { AuthProvider } from "@/provider/AuthProvider";
import { ChannelProvider } from '@/provider/ChannelProvider';
import { ViewerProvider } from '@/provider/ViewerProvider';
import { SettingsProvider } from '@/provider/SettingsProvider';
import { CommentsProvider } from '@/provider/CommentsProvider';
// SCREENS
import { Main } from "../layouts/Main";
import { Login } from "../layouts/Login";
import { Signup } from "../layouts/Signup";

export interface RootProps {
    screen: string
}

export const Root = ({ screen = 'main' }: RootProps) => {
    const [currentScreen, setCurrentScreen] = useState<string>(screen);
    const renderScreen = () => {
        switch(currentScreen) {
            case 'login':
                return (
                    <Login setScreen={setCurrentScreen} />
                )
            case 'signup':
                return (
                    <Signup setScreen={setCurrentScreen} />
                )
            default:
                return (
                    <Main />
                )
        }
    }

    return (
        <AuthProvider>
            <SettingsProvider>
                <ChannelProvider>
                    <ViewerProvider>
                        <CommentsProvider>
                        <ServerProvider>
                            <Theme>
                                {renderScreen()}
                            </Theme>
                        </ServerProvider>
                        </CommentsProvider>
                    </ViewerProvider>
                </ChannelProvider>
            </SettingsProvider>
        </AuthProvider>
    )
}
