'use client'

import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Alert,
  Button,
  Card,
  Form,
  Grid,
  Input,
  Select,
  Space,
  Typography,
} from 'antd'
import { EyeOutlined, UploadOutlined } from '@ant-design/icons'
import {
  UploadDateField,
  UploadTimeAnchorDuration,
} from '@/components/articles/article-upload-fields'
import {
  BroadcastVideoFileUpload,
  VIDEO_AUTO_FILL_HINT,
} from '@/components/articles/broadcast-video-file-upload'

const { Text } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

type BroadcastVariant = 'tv' | 'radio'

interface MediaOption {
  value: string
  label: string
}

interface DuplicateArticle {
  article_id: number
  title: string
  datee: string
  media_name: string
}

const VARIANT_CONFIG: Record<
  BroadcastVariant,
  {
    mediaLabel: string
    mediaPlaceholder: string
    mediaExtra: string
    badgeClass: string
    videoInfoText: string
    videoRemoveLabel: string
  }
> = {
  tv: {
    mediaLabel: 'Media (TV)',
    mediaPlaceholder: 'Select TV media',
    mediaExtra: 'Only TV media available',
    badgeClass: 'digivla-broadcast-upload-multi--tv',
    videoInfoText: 'Stored at: synology-disk/input/media_tv/[year]/[month]/[day]/[filename].mp4',
    videoRemoveLabel: 'Remove',
  },
  radio: {
    mediaLabel: 'Media (Radio)',
    mediaPlaceholder: 'Select radio media',
    mediaExtra: 'Only radio media available',
    badgeClass: 'digivla-broadcast-upload-multi--radio',
    videoInfoText: 'Stored at: synology-disk/input/media_radio/[year]/[month]/[day]/[filename].mp4',
    videoRemoveLabel: 'Delete',
  },
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function broadcastSingleFocusableSelector(): string {
  return '#broadcast-single-form input, #broadcast-single-form textarea, #broadcast-single-form .ant-picker-input input, #broadcast-single-form .ant-select-selection-search-input'
}

export interface BroadcastSingleUploadFormProps {
  variant: BroadcastVariant
  listHref: string
  mediaOptions: MediaOption[]
  selectedMedia: string | null
  onMediaChange: (value: string | null) => void
  title: string
  onTitleChange: (value: string) => void
  content: string
  onContentChange: (value: string) => void
  date: Date | null
  onDateChange: (date: Date | null) => void
  time: string
  onTimeChange: (value: string) => void
  journalist: string
  onJournalistChange: (value: string) => void
  duration: number | string
  onDurationChange: (value: number | string) => void
  file: File | null
  onFileDrop: (files: File[]) => void
  onRemoveFile: () => void
  duplicateWarning: { show: boolean; duplicates: DuplicateArticle[] }
  onViewDuplicates: () => void
  loading: boolean
  onReset: () => void
  onSubmit: () => void
}

export function BroadcastSingleUploadForm({
  variant,
  listHref,
  mediaOptions,
  selectedMedia,
  onMediaChange,
  title,
  onTitleChange,
  content,
  onContentChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  journalist,
  onJournalistChange,
  duration,
  onDurationChange,
  file,
  onFileDrop,
  onRemoveFile,
  duplicateWarning,
  onViewDuplicates,
  loading,
  onReset,
  onSubmit,
}: BroadcastSingleUploadFormProps) {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const config = VARIANT_CONFIG[variant]
  const wordCount = useMemo(() => countWords(content), [content])

  const handleEnterPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    const target = e.target as HTMLElement
    if (target.tagName === 'TEXTAREA') return
    e.preventDefault()
    const inputs = Array.from(document.querySelectorAll(broadcastSingleFocusableSelector()))
    const current = inputs.find((el) => el.contains(target) || el === target)
    if (!current) return
    const index = inputs.indexOf(current)
    if (index >= 0 && index < inputs.length - 1) {
      ;(inputs[index + 1] as HTMLElement).focus()
    }
  }, [])

  return (
    <div
      id="broadcast-single-form"
      className={`digivla-online-upload-single digivla-broadcast-upload-single ${config.badgeClass}`}
    >
      <Card variant="borderless" className="digivla-online-upload-form-card">
        <Form layout="vertical" className="digivla-online-upload-form">
          <Form.Item
            label="Title"
            required
            extra={VIDEO_AUTO_FILL_HINT}
            className="digivla-online-upload-field"
          >
            <Input
              placeholder="Article title (Enter for next field)"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={handleEnterPress}
              status={duplicateWarning.show ? 'warning' : undefined}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={config.mediaLabel}
            required
            extra={config.mediaExtra}
            className="digivla-online-upload-field"
          >
            <Select
              placeholder={config.mediaPlaceholder}
              value={selectedMedia || undefined}
              onChange={(v) => onMediaChange(v || null)}
              options={mediaOptions}
              showSearch
              optionFilterProp="label"
              size="large"
            />
          </Form.Item>

          {duplicateWarning.show && duplicateWarning.duplicates.length > 0 && (
            <Alert
              type="warning"
              showIcon
              className="digivla-online-upload-duplicate-alert"
              title={`Potential Duplicate(s) (${duplicateWarning.duplicates.length})`}
              description={
                <div>
                  {duplicateWarning.duplicates.slice(0, 2).map((dup, idx) => (
                    <div key={idx} className="digivla-online-upload-duplicate-line">
                      {dup.title} — {dup.media_name} ({dup.datee})
                    </div>
                  ))}
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    className="digivla-online-upload-duplicate-btn"
                    onClick={onViewDuplicates}
                  >
                    View Details
                  </Button>
                </div>
              }
            />
          )}

          <div className="digivla-online-upload-field">
            <UploadDateField value={date} onChange={onDateChange} required />
          </div>

          <UploadTimeAnchorDuration
            time={time}
            journalist={journalist}
            duration={duration}
            onTimeChange={onTimeChange}
            onJournalistChange={onJournalistChange}
            onDurationChange={onDurationChange}
            onKeyDown={handleEnterPress}
          />

          <Form.Item
            label="Article Content"
            className="digivla-online-upload-field digivla-online-upload-content-field"
          >
            <div className="digivla-online-upload-editor">
              <div className="digivla-online-upload-editor-toolbar">
                <Text type="secondary" className="digivla-online-upload-editor-toolbar-meta">
                  Shift+Enter for new line
                </Text>
              </div>
              <TextArea
                className="digivla-online-upload-editor-input"
                placeholder="Article content or summary..."
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                rows={isMobile ? 10 : 14}
              />
              <div className="digivla-online-upload-editor-status">
                <Text type="secondary">Words: {wordCount.toLocaleString()}</Text>
                <Text type="secondary">Characters: {content.length.toLocaleString()}</Text>
              </div>
            </div>
          </Form.Item>

          <Form.Item
            label="Video File (MP4)"
            className="digivla-online-upload-field digivla-broadcast-single-video-field"
            style={{ marginBottom: 0 }}
          >
            <BroadcastVideoFileUpload
              file={file}
              onDrop={onFileDrop}
              onRemove={onRemoveFile}
              infoText={config.videoInfoText}
              removeLabel={config.videoRemoveLabel}
            />
          </Form.Item>
        </Form>
      </Card>

      <div className="digivla-online-upload-footer">
        <Space wrap>
          <Button onClick={onReset} disabled={loading}>
            Reset
          </Button>
          <Link href={listHref}>
            <Button disabled={loading}>Cancel</Button>
          </Link>
        </Space>
        <Button
          type="primary"
          loading={loading}
          icon={<UploadOutlined />}
          onClick={onSubmit}
          className="digivla-online-upload-submit"
        >
          Upload & Continue
        </Button>
      </div>
    </div>
  )
}
