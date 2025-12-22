import ReactPlayer from 'react-player'
import '../css/MediaPlayer.css';
import { getSizeValue } from '@/util/values';
import { useState } from 'react';
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
    const [volume, setVolume] = useState(1.0);
    const [muted, setMuted] = useState(true);

    const renderPlayButton = () => {
        return (
            <Tooltip content={playing ? 'Pause' : 'Play'}>
                <IconButton onClick={() => null} variant={playing ? 'subtle' : 'solid'}>
                    {playing ? <FaPause /> : <FaPlay />}
                </IconButton>
            </Tooltip>
        )
    }

    const renderVolumeControl = () => {
        return (
            <div className='volume-control-frame'>
                <Tooltip content={muted ? 'Unmute' : 'Mute'}>
                    <IconButton onClick={() => {
                        setMuted(!muted);
                    }} variant={'subtle'} aria-label="Search database">
                        {volume > 0.0 && !muted ? <FaVolumeHigh /> : <FaVolumeXmark />}
                    </IconButton>
                </Tooltip>
            </div>
        )
    }

    const renderSlider = () => {
        return (
            <div className='slider'>
                <Slider.Root disabled={muted} onValueChange={details => {
                    const val = details.value[0];
                    setVolume(val);
                }} max={1.0} min={0.0} step={0.02}>
                    <Slider.Control>
                        <Slider.Track>
                        <Slider.Range />
                        </Slider.Track>
                        <Slider.Thumb>
                            <Slider.DraggingIndicator />
                            <Slider.HiddenInput />
                        </Slider.Thumb>
                            <Slider.MarkerGroup>
                        <Slider.Marker />
                        </Slider.MarkerGroup>
                    </Slider.Control>
                </Slider.Root>
            </div>
        );
    }

    const renderFullscreenControl = () => {
        return (
            <Tooltip content="Fullscreen">
                <IconButton onClick={() => {
                    setMuted(!muted);
                }} variant={'subtle'} aria-label="Search database">
                    <RiFullscreenLine/>
                </IconButton>
            </Tooltip> 
        )
    }

    const renderControls = () => {
        return (
            <Flex gap={6}>
                <div className='control-section'>
                    {renderPlayButton()}
                    {renderVolumeControl()}
                    {renderFullscreenControl()}
                </div>
            </Flex>
        )
    }

    return (
        <div>
            <div className="player-frame" style={{
                width: isMobile ? '100%' : getSizeValue(size)
            }}>
                <ReactPlayer className='player-element' volume={volume} muted={muted} controls={false} height={'auto'} width={getSizeValue(size)} src={url} playing={playing}/>
            </div>
            <div className="control-frame">
                {renderControls()}
            </div>
        </div>
    );
}