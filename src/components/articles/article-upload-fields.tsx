'use client'

import type { ReactNode, KeyboardEvent } from 'react'
import dayjs from 'dayjs'
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Space } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { WibTimePicker } from '@/components/articles/wib-time-picker'

const { TextArea } = Input

interface UploadDateFieldProps {
  value: Date | null
  onChange: (date: Date | null) => void
  required?: boolean
}

export function UploadDateField({ value, onChange, required }: UploadDateFieldProps) {
  return (
    <Form.Item
      label={
        <Space wrap size="small" className="digivla-upload-date-label">
          <span>{required ? 'Date *' : 'Date'}</span>
          <Button size="small" onClick={() => onChange(new Date())}>
            Today
          </Button>
          <Button
            size="small"
            onClick={() => {
              const yesterday = new Date()
              yesterday.setDate(yesterday.getDate() - 1)
              onChange(yesterday)
            }}
          >
            Yesterday
          </Button>
        </Space>
      }
    >
      <DatePicker
        style={{ width: '100%', borderRadius: 6 }}
        format="DD/MM/YYYY"
        disabledDate={(current) => current && current > dayjs().endOf('day')}
        value={value ? dayjs(value) : null}
        onChange={(d) => onChange(d ? d.toDate() : null)}
      />
    </Form.Item>
  )
}

interface UploadTimeAnchorDurationProps {
  time: string
  journalist: string
  duration: number | string
  onTimeChange: (value: string) => void
  onJournalistChange: (value: string) => void
  onDurationChange: (value: number | string) => void
  onKeyDown?: (e: KeyboardEvent) => void
}

export function UploadTimeAnchorDuration({
  time,
  journalist,
  duration,
  onTimeChange,
  onJournalistChange,
  onDurationChange,
  onKeyDown,
}: UploadTimeAnchorDurationProps) {
  return (
    <Row gutter={[16, 0]}>
      <Col xs={24} sm={8}>
        <Form.Item
          label="Time (WIB)"
          extra="24 jam · UTC+7 · from filename suffix -HHmm (e.g. -1120 → 11:20)"
        >
          <WibTimePicker value={time} onChange={onTimeChange} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={8}>
        <Form.Item label="Anchor / Journalist">
          <Input
            placeholder="Anchor or journalist name"
            value={journalist}
            onChange={(e) => onJournalistChange(e.target.value)}
            onKeyDown={onKeyDown}
            style={{ borderRadius: 6 }}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={8}>
        <Form.Item label="Duration (seconds)" extra="From video file metadata">
          <InputNumber
            style={{ width: '100%', borderRadius: 6 }}
            min={0}
            placeholder="e.g. 180"
            value={duration !== '' ? Number(duration) : undefined}
            onChange={(v) => onDurationChange(v ?? '')}
            onKeyDown={onKeyDown}
          />
        </Form.Item>
      </Col>
    </Row>
  )
}

interface UploadFormSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function UploadFormSection({ title, children, className }: UploadFormSectionProps) {
  return (
    <Card size="small" title={title} className={`digivla-upload-section${className ? ` ${className}` : ''}`}>
      {children}
    </Card>
  )
}

interface UploadArticleContentFieldsProps {
  title: string
  content: string
  onTitleChange: (value: string) => void
  onContentChange: (value: string) => void
  onKeyDown?: (e: KeyboardEvent) => void
  titleStatus?: 'warning' | 'error'
  titleExtra?: string
  contentRows?: number
  titlePlaceholder?: string
}

export function UploadArticleContentFields({
  title,
  content,
  onTitleChange,
  onContentChange,
  onKeyDown,
  titleStatus,
  titleExtra,
  contentRows = 3,
  titlePlaceholder = 'Article title',
}: UploadArticleContentFieldsProps) {
  return (
    <>
      <Form.Item label="Title" required extra={titleExtra}>
        <Input
          placeholder={titlePlaceholder}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={onKeyDown}
          status={titleStatus}
          style={{ borderRadius: 6 }}
        />
      </Form.Item>
      <Form.Item label="Content">
        <TextArea
          placeholder="Article content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={contentRows}
          style={{ borderRadius: 6 }}
        />
      </Form.Item>
    </>
  )
}

export function uploadFormFocusableSelector(formIndex: number): string {
  return `#multi-form-${formIndex} input, #multi-form-${formIndex} textarea, #multi-form-${formIndex} .ant-picker-input input`
}

interface UploadOnlineUrlFieldProps {
  value: string
  onChange: (value: string) => void
  onPaste: () => void
  onKeyDown?: (e: KeyboardEvent) => void
}

export function UploadOnlineUrlField({ value, onChange, onPaste, onKeyDown }: UploadOnlineUrlFieldProps) {
  return (
    <Form.Item
      label={
        <Space wrap size="small">
          <span>Link URL</span>
          <Button type="text" size="small" icon={<CopyOutlined />} onClick={onPaste} aria-label="Paste URL from clipboard" />
        </Space>
      }
    >
      <Input
        placeholder="https://example.com/article"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        style={{ borderRadius: 6 }}
      />
    </Form.Item>
  )
}

interface UploadOnlinePublicationFieldsProps {
  journalist: string
  pages: string
  mmCol: string
  onJournalistChange: (value: string) => void
  onPagesChange: (value: string) => void
  onMmColChange: (value: string) => void
  onKeyDown?: (e: KeyboardEvent) => void
}

export function UploadOnlinePublicationFields({
  journalist,
  pages,
  mmCol,
  onJournalistChange,
  onPagesChange,
  onMmColChange,
  onKeyDown,
}: UploadOnlinePublicationFieldsProps) {
  return (
    <>
      <Form.Item label="Journalist">
        <Input
          placeholder="Journalist name"
          value={journalist}
          onChange={(e) => onJournalistChange(e.target.value)}
          onKeyDown={onKeyDown}
          style={{ borderRadius: 6 }}
        />
      </Form.Item>
      <Row gutter={[16, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label="Pages">
            <InputNumber
              style={{ width: '100%', borderRadius: 6 }}
              min={1}
              placeholder="Number of pages"
              value={pages ? Number(pages) : undefined}
              onChange={(v) => onPagesChange(v != null ? String(v) : '')}
              onKeyDown={onKeyDown}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="MM Column" style={{ marginBottom: 0 }}>
            <InputNumber
              style={{ width: '100%', borderRadius: 6 }}
              min={0}
              step={0.01}
              placeholder="MM column size"
              value={mmCol ? Number(mmCol) : undefined}
              onChange={(v) => onMmColChange(v != null ? String(v) : '')}
              onKeyDown={onKeyDown}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}

interface UploadContentFieldWithPasteProps {
  content: string
  onChange: (value: string) => void
  onPaste: () => void
  onKeyDown?: (e: KeyboardEvent) => void
  rows?: number
}

export function UploadContentFieldWithPaste({
  content,
  onChange,
  onPaste,
  onKeyDown,
  rows = 4,
}: UploadContentFieldWithPasteProps) {
  return (
    <Form.Item
      label={
        <Space wrap size="small">
          <span>Content</span>
          <Button type="text" size="small" icon={<CopyOutlined />} onClick={onPaste} aria-label="Paste content from clipboard" />
        </Space>
      }
      style={{ marginBottom: 0 }}
    >
      <TextArea
        placeholder="Content or article summary..."
        rows={rows}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        style={{ borderRadius: 6 }}
      />
    </Form.Item>
  )
}
