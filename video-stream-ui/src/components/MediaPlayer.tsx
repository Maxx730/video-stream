import ReactPlayer from 'react-player'
import '../css/MediaPlayer.css';
import { getSizeValue } from '@/util/values';
import { useState } from 'react';
import { Flex, HStack, Icon, IconButton, Slider } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import { FaVolumeHigh, FaVolumeOff, FaVolumeXmark } from 'react-icons/fa6';

export interface PlayerProps {
    url: string,
    effect?: string,
    size?: string
}

export const MediaPlayer = ({ url, effect = 'NONE', size = 'Normal' }: PlayerProps) => {
    const [volume, setVolume] = useState(0.5);
    const [muted, setMuted] = useState(false);

    const renderVolumeControl = () => {
        return (
            <div className='volume-control-frame'>
                <IconButton onClick={() => {
                    setMuted(!muted);
                }} variant={'ghost'} size={'xs'} aria-label="Search database">
                    {volume > 0.0 && !muted ? <FaVolumeHigh /> : <FaVolumeXmark />}
                </IconButton>
                <div className='slider'>
                    <Slider.Root disabled={muted} onValueChange={details => {
                        const val = details.value[0];
                        setVolume(val);
                    }} max={1.0} min={0.0} step={0.02}>
                        <Slider.Label />
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
            </div>
        )
    }

    const renderControls = () => {
        return (
            <Flex gap={6}>
                <div className='control-section'>
                    
                </div>
                <div className='control-section'>
                    {renderVolumeControl()}
                </div>
                <div className='control-section'>
                    
                </div>
            </Flex>
        )
    }

    return (
        <div>
            <div className="player-frame" style={{
                width: getSizeValue(size)
            }}>
                <ReactPlayer volume={volume} muted={muted} controls={false} height={'auto'} width={getSizeValue(size)} src={url}/>
            </div>
            <div className="control-frame">
                {renderControls()}
            </div>
        </div>
    );
}