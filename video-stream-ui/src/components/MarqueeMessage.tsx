import '../css/MarqueeMessage.css';

export interface MarqueeMessageProps {
    message: string
}

export const MarqueeMessage = ({
    message = "Default Message"
}: MarqueeMessageProps) => {
    return(
        <div className='marqueeContainer'>
            <div className='marqueeContent'>
                {message}
            </div>
            <div className='marqueeContent'>
                {message}
            </div>
        </div>
    )
}