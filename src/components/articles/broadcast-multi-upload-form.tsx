'use client'

import { memo, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Grid,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  AppstoreOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  UploadDateField,
  UploadTimeAnchorDuration,
} from '@/components/articles/article-upload-fields'
import { BroadcastVideoFileUpload, VIDEO_AUTO_FILL_HINT } from '@/components/articles/broadcast-video-file-upload'
import { isArticleUploadFormReady } from '@/lib/articles/article-upload-validation'
import {
  canAddMoreMultiUploadArticles,
  MAX_MULTI_UPLOAD_ARTICLES,
  multiUploadCountLabel,
} from '@/lib/articles/article-multi-upload-limits'
import { ToolbarIconButton } from '@/components/ui/toolbar-icon-button'
import { UploadFormSkeleton } from '@/components/ui/page-loading'
import {
  ArticleMultiUploadProgress,
  type MultiUploadProgressState,
} from '@/components/articles/article-multi-upload-progress'

const { Text } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

type BroadcastVariant = 'tv' | 'radio'

interface MediaOption {
  value: string
  label: string
}

export interface BroadcastMultiFormValues {
  media_id: string | null
  title: string
  content: string
  date: Date | null
  time: string
  journalist: string
  duration: number | string
  file: File | null
  filePath: string
}

const VARIANT_CONFIG: Record<
  BroadcastVariant,
  { mediaLabel: string; mediaPlaceholder: string; badgeClass: string }
