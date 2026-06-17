'use client'

import { useMemo } from 'react'
import { Alert, Button, Drawer, Input, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CloseOutlined, LinkOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { ARTICLE_DRAWER_STYLES } from '@/lib/articles/article-list-helpers'
import { MAX_MULTI_UPLOAD_ARTICLES } from '@/lib/articles/article-multi-upload-limits'
import type { OnlineArticleScrapeResultItem, OnlineScrapeProgressState } from '@/lib/articles/online-article-scrape'
import { parseOnlineScrapeUrls } from '@/lib/articles/online-article-scrape'
import { OnlineScrapeProgress } from '@/components/articles/online-scrape-progress'

const { Text } = Typography
const { TextArea } = Input

interface OnlineScrapeUrlsDrawerProps {
  open: boolean
  loading: boolean
  progress: OnlineScrapeProgressState
  urlText: string
  results: OnlineArticleScrapeResultItem[] | null
  onUrlTextChange: (value: string) => void
  onClose: () => void
  onScrape: () => void
  onApply: () => void
}

export function OnlineScrapeUrlsDrawer({
  open,
  loading,
  progress,
  urlText,
  results,
  onUrlTextChange,
  onClose,
  onScrape,
  onApply,
}: OnlineScrapeUrlsDrawerProps) {
  const parsedUrls = useMemo(() => parseOnlineScrapeUrls(urlText), [urlText])
  const successCount = results?.filter((item) => item.success).length ?? 0

  const columns: ColumnsType<OnlineArticleScrapeResultItem> = [
    {
      title: 'URL',
      dataIndex: 'url',
      ellipsis: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="digivla-online-scrape-url-link">
          {url}
        </a>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 180,
      ellipsis: true,
      render: (title: string | null | undefined, row) => title || (row.success ? '—' : row.error || 'Failed'),
    },
    {
      title: 'Media',
      dataIndex: 'media_name',
      width: 120,
      ellipsis: true,
      render: (name: string | null | undefined) => name || '—',
    },
    {
      title: 'Date',
      dataIndex: 'datee',
      width: 100,
      render: (value: string | null | undefined) => value || '—',
    },
    {
      title: 'Pages',
      dataIndex: 'pages',
      width: 70,
      render: (value: number | null | undefined) => (value != null ? value : '—'),
    },
    {
      title: 'MM Col',
      dataIndex: 'mm_col',
      width: 70,
      render: (value: number | null | undefined) => (value != null ? value : '—'),
    },
    {
      title: 'Journalist',
      dataIndex: 'journalist',
      width: 120,
      ellipsis: true,
      render: (value: string | null | undefined) => value || '—',
    },
    {
      title: 'Status',
      dataIndex: 'success',
      width: 100,
      render: (success: boolean) =>
        success ? <Tag color="success">OK</Tag> : <Tag color="error">Failed</Tag>,
    },
  ]

  return (
    <Drawer
      title="Scrape Articles from URLs"
      placement="top"
      open={open}
      onClose={onClose}
      size="85vh"
      destroyOnClose
      maskClosable={!loading}
      className="digivla-online-scrape-drawer"
      styles={ARTICLE_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer digivla-online-scrape-drawer-footer">
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Space wrap>
            <Button
              icon={<ThunderboltOutlined />}
              loading={loading}
              onClick={onScrape}
              disabled={parsedUrls.length === 0}
            >
              Scrape {parsedUrls.length > 0 ? `(${parsedUrls.length})` : ''}
            </Button>
            <Button
              type="primary"
              onClick={onApply}
              disabled={loading || successCount === 0}
            >
              Fill Multi Upload ({successCount})
            </Button>
          </Space>
        </div>
      }
    >
      <div className="digivla-online-scrape-drawer-body">
        <Text type="secondary" className="digivla-online-scrape-desc">
          Paste article URLs (one per line). The system will fetch each page and auto-fill title, content,
          journalist, date, media, pages, MM column, and URL into Multi Upload forms.
        </Text>

        <Alert
          type="info"
          showIcon
          className="digivla-online-scrape-alert"
          title={`Max ${MAX_MULTI_UPLOAD_ARTICLES} URLs per scrape · ${parsedUrls.length} detected`}
          description="URLs are crawled one at a time with live progress. Media is matched from the article domain — review fields before uploading."
        />

        <OnlineScrapeProgress progress={progress} />

        <div className="digivla-online-scrape-input-wrap">
          <Text className="digivla-online-scrape-input-label">
            <LinkOutlined /> Article URLs
          </Text>
          <TextArea
            value={urlText}
            onChange={(e) => onUrlTextChange(e.target.value)}
            placeholder={'https://example.com/article-1\nhttps://example.com/article-2'}
            rows={8}
            disabled={loading}
            className="digivla-online-scrape-textarea"
          />
        </div>

        {results && results.length > 0 && (
          <Table<OnlineArticleScrapeResultItem>
            rowKey={(row) => row.url}
            size="small"
            className="digivla-data-table digivla-online-scrape-table"
            columns={columns}
            dataSource={results}
            pagination={false}
            scroll={{ x: 700, y: loading ? 'calc(85vh - 520px)' : 'calc(85vh - 420px)' }}
          />
        )}
      </div>
    </Drawer>
  )
}
