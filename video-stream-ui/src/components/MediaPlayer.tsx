import ReactPlayer from 'react-player'
import '../css/MediaPlayer.css';
import { getSizeValue } from '@/util/values';

export interface PlayerProps {
    url: string,
    effect?: string,
    size?: string
}

export const MediaPlayer = ({ url, effect = 'NONE', size = 'Normal' }: PlayerProps) => {
    const getChannelInfo = () => {
        return (
            <div className="channel-overlay">

            </div>
        )
    }
    return (
        <div className="player-frame" style={{
            width: getSizeValue(size)
        }}>
            <ReactPlayer controls={true} height={'auto'} width={getSizeValue(size)} src={url}/>
            {getChannelInfo()}
        </div>
    );
}