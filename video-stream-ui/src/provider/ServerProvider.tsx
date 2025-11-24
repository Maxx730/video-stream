import { createContext, useState, useEffect, useRef } from "react";

export interface Channel {
    key: string,
    title: string,
    desc: string,
    path: string,
    started: Date,
}

export interface Viewer {
    name: string,
    ping: Date,
    channel: string,
    current: boolean
}

export interface Error {
    error: string
}

export interface ServerContext {
    serverIp: string,
    serverPort: string,
    channels: Array<Channel>,
    viewers: Array<Viewer>,
    currentChannel: Channel | null,
    errors: Array<Error>,
    loading: boolean
};

const serverContextDefault = {
    serverIp: "video.clam-tube.com",
    serverPort: "3000",
    channels: [],
    currentChannel: null,
    errors: [],
    loading: true
};
export const serverContextInstance = createContext<any>(serverContextDefault);
export const CHANNEL_UPDATE_DELTA: number = 30000;
const VIEW_PING_FREQUENCY: number = 5000;
const JSON_HEADERS = { 'Content-Type': 'application/json' }
let pingInterval: number | null = null;

export const ServerProvider: React.FC<{
    children: React.ReactNode
}> = ({children}) => {
    const [serverIp] = useState(serverContextDefault.serverIp);
    const [serverPort] = useState(serverContextDefault.serverPort);
    const [channels, setChannels] = useState<Array<Channel>>(serverContextDefault.channels);
    const [channel, setChannel] = useState<number>(-1);
    const [errors, setErrors] = useState(serverContextDefault.errors);
    const [viewers, setViewers] = useState<Array<Viewer>>();

    const addError = (error: string) => {
        const clonedErrors = JSON.parse(JSON.stringify(errors));
        clonedErrors.push({
            error
        });
        setErrors(clonedErrors);
    }

    // CHANNELS
    const getChannels = async () => {
        const channelResponse = await fetch(`https://${serverIp}/channels`);
        if (!channelResponse.ok) {
            addError("Error loading channels...");
        }
        const data: string = await channelResponse.text();
        const channels: Array<Channel> = JSON.parse(data);
        return channels;
    }
    const getChannelURL = () => {
        return `http://video.clam-tube.com${channels[channel].path}`;
    }

    // VIEWERS
    const getViewers = async () => {
        const viewersResponse = await fetch(`/viewers`);
        if (!viewersResponse.ok) {
            addError('Error loading viewers...');
        }
        const data = await viewersResponse.json();
        return data;
    }
    const getPing = async () => {
        const pingResponse = await fetch(`/ping`);
        if (!pingResponse.ok) {
            addError(`ERROR: Error pinging...`);
        }
        const data = await pingResponse.json();
        setViewers(data);
    }
    const getCurrentViewer = () => {
        if (viewers) {
            return viewers.find(viewer => viewer.current);
        }
        return null;
    }

    // ACTIONS
    const join = async (key: string) => {
            const joinResponse = await fetch(`http://${serverIp}:2277/join`, {
                method: 'POST',
                headers: JSON_HEADERS,
                body: JSON.stringify({ channel: key })
            });
            try {
                const data = await joinResponse.json();
                return data;
            } catch(err) {
                addError(`ERROR: ${err}`);
                return;
            }
    }
    const watch = async (key: string) => {
        const watchResponse = await fetch(`/watch`, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ channel: key })
        });
        const data = await watchResponse.json();
        setViewers(data);
    }

    const setup = async () => {
        try {
            const allChannels = await getChannels();
            if (allChannels && allChannels.length > 0 && Object.hasOwn(allChannels[0] as Object, "key")) {
                const firstChannel: Channel = allChannels[0] as Channel;
                await join(firstChannel.key);
                setChannel(0);
            }
            setChannels(allChannels as Channel[]);

            const allViewers = await getViewers();
            setViewers(allViewers as Viewer[]);
            pingInterval = setInterval(() => {
                const updatedData = getPing();
            }, VIEW_PING_FREQUENCY);
        } catch(err) {
            addError(`ERROR: ${err}`);
        }
    }

    useEffect(() => {
        setup();
        return () => {
            if (pingInterval) {
                clearInterval(pingInterval);
            }
        }
    }, []);

    return (
        <serverContextInstance.Provider value={{
            serverIp,
            serverPort,
            channels,
            errors,
            channel,
            viewers,
            watch,

            getChannelURL,
            getCurrentViewer
        }}>
            {children}
        </serverContextInstance.Provider>
    )
}