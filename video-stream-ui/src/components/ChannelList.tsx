import '../css/ChannelList.css';
import { useContext } from 'react';
import { serverContextInstance } from '@/provider/ServerProvider';
import { Table, IconButton, Tag, SegmentGroup } from '@chakra-ui/react';
import type { Channel } from '@/provider/ServerProvider';
import { FaEye } from "react-icons/fa6";

interface ChannelListProps {
    onChannelSelected: (channel: number) => void;
}

export const ChannelList = ({ onChannelSelected }: ChannelListProps) => {
    const { channels, currentChannel } = useContext(serverContextInstance);
    const isCurrentChannel = (name: string) => {
        const currentChannelName = channels[currentChannel].name;
        return name === currentChannelName;
    }
    return (
        <div className="channel-list-frame">
            <Table.ScrollArea borderWidth="1px" rounded="md">
                <Table.Root stickyHeader={true} key={"outline"} size="sm" variant={"outline"}>
                    <Table.Header>
                        <Table.ColumnHeader>Channel</Table.ColumnHeader>
                        <Table.ColumnHeader/>
                        <Table.ColumnHeader/>
                    </Table.Header>
                    <Table.Body>
                        {channels.map((channel: Channel) => {
                            return (
                                <Table.Row key={channel.name}>
                                    <Table.Cell>
                                        {!isCurrentChannel(channel.name) && 
                                        <IconButton onClick={() => {
                                            onChannelSelected(channels.indexOf(channel))
                                        }} disabled={isCurrentChannel(channel.name)} variant={'surface'} size={'xs'}>
                                            <FaEye />
                                        </IconButton>}
                                        {channel.name}
                                    </Table.Cell>
                                    <Table.Cell textAlign={'start'}></Table.Cell>
                                    <Table.Cell textAlign={"end"}>
                                        {isCurrentChannel(channel.name) && 
                                        <Tag.Root colorPalette={"red"}>
                                            <Tag.Label>Live</Tag.Label>
                                        </Tag.Root>}
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
        </div>
    )
}