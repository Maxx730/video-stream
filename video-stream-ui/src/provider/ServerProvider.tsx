import { createContext, useState, useEffect, useRef } from "react";

export interface Channel {
    key: string,
    title: string,
    desc: string,
    viewers?: Array<any>,
    path: string,
    started: Date
}

export interface Error {
    error: string
}

export interface ServerContext {
    serverIp: string,
    serverPort: string,
    channels: Array<Channel>,
    currentChannel: number,
    errors: Array<Error>,
    loading: boolean
};

const serverContextDefault = {
    serverIp: "video.clam-tube.com",
    serverPort: "8080",
    channels: [],
    currentChannel: 0,
    errors: [],
    loading: true
};
export const serverContextInstance = createContext<any>(serverContextDefault);
export const CHANNEL_UPDATE_DELTA: number = 30000;

export const ServerProvider: React.FC<{
    children: React.ReactNode
}> = ({children}) => {
    const [serverIp] = useState(serverContextDefault.serverIp);
    const [serverPort] = useState(serverContextDefault.serverPort);
    const [channels, setChannels] = useState<Array<Channel>>(serverContextDefault.channels);
    const [currentChannel, setCurrentChannel] = useState<number>(serverContextDefault.currentChannel);
    const [errors, setErrors] = useState(serverContextDefault.errors);
    const [loading, setLoading] = useState(serverContextDefault.loading);
    const [viewCount, setViewCount] = useState(0);
    const changeChannelTimer = useRef<NodeJS.Timeout | null>(null);

    const addError = (error: string) => {
        const clonedErrors = JSON.parse(JSON.stringify(errors));
        clonedErrors.push({
            error
        });
        setErrors(clonedErrors);
    }
    const getChannels = async () => {
        const channelResponse = await fetch(`https://${serverIp}/channels`);
        if (!channelResponse.ok) {
            addError("Error in channel response.")
            return;
        }
        const data: string = await channelResponse.text();
        setChannels(JSON.parse(data));
        setLoading(false);
    }

    const getChannelURL = () => {
        return `https://${serverIp}/stream/max.m3u8`
    }

    useEffect(() => {
        getChannels();
    }, []);

    useEffect(() => {
    }, [changeChannelTimer]);

    return (
        <serverContextInstance.Provider value={{
            serverIp,
            serverPort,
            channels,
            currentChannel,
            errors,
            loading,
            getChannelURL,
            setCurrentChannel: (channel: number) => {
                setLoading(true);
                setCurrentChannel(channel);
                changeChannelTimer.current = setTimeout(() => {
                    setLoading(false);
                }, 1000);
            },
            viewCount
        }}>
            {children}
        </serverContextInstance.Provider>
    )
}