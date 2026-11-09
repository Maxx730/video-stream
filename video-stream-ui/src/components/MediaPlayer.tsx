import ReactPlayer from 'react-player'
import '../css/MediaPlayer.css';
import { getSizeValue } from '@/util/values';
import { HolidayLights } from '@/components/HolidayLights';
import { SettingsContext } from '@/provider/SettingsProvider';
import { useContext, useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Flex, IconButton, Slider, Spinner } from '@chakra-ui/react';
import { Tooltip } from "@/components/ui/tooltip"
import { FaPause, FaPlay, FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6';
import { RiFullscreenLine } from "react-icons/ri";


export interface PlayerProps {
    url: string | undefined,
    title?: string,
    effect?: string,
    size?: string,
    playing?: boolean
}

const STREAM_SWITCH_DELAY = 500;
const LIGHTS_PADDING = 14; // matches .holiday-frame, keeps the video at its full size

export const MediaPlayer = ({ url, title, effect = 'NONE', size = 'Normal', playing = true }: PlayerProps) => {
    const { getBoolValue } = useContext(SettingsContext);
    const lightsOn = getBoolValue('holidayLights');
    const [ready, setReady] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [activeUrl, setActiveUrl] = useState<string | undefined>(undefined);
    // react-player re-applies muted and volume on every render, so they have to
    // track what the viewer chose or each re-render resets them.
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(1);

    const handleVolumeChange = (event: SyntheticEvent<HTMLVideoElement>) => {
        setMuted(event.currentTarget.muted);
        setVolume(event.currentTarget.volume);
    };

    useEffect(() => {
        setReady(false);
        const switchTimer = setTimeout(() => {
            setActiveUrl(url);
        }, STREAM_SWITCH_DELAY);
        return () => clearTimeout(switchTimer);
    }, [url]);

    return (
        <div className={lightsOn ? 'holiday-frame' : undefined} style={{ maxWidth: getSizeValue(size, lightsOn ? LIGHTS_PADDING * 2 : 0) }}>
            <div className="player-frame" style={{ width: '100%' }}>
                {title && <div className="player-title">{title}</div>}
                <div className="player-overlay" style={{ opacity: (!ready && hasLoaded) ? 1 : 0 }}>
                    {!ready && hasLoaded && (
                        <div className="player-loader">
                            <Spinner size="xl" color="white" />
                        </div>
                    )}
                </div>
                <ReactPlayer
                    className='player-element'
                    controls={true}
                    height={'100%'}
                    width={'100%'}
                    src={activeUrl}
                    playing={true}
                    muted={muted}
                    volume={volume}
                    onVolumeChange={handleVolumeChange}
                    onReady={() => setTimeout(() => {
                        setReady(true);
                        setHasLoaded(true);
                    }, 10)}
                />
            </div>
            {lightsOn && <HolidayLights />}
        </div>
    );
}