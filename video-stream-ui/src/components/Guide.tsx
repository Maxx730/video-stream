import { useContext } from "react";
import { serverContextInstance } from "../provider/ServerProvider";

import '../css/Guide.css';

export const Guide = () => {
    const {channels, loading} = useContext(serverContextInstance);

    return (
        <div className="channels-frame">
        </div>
    );
}