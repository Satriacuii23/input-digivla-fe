'use client'

import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Alert,
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
  Typography,
} from 'antd'
import {
  CopyOutlined,
  EyeOutlined,
  LinkOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { UploadDateField, UploadOnlineUrlField } from '@/components/articles/article-upload-fields'

const { Text } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

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

export interface OnlineSingleUploadFormProps {
  mediaOptions: MediaOption[]
  selectedMedia: string | null
  onMediaChange: (value: string | null) => void
  title: string
  onTitleChange: (value: string) => void
  content: string
  onContentChange: (value: string) => void
  journalist: string
  onJournalistChange: (value: string) => void
  date: Date | null
  onDateChange: (date: Date | null) => void
  url: string
  onUrlChange: (value: string) => void
  pages: string
  onPagesChange: (value: string) => void
  mmCol: string
  onMmColChange: (value: string) => void
  duplicateWarning: { show: boolean; duplicates: DuplicateArticle[] }
  onViewDuplicates: () => void
  loading: boolean
  onReset: () => void
  onSubmit: () => void
  onPaste: (field: 'url' | 'content') => void
}

function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  return /^https?:\/\/.+/i.test(trimmed)
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function onlineSingleFocusableSelector(): string {
  return '#online-single-form input, #online-single-form textarea, #online-single-form .ant-picker-input input, #online-single-form .ant-select-selection-search-input'
}

export function OnlineSingleUploadForm({
  mediaOptions,
  selectedMedia,
  onMediaChange,
  title,
  onTitleChange,
  content,
  onContentChange,
  journalist,
  onJournalistChange,
  date,
  onDateChange,
  url,
  onUrlChange,
  pages,
  onPagesChange,
  mmCol,
  onMmColChange,
  duplicateWarning,
  onViewDuplicates,
  loading,
  onReset,
  onSubmit,
  onPaste,
}: OnlineSingleUploadFormProps) {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const urlValid = isValidHttpUrl(url)
  const wordCount = useMemo(() => countWords(content), [content])

  const handleEnterPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    const target = e.target as HTMLElement
    if (target.tagName === 'TEXTAREA') return
    e.preventDefault()
    const inputs = Array.from(document.querySelectorAll(onlineSingleFocusableSelector()))
    const current = inputs.find((el) => el.contains(target) || el === target)
    if (!current) return
    const index = inputs.indexOf(current)
    if (index >= 0 && index < inputs.length - 1) {
      ;(inputs[index + 1] as HTMLElement).focus()
    }
  }, [])

  return (
    <div id="online-single-form" className="digivla-online-upload-single">
      <Card variant="borderless" className="digivla-online-upload-form-card">
        <Form layout="vertical" className="digivla-online-upload-form">
          <Form.Item label="Title" required className="digivla-online-upload-field">
            <Input
              placeholder="Judul berita / article title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={handleEnterPress}
              status={duplicateWarning.show ? 'warning' : undefined}
              size="large"
            />
          </Form.Item>

          <div className="digivla-online-upload-field">
            <UploadOnlineUrlField
              value={url}
              onChange={onUrlChange}
              onPaste={() => onPaste('url')}
              onKeyDown={handleEnterPress}
            />
            {urlValid && (
              <Button
                type="link"
                size="small"
                icon={<LinkOutlined />}
                href={url.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="digivla-online-upload-url-preview"
              >
                Open link in new tab
              </Button>
            )}
          </div>

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

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item label="Media (Online)" required className="digivla-online-upload-field">
                <Select
                  placeholder="— Please select —"
                  value={selectedMedia || undefined}
                  onChange={(v) => onMediaChange(v || null)}
                  options={mediaOptions}
                  showSearch
                  optionFilterProp="label"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Journalist" className="digivla-online-upload-field">
                <Input
                  placeholder="Journalist name"
                  value={journalist}
                  onChange={(e) => onJournalistChange(e.target.value)}
                  onKeyDown={handleEnterPress}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <div className="digivla-online-upload-field">
                <UploadDateField value={date} onChange={onDateChange} required />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Pages" className="digivla-online-upload-field">
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Halaman"
                  value={pages ? Number(pages) : undefined}
                  onChange={(v) => onPagesChange(v != null ? String(v) : '')}
                  onKeyDown={handleEnterPress}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="MM Column" className="digivla-online-upload-field">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  placeholder="Millimeter column"
                  value={mmCol ? Number(mmCol) : undefined}
                  onChange={(v) => onMmColChange(v != null ? String(v) : '')}
                  onKeyDown={handleEnterPress}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Article Content"
            className="digivla-online-upload-field digivla-online-upload-content-field"
          >
            <div className="digivla-online-upload-editor">
              <div className="digivla-online-upload-editor-toolbar">
                <Space wrap size={8}>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => onPaste('content')}
                  >
                    Paste from clipboard
                  </Button>
                </Space>
                <Text type="secondary" className="digivla-online-upload-editor-toolbar-meta">
                  Shift+Enter for new line
                </Text>
              </div>
              <TextArea
                className="digivla-online-upload-editor-input"
                placeholder="Isi berita / article content..."
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                rows={isMobile ? 12 : 16}
              />
              <div className="digivla-online-upload-editor-status">
                <Text type="secondary">Words: {wordCount.toLocaleString()}</Text>
                <Text type="secondary">Characters: {content.length.toLocaleString()}</Text>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Card>

      <div className="digivla-online-upload-footer">
        <Space wrap>
          <Button onClick={onReset} disabled={loading}>
            Reset
          </Button>
          <Link href="/online/list">
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
