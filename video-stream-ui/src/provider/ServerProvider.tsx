import { createContext, useState, useEffect } from "react";

export interface Channel {
    name: string,
    viewerCount: number
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

    const addError = (error: string) => {
        const clonedErrors = JSON.parse(JSON.stringify(errors));
        clonedErrors.push({
            error
        });
        setErrors(clonedErrors);
    }

    const loadChannels = async () => {
        console.log("Loading Channels...");
        const channelResponse = await fetch(`https://${serverIp}/stat/`);
        if (!channelResponse.ok) {
            addError("Error in channel response.")
            return;
        }
        const data: string = await channelResponse.text();
        setChannels(parseChannels(data))
    }

    const parseChannels = (data: string): Array<Channel> => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");

        // ✅ Example: Extract stream names
        const streams = xmlDoc.getElementsByTagName('stream');

        const streamList = Array.from(streams).map(stream => {
            const name = stream.getElementsByTagName('name')[0]?.textContent;
            const viewers = stream.getElementsByTagName('nclients')[0]?.textContent;
            return { name, viewerCount: parseInt(viewers || "0") } as Channel;
        });
        return streamList;
    }

    const getChannelURL = () => {
        return `https://${serverIp}/hls/${channels[currentChannel].name}.m3u8`
    }

    const getViewCount = async () => {
        const data = await fetch(`https://${serverIp}/viewers/`);
        if (data.ok) {
            const json = await data.json();
            setViewCount(json.viewerCount);
        }
    }

    useEffect(() => {
        loadChannels();
    }, []);

    useEffect(() => {
        setLoading(false);
        const interval = setInterval(getViewCount, 5000);
        return () => {
            clearInterval(interval);
        }
    }, [channels]);

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
                setCurrentChannel(channel - 1);
            },
            viewCount
        }}>
            {children}
        </serverContextInstance.Provider>
    )
}