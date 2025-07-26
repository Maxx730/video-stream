import { ServerProvider } from "@/provider/ServerProvider";
import { Main } from "../layouts/Main";

export const Root = () => {
    return (
        <ServerProvider>
            <Main/>
        </ServerProvider>
    )
}