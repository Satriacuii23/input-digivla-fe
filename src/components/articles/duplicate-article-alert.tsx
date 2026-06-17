'use client'

import { Alert, Badge, Button, Card, Space, Typography } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { formatArticleDateLong, formatCreatedAtDisplay, type DuplicateArticleMatch } from '@/lib/articles/article-list-helpers'

const { Text, Paragraph } = Typography

interface DuplicateArticleListProps {
  duplicates: DuplicateArticleMatch[]
  onPreview?: (duplicate: DuplicateArticleMatch) => void
}

export function DuplicateArticleList({ duplicates, onPreview }: DuplicateArticleListProps) {
  return (
    <div className="digivla-dup-article-list">
      {duplicates.map((dup) => (
        <Card key={dup.article_id} size="small" className="digivla-dup-article-card">
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
              <Badge count={`#${dup.article_id}`} style={{ backgroundColor: '#faad14' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dup.created_at ? formatCreatedAtDisplay(dup.created_at) : '—'}
              </Text>
            </Space>
            <Text strong>{dup.title}</Text>
            <Space size="small" wrap>
              <Text type="secondary">{dup.media_name || '—'}</Text>
              {dup.datee && <Text type="secondary">· {formatArticleDateLong(dup.datee)}</Text>}
            </Space>
            {dup.content_preview && (
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                style={{ marginBottom: 0, fontSize: 12 }}
              >
                {dup.content_preview}
              </Paragraph>
            )}
            {onPreview && (
              <Button size="small" icon={<EyeOutlined />} onClick={() => onPreview(dup)}>
                Preview
              </Button>
            )}
          </Space>
        </Card>
      ))}
    </div>
  )
}

interface DuplicateArticleAlertProps {
  duplicates: DuplicateArticleMatch[]
  onPreview?: (duplicate: DuplicateArticleMatch) => void
}

export function DuplicateArticleAlert({ duplicates, onPreview }: DuplicateArticleAlertProps) {
  return (
    <Alert
      type="warning"
      showIcon
      className="digivla-dup-alert"
      title={`${duplicates.length} similar article(s) found`}
      description={
        <div className="digivla-dup-alert-body">
          <p className="digivla-dup-alert-text">
            Articles with matching title or content already exist. Review the records below before
            uploading or editing.
          </p>
          <DuplicateArticleList duplicates={duplicates} onPreview={onPreview} />
        </div>
      }
    />
  )
}
