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
  onToggleSelectAll,
  selectAllLabel,
  onSubmit,
}: ArticleUploadPreviewDrawerProps<T>) {
  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>Review Articles Before Upload</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: 12 }}>
            {selectedCount} article(s) selected
          </span>
        </div>
      }
      placement="top"
      open={open}
      onClose={onClose}
      size="85vh"
      destroyOnClose
      maskClosable={!loading}
      className="digivla-upload-preview-drawer"
      styles={ARTICLE_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={loading}
            icon={<UploadOutlined />}
            onClick={onSubmit}
            disabled={selectedCount === 0}
            style={{ minWidth: 160 }}
          >
            Upload {selectedCount} Article(s)
          </Button>
        </div>
      }
    >
      <div className="digivla-upload-preview-drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Text type="secondary" className="digivla-upload-preview-desc" style={{ fontSize: 13, color: '#64748b', lineHeight: '1.5' }}>
          Select the articles you want to upload. Review their metadata in the table below to ensure accuracy before submitting.
        </Text>
        <div className="digivla-upload-preview-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={onToggleSelectAll} style={{ borderRadius: 6 }}>
            {selectAllLabel}
          </Button>
        </div>
        <Table<T>
          rowKey="key"
          size="small"
          className="digivla-data-table digivla-upload-preview-table"
          scroll={{ x: 900, y: 'calc(85vh - 240px)' }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => onSelectionChange(keys),
          }}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          style={{ border: '1px solid #f1f5f9', borderRadius: 8, overflow: 'hidden' }}
        />
      </div>
    </Drawer>
  )
}
