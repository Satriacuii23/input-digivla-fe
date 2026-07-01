'use client'

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  Grid,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
} from 'antd'
import { AppstoreOutlined, CloseOutlined } from '@ant-design/icons'
import { WibTimePicker } from '@/components/articles/wib-time-picker'
import { ARTICLE_DRAWER_STYLES } from '@/lib/articles/article-list-helpers'
import {
  parseBatchContentBlocks,
  parseBatchLines,
  parseBatchTimeLines,
} from '@/lib/articles/article-upload-batch-parse'

const { Text } = Typography
const { TextArea } = Input

export type ArticleUploadBatchVariant = 'broadcast' | 'online'

export interface ArticleUploadBatchValues {
  mediaId: string | null
  title: string | null
  content: string | null
  date: Date | null
  journalist: string | null
  time: string | null
  duration: string | null
  url: string | null
  pages: string | null
  mmCol: string | null
  /** Line 1 → target form #1, line 2 → #2, … */
  titlesPerForm?: string[]
  /** Block 1 → form #1; separate blocks with a line containing only `---` */
  contentsPerForm?: string[]
  journalistsPerForm?: string[]
  timesPerForm?: string[]
  durationsPerForm?: string[]
}

interface MediaOption {
  value: string
  label: string
}

interface ArticleUploadBatchDrawerProps {
  open: boolean
  variant: ArticleUploadBatchVariant
  mediaOptions: MediaOption[]
  mediaTypeLabel: string
  journalistLabel?: string
  targetCount: number
  onClose: () => void
  onApply: (values: ArticleUploadBatchValues) => void
}

function trimOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function numToStringOrNull(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

export function hasAnyBatchValue(
  values: ArticleUploadBatchValues,
  variant: ArticleUploadBatchVariant,
): boolean {
  if (values.mediaId || values.date) return true
  if (values.title || values.content || values.journalist) return true
  if (values.titlesPerForm?.length) return true
  if (values.contentsPerForm?.length) return true
  if (values.journalistsPerForm?.length) return true
  if (values.timesPerForm?.length) return true
  if (values.durationsPerForm?.length) return true
  if (variant === 'broadcast') {
    return Boolean(values.time || values.duration)
  }
  return Boolean(values.url || values.pages || values.mmCol)
}

export function collectBatchAppliedLabels(
  values: ArticleUploadBatchValues,
  variant: ArticleUploadBatchVariant,
): string[] {
  const labels: string[] = []
  if (values.mediaId) labels.push('media')
  if (values.title) labels.push('title (all)')
  if (values.titlesPerForm?.length) labels.push(`titles (${values.titlesPerForm.length})`)
  if (values.content) labels.push('content (all)')
  if (values.contentsPerForm?.length) labels.push(`contents (${values.contentsPerForm.length})`)
  if (values.date) labels.push('date')
  if (values.journalist) labels.push(variant === 'broadcast' ? 'anchor (all)' : 'journalist (all)')
  if (values.journalistsPerForm?.length) {
    labels.push(`${variant === 'broadcast' ? 'anchors' : 'journalists'} (${values.journalistsPerForm.length})`)
  }
  if (variant === 'broadcast') {
    if (values.time) labels.push('time (all)')
    if (values.timesPerForm?.length) labels.push(`times (${values.timesPerForm.length})`)
    if (values.duration) labels.push('duration (all)')
    if (values.durationsPerForm?.length) labels.push(`durations (${values.durationsPerForm.length})`)
  } else {
    if (values.url) labels.push('url')
    if (values.pages) labels.push('pages')
    if (values.mmCol) labels.push('mm col')
  }
  return labels
}

export function ArticleUploadBatchDrawer({
  open,
  variant,
  mediaOptions,
  mediaTypeLabel,
  journalistLabel,
  targetCount,
  onClose,
  onApply,
}: ArticleUploadBatchDrawerProps) {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const drawerWidth = isMobile ? '100%' : 680

  const anchorLabel =
    journalistLabel ?? (variant === 'broadcast' ? 'Anchor / Journalist' : 'Journalist')

  const [mediaId, setMediaId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [journalist, setJournalist] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('')
  const [url, setUrl] = useState('')
  const [pages, setPages] = useState('')
  const [mmCol, setMmCol] = useState('')
  const [titlesBulk, setTitlesBulk] = useState('')
  const [contentsBulk, setContentsBulk] = useState('')
  const [journalistsBulk, setJournalistsBulk] = useState('')
  const [timesBulk, setTimesBulk] = useState('')
  const [durationsBulk, setDurationsBulk] = useState('')

  useEffect(() => {
    if (open) {
      setMediaId(null)
      setTitle('')
      setContent('')
      setDate(null)
      setJournalist('')
      setTime('')
      setDuration('')
      setUrl('')
      setPages('')
      setMmCol('')
      setTitlesBulk('')
      setContentsBulk('')
      setJournalistsBulk('')
      setTimesBulk('')
      setDurationsBulk('')
    }
  }, [open])

  const titlesPerForm = parseBatchLines(titlesBulk)
  const contentsPerForm = parseBatchContentBlocks(contentsBulk)
  const journalistsPerForm = parseBatchLines(journalistsBulk)
  const timesPerForm = parseBatchTimeLines(timesBulk)
  const durationsPerForm = parseBatchLines(durationsBulk)

  const draftValues: ArticleUploadBatchValues = {
    mediaId,
    title: trimOrNull(title),
    content: trimOrNull(content),
    date,
    journalist: trimOrNull(journalist),
    time: variant === 'broadcast' ? trimOrNull(time) : null,
    duration: variant === 'broadcast' ? trimOrNull(duration) : null,
    url: variant === 'online' ? trimOrNull(url) : null,
    pages: variant === 'online' ? trimOrNull(pages) : null,
    mmCol: variant === 'online' ? trimOrNull(mmCol) : null,
    titlesPerForm: titlesPerForm.length ? titlesPerForm : undefined,
    contentsPerForm: contentsPerForm.length ? contentsPerForm : undefined,
    journalistsPerForm: journalistsPerForm.length ? journalistsPerForm : undefined,
    timesPerForm: timesPerForm.length ? timesPerForm : undefined,
    durationsPerForm: durationsPerForm.length ? durationsPerForm : undefined,
  }

  const canApply = hasAnyBatchValue(draftValues, variant)

  const handleApply = () => {
    if (!canApply) return
    onApply(draftValues)
  }

  return (
    <Drawer
      title="Batch Apply"
      placement="right"
      styles={{
        ...ARTICLE_DRAWER_STYLES,
        wrapper: { width: drawerWidth },
      }}
      open={open}
      onClose={onClose}
      destroyOnClose
      maskClosable
      className="digivla-upload-batch-drawer"
      footer={
        <div className="digivla-drawer-footer">
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Cancel
          </Button>
          <Button type="primary" icon={<AppstoreOutlined />} disabled={!canApply} onClick={handleApply}>
            Apply to {targetCount} Article(s)
          </Button>
        </div>
      }
    >
      <div className="digivla-upload-batch-drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Text type="secondary" className="digivla-upload-batch-desc" style={{ display: 'block', fontSize: 13, lineHeight: '1.6', color: '#64748b' }}>
          Configure shared fields on the left/top card (Same for all), or paste list of items per form on the right/bottom card (Bulk per form).
        </Text>

        <Form layout="vertical" requiredMark="optional" className="digivla-upload-batch-form" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card size="small" title="Same for all" className="digivla-drawer-card" style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Row gutter={[16, 12]}>
              <Col span={24}>
                <Form.Item label={`Media (${mediaTypeLabel})`} style={{ marginBottom: 0 }}>
                  <Select
                    placeholder="Select media (optional)"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    value={mediaId ?? undefined}
                    onChange={(v) => setMediaId(v ?? null)}
                    options={mediaOptions}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Date" style={{ marginBottom: 0 }}>
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Select date (optional)"
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                    value={date ? dayjs(date) : null}
                    onChange={(d) => setDate(d ? d.toDate() : null)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={anchorLabel} style={{ marginBottom: 0 }}>
                  <Input
                    placeholder={`Enter ${anchorLabel.toLowerCase()} (optional)`}
                    value={journalist}
                    onChange={(e) => setJournalist(e.target.value)}
                    allowClear
                  />
                </Form.Item>
              </Col>
              {variant !== 'broadcast' && (
                <>
                  <Col span={24}>
                    <Form.Item label="Link URL" style={{ marginBottom: 0 }}>
                      <Input
                        placeholder="https://... (optional)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Pages" style={{ marginBottom: 0 }}>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="Optional"
                        value={pages !== '' ? Number(pages) : undefined}
                        onChange={(v) => setPages(numToStringOrNull(v) ?? '')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="MM Column" style={{ marginBottom: 0 }}>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        placeholder="Optional"
                        value={mmCol !== '' ? Number(mmCol) : undefined}
                        onChange={(v) => setMmCol(numToStringOrNull(v) ?? '')}
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
          </Card>

          <Card
            size="small"
            title="Bulk per form (Multiple)"
            className="digivla-drawer-card"
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {targetCount} form(s)
              </Text>
            }
          >
            <Text type="secondary" className="digivla-upload-batch-bulk-hint" style={{ display: 'block', fontSize: 12, marginBottom: 12, color: '#94a3b8' }}>
              Row/block order matches upload tabs #1, #2, #3… Per-form values will map sequentially.
            </Text>
            <Row gutter={[16, 12]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  label="Titles"
                  extra={`One title per line · ${titlesPerForm.length} parsed`}
                  style={{ marginBottom: 0 }}
                >
                  <TextArea
                    placeholder={'Title article 1\nTitle article 2\nTitle article 3'}
                    value={titlesBulk}
                    onChange={(e) => setTitlesBulk(e.target.value)}
                    rows={4}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  label="Contents"
                  extra={`Separate blocks with --- on its own line · ${contentsPerForm.length} parsed`}
                  style={{ marginBottom: 0 }}
                >
                  <TextArea
                    placeholder={'Content for article 1\n---\nContent for article 2\n---\nContent for article 3'}
                    value={contentsBulk}
                    onChange={(e) => setContentsBulk(e.target.value)}
                    rows={4}
                  />
                </Form.Item>
              </Col>
              {variant === 'broadcast' && (
                <>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Times (WIB)"
                      extra={`HH:mm or HHmm · ${timesPerForm.length} parsed`}
                      style={{ marginBottom: 0 }}
                    >
                      <TextArea
                        placeholder={'11:20\n09:30\n14:05'}
                        value={timesBulk}
                        onChange={(e) => setTimesBulk(e.target.value)}
                        rows={3}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Durations (seconds)"
                      extra={`One per line · ${durationsPerForm.length} parsed`}
                      style={{ marginBottom: 0 }}
                    >
                      <TextArea
                        placeholder={'163\n120\n95'}
                        value={durationsBulk}
                        onChange={(e) => setDurationsBulk(e.target.value)}
                        rows={3}
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
          </Card>
        </Form>
      </div>
    </Drawer>
  )
}

export function getBatchTargetIndices(
  previewOpen: boolean,
  previewSelected: Set<number>,
  totalForms: number,
): number[] {
  if (previewOpen && previewSelected.size > 0) {
    return Array.from(previewSelected).sort((a, b) => a - b)
  }
  return Array.from({ length: totalForms }, (_, i) => i)
}
