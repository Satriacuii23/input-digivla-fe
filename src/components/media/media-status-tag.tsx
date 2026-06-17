import { Tag } from 'antd'
import { isMediaActive } from '@/lib/media/media-list-helpers'

export function MediaStatusTag({ status }: { status: string | undefined }) {
  const active = isMediaActive(status)
  return <Tag color={active ? 'success' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
}
