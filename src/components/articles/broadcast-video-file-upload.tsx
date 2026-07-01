'use client'

import { Alert, App, Button, Upload } from 'antd'
import { DeleteOutlined, InboxOutlined } from '@ant-design/icons'
import {
  getMediaFileSizeLimitError,
  isMediaFileWithinSizeLimit,
  MAX_MEDIA_UPLOAD_LABEL,
} from '@/lib/storage/media-upload-limits'

const { Dragger } = Upload

export const VIDEO_AUTO_FILL_HINT =
  'Auto-filled from video filename (title, -HHmm time suffix e.g. -1120 → 11:20, duration from file)'

/** @deprecated use VIDEO_AUTO_FILL_HINT */
export const VIDEO_AUTO_FILL_TITLE_EXTRA = VIDEO_AUTO_FILL_HINT

interface BroadcastVideoFileUploadProps {
  file: File | null
  compact?: boolean
  onDrop: (files: File[]) => void
  onRemove: () => void
  infoText?: string
  removeLabel?: string
}

export function BroadcastVideoFileUpload({
  file,
  compact,
  onDrop,
  onRemove,
  infoText,
  removeLabel = 'Remove',
}: BroadcastVideoFileUploadProps) {
  const { message } = App.useApp()

  if (file) {
    return (
      <Alert
        type="success"
        showIcon
        className="digivla-broadcast-video-alert"
        title={file.name}
        description={`${(file.size / 1024 / 1024).toFixed(2)} MB${infoText ? ` — ${infoText}` : ''}`}
        action={
          <Button size="small" danger icon={<DeleteOutlined />} onClick={onRemove}>
            {removeLabel}
          </Button>
        }
      />
    )
  }

  return (
    <Dragger
      accept=".mp4,video/*"
      maxCount={1}
      showUploadList={false}
      className="digivla-broadcast-video-dragger"
      style={{ padding: compact ? 12 : 24 }}
      beforeUpload={(f) => {
        if (!isMediaFileWithinSizeLimit(f.size)) {
          message.warning(getMediaFileSizeLimitError())
          return Upload.LIST_IGNORE
        }
        onDrop([f])
        return false
      }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined style={{ color: '#1e3a5f', fontSize: compact ? 32 : 48 }} />
      </p>
      <p className="ant-upload-text">Drag MP4 file here or click to browse</p>
      <p className="ant-upload-hint">Max. {MAX_MEDIA_UPLOAD_LABEL}, MP4 format</p>
    </Dragger>
  )
}
