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
    currentChannel: string,
    errors: Array<Error>,
    loading: boolean
};

const serverContextDefault = {
    serverIp: import.meta.env.DEV ? "localhost:8080" : "video.clam-tube.com",
    serverPort: "8080",
    channels: [],
    currentChannel: "connor_password",
    errors: [],
    loading: true
};
export const serverContextInstance = createContext<any>(serverContextDefault);

export const ServerProvider: React.FC<{
    children: React.ReactNode
}> = ({children}) => {

    const [serverIp] = useState(serverContextDefault.serverIp);
    const [serverPort] = useState(serverContextDefault.serverPort);
    const [channels, setChannels] = useState<Array<Channel>>(serverContextDefault.channels);
    const [currentChannel, setCurrentChannel] = useState(serverContextDefault.currentChannel);
    const [errors, setErrors] = useState(serverContextDefault.errors);
    const [loading, setLoading] = useState(serverContextDefault.loading);

    const addError = (error: string) => {
        const clonedErrors = JSON.parse(JSON.stringify(errors));
        clonedErrors.push({
            error
        });
        setErrors(clonedErrors);
    }

    const loadChannels = async () => {
        const channelResponse = await fetch(`https://${serverIp}/stat`);
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
        return `https://${serverIp}/hls/${currentChannel}.m3u8`
    }

    useEffect(() => {
        loadChannels();
    }, []);

    useEffect(() => {
        setLoading(false);
    }, [channels]);

    return (
        <serverContextInstance.Provider value={{
            serverIp,
            serverPort,
            channels,
            currentChannel,
            errors,
            loading,
            getChannelURL
        }}>
            {children}
        </serverContextInstance.Provider>
    )
}