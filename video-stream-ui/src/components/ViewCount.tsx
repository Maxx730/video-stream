import { Icon, Tag } from "@chakra-ui/react"
import { FiEye } from "react-icons/fi"

interface ViewCountProps {
    count?: number
}

export const ViewCount = ({ count = 0 }: ViewCountProps) => {
    return (
        <div>
          <Tag.Root size="lg" colorPalette={'red'}>
            <Tag.Label>{count}</Tag.Label>
            <Icon>
                <FiEye/>
            </Icon>
          </Tag.Root>
        </div>
    )
}