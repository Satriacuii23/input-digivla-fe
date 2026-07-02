'use client'

import { useMemo } from 'react'
import { Alert, Button, Col, Drawer, Input, Row, Space, Table, Tag, Typography } from 'antd'
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
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 500 }}>
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
      width: 90,
      render: (success: boolean) =>
        success ? (
          <Tag color="success" style={{ borderRadius: 4, fontWeight: 500 }}>OK</Tag>
        ) : (
          <Tag color="error" style={{ borderRadius: 4, fontWeight: 500 }}>Failed</Tag>
        ),
    },
  ]

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThunderboltOutlined style={{ color: '#eab308' }} />
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>Scrape Articles from URLs</span>
        </div>
      }
      placement="top"
      open={open}
      onClose={onClose}
      size="85vh"
      destroyOnClose
      maskClosable={!loading}
      className="digivla-online-scrape-drawer"
      styles={ARTICLE_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderTop: '1px solid #f1f5f9', padding: '16px 24px' }}>
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Space wrap size={12}>
            <Button
              icon={<ThunderboltOutlined />}
              loading={loading}
              onClick={onScrape}
              disabled={parsedUrls.length === 0}
              style={{ borderRadius: 6 }}
            >
              Scrape {parsedUrls.length > 0 ? `(${parsedUrls.length})` : ''}
            </Button>
            <Button
              type="primary"
              onClick={onApply}
              disabled={loading || successCount === 0}
              style={{ minWidth: 180, borderRadius: 6 }}
            >
              Fill Multi Upload ({successCount})
            </Button>
          </Space>
        </div>
      }
    >
      <div className="digivla-online-scrape-drawer-body" style={{ padding: '4px 0' }}>
        <Row gutter={[24, 24]}>
          {/* Left Column: Instructions and Inputs */}
          <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Text type="secondary" style={{ display: 'block', fontSize: 13, lineHeight: 1.5, color: '#64748b', marginBottom: 12 }}>
                Paste article URLs (one per line). The system will fetch each page and auto-fill title, content,
                journalist, date, media, pages, MM column, and URL into Multi Upload forms.
              </Text>

              <Alert
                type="info"
                showIcon
                title={`Max ${MAX_MULTI_UPLOAD_ARTICLES} URLs per scrape`}
                description={
                  <span style={{ fontSize: 12, lineHeight: 1.4, display: 'block', marginTop: 2 }}>
                    URLs are crawled one by one with live progress. Currently <strong>{parsedUrls.length}</strong> URL(s) detected.
                  </span>
                }
                style={{ borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <LinkOutlined /> Article URLs
              </Text>
              <TextArea
                value={urlText}
                onChange={(e) => onUrlTextChange(e.target.value)}
                placeholder={'https://example.com/article-1\nhttps://example.com/article-2'}
                rows={12}
                disabled={loading}
                style={{ borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}
              />
            </div>
          </Col>

          {/* Right Column: Live Progress & Results Table */}
          <Col xs={24} lg={16} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Live Progress Bar */}
            <OnlineScrapeProgress progress={progress} />

            {/* Empty State */}
            {!results && progress.status === 'idle' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                border: '2px dashed #cbd5e1',
                borderRadius: 8,
                background: '#f8fafc',
                color: '#64748b',
                minHeight: 280,
                textAlign: 'center'
              }}>
                <ThunderboltOutlined style={{ fontSize: 36, color: '#94a3b8', marginBottom: 12 }} />
                <div style={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>No Active Scrape Session</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, maxWidth: 320 }}>
                  Enter article URLs on the left panel and click "Scrape" to start pulling articles in real time.
                </div>
              </div>
            )}

            {/* Results Table */}
            {results && results.length > 0 && (
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Scrape Results
                </h3>
                <Table<OnlineArticleScrapeResultItem>
                  rowKey={(row) => row.url}
                  size="small"
                  className="digivla-data-table digivla-online-scrape-table"
                  columns={columns}
                  dataSource={results}
                  pagination={false}
                  scroll={{ x: 700, y: 'calc(85vh - 350px)' }}
                  style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 8, overflow: 'hidden' }}
                />
              </div>
            )}
          </Col>
        </Row>
      </div>
    </Drawer>
  )
}
