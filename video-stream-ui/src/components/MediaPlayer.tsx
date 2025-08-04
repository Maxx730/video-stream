import ReactPlayer from 'react-player'
import '../css/MediaPlayer.css';
import { getSizeValue } from '@/util/values';
import { useState } from 'react';
import { Flex, IconButton, Slider } from '@chakra-ui/react';
import { FaPause, FaPlay, FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6';
import { RiFullscreenLine } from "react-icons/ri";


export interface PlayerProps {
    url: string,
    effect?: string,
    size?: string,
    playing?: boolean
}

export const MediaPlayer = ({ url, effect = 'NONE', size = 'Normal', playing = true }: PlayerProps) => {
    const [volume, setVolume] = useState(1.0);
    const [muted, setMuted] = useState(true);

    const renderPlayButton = () => {
        return (
            <div>
                <IconButton onClick={() => setPlaying(!playing)} variant={playing ? 'subtle' : 'solid'}>
                    {playing ? <FaPause /> : <FaPlay />}
                </IconButton>
            </div>
        )
    }

    const renderVolumeControl = () => {
        return (
            <div className='volume-control-frame'>
                <IconButton onClick={() => {
                    setMuted(!muted);
                }} variant={'subtle'} aria-label="Search database">
                    {volume > 0.0 && !muted ? <FaVolumeHigh /> : <FaVolumeXmark />}
                </IconButton>
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

    const renderFullscreenButton = () => {
        return (
            <IconButton onClick={() => {
                setMuted(!muted);
            }} variant={'subtle'} aria-label="Search database">
                <RiFullscreenLine/>
            </IconButton>  
        )
    }

    const renderControls = () => {
        return (
            <Flex gap={6}>
                <div className='control-section'>
                    {renderPlayButton()}
                    {renderVolumeControl()}
                </div>
            </Flex>
        )
    }

    return (
        <div>
            <div className="player-frame" style={{
                width: getSizeValue(size)
            }}>
                <ReactPlayer volume={volume} muted={muted} controls={false} height={'auto'} width={getSizeValue(size)} src={url} playing={playing}/>
            </div>
            <div className="control-frame">
                {renderControls()}
            </div>
        </div>
    );
}