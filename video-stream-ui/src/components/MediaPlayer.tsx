import ReactPlayer from 'react-player'
import '../css/MediaPlayer.css';
import { getSizeValue } from '@/util/values';
import { useEffect, useState } from 'react';
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

export const MediaPlayer = ({ url, title, effect = 'NONE', size = 'Normal', playing = true }: PlayerProps) => {
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
        <div>
            <div className="player-frame" style={{
                width: '100%',
                maxWidth: getSizeValue(size)
            }}>
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
                    height={'auto'}
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
        </div>
    );
}