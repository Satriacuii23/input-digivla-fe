'use client'

import type { ReactNode } from 'react'
import dayjs from 'dayjs'
import {
  Alert,
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
  title: string
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
    <div className={`digivla-qc-top-drawer-footer${isMobile ? ' digivla-qc-top-drawer-footer--stacked' : ''}`}>
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
    <div className="digivla-article-drawer-hero digivla-qc-drawer-hero">
      <Text type="secondary" className="digivla-article-drawer-eyebrow">
        {eyebrow}
      </Text>
      <Paragraph className="digivla-article-drawer-hero-title">{title}</Paragraph>
      <ul className="digivla-qc-drawer-meta-list">
        {metaItems.map((item) => (
          <li key={item.label} className="digivla-qc-drawer-meta-item">
            <span className="digivla-qc-drawer-meta-label">{item.label}</span>
            <span className="digivla-qc-drawer-meta-value">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface QcEditDrawerShellProps {
  title: string
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
          <Button block={isMobile} icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            block={isMobile}
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={onSave}
          >
            Save QC Changes
          </Button>
        </QcTopDrawerFooter>
      }
    >
      <div className="digivla-qc-top-drawer-body">
        <QcDrawerHero eyebrow={heroEyebrow} title={heroTitle} metaItems={metaItems} />

        <Alert
          type="info"
          showIcon
          title="Quality control review"
          description={
            isMobile
              ? 'Review reference data, then update the form below.'
              : alertDescription
          }
          className="digivla-article-drawer-alert digivla-qc-edit-alert"
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
      title={`Preview — ${mediaLabel} Article`}
      open={open}
      variant="preview"
      onClose={onClose}
      footer={
        article ? (
          <QcTopDrawerFooter isMobile={isMobile}>
            <Button block={isMobile} icon={<CloseOutlined />} onClick={onClose}>
              Close
            </Button>
            <Button
              block={isMobile}
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose()
                onEdit(article)
              }}
            >
              {editButtonLabel}
            </Button>
          </QcTopDrawerFooter>
        ) : null
      }
    >
      {article ? (
        <div className="digivla-qc-top-drawer-body">
          <QcDrawerHero
            eyebrow={`${mediaLabel} · Article ${formatArticleIdDisplay(article.article_id)}`}
            title={article.title}
            metaItems={buildBroadcastMetaItems(article)}
          />

          <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]} className="digivla-qc-preview-layout">
            <Col xs={24} lg={hasMedia ? 14 : 24} xl={hasMedia ? 15 : 24}>
              <div className="digivla-qc-preview-main">
                <Card size="small" title="Article Information" className="digivla-drawer-card digivla-qc-panel-card">
                  <ArticleMetaDescriptions article={article} />
                </Card>

                {article.content?.trim() ? (
                  <Card size="small" title="Content" className="digivla-drawer-card digivla-qc-panel-card">
                    <Paragraph className="digivla-article-drawer-content digivla-qc-preview-content">
                      <HighlightSearchText text={article.content} keyword={searchKeyword} />
                    </Paragraph>
                  </Card>
                ) : null}
              </div>
            </Col>

            {hasMedia ? (
              <Col xs={24} lg={10} xl={9}>
                <Card
                  size="small"
                  title={fileLabel}
                  className="digivla-drawer-card digivla-drawer-card-media digivla-qc-panel-card digivla-qc-preview-media-card"
                >
                  <video
                    controls
                    className="digivla-article-media-player digivla-qc-preview-media-player"
                    src={fileeToPublicUrl(article.filee) ?? undefined}
                  >
                    Your browser does not support the media tag.
                  </video>
                  {fileeToPublicUrl(article.filee) ? (
                    <div className="digivla-article-file-actions">
                      <Button
                        type="link"
                        icon={<LinkOutlined />}
                        href={fileeToPublicUrl(article.filee)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="digivla-article-open-file"
                      >
                        Open file in new tab
                      </Button>
                    </div>
                  ) : null}
                </Card>
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
      title="Preview — Online Article"
      open={open}
      variant="preview"
      onClose={onClose}
      footer={
        article ? (
          <QcTopDrawerFooter isMobile={isMobile}>
            <Button block={isMobile} icon={<CloseOutlined />} onClick={onClose}>
              Close
            </Button>
            <Button
              block={isMobile}
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose()
                onEdit(article)
              }}
            >
              {editButtonLabel}
            </Button>
          </QcTopDrawerFooter>
        ) : null
      }
    >
      {article ? (
        <div className="digivla-qc-top-drawer-body">
          <QcDrawerHero
            eyebrow={`Online · Article ${formatArticleIdDisplay(article.article_id)}`}
            title={article.title}
            metaItems={buildOnlineMetaItems(article)}
          />

          <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]} className="digivla-qc-preview-layout">
            <Col xs={24} lg={hasFile ? 14 : 24} xl={hasFile ? 15 : 24}>
              <div className="digivla-qc-preview-main">
                <Card size="small" title="Article Information" className="digivla-drawer-card digivla-qc-panel-card">
                  <OnlineArticleMetaDescriptions article={article} />
                </Card>

                {article.content?.trim() ? (
                  <Card size="small" title="Content" className="digivla-drawer-card digivla-qc-panel-card">
                    <Paragraph className="digivla-article-drawer-content digivla-qc-preview-content">
                      <HighlightSearchText text={article.content} keyword={searchKeyword} />
                    </Paragraph>
                  </Card>
                ) : null}
              </div>
            </Col>

            {hasFile ? (
              <Col xs={24} lg={10} xl={9}>
                <Card size="small" title="Article File / URL" className="digivla-drawer-card digivla-qc-panel-card">
                  {fileHref ? (
                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      href={fileHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="digivla-qc-edit-url-link"
                    >
                      {fileLabel}
                    </Button>
                  ) : (
                    <Text className="digivla-table-file-link">{fileLabel}</Text>
                  )}
                </Card>
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
      title={`QC — Edit ${mediaLabel} Article`}
      open={open}
      loading={loading}
      onClose={onClose}
      onSave={onSave}
      alertDescription="Review reference data on the left, then correct title, content, broadcast date, time, and metadata on the right."
      heroEyebrow={`${mediaLabel} · Article ${formatArticleIdDisplay(article.article_id)}`}
      heroTitle={article.title}
      metaItems={buildBroadcastMetaItems(article)}
      referencePanel={
        <>
          <Card size="small" title="Reference" className="digivla-drawer-card digivla-qc-panel-card">
            <ArticleMetaDescriptions article={article} />
          </Card>

          {article.content?.trim() ? (
            <Card size="small" title="Current Content" className="digivla-drawer-card digivla-qc-panel-card">
              <Paragraph className="digivla-article-drawer-content digivla-qc-edit-content-preview">
                {article.content}
              </Paragraph>
            </Card>
          ) : null}

          {article.filee ? (
            <Card
              size="small"
              title={fileLabel}
              className="digivla-drawer-card digivla-drawer-card-media digivla-qc-panel-card digivla-qc-edit-media-card"
            >
              <video
                controls
                className="digivla-article-media-player digivla-qc-edit-media-player"
                src={fileUrl ?? undefined}
              >
                Your browser does not support the media tag.
              </video>
              {fileUrl ? (
                <div className="digivla-article-file-actions">
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="digivla-article-open-file"
                  >
                    Open file in new tab
                  </Button>
                </div>
              ) : null}
            </Card>
          ) : null}
        </>
      }
      formPanel={
        <Form form={form} layout="vertical" requiredMark="optional" className="digivla-drawer-form digivla-qc-edit-form">
          <Card size="small" title="Article Information" className="digivla-drawer-card digivla-qc-panel-card digivla-qc-edit-form-main">
            <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
              <Input placeholder="Enter article title" size="large" />
            </Form.Item>
            <Form.Item name="content" label="Content" className="digivla-qc-edit-content-item">
              <Input.TextArea
                autoSize={contentTextAreaProps}
                placeholder="Enter article content"
                showCount
                maxLength={5000}
                className="digivla-qc-edit-content-field"
              />
            </Form.Item>
          </Card>

          <Card size="small" title="Broadcast Details" className="digivla-drawer-card digivla-qc-panel-card digivla-qc-edit-form-details">
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="datee"
                  label="Broadcast Date"
                  rules={[{ required: true, message: 'Date is required' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="journalist" label="Anchor / Journalist">
                  <Input placeholder="Enter anchor or journalist name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="timee" label="Time (WIB)" extra="24 jam · UTC+7">
                  <TimePicker
                    format="HH:mm"
                    use12Hours={false}
                    inputReadOnly
                    placeholder="HH:mm"
                    className="digivla-wib-time-picker"
                    style={{ width: '100%' }}
                    needConfirm={false}
                    showNow={false}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="duration" label="Duration (seconds)" style={{ marginBottom: 0 }}>
                  <Input placeholder="e.g. 163" inputMode="numeric" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
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
      title="QC — Edit Online Article"
      open={open}
      loading={loading}
      onClose={onClose}
      onSave={onSave}
      alertDescription="Review reference data on the left, then correct title, content, URL, and publication metadata on the right."
      heroEyebrow={`Online · Article ${formatArticleIdDisplay(article.article_id)}`}
      heroTitle={article.title}
      metaItems={buildOnlineMetaItems(article)}
      referencePanel={
        <>
          <Card size="small" title="Reference" className="digivla-drawer-card digivla-qc-panel-card">
            <OnlineArticleMetaDescriptions article={article} />
          </Card>

          {article.content?.trim() ? (
            <Card size="small" title="Current Content" className="digivla-drawer-card digivla-qc-panel-card">
              <Paragraph className="digivla-article-drawer-content digivla-qc-edit-content-preview">
                {article.content}
              </Paragraph>
            </Card>
          ) : null}

          {fileUrl ? (
            <Card size="small" title="Link / File" className="digivla-drawer-card digivla-qc-panel-card">
              <Button
                type="link"
                icon={<LinkOutlined />}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="digivla-qc-edit-url-link"
              >
                {fileUrl}
              </Button>
            </Card>
          ) : null}
        </>
      }
      formPanel={
        <Form form={form} layout="vertical" requiredMark="optional" className="digivla-drawer-form digivla-qc-edit-form">
          <Card size="small" title="Article Information" className="digivla-drawer-card digivla-qc-panel-card digivla-qc-edit-form-main">
            <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
              <Input placeholder="Enter article title" size="large" />
            </Form.Item>
            <Form.Item name="content" label="Content" className="digivla-qc-edit-content-item">
              <Input.TextArea
                autoSize={contentTextAreaProps}
                placeholder="Enter article content"
                showCount
                maxLength={5000}
                className="digivla-qc-edit-content-field"
              />
            </Form.Item>
            <Form.Item name="journalist" label="Journalist">
              <Input placeholder="Enter journalist name" />
            </Form.Item>
            <Form.Item name="url" label="Link URL" extra="Stored in file_pdf when saved">
              <Input placeholder="https://..." />
            </Form.Item>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="pages" label="Pages">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="mm_col" label="MM Column" style={{ marginBottom: 0 }}>
                  <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="Publication Details" className="digivla-drawer-card digivla-qc-panel-card digivla-qc-edit-form-details">
            <Form.Item
              name="datee"
              label="Publication Date"
              rules={[{ required: true, message: 'Date is required' }]}
              style={{ marginBottom: 0 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Card>
        </Form>
      }
    />
  )
}