> = {
  tv: {
    mediaLabel: 'Media (TV)',
    mediaPlaceholder: 'Select TV media',
    badgeClass: 'digivla-broadcast-upload-multi--tv',
  },
  radio: {
    mediaLabel: 'Media (Radio)',
    mediaPlaceholder: 'Select radio media',
    badgeClass: 'digivla-broadcast-upload-multi--radio',
  },
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function isBroadcastFormReady(values: BroadcastMultiFormValues): boolean {
  return isArticleUploadFormReady(values) && Boolean(values.file)
}

export const BroadcastMultiFormCard = memo(function BroadcastMultiFormCard({
  variant,
  index,
  mediaOptions,
  values,
  onFieldChange,
  onRemove,
  canRemove,
  onFileDrop,
  onRemoveFile,
  hasDuplicate,
  duplicateCount,
  onViewDuplicate,
  onEnterPress,
}: {
  variant: BroadcastVariant
  index: number
  mediaOptions: MediaOption[]
  values: BroadcastMultiFormValues
  onFieldChange: (field: keyof BroadcastMultiFormValues, value: unknown) => void
  onRemove: () => void
  canRemove: boolean
  onFileDrop: (files: File[]) => void
  onRemoveFile: () => void
  hasDuplicate?: boolean
  duplicateCount?: number
  onViewDuplicate?: () => void
  onEnterPress?: (e: React.KeyboardEvent) => void
}) {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const config = VARIANT_CONFIG[variant]
  const wordCount = useMemo(() => countWords(values.content), [values.content])
  const isReady = isBroadcastFormReady(values)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return
      const target = e.target as HTMLElement
      if (target.tagName === 'TEXTAREA') return
      e.preventDefault()
      onEnterPress?.(e)
    },
    [onEnterPress],
  )

  const cardTitle = values.title.trim() || `Article #${index + 1}`

  return (
    <Card
      id={`multi-form-${index}`}
      size="small"
      className="digivla-online-upload-multi-card"
      title={
        <div className="digivla-online-upload-multi-card-head">
          <Badge count={index + 1} className="digivla-online-upload-multi-badge" />
          <span className="digivla-online-upload-multi-card-title" title={cardTitle}>
            {cardTitle}
          </span>
        </div>
      }
      extra={
        <Space size={4} wrap className="digivla-online-upload-multi-card-extra">
          {isReady ? (
            <Tag color="success" className="digivla-online-upload-multi-tag">
              Ready
            </Tag>
          ) : (
            <Tag className="digivla-online-upload-multi-tag">Incomplete</Tag>
          )}
          {values.file ? (
            <Tag color="processing" className="digivla-online-upload-multi-tag">
              Video
            </Tag>
          ) : null}
          {hasDuplicate ? (
            <Tag
              color="warning"
              className="digivla-online-upload-multi-tag digivla-online-upload-multi-tag--clickable"
              onClick={onViewDuplicate}
            >
              Duplicate{duplicateCount ? ` (${duplicateCount})` : ''}
            </Tag>
          ) : null}
          {canRemove ? (
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              aria-label="Remove article"
              onClick={onRemove}
            />
          ) : null}
        </Space>
      }
    >
      <Form layout="vertical" size="middle" className="digivla-online-upload-form digivla-online-upload-multi-form">
        <Form.Item
          label="Title"
          required
          extra={VIDEO_AUTO_FILL_HINT}
          className="digivla-online-upload-field"
        >
          <Input
            placeholder="Article title (Enter for next field)"
            value={values.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            onKeyDown={handleKeyDown}
            status={hasDuplicate ? 'warning' : undefined}
          />
        </Form.Item>

        <Form.Item label={config.mediaLabel} required className="digivla-online-upload-field">
          <Select
            placeholder={config.mediaPlaceholder}
            value={values.media_id || undefined}
            onChange={(v) => onFieldChange('media_id', v || null)}
            options={mediaOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        {hasDuplicate && duplicateCount && duplicateCount > 0 && (
          <Alert
            type="warning"
            showIcon
            className="digivla-online-upload-duplicate-alert digivla-online-upload-multi-duplicate-alert"
            title={`${duplicateCount} similar article(s) found`}
            action={
              onViewDuplicate ? (
                <Button size="small" icon={<EyeOutlined />} onClick={onViewDuplicate}>
                  View
                </Button>
              ) : undefined
            }
          />
        )}

        <div className="digivla-online-upload-field">
          <UploadDateField value={values.date} onChange={(d) => onFieldChange('date', d)} required />
        </div>

        <UploadTimeAnchorDuration
          time={values.time}
          journalist={values.journalist}
          duration={values.duration}
          onTimeChange={(v) => onFieldChange('time', v)}
          onJournalistChange={(v) => onFieldChange('journalist', v)}
          onDurationChange={(v) => onFieldChange('duration', v)}
          onKeyDown={handleKeyDown}
        />

        <Form.Item
          label="Article Content"
          className="digivla-online-upload-field digivla-online-upload-content-field"
        >
          <div className="digivla-online-upload-editor digivla-online-upload-editor--compact">
            <TextArea
              className="digivla-online-upload-editor-input"
              placeholder="Article content or summary..."
              value={values.content}
              onChange={(e) => onFieldChange('content', e.target.value)}
              rows={isMobile ? 4 : 5}
            />
            <div className="digivla-online-upload-editor-status">
              <Text type="secondary">Words: {wordCount.toLocaleString()}</Text>
              <Text type="secondary">Chars: {values.content.length.toLocaleString()}</Text>
            </div>
          </div>
        </Form.Item>

        <Form.Item label="Video File (MP4)" className="digivla-online-upload-field" style={{ marginBottom: 0 }}>
          <BroadcastVideoFileUpload file={values.file} compact onDrop={onFileDrop} onRemove={onRemoveFile} />
        </Form.Item>
      </Form>
    </Card>
  )
}, (prev, next) =>
  prev.variant === next.variant &&
  prev.index === next.index &&
  prev.values === next.values &&
  prev.canRemove === next.canRemove &&
  prev.mediaOptions === next.mediaOptions &&
  prev.hasDuplicate === next.hasDuplicate &&
  prev.duplicateCount === next.duplicateCount,
)

interface BroadcastMultiUploadPanelProps {
  variant: BroadcastVariant
  listHref: string
  mediaLoading: boolean
  loading: boolean
  articleCount: number
  readyCount: number
  duplicateFormCount: number
  mediaOptions: MediaOption[]
  multiFormData: BroadcastMultiFormValues[]
  uploadProgress: MultiUploadProgressState
  duplicatesByForm: Map<number, unknown[]>
  onAddArticle: () => void
  onPreview: () => void
  onUploadAll: () => void
  onFieldChange: (index: number, field: keyof BroadcastMultiFormValues, value: unknown) => void
  onRemove: (index: number) => void
  onFileDrop: (index: number, files: File[]) => void
  onRemoveFile: (index: number) => void
  onEnterPress: (index: number, e: React.KeyboardEvent) => void
  onViewDuplicate: (index: number) => void
}

export function BroadcastMultiUploadPanel({
  variant,
  listHref,
  mediaLoading,
  loading,
  articleCount,
  readyCount,
  duplicateFormCount,
  mediaOptions,
  multiFormData,
  uploadProgress,
  duplicatesByForm,
  onAddArticle,
  onPreview,
  onUploadAll,
  onFieldChange,
  onRemove,
  onFileDrop,
  onRemoveFile,
  onEnterPress,
  onViewDuplicate,
}: BroadcastMultiUploadPanelProps) {
  const canAddMore = canAddMoreMultiUploadArticles(articleCount)
  const variantClass = VARIANT_CONFIG[variant].badgeClass

  return (
    <div className={`digivla-online-upload-multi digivla-broadcast-upload-multi ${variantClass}`}>
      <Card variant="borderless" className="digivla-online-upload-multi-toolbar-card">
        <div className="digivla-online-upload-multi-toolbar">
          <div className="digivla-online-upload-multi-toolbar-info">
            <Badge count={articleCount} className="digivla-online-upload-multi-badge" />
            <div>
              <Text strong className="digivla-online-upload-multi-toolbar-title">
                {articleCount} article(s)
              </Text>
              <Text type="secondary" className="digivla-online-upload-multi-toolbar-sub">
                Max {MAX_MULTI_UPLOAD_ARTICLES} · {readyCount} ready (with video)
                {duplicateFormCount > 0 ? ` · ${duplicateFormCount} possible duplicate(s)` : ''}
              </Text>
            </div>
          </div>
          <div className="digivla-online-upload-multi-toolbar-actions">
            {canAddMore && (
              <ToolbarIconButton
                label={`Add article (${multiUploadCountLabel(articleCount)})`}
                icon={<PlusOutlined />}
                onClick={onAddArticle}
              />
            )}
            <ToolbarIconButton
              label={`Preview ${articleCount} article(s)`}
              icon={<EyeOutlined />}
              onClick={onPreview}
            />
            <Button type="primary" loading={loading} icon={<UploadOutlined />} onClick={onUploadAll}>
              Upload All ({articleCount})
            </Button>
          </div>
        </div>
      </Card>

      <ArticleMultiUploadProgress progress={uploadProgress} />

      {mediaLoading ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <UploadFormSkeleton fields={9} />
          </Col>
          <Col xs={24} xl={12}>
            <UploadFormSkeleton fields={9} />
          </Col>
        </Row>
      ) : (
        <Row gutter={[16, 16]} className="digivla-online-upload-multi-grid">
          {multiFormData.map((values, index) => (
            <Col xs={24} xl={12} key={index}>
              <BroadcastMultiFormCard
                variant={variant}
                index={index}
                mediaOptions={mediaOptions}
                values={values}
                onFieldChange={(field, value) => onFieldChange(index, field, value)}
                onRemove={() => onRemove(index)}
                canRemove={articleCount > 1}
                onFileDrop={(files) => onFileDrop(index, files)}
                onRemoveFile={() => onRemoveFile(index)}
                onEnterPress={(e) => onEnterPress(index, e)}
                hasDuplicate={duplicatesByForm.has(index)}
                duplicateCount={duplicatesByForm.get(index)?.length}
                onViewDuplicate={() => onViewDuplicate(index)}
              />
            </Col>
          ))}
        </Row>
      )}

      {canAddMore && !mediaLoading && (
        <Button
          block
          size="large"
          icon={<PlusOutlined />}
          onClick={onAddArticle}
          className="digivla-online-upload-multi-add-btn"
        >
          Add Article ({multiUploadCountLabel(articleCount)})
        </Button>
      )}

      <div className="digivla-online-upload-footer digivla-online-upload-multi-footer">
        <Text type="secondary" className="digivla-online-upload-multi-footer-hint">
          <AppstoreOutlined /> Use Batch to apply shared fields or paste multiple titles/contents per upload tab.
        </Text>
        <Link href={listHref}>
          <Button>Cancel</Button>
        </Link>
      </div>
    </div>
  )
}
