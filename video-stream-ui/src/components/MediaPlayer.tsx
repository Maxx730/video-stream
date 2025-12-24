import ReactPlayer from 'react-player'
import '../css/MediaPlayer.css';
import { getSizeValue } from '@/util/values';
import { useEffect, useState } from 'react';
import { Flex, IconButton, Slider } from '@chakra-ui/react';
import { Tooltip } from "@/components/ui/tooltip"
import { FaPause, FaPlay, FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6';
import { RiFullscreenLine } from "react-icons/ri";


export interface PlayerProps {
    url: string,
    effect?: string,
    size?: string,
    playing?: boolean,
    isMobile?: boolean
}

export const MediaPlayer = ({ url, effect = 'NONE', size = 'Normal', playing = true, isMobile = false }: PlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setIsPlaying(true);
        }, 1000);
    });
    return (
        <div>
            <div className="player-frame" style={{
                width: isMobile ? '100%' : getSizeValue(size)
            }}>
                <ReactPlayer className='player-element' controls={true} height={'auto'} width={getSizeValue(size)} src={url} playing={isPlaying}/>
            </div>
        </div>
    );
}