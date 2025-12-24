import { createContext, useState } from 'react';
import { buildRequestURL } from '@/util/utils';

export interface Viewer {
    name: string,
    ping: Date,
    channel: string,
    current: boolean
}

export interface ViewerContextInstance {
    viewers: Array<Viewer>,
    getViewers: () => Promise<{ error: string } | Array<Viewer>>,
    updateViewers: (viewers: Viewer[]) => void,
    join: (key: string) => Promise<boolean>,
    watch: (key: string) => void,
    ping: () => void
}

export const ViewerContextDefault = {
    viewers: [],
    getViewers: () => Promise.resolve({ error: 'viewer provider not mounted' }),
    updateViewers: (viewers: Viewer[]) => {},
    join: () => Promise.resolve(false),
    watch: () => {},
    ping: () => {}
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const ViewerContext = createContext<ViewerContextInstance>(ViewerContextDefault);
export const ViewerProvider:React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    const [viewers, setViewers] = useState<Viewer[]>([]);

    const getViewers = async () => {
        const viewersResponse = await fetch(`${buildRequestURL('2277')}/viewers`);
        if (!viewersResponse.ok) {
            return Promise.resolve({
                error: 'unable to get viewers'
            });
        }
        const data = await viewersResponse.json();
        setViewers(data);
        return Promise.resolve(data);
    }
    const join = async (key: string) => {
        const joinResponse = await fetch(`${buildRequestURL('2277')}/join`, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ channel: key })
        });
        const data = await joinResponse.json();
        return Promise.resolve(data?.success);
    }
    const watch = async (key: string) => {
        const watchResponse = await fetch(`${buildRequestURL('2277')}/watch`, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ channel: key })
        });
        const data = await watchResponse.json();
        setViewers(data);
    }
    const ping = async () => {
        await fetch(`${buildRequestURL('2277')}/ping`);
    }

    return (
        <ViewerContext.Provider value={{
            viewers,
            getViewers,
            join,
            watch,
            updateViewers: (viewers: Viewer[]) => {
                setViewers(viewers);
            },
            ping
        }}>
            {children}
        </ViewerContext.Provider>
    )
}