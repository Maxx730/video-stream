import { useState } from 'react';

// PROVIDERS
import { ServerProvider } from "@/provider/ServerProvider";
import { AuthProvider } from "@/provider/AuthProvider";
import { ChannelProvider } from '@/provider/ChannelProvider';
import { ViewerProvider } from '@/provider/ViewerProvider';
// SCREENS
import { Main } from "../layouts/Main";
import { Login } from "../layouts/Login";

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
            default:
                return (
                    <Main />
                )
        }
    }

    return (
        <AuthProvider>
            <ChannelProvider>
                <ViewerProvider>
                    <ServerProvider>
                        {renderScreen()}
                    </ServerProvider>
                </ViewerProvider>
            </ChannelProvider>
        </AuthProvider>
    )
}
