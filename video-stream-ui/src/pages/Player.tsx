import { ServerProvider } from "@/provider/ServerProvider";
import { Main } from "../layouts/Main";

export const Player = () => {
    return (
        <div>
            <ServerProvider>
                <Main/>
            </ServerProvider>
        </div>
    )
}