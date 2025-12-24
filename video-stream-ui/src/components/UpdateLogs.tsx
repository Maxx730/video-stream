import { Stack, Heading, List } from "@chakra-ui/react"

interface LogItem {
    description: string
}

interface UpdateLog {
    version: string,
    date: string,
    items: LogItem[]
}

export const UpdateLogs = () => {
    const logs: UpdateLog[] = [
        {
            version: '1.2.0',
            date: 'December 25th, 2025',
            items: [
                {
                    description: 'Update item 1'
                },
                {
                    description: 'Update item 2'
                },
                {
                    description: 'Update item 3'
                },
            ]
        },
        {
            version: '1.1.0',
            date: 'October 5th, 2025',
            items: [
                {
                    description: 'Update item 1'
                },
                {
                    description: 'Update item 2'
                },
                {
                    description: 'Update item 3'
                },
                {
                    description: 'Update item 4'
                }
            ]
        },
        {
            version: '1.0.0',
            date: 'June 15th, 2025',
            items: [
                {
                    description: 'Update item 1'
                },
                {
                    description: 'Update item 2'
                }
            ]
        }        
    ]
    return (
        <Stack paddingX={6} gap={6}>
            {logs.map(log => {
                return (
                    <Stack gap={4}>
                        <Stack gap={0}>
                            <Heading>{log.version}</Heading>
                            <Heading size='sm'>{log.date}</Heading>
                        </Stack>
                        <List.Root>
                            {
                                log.items.map(item => {
                                    return <List.Item>{item.description}</List.Item>
                                })
                            }
                        </List.Root>
                    </Stack>
                )
            })}
        </Stack>
    )
}