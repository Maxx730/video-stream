import { Spinner } from '@chakra-ui/react';

import '../css/LoadingIndicator.css';

export function LoadingIndicator() {
    return (
        <div className='loading-indicator-frame'>
            <Spinner/>
        </div>
    )
}