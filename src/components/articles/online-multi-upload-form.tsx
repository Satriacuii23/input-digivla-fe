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
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  LinkOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { UploadDateField, UploadOnlineUrlField } from '@/components/articles/article-upload-fields'
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

interface MediaOption {
  value: string
  label: string
}

export interface OnlineMultiFormValues {
  media_id: string | null
  title: string
  content: string
  journalist: string
  date: Date | null
  url: string
  pages: string
  mm_col: string
}

function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  return /^https?:\/\/.+/i.test(trimmed)
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export const OnlineMultiFormCard = memo(function OnlineMultiFormCard({
  index,
  mediaOptions,
  values,
  onFieldChange,
  onRemove,
  canRemove,
  hasDuplicate,
  duplicateCount,
  onViewDuplicate,
  onPaste,
  onEnterPress,
}: {
  index: number
  mediaOptions: MediaOption[]
  values: OnlineMultiFormValues
  onFieldChange: (field: keyof OnlineMultiFormValues, value: unknown) => void
  onRemove: () => void
  canRemove: boolean
  hasDuplicate?: boolean
  duplicateCount?: number
  onViewDuplicate?: () => void
  onPaste: (field: 'url' | 'content') => void
  onEnterPress?: (e: React.KeyboardEvent) => void
}) {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const urlValid = isValidHttpUrl(values.url)
  const wordCount = useMemo(() => countWords(values.content), [values.content])
  const isReady = isArticleUploadFormReady(values)

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
          {values.url.trim() ? (
            <Tag color="processing" className="digivla-online-upload-multi-tag">
              URL
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
        <Form.Item label={<span style={{ fontWeight: 500, color: '#334155' }}>Title</span>} required className="digivla-online-upload-field">
          <Input
            placeholder="Judul berita / article title"
            value={values.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            onKeyDown={handleKeyDown}
            status={hasDuplicate ? 'warning' : undefined}
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <div className="digivla-online-upload-field">
          <UploadOnlineUrlField
            value={values.url}
            onChange={(v) => onFieldChange('url', v)}
            onPaste={() => onPaste('url')}
            onKeyDown={handleKeyDown}
          />
          {urlValid && (
            <Button
              type="link"
              size="small"
              icon={<LinkOutlined />}
              href={values.url.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="digivla-online-upload-url-preview"
            >
              Open link
            </Button>
          )}
        </div>

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

        <Row gutter={[12, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item label={<span style={{ fontWeight: 500, color: '#334155' }}>Media (Online)</span>} required className="digivla-online-upload-field">
              <Select
                placeholder="— Please select —"
                value={values.media_id || undefined}
                onChange={(v) => onFieldChange('media_id', v || null)}
                options={mediaOptions}
                showSearch
                optionFilterProp="label"
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label={<span style={{ fontWeight: 500, color: '#334155' }}>Journalist</span>} className="digivla-online-upload-field">
              <Input
                placeholder="Journalist name"
                value={values.journalist}
                onChange={(e) => onFieldChange('journalist', e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 0]}>
          <Col xs={24} sm={8}>
            <div className="digivla-online-upload-field">
              <UploadDateField value={values.date} onChange={(d) => onFieldChange('date', d)} required />
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label={<span style={{ fontWeight: 500, color: '#334155' }}>Pages</span>} className="digivla-online-upload-field">
              <InputNumber
                style={{ width: '100%', borderRadius: 6 }}
                min={1}
                placeholder="Halaman"
                value={values.pages ? Number(values.pages) : undefined}
                onChange={(v) => onFieldChange('pages', v != null ? String(v) : '')}
                onKeyDown={handleKeyDown}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label={<span style={{ fontWeight: 500, color: '#334155' }}>MM Column</span>} className="digivla-online-upload-field">
              <InputNumber
                style={{ width: '100%', borderRadius: 6 }}
                min={0}
                step={0.01}
                placeholder="MM column"
                value={values.mm_col ? Number(values.mm_col) : undefined}
                onChange={(v) => onFieldChange('mm_col', v != null ? String(v) : '')}
                onKeyDown={handleKeyDown}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={<span style={{ fontWeight: 500, color: '#334155' }}>Article Content</span>}
          className="digivla-online-upload-field digivla-online-upload-content-field"
        >
          <div className="digivla-online-upload-editor digivla-online-upload-editor--compact">
            <div className="digivla-online-upload-editor-toolbar">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => onPaste('content')}
              >
                Paste
              </Button>
              <Text type="secondary" className="digivla-online-upload-editor-toolbar-meta">
                Shift+Enter for new line
              </Text>
            </div>
            <TextArea
              className="digivla-online-upload-editor-input"
              placeholder="Isi berita / article content..."
              value={values.content}
              onChange={(e) => onFieldChange('content', e.target.value)}
              rows={isMobile ? 6 : 8}
              style={{ borderRadius: 6 }}
            />
            <div className="digivla-online-upload-editor-status">
              <Text type="secondary">Words: {wordCount.toLocaleString()}</Text>
              <Text type="secondary">Chars: {values.content.length.toLocaleString()}</Text>
            </div>
          </div>
        </Form.Item>
      </Form>
    </Card>
  )
}, (prev, next) =>
  prev.index === next.index &&
  prev.values === next.values &&
  prev.canRemove === next.canRemove &&
  prev.mediaOptions === next.mediaOptions &&
  prev.hasDuplicate === next.hasDuplicate &&
  prev.duplicateCount === next.duplicateCount,
)

interface OnlineMultiUploadPanelProps {
  mediaLoading: boolean
  loading: boolean
  articleCount: number
  readyCount: number
  duplicateFormCount: number
  mediaOptions: MediaOption[]
  multiFormData: OnlineMultiFormValues[]
  uploadProgress: MultiUploadProgressState
  duplicatesByForm: Map<number, unknown[]>
  onAddArticle: () => void
  onPreview: () => void
  onUploadAll: () => void
  onFieldChange: (index: number, field: keyof OnlineMultiFormValues, value: unknown) => void
  onRemove: (index: number) => void
  onPaste: (index: number, field: 'url' | 'content') => void
  onEnterPress: (index: number, e: React.KeyboardEvent) => void
  onViewDuplicate: (index: number) => void
  onOpenScrape?: () => void
}

export function OnlineMultiUploadPanel({
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
  onPaste,
  onEnterPress,
  onViewDuplicate,
  onOpenScrape,
}: OnlineMultiUploadPanelProps) {
  const canAddMore = canAddMoreMultiUploadArticles(articleCount)

  return (
    <div className="digivla-online-upload-multi">
      <Card variant="borderless" className="digivla-online-upload-multi-toolbar-card">
        <div className="digivla-online-upload-multi-toolbar">
          <div className="digivla-online-upload-multi-toolbar-info">
            <Badge count={articleCount} className="digivla-online-upload-multi-badge" />
            <div>
              <Text strong className="digivla-online-upload-multi-toolbar-title">
                {articleCount} article(s)
              </Text>
              <Text type="secondary" className="digivla-online-upload-multi-toolbar-sub">
                Max {MAX_MULTI_UPLOAD_ARTICLES} · {readyCount} ready to upload
                {duplicateFormCount > 0 ? ` · ${duplicateFormCount} possible duplicate(s)` : ''}
              </Text>
            </div>
          </div>
          <div className="digivla-online-upload-multi-toolbar-actions">
            {onOpenScrape && (
              <ToolbarIconButton
                label="Scrape from URLs"
                icon={<ThunderboltOutlined />}
                onClick={onOpenScrape}
              />
            )}
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
              <OnlineMultiFormCard
                index={index}
                mediaOptions={mediaOptions}
                values={values}
                onFieldChange={(field, value) => onFieldChange(index, field, value)}
                onRemove={() => onRemove(index)}
                canRemove={articleCount > 1}
                onPaste={(field) => onPaste(index, field)}
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
        <Link href="/online/list">
          <Button>Cancel</Button>
        </Link>
      </div>
    </div>
  )
}
