import type { ReactNode } from 'react'
import type { ColumnsType } from 'antd/es/table'
import type { SortOrder } from 'antd/es/table/interface'
import { Button, Space, Tag, Typography } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { Media } from '@/lib/types/media'
import {
  formatMediaIdDisplay,
  tierColor,
} from '@/lib/media/media-list-helpers'
import { MediaStatusTag } from '@/components/media/media-status-tag'
import { HighlightSearchText } from '@/components/ui/highlight-search-text'

const { Text } = Typography

function EmptyCell() {
  return <span className="digivla-table-empty">—</span>
}

function WrapCell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="digivla-table-cell-wrap" title={title}>
      {children}
    </div>
  )
}

export interface MediaColumnHandlers {
  onEdit: (record: Media) => void
  onDelete: (record: Media) => void
  searchKeyword?: string
  idSortOrder?: SortOrder
}

export function buildMediaListColumns(handlers: MediaColumnHandlers): ColumnsType<Media> {
  const searchKeyword = handlers.searchKeyword?.trim() || ''

  return [
    {
      title: 'ID',
      dataIndex: 'media_id',
      width: 80,
      fixed: 'left',
      sorter: true,
      sortOrder: handlers.idSortOrder,
      className: 'digivla-table-col-id',
      showSorterTooltip: { title: 'Sort by media ID' },
      render: (id: number) => (
        <span className="digivla-media-id-cell" title={formatMediaIdDisplay(id)}>
          {formatMediaIdDisplay(id)}
        </span>
      ),
    },
    {
      title: 'Media Name',
      dataIndex: 'media_name',
      width: 240,
      ellipsis: true,
      render: (name: string) => (
        <WrapCell title={name}>
          <Text strong className="digivla-media-name">
            <HighlightSearchText
              text={name || ''}
              keyword={searchKeyword}
              matchMode="substring"
            />
          </Text>
        </WrapCell>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type_name',
      width: 120,
      responsive: ['md'],
      render: (v: string) =>
        v?.trim() ? (
          <WrapCell title={v.trim()}>
            <Text className="digivla-table-cell-muted">{v.trim()}</Text>
          </WrapCell>
        ) : (
          <EmptyCell />
        ),
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      width: 96,
      align: 'center',
      responsive: ['sm'],
      render: (tier: string) =>
        tier ? <Tag color={tierColor(tier)}>{tier}</Tag> : <EmptyCell />,
    },
    {
      title: 'Language',
      dataIndex: 'language',
      width: 88,
      align: 'center',
      responsive: ['lg'],
      render: (v: string) => (
        <Text className="digivla-table-cell-mono">{v?.trim() || 'IDN'}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 96,
      align: 'center',
      render: (s: string) => <MediaStatusTag status={s} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 88,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={0} className="digivla-table-actions">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label="Edit"
            onClick={() => handlers.onEdit(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            aria-label="Delete"
            onClick={() => handlers.onDelete(record)}
          />
        </Space>
      ),
    },
  ]
}
