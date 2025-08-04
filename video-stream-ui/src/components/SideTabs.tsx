import { Tabs } from "@chakra-ui/react"
import { ChannelList } from "./ChannelList";
import '../css/SideTabs.css';

export interface SideTabsProps {
    onChannelSelected: (channel: number) => void;
}

export const SideTabs = ({ onChannelSelected }: SideTabsProps) => {

    const renderTabs = () => {
        return (
            <div className="side-tabs">
                <Tabs.Root fitted defaultValue="channels" variant="plain">
                    <Tabs.List bg="bg.muted" rounded="l3" p="1">
                        <Tabs.Trigger value="channels">
                            Channels
                        </Tabs.Trigger>
                        <Tabs.Trigger value="chat">
                            Chat
                        </Tabs.Trigger>
                        <Tabs.Trigger value="settings">
                            Settings
                        </Tabs.Trigger>
                        <Tabs.Indicator rounded="l2" />
                    </Tabs.List>
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