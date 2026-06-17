'use client'

import { useEffect, useState } from 'react'
import { Alert, Card, Progress, Space, Typography } from 'antd'
import { CheckCircleOutlined, CloudUploadOutlined, LoadingOutlined } from '@ant-design/icons'

const { Text } = Typography

export type MultiUploadProgressPhase = 'file' | 'article'

export interface MultiUploadProgressState {
  current: number
  total: number
  status: 'idle' | 'uploading' | 'complete'
  formNumber?: number
  formTitle?: string
  phase?: MultiUploadProgressPhase
}

interface ArticleMultiUploadProgressProps {
  progress: MultiUploadProgressState
}

const MAX_PROGRESS_DOTS = 30

function getPhaseLabel(phase: MultiUploadProgressPhase | undefined): string {
  if (phase === 'file') return 'Uploading media file to server…'
  return 'Saving article data…'
}

function getProgressDotStates(total: number, current: number): boolean[] {
  const dotCount = Math.min(total, MAX_PROGRESS_DOTS)
  return Array.from({ length: dotCount }, (_, index) => {
    const threshold = Math.ceil(((index + 1) / dotCount) * total)
    return current >= threshold
  })
}

function getActiveProgressDotIndex(total: number, current: number): number {
  if (current >= total) return -1
  const dotCount = Math.min(total, MAX_PROGRESS_DOTS)
  const activeThreshold = current + 1
  return (
    Array.from({ length: dotCount }, (_, index) =>
      Math.ceil(((index + 1) / dotCount) * total) === activeThreshold ? index : -1,
    ).find((index) => index >= 0) ?? Math.min(current, dotCount - 1)
  )
}

export function createIdleMultiUploadProgress(): MultiUploadProgressState {
  return { current: 0, total: 0, status: 'idle' }
}

export function ArticleMultiUploadProgress({ progress }: ArticleMultiUploadProgressProps) {
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
        title="Upload complete!"
        description={`All ${progress.total} selected article(s) have been processed sequentially.`}
        className="digivla-upload-progress-alert digivla-upload-progress-alert--complete"
      />
    )
  }

  const formLabel = progress.formNumber ? `Form ${progress.formNumber}` : 'Article'
  const titleSnippet =
    progress.formTitle && progress.formTitle.length > 48
      ? `${progress.formTitle.slice(0, 48)}…`
      : progress.formTitle

  const dotStates = getProgressDotStates(progress.total, progress.current)
  const activeDotIndex = getActiveProgressDotIndex(progress.total, progress.current)

  return (
    <Card className="digivla-upload-progress-card" variant="borderless">
      <div className="digivla-upload-progress-card-inner">
        <div className="digivla-upload-progress-header">
          <Space align="center" size={12}>
            <span className="digivla-upload-progress-spinner" aria-hidden>
              <LoadingOutlined spin />
            </span>
            <div>
              <Text strong className="digivla-upload-progress-title">
                Uploading articles sequentially
              </Text>
              <div className="digivla-upload-progress-subtitle">
                {formLabel}
                {titleSnippet ? ` · ${titleSnippet}` : ''}
              </div>
            </div>
          </Space>
          <Space orientation="vertical" align="end" size={0}>
            <Text className="digivla-upload-progress-count">
              {progress.current} / {progress.total}
            </Text>
            <Text type="secondary" className="digivla-upload-progress-phase">
              <CloudUploadOutlined /> {getPhaseLabel(progress.phase)}
            </Text>
          </Space>
        </div>

        <Progress
          percent={displayPercent}
          status="active"
          strokeColor={{ from: '#1e3a5f', to: '#52c41a' }}
          className="digivla-upload-progress-bar"
          format={(pct) => `${pct ?? 0}%`}
        />

        <div className="digivla-upload-progress-track" aria-hidden>
          {dotStates.map((done, index) => (
            <span
              key={index}
              className={[
                'digivla-upload-progress-dot',
                done ? 'digivla-upload-progress-dot--done' : '',
                index === activeDotIndex ? 'digivla-upload-progress-dot--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
