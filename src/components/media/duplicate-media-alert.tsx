'use client'

import Link from 'next/link'
import { Alert, Button, Descriptions, Space, Tag } from 'antd'
import { ExportOutlined } from '@ant-design/icons'

export type DuplicateMediaInfo = {
  media_id: number
  media_name: string
  status?: string
}

interface DuplicateMediaAlertProps {
  duplicate: DuplicateMediaInfo
  showViewLink?: boolean
}

export function DuplicateMediaAlert({ duplicate, showViewLink = true }: DuplicateMediaAlertProps) {
  return (
    <Alert
      type="warning"
      showIcon
      className="digivla-dup-alert"
      title="Duplicate media name detected"
      description={
        <div className="digivla-dup-alert-body">
          <p className="digivla-dup-alert-text">
            The name you entered is already registered in the system. Please use a different name or review the
            existing record below.
          </p>
          <Descriptions size="small" bordered column={1} className="digivla-dup-alert-desc">
            <Descriptions.Item label="Media ID">
              <Tag color="blue">#{duplicate.media_id}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Existing Name">
              <strong>{duplicate.media_name}</strong>
            </Descriptions.Item>
            {duplicate.status && (
              <Descriptions.Item label="Status">
                <Tag color={duplicate.status === 'Active' || duplicate.status === 'A' ? 'success' : 'default'}>
                  {duplicate.status === 'A' ? 'Active' : duplicate.status === 'N' ? 'Inactive' : duplicate.status}
                </Tag>
              </Descriptions.Item>
            )}
          </Descriptions>
          {showViewLink && (
            <Space style={{ marginTop: 12 }}>
              <Link href="/media/list">
                <Button size="small" icon={<ExportOutlined />}>
                  Open Media List
                </Button>
              </Link>
            </Space>
          )}
        </div>
      }
    />
  )
}
