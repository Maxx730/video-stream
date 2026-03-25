import '../css/ChannelList.css';
import { useContext } from 'react';
import { serverContextInstance } from '@/provider/ServerProvider';
import { Table, IconButton, Tag, Text } from '@chakra-ui/react';
import type { Channel, Viewer } from '@/provider/ServerProvider';
import { FaEye } from "react-icons/fa6";

interface ChannelListProps {
    channels: Array<Channel>,
    onChannelSelected: (key: string) => void;
    getChannelCount: (key: string) => number;
}

export const ChannelList = ({ onChannelSelected, getChannelCount, channels }: ChannelListProps) => {
    return (
        <div className="channel-list-frame">
            <Table.ScrollArea borderWidth="1px" rounded="md">
                <Table.Root stickyHeader={true} key={"outline"} size="sm" variant={"outline"}>
                    <Table.Header>
                        <Table.ColumnHeader>Channels</Table.ColumnHeader>
                        <Table.ColumnHeader/>
                        <Table.ColumnHeader/>
                    </Table.Header>
                    <Table.Body>
                        {channels.length > 0 ? 
                        <>{channels.map((channel: Channel) => {
                            return (
                                <Table.Row key={channel.key}>
                                    <Table.Cell>
                                        <div className="channel-item">
                                            <IconButton onClick={() => {
                                                onChannelSelected(channel.key)
                                            }} disabled={false} variant={'surface'} size={'xs'}>
                                                <FaEye />
                                            </IconButton>
                                            <div className="channel-item-details">
                                                <span>{channel.key}</span>
                                                <span>{channel.desc || "No Description"}</span>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell textAlign={'start'}></Table.Cell>
                                    <Table.Cell textAlign={"end"}>
                                        <div className="channel-item-tags">
                                            <Tag.Root>
                                                <Tag.Label>{getChannelCount(channel.key)}</Tag.Label>
                                            </Tag.Root>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}</> : <></>}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
        </div>
    )
}