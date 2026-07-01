'use client'

import type { ReactNode } from 'react'
import dayjs from 'dayjs'
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Grid,
  Input,
  InputNumber,
  Row,
  TimePicker,
  Typography,
} from 'antd'
import type { FormInstance } from 'antd/es/form'
import { CloseOutlined, EditOutlined, LinkOutlined, SaveOutlined } from '@ant-design/icons'
import { fileeToPublicUrl } from '@/lib/storage/media-paths-client'
import { HighlightSearchText } from '@/components/ui/highlight-search-text'
import {
  formatArticleDateLong,
  formatArticleIdDisplay,
  formatCreatedAtDisplay,
  formatWibTimeDisplay,
  getOnlineArticleFileHref,
  getOnlineArticleFileLabel,
  type ArticleRow,
  type OnlineArticleRow,
} from '@/lib/articles/article-list-helpers'
import { ArticleMetaDescriptions } from '@/components/articles/article-list-drawers'
import { OnlineArticleMetaDescriptions } from '@/components/articles/online-article-list-drawers'

const { Text, Paragraph } = Typography
const { useBreakpoint } = Grid

interface QcMetaItem {
  label: string
  value: string
}

interface QcTopDrawerShellProps {
  title: ReactNode
  open: boolean
  variant: 'preview' | 'edit'
  loading?: boolean
  maskClosable?: boolean
  onClose: () => void
  footer: ReactNode
  children: ReactNode
}

function QcTopDrawerShell({
  title,
  open,
  variant,
  loading = false,
  maskClosable,
  onClose,
  footer,
  children,
}: QcTopDrawerShellProps) {
  return (
    <Drawer
      title={title}
      placement="top"
      open={open}
      onClose={onClose}
      size="100%"
      destroyOnClose
      maskClosable={maskClosable ?? !loading}
      className={`digivla-qc-top-drawer digivla-qc-${variant}-drawer digivla-media-drawer digivla-article-drawer digivla-qc-drawer`}
      styles={{
        header: { borderBottom: '1px solid #e2e8f0' },
      }}
      footer={footer}
    >
      <div className="digivla-qc-top-drawer-scroll">{children}</div>
    </Drawer>
  )
}

function QcTopDrawerFooter({
  children,
  isMobile,
}: {
  children: ReactNode
  isMobile: boolean
}) {
  return (
    <div className={`digivla-qc-top-drawer-footer${isMobile ? ' digivla-qc-top-drawer-footer--stacked' : ''}`} style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #f1f5f9', padding: '16px 24px' }}>
      {children}
    </div>
  )
}

function QcDrawerHero({
  eyebrow,
  title,
  metaItems,
}: {
  eyebrow: string
  title: string
  metaItems: QcMetaItem[]
}) {
  return (
    <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: 8, borderLeft: '4px solid #3b82f6', marginBottom: 20 }}>
      <Text type="secondary" style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 6 }}>
        {eyebrow}
      </Text>
      <Paragraph style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0', lineHeight: 1.45 }}>{title}</Paragraph>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: 13, borderTop: '1px dashed #e2e8f0', paddingTop: 10 }}>
        {metaItems.map((item) => (
          <div key={item.label}>
            <span style={{ color: '#64748b', marginRight: 4 }}>{item.label}:</span>
            <span style={{ color: '#334155', fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface QcEditDrawerShellProps {
  title: ReactNode
  open: boolean
  loading: boolean
  onClose: () => void
  onSave: () => void
  alertDescription: string
  heroEyebrow: string
  heroTitle: string
  metaItems: QcMetaItem[]
  referencePanel: ReactNode
  formPanel: ReactNode
}

function QcEditDrawerShell({
  title,
  open,
  loading,
  onClose,
  onSave,
  alertDescription,
  heroEyebrow,
  heroTitle,
  metaItems,
  referencePanel,
  formPanel,
}: QcEditDrawerShellProps) {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const isTablet = !!screens.md && !screens.xl

  return (
    <QcTopDrawerShell
      title={title}
      open={open}
      variant="edit"
      loading={loading}
      onClose={onClose}
      footer={
        <QcTopDrawerFooter isMobile={isMobile}>
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={onSave}
            style={{ minWidth: 140 }}
          >
            Save QC Changes
          </Button>
        </QcTopDrawerFooter>
      }
    >
      <div className="digivla-qc-top-drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <QcDrawerHero eyebrow={heroEyebrow} title={heroTitle} metaItems={metaItems} />

        <Alert
          type="info"
          showIcon
          message={<span style={{ fontWeight: 600 }}>Quality Control Review</span>}
          description={
            isMobile
              ? 'Review reference data, then update the form below.'
              : alertDescription
          }
          style={{ borderRadius: 8 }}
        />

        <Row
          gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]}
          className={`digivla-qc-edit-layout${isTablet ? ' digivla-qc-edit-layout--stacked' : ''}`}
        >
          <Col xs={24} lg={10} xl={9} className="digivla-qc-edit-col digivla-qc-edit-col--reference">
            <div className="digivla-qc-edit-side">{referencePanel}</div>
          </Col>
          <Col xs={24} lg={14} xl={15} className="digivla-qc-edit-col digivla-qc-edit-col--form">
            {formPanel}
          </Col>
        </Row>
      </div>
    </QcTopDrawerShell>
  )
}

function useContentTextAreaProps() {
  const screens = useBreakpoint()
  if (!screens.md) return { minRows: 8, maxRows: 18 }
  if (!screens.xl) return { minRows: 10, maxRows: 24 }
  return { minRows: 14, maxRows: 32 }
}

function buildBroadcastMetaItems(article: ArticleRow): QcMetaItem[] {
  return [
    { label: 'Media', value: article.media_name || `Media #${article.media_id}` },
    { label: 'Date', value: formatArticleDateLong(article.datee) || article.datee || '—' },
    { label: 'Time', value: article.timee ? `${formatWibTimeDisplay(article.timee)} WIB` : '—' },
    {
      label: 'Uploaded',
      value: article.created_at ? formatCreatedAtDisplay(article.created_at) : '—',
    },
  ]
}

function buildOnlineMetaItems(article: OnlineArticleRow): QcMetaItem[] {
  return [
    { label: 'Media', value: article.media_name || `Media #${article.media_id}` },
    { label: 'Date', value: formatArticleDateLong(article.datee) || article.datee || '—' },
    {
      label: 'Uploaded',
      value: article.created_at ? formatCreatedAtDisplay(article.created_at) : '—',
    },
  ]
}

interface ArticleQcPreviewDrawerProps {
  open: boolean
  article: ArticleRow | null
  mediaLabel: string
  fileLabel?: string
  searchKeyword?: string
  editButtonLabel?: string
  onClose: () => void
  onEdit: (article: ArticleRow) => void
}

export function ArticleQcPreviewDrawer({
  open,
  article,
  mediaLabel,
  fileLabel = 'Media File',
  searchKeyword,
  editButtonLabel = 'QC Edit',
  onClose,
  onEdit,
}: ArticleQcPreviewDrawerProps) {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const hasMedia = Boolean(article?.filee)

  return (
    <QcTopDrawerShell
      title={
        article ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>Preview — {mediaLabel} Article</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
              ID: {formatArticleIdDisplay(article.article_id)}
            </span>
          </div>
        ) : (
          `Preview — ${mediaLabel} Article`
        )
      }
      open={open}
      variant="preview"
      onClose={onClose}
      footer={
        article ? (
          <QcTopDrawerFooter isMobile={isMobile}>
            <Button icon={<CloseOutlined />} onClick={onClose}>
              Close
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose()
                onEdit(article)
              }}
              style={{ minWidth: 120 }}
            >
              {editButtonLabel}
            </Button>
          </QcTopDrawerFooter>
        ) : null
      }
    >
      {article ? (
        <div className="digivla-qc-top-drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <QcDrawerHero
            eyebrow={`${mediaLabel} · Article ${formatArticleIdDisplay(article.article_id)}`}
            title={article.title}
            metaItems={buildBroadcastMetaItems(article)}
          />

          <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]} className="digivla-qc-preview-layout">
            <Col xs={24} lg={hasMedia ? 14 : 24} xl={hasMedia ? 15 : 24}>
              <div className="digivla-qc-preview-main" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Article Information
                  </h3>
                  <ArticleMetaDescriptions article={article} />
                </div>

                {article.content?.trim() ? (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Content
                    </h3>
                    <Paragraph style={{ fontSize: 14, lineHeight: '1.7', color: '#1e293b', whiteSpace: 'pre-wrap', margin: 0 }}>
                      <HighlightSearchText text={article.content} keyword={searchKeyword} />
                    </Paragraph>
                  </div>
                ) : null}
              </div>
            </Col>

            {hasMedia ? (
              <Col xs={24} lg={10} xl={9}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {fileLabel}
                  </h3>
                  <video
                    controls
                    style={{ width: '100%', borderRadius: 8, border: '1px solid #e2e8f0', background: '#000', maxHeight: 380, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    src={fileeToPublicUrl(article.filee) ?? undefined}
                  >
                    Your browser does not support the media tag.
                  </video>
                  {fileeToPublicUrl(article.filee) ? (
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="link"
                        icon={<LinkOutlined />}
                        href={fileeToPublicUrl(article.filee)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: 0, fontSize: 13 }}
                      >
                        Open file in new tab
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Col>
            ) : null}
          </Row>
        </div>
      ) : null}
    </QcTopDrawerShell>
  )
}

interface OnlineArticleQcPreviewDrawerProps {
  open: boolean
  article: OnlineArticleRow | null
  searchKeyword?: string
  editButtonLabel?: string
  onClose: () => void
  onEdit: (article: OnlineArticleRow) => void
}

export function OnlineArticleQcPreviewDrawer({
  open,
  article,
  searchKeyword,
  editButtonLabel = 'QC Edit',
  onClose,
  onEdit,
}: OnlineArticleQcPreviewDrawerProps) {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const fileLabel = article ? getOnlineArticleFileLabel(article) : ''
  const fileHref = article ? getOnlineArticleFileHref(article) : null
  const hasFile = Boolean(fileLabel)

  return (
    <QcTopDrawerShell
      title={
        article ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>Preview — Online Article</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
              ID: {formatArticleIdDisplay(article.article_id)}
            </span>
          </div>
        ) : (
          "Preview — Online Article"
        )
      }
      open={open}
      variant="preview"
      onClose={onClose}
      footer={
        article ? (
          <QcTopDrawerFooter isMobile={isMobile}>
            <Button icon={<CloseOutlined />} onClick={onClose}>
              Close
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose()
                onEdit(article)
              }}
              style={{ minWidth: 120 }}
            >
              {editButtonLabel}
            </Button>
          </QcTopDrawerFooter>
        ) : null
      }
    >
      {article ? (
        <div className="digivla-qc-top-drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <QcDrawerHero
            eyebrow={`Online · Article ${formatArticleIdDisplay(article.article_id)}`}
            title={article.title}
            metaItems={buildOnlineMetaItems(article)}
          />

          <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]} className="digivla-qc-preview-layout">
            <Col xs={24} lg={hasFile ? 14 : 24} xl={hasFile ? 15 : 24}>
              <div className="digivla-qc-preview-main" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Article Information
                  </h3>
                  <OnlineArticleMetaDescriptions article={article} />
                </div>

                {article.content?.trim() ? (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Content
                    </h3>
                    <Paragraph style={{ fontSize: 14, lineHeight: '1.7', color: '#1e293b', whiteSpace: 'pre-wrap', margin: 0 }}>
                      <HighlightSearchText text={article.content} keyword={searchKeyword} />
                    </Paragraph>
                  </div>
                ) : null}
              </div>
            </Col>

            {hasFile ? (
              <Col xs={24} lg={10} xl={9}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Article File / URL
                  </h3>
                  {fileHref ? (
                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      href={fileHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: 0, fontSize: 13 }}
                    >
                      {fileLabel}
                    </Button>
                  ) : (
                    <Text style={{ fontSize: 13, color: '#475569' }}>{fileLabel}</Text>
                  )}
                </div>
              </Col>
            ) : null}
          </Row>
        </div>
      ) : null}
    </QcTopDrawerShell>
  )
}

interface ArticleQcEditDrawerProps {
  open: boolean
  article: ArticleRow | null
  mediaLabel: string
  fileLabel?: string
  form: FormInstance
  loading: boolean
  onClose: () => void
  onSave: () => void
}

export function ArticleQcEditDrawer({
  open,
  article,
  mediaLabel,
  fileLabel = 'Media File',
  form,
  loading,
  onClose,
  onSave,
}: ArticleQcEditDrawerProps) {
  const contentTextAreaProps = useContentTextAreaProps()

  if (!article) {
    return (
      <QcTopDrawerShell
        title={`QC — Edit ${mediaLabel} Article`}
        open={open}
        variant="edit"
        onClose={onClose}
        footer={null}
      >
        {null}
      </QcTopDrawerShell>
    )
  }

  const fileUrl = article.filee ? fileeToPublicUrl(article.filee) : null

  return (
    <QcEditDrawerShell
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>QC — Edit {mediaLabel} Article</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
            ID: {formatArticleIdDisplay(article.article_id)}
          </span>
        </div>
      }
      open={open}
      loading={loading}
      onClose={onClose}
      onSave={onSave}
      alertDescription="Review reference data on the left, then correct title, content, broadcast date, time, and metadata on the right."
      heroEyebrow={`${mediaLabel} · Article ${formatArticleIdDisplay(article.article_id)}`}
      heroTitle={article.title}
      metaItems={buildBroadcastMetaItems(article)}
      referencePanel={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reference Metadata
            </h3>
            <ArticleMetaDescriptions article={article} />
          </div>

          {article.content?.trim() ? (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current Content
              </h3>
              <Paragraph style={{ fontSize: 13, lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-wrap', margin: 0, maxHeight: 300, overflowY: 'auto' }}>
                {article.content}
              </Paragraph>
            </div>
          ) : null}

          {article.filee ? (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {fileLabel}
              </h3>
              <video
                controls
                style={{ width: '100%', borderRadius: 8, border: '1px solid #e2e8f0', background: '#000', maxHeight: 240 }}
                src={fileUrl ?? undefined}
              >
                Your browser does not support the media tag.
              </video>
              {fileUrl ? (
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: 0, fontSize: 13 }}
                  >
                    Open file in new tab
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      }
      formPanel={
        <Form form={form} layout="vertical" requiredMark="optional" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
              Article Details
            </h3>
            <Form.Item name="title" label={<span style={{ fontWeight: 500, color: '#334155' }}>Title</span>} rules={[{ required: true, message: 'Title is required' }]}>
              <Input placeholder="Enter article title" style={{ borderRadius: 6 }} />
            </Form.Item>
            <Form.Item name="content" label={<span style={{ fontWeight: 500, color: '#334155' }}>Content</span>} style={{ marginBottom: 0 }}>
              <Input.TextArea
                autoSize={contentTextAreaProps}
                placeholder="Enter article content"
                showCount
                maxLength={5000}
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </div>

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
              Broadcast Details
            </h3>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="datee"
                  label={<span style={{ fontWeight: 500, color: '#334155' }}>Broadcast Date</span>}
                  rules={[{ required: true, message: 'Date is required' }]}
                >
                  <DatePicker
                    style={{ width: '100%', borderRadius: 6 }}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="journalist" label={<span style={{ fontWeight: 500, color: '#334155' }}>Anchor / Journalist</span>}>
                  <Input placeholder="Enter anchor or journalist name" style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="timee" label={<span style={{ fontWeight: 500, color: '#334155' }}>Time (WIB)</span>} extra={<span style={{ fontSize: 11, color: '#94a3b8' }}>24-hour format</span>}>
                  <TimePicker
                    format="HH:mm"
                    use12Hours={false}
                    inputReadOnly
                    placeholder="HH:mm"
                    style={{ width: '100%', borderRadius: 6 }}
                    needConfirm={false}
                    showNow={false}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="duration" label={<span style={{ fontWeight: 500, color: '#334155' }}>Duration (seconds)</span>} style={{ marginBottom: 0 }}>
                  <Input placeholder="e.g. 163" inputMode="numeric" style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      }
    />
  )
}

interface OnlineArticleQcEditDrawerProps {
  open: boolean
  article: OnlineArticleRow | null
  form: FormInstance
  loading: boolean
  onClose: () => void
  onSave: () => void
}

export function OnlineArticleQcEditDrawer({
  open,
  article,
  form,
  loading,
  onClose,
  onSave,
}: OnlineArticleQcEditDrawerProps) {
  const contentTextAreaProps = useContentTextAreaProps()

  if (!article) {
    return (
      <QcTopDrawerShell
        title="QC — Edit Online Article"
        open={open}
        variant="edit"
        onClose={onClose}
        footer={null}
      >
        {null}
      </QcTopDrawerShell>
    )
  }

  const fileUrl = article.url || article.file_pdf || null

  return (
    <QcEditDrawerShell
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>QC — Edit Online Article</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
            ID: {formatArticleIdDisplay(article.article_id)}
          </span>
        </div>
      }
      open={open}
      loading={loading}
      onClose={onClose}
      onSave={onSave}
      alertDescription="Review reference data on the left, then correct title, content, URL, and publication metadata on the right."
      heroEyebrow={`Online · Article ${formatArticleIdDisplay(article.article_id)}`}
      heroTitle={article.title}
      metaItems={buildOnlineMetaItems(article)}
      referencePanel={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reference Metadata
            </h3>
            <OnlineArticleMetaDescriptions article={article} />
          </div>

          {article.content?.trim() ? (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current Content
              </h3>
              <Paragraph style={{ fontSize: 13, lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-wrap', margin: 0, maxHeight: 300, overflowY: 'auto' }}>
                {article.content}
              </Paragraph>
            </div>
          ) : null}

          {fileUrl ? (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Link / File
              </h3>
              <Button
                type="link"
                icon={<LinkOutlined />}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: 0, fontSize: 13 }}
              >
                {fileUrl}
              </Button>
            </div>
          ) : null}
        </div>
      }
      formPanel={
        <Form form={form} layout="vertical" requiredMark="optional" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
              Article Details
            </h3>
            <Form.Item name="title" label={<span style={{ fontWeight: 500, color: '#334155' }}>Title</span>} rules={[{ required: true, message: 'Title is required' }]}>
              <Input placeholder="Enter article title" style={{ borderRadius: 6 }} />
            </Form.Item>
            <Form.Item name="content" label={<span style={{ fontWeight: 500, color: '#334155' }}>Content</span>}>
              <Input.TextArea
                autoSize={contentTextAreaProps}
                placeholder="Enter article content"
                showCount
                maxLength={5000}
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
            <Form.Item name="journalist" label={<span style={{ fontWeight: 500, color: '#334155' }}>Journalist</span>}>
              <Input placeholder="Enter journalist name" style={{ borderRadius: 6 }} />
            </Form.Item>
            <Form.Item name="url" label={<span style={{ fontWeight: 500, color: '#334155' }}>Link URL</span>} extra={<span style={{ fontSize: 11, color: '#94a3b8' }}>Stored in file_pdf when saved</span>}>
              <Input placeholder="https://..." style={{ borderRadius: 6 }} />
            </Form.Item>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="pages" label={<span style={{ fontWeight: 500, color: '#334155' }}>Pages</span>}>
                  <InputNumber style={{ width: '100%', borderRadius: 6 }} min={0} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="mm_col" label={<span style={{ fontWeight: 500, color: '#334155' }}>MM Column</span>} style={{ marginBottom: 0 }}>
                  <InputNumber style={{ width: '100%', borderRadius: 6 }} min={0} step={0.01} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
              Publication details
            </h3>
            <Form.Item
              name="datee"
              label={<span style={{ fontWeight: 500, color: '#334155' }}>Publication Date</span>}
              rules={[{ required: true, message: 'Date is required' }]}
              style={{ marginBottom: 0 }}
            >
              <DatePicker
                style={{ width: '100%', borderRadius: 6 }}
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </div>
        </Form>
      }
    />
  )
}
