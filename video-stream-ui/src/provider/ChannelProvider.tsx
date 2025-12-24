import { createContext, useState, useEffect } from 'react';
import { buildRequestURL } from '@/util/utils';

export interface Channel {
    key: string,
    title: string,
    desc: string,
    path: string,
    started: Date,
}

export interface ChannelContextValue {
    getChannels: (mocks?: boolean, token?: string | null, dev?: boolean | null) => Promise<Channel[]> | Promise<void>;
    channelsLoading: boolean;
    setChannel: (key: string) => void;
    setChannels: (channels: Array<Channel>) => void;
    channels: Array<Channel>;
    channel: string | undefined;
}

const ChannelContextDefault: ChannelContextValue = {
    getChannels: async () => Promise.resolve(),
    channelsLoading: false,
    setChannel: () => {},
    setChannels: () => {},
    channels: [],
    channel: undefined
};

export const ChannelContext = createContext<ChannelContextValue>(ChannelContextDefault);
export const ChannelProvider: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    const [channelsLoading, setChannelsLoading] = useState<boolean>(true);
    const [channels, setChannels] = useState<Array<Channel>>([]);
    const [channel, setChannel] = useState<string | undefined>();

    const getChannels = async (mocks: boolean = false, token: string | null = null, dev: boolean | null = false) => {
        const channelResponse = await fetch(`${buildRequestURL('2276')}/${'channels'}${dev ? mocks ? `?mocks=true` : `?dev=true` : ''}`, {
            method: 'GET',
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        });
        if (!channelResponse.ok) {
            return Promise.reject();
        }
        const data: string = await channelResponse.text();
        const channels: Array<Channel> = JSON.parse(data);
        return Promise.resolve(channels);
    }

    useEffect(() => {
        setChannelsLoading(false);
    }, [channels]);

    return (
        <ChannelContext.Provider value={{
            getChannels,
            channelsLoading,
            setChannel,
            setChannels,
            channels,
            channel
        }}>
            {children}
        </ChannelContext.Provider>
    )
}
