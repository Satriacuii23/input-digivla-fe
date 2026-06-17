'use client'

import { Button, Drawer, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Key } from 'react'
import { AppstoreOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons'
import { ARTICLE_DRAWER_STYLES } from '@/lib/articles/article-list-helpers'

const { Text } = Typography

interface ArticleUploadPreviewDrawerProps<T extends object> {
  open: boolean
  loading: boolean
  selectedCount: number
  columns: ColumnsType<T>
  dataSource: T[]
  selectedRowKeys: Key[]
  onSelectionChange: (keys: Key[]) => void
  onClose: () => void
  onBatch?: () => void
  onToggleSelectAll: () => void
  selectAllLabel: string
  onSubmit: () => void
}

export function ArticleUploadPreviewDrawer<T extends object>({
  open,
  loading,
  selectedCount,
  columns,
  dataSource,
  selectedRowKeys,
  onSelectionChange,
  onClose,
  onBatch,
  onToggleSelectAll,
  selectAllLabel,
  onSubmit,
}: ArticleUploadPreviewDrawerProps<T>) {
  return (
    <Drawer
      title="Review Articles Before Upload"
      placement="top"
      open={open}
      onClose={onClose}
      size="85vh"
      destroyOnClose
      maskClosable={!loading}
      className="digivla-upload-preview-drawer"
      styles={ARTICLE_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer">
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={loading}
            icon={<UploadOutlined />}
            onClick={onSubmit}
            disabled={selectedCount === 0}
          >
            Upload {selectedCount} Article(s)
          </Button>
        </div>
      }
    >
      <div className="digivla-upload-preview-drawer-body">
        <Text type="secondary" className="digivla-upload-preview-desc">
          {onBatch
            ? 'Select articles to upload. Use Batch to apply the same media and date to selected rows.'
            : 'Select articles to upload.'}
        </Text>
        <Space className="digivla-upload-preview-toolbar" wrap>
          {onBatch ? (
            <Button icon={<AppstoreOutlined />} onClick={onBatch}>
              Batch
            </Button>
          ) : null}
          <Button onClick={onToggleSelectAll}>{selectAllLabel}</Button>
        </Space>
        <Table<T>
          rowKey="key"
          size="small"
          className="digivla-data-table digivla-upload-preview-table"
          scroll={{ x: 900, y: 'calc(85vh - 220px)' }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => onSelectionChange(keys),
          }}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
      </div>
    </Drawer>
  )
}
