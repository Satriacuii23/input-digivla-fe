'use client'

import { useEffect, useState } from 'react'
import { Progress, Space, Typography } from 'antd'
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

function truncateUrl(url: string, max = 50): string {
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
      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
        <CheckCircleOutlined style={{ color: '#10b981', fontSize: 20, marginTop: 2 }} />
        <div>
          <h4 style={{ color: '#065f46', fontWeight: 600, margin: '0 0 4px 0', fontSize: 14 }}>Scrape Complete</h4>
          <div style={{ color: '#047857', fontSize: 13, lineHeight: 1.5 }}>
            Successfully scraped <strong>{progress.successCount}</strong> of <strong>{progress.total}</strong> URL(s).
            {progress.failedCount > 0 && (
              <span> (Failed: <strong style={{ color: '#b91c1c' }}>{progress.failedCount}</strong>)</span>
            )}
            <span> · Total duration: <strong>{formatScrapeDuration(progress.elapsedMs)}</strong>.</span>
          </div>
        </div>
      </div>
    )
  }

  const avgMs =
    progress.current > 0 ? Math.round(progress.elapsedMs / progress.current) : null

  // Calculate estimated completion wall-clock time
  let estimatedFinishTime = ''
  if (progress.estimatedRemainingMs != null) {
    const finishDate = new Date(Date.now() + progress.estimatedRemainingMs)
    const hours = String(finishDate.getHours()).padStart(2, '0')
    const minutes = String(finishDate.getMinutes()).padStart(2, '0')
    const seconds = String(finishDate.getSeconds()).padStart(2, '0')
    estimatedFinishTime = `${hours}:${minutes}:${seconds} WIB`
  }

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <LoadingOutlined spin style={{ color: '#1e3a5f', fontSize: 18 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Crawling Articles...</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, wordBreak: 'break-all', maxWidth: 400 }} title={progress.currentUrl || ''}>
              {progress.currentUrl ? truncateUrl(progress.currentUrl) : 'Preparing...'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{progress.current} / {progress.total}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4, marginTop: 4, display: 'inline-block' }}>
            <GlobalOutlined /> {formatScrapeEta(progress.estimatedRemainingMs)}
          </div>
        </div>
      </div>

      <Progress
        percent={displayPercent}
        status="active"
        strokeColor={{ from: '#1e3a5f', to: '#2a4a73' }}
        style={{ marginBottom: 12 }}
        format={(pct) => <span style={{ fontWeight: 600, fontSize: 12, color: '#1e3a5f' }}>{pct}%</span>}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 10, fontSize: 12, color: '#64748b' }}>
        <div>
          Elapsed: <strong>{formatScrapeDuration(progress.elapsedMs)}</strong>
          {avgMs != null && <span> · ~<strong>{formatScrapeDuration(avgMs)}</strong> per URL</span>}
        </div>
        {estimatedFinishTime && (
          <div>
            Est. selesai: <strong style={{ color: '#0f172a' }}>{estimatedFinishTime}</strong>
          </div>
        )}
      </div>
    </div>
  )
}
