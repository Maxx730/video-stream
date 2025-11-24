import { Tabs } from "@chakra-ui/react"
import { ChannelList } from "./ChannelList";
import '../css/SideTabs.css';

export interface SideTabsProps {
    onChannelSelected: (key: string) => void;
}

export const SideTabs = ({ onChannelSelected }: SideTabsProps) => {

    const renderTabs = () => {
        return (
            <div className="side-tabs">
                <Tabs.Root fitted defaultValue="channels" variant="plain">
                    <Tabs.Content value="channels" _open={{
                        animationName: "fade-in, scale-in",
                        animationDuration: "300ms",
                    }} _closed={{
                        animationName: "fade-out, scale-out",
                        animationDuration: "120ms",
                    }}>
                        <ChannelList onChannelSelected={onChannelSelected}/>
                    </Tabs.Content>
                    <Tabs.Content value="chat" _open={{
                        animationName: "fade-in, scale-in",
                        animationDuration: "300ms",
                    }} _closed={{
                        animationName: "fade-out, scale-out",
                        animationDuration: "120ms",
                    }}></Tabs.Content>
                    <Tabs.Content value="settings" _open={{
                        animationName: "fade-in, scale-in",
                        animationDuration: "300ms",
                    }} _closed={{
                        animationName: "fade-out, scale-out",
                        animationDuration: "120ms",
                    }}></Tabs.Content>
                </Tabs.Root>
            </div>            
        )
    }

    return (
        <div className="side-tabs-frame">
            {renderTabs()}
        </div>
    )
}