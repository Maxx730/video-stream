import '../css/ChannelList.css';
import { useContext } from 'react';
import { serverContextInstance } from '@/provider/ServerProvider';
import { Table, IconButton, Tag, SegmentGroup } from '@chakra-ui/react';
import type { Channel, Viewer } from '@/provider/ServerProvider';
import { FaEye } from "react-icons/fa6";

interface ChannelListProps {
    onChannelSelected: (key: string) => void;
}

export const ChannelList = ({ onChannelSelected }: ChannelListProps) => {
    const { channels, getCurrentViewer, viewers } = useContext(serverContextInstance);
    const watchingChannel = (key: string) => {
        const currentViewer: Viewer = getCurrentViewer() as Viewer;
        if (currentViewer) {
            return key === currentViewer.channel;
        }
        return false;
    }
    const getWatchCount = (key: string) => {
        if (viewers) {
            return viewers.filter((viewer: { channel: string; }) => viewer.channel === key).length;
        } else {
            return 0;
        }
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
                                <Table.Row key={channel.key}>
                                    <Table.Cell>
                                        <div className="channel-item">
                                            <IconButton onClick={() => {
                                                onChannelSelected(channel.key)
                                            }} disabled={watchingChannel(channel.key)} variant={'surface'} size={'xs'}>
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
                                                <Tag.Label>{getWatchCount(channel.key)}</Tag.Label>
                                            </Tag.Root>
                                        </div>
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