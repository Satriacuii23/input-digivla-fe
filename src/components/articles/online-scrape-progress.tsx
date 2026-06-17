'use client'

import { useEffect, useState } from 'react'
import { Alert, Card, Progress, Space, Typography } from 'antd'
import { CheckCircleOutlined, GlobalOutlined, LoadingOutlined } from '@ant-design/icons'
import {
  formatScrapeDuration,
  formatScrapeEta,
  type OnlineScrapeProgressState,
} from '@/lib/articles/online-article-scrape'

const { Text } = Typography

interface OnlineScrapeProgressProps {
  progress: OnlineScrapeProgressState
}

function truncateUrl(url: string, max = 56): string {
  if (url.length <= max) return url
  return `${url.slice(0, max)}…`
}

export function OnlineScrapeProgress({ progress }: OnlineScrapeProgressProps) {
  const [displayPercent, setDisplayPercent] = useState(0)

  const targetPercent =
    progress.total > 0
      ? progress.status === 'complete'
        ? 100
        : Math.round((progress.current / progress.total) * 100)
      : 0

  useEffect(() => {
    if (progress.status === 'idle') {
      setDisplayPercent(0)
      return
    }
    const timer = window.setTimeout(() => setDisplayPercent(targetPercent), 60)
    return () => window.clearTimeout(timer)
  }, [targetPercent, progress.status])

  if (progress.status === 'idle') return null

  if (progress.status === 'complete') {
    return (
      <Alert
        type="success"
        showIcon
        icon={<CheckCircleOutlined className="digivla-upload-progress-complete-icon" />}
        title="Scrape complete"
        description={`${progress.successCount} of ${progress.total} URL(s) scraped successfully${progress.failedCount > 0 ? ` · ${progress.failedCount} failed` : ''} · ${formatScrapeDuration(progress.elapsedMs)} total`}
        className="digivla-upload-progress-alert digivla-upload-progress-alert--complete"
      />
    )
  }

  const avgMs =
    progress.current > 0 ? Math.round(progress.elapsedMs / progress.current) : null

  return (
    <Card className="digivla-upload-progress-card digivla-scrape-progress-card" variant="borderless">
      <div className="digivla-upload-progress-card-inner">
        <div className="digivla-upload-progress-header">
          <Space align="center" size={12}>
            <span className="digivla-upload-progress-spinner" aria-hidden>
              <LoadingOutlined spin />
            </span>
            <div>
              <Text strong className="digivla-upload-progress-title">
                Crawling articles…
              </Text>
              <div className="digivla-upload-progress-subtitle">
                {progress.currentUrl ? truncateUrl(progress.currentUrl) : 'Preparing…'}
              </div>
            </div>
          </Space>
          <Space orientation="vertical" align="end" size={0}>
            <Text className="digivla-upload-progress-count">
              {progress.current} / {progress.total}
            </Text>
            <Text type="secondary" className="digivla-upload-progress-phase">
              <GlobalOutlined /> {formatScrapeEta(progress.estimatedRemainingMs)}
            </Text>
          </Space>
        </div>

        <Progress
          percent={displayPercent}
          status="active"
          strokeColor={{ from: '#1e3a5f', to: '#2a4a73' }}
          className="digivla-upload-progress-bar"
          format={(pct) => `${pct ?? 0}%`}
        />

        <div className="digivla-scrape-progress-meta">
          <Text type="secondary">
            Elapsed {formatScrapeDuration(progress.elapsedMs)}
            {avgMs != null ? ` · ~${formatScrapeDuration(avgMs)} per URL` : ''}
          </Text>
          <Text type="secondary">
            OK {progress.successCount}
            {progress.failedCount > 0 ? ` · Failed ${progress.failedCount}` : ''}
          </Text>
        </div>
      </div>
    </Card>
  )
}
