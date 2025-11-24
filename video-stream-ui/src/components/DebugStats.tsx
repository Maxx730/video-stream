import { useContext } from "react";
import { serverContextInstance } from "@/provider/ServerProvider";

import './DebugStats.scss';

export default function DebugStats() {
    const { channels, errors, viewers, channel, getChannelURL, getCurrentViewer} = useContext(serverContextInstance);
    const renderChannels = () => {
        return (
            <div className='debug-channels'>{JSON.stringify(channels)}</div>
        )
    }
    const renderChannelPath = () => {
        return <div>{getChannelURL()}</div>
    }
    const renderErrors = () => {
        return <div className='debug-errors'>{JSON.stringify(errors)}</div>
    }
    const renderViewers = () => {
        return <div>{JSON.stringify(viewers)}</div>
    }
    const renderCurrentViewer = () => {
        return <div className='debug-current-viewer'>{JSON.stringify(getCurrentViewer())}</div>
    }
    return (
        <div className='debug-stats'>
            {renderChannels()}
            {renderErrors()}
            {renderViewers()}
            {channel > -1 && renderChannelPath()}
            {renderCurrentViewer()}
        </div>
    )
}