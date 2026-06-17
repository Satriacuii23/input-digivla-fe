'use client'

import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Tag,
  Typography,
} from 'antd'
import type { FormInstance } from 'antd/es/form'
import {
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  SaveOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import { HighlightSearchText } from '@/components/ui/highlight-search-text'
import {
  ARTICLE_DRAWER_STYLES,
  formatArticleDateLong,
  formatArticleIdDisplay,
  formatCreatedAtDisplay,
  getOnlineArticleFileHref,
  getOnlineArticleFileLabel,
  type OnlineArticleRow,
} from '@/lib/articles/article-list-helpers'

const { Text, Paragraph, Link } = Typography

type DrawerWidth = number | string

export function OnlineArticleMetaDescriptions({ article }: { article: OnlineArticleRow }) {
  const fileLabel = getOnlineArticleFileLabel(article)
  const fileHref = getOnlineArticleFileHref(article)

  return (
    <Descriptions column={1} size="small" className="digivla-drawer-desc digivla-article-drawer-meta">
      <Descriptions.Item label="Article ID">
        <Tag color="blue" className="digivla-article-tag-id">
          {formatArticleIdDisplay(article.article_id)}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Media">{article.media_name || '—'}</Descriptions.Item>
      <Descriptions.Item label="Media ID">{article.media_id}</Descriptions.Item>
      <Descriptions.Item label="Date">{formatArticleDateLong(article.datee) || '—'}</Descriptions.Item>
      <Descriptions.Item label="Journalist">{article.journalist?.trim() || '—'}</Descriptions.Item>
      <Descriptions.Item label="Pages">{article.pages || '—'}</Descriptions.Item>
      <Descriptions.Item label="MM Column">{article.mm_col || '—'}</Descriptions.Item>
      <Descriptions.Item label="File">
        {fileLabel ? (
          fileHref ? (
            <Link href={fileHref} target="_blank" rel="noopener noreferrer" className="digivla-table-file-link">
              {fileLabel}
            </Link>
          ) : (
            <Text className="digivla-table-file-link">{fileLabel}</Text>
          )
        ) : (
          '—'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Created At">
        {article.created_at ? formatCreatedAtDisplay(article.created_at) : '—'}
      </Descriptions.Item>
    </Descriptions>
  )
}

interface OnlineArticlePreviewDrawerProps {
  open: boolean
  article: OnlineArticleRow | null
  width: DrawerWidth
  searchKeyword?: string
  editButtonLabel?: string
  onClose: () => void
  onEdit: (article: OnlineArticleRow) => void
}

export function OnlineArticlePreviewDrawer({
  open,
  article,
  width,
  searchKeyword,
  editButtonLabel = 'Edit Article',
  onClose,
  onEdit,
}: OnlineArticlePreviewDrawerProps) {
  const fileLabel = article ? getOnlineArticleFileLabel(article) : ''
  const fileHref = article ? getOnlineArticleFileHref(article) : null

  return (
    <Drawer
      title="Preview Online Article"
      open={open}
      onClose={onClose}
      size={width}
      destroyOnClose
      className="digivla-media-drawer digivla-media-drawer-view digivla-article-drawer"
      styles={ARTICLE_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer">
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Close
          </Button>
          {article && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose()
                onEdit(article)
              }}
            >
              {editButtonLabel}
            </Button>
          )}
        </div>
      }
    >
      {article && (
        <div className="digivla-drawer-stack">
          <div className="digivla-article-drawer-hero">
            <Text type="secondary" className="digivla-article-drawer-eyebrow">
              Title
            </Text>
            <Paragraph className="digivla-article-drawer-hero-title">
              <HighlightSearchText text={article.title} keyword={searchKeyword} />
            </Paragraph>
            {article.journalist?.trim() ? (
              <Text type="secondary" className="digivla-article-drawer-hero-sub">
                Journalist: {article.journalist.trim()}
              </Text>
            ) : null}
          </div>

          <Card size="small" title="Article Information" className="digivla-drawer-card">
            <OnlineArticleMetaDescriptions article={article} />
          </Card>

          {article.content?.trim() ? (
            <Card size="small" title="Content" className="digivla-drawer-card">
              <Paragraph className="digivla-article-drawer-content">
                <HighlightSearchText text={article.content} keyword={searchKeyword} />
              </Paragraph>
            </Card>
          ) : null}

          {fileLabel ? (
            <Card size="small" title="Article File / URL" className="digivla-drawer-card">
              {fileHref ? (
                <Button
                  type="link"
                  icon={<LinkOutlined />}
                  href={fileHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="digivla-article-open-file"
                >
                  {fileLabel}
                </Button>
              ) : (
                <Text className="digivla-table-file-link">{fileLabel}</Text>
              )}
            </Card>
          ) : null}
        </div>
      )}
    </Drawer>
  )
}

interface OnlineArticleEditDrawerProps {
  open: boolean
  article: OnlineArticleRow | null
  width: DrawerWidth
  form: FormInstance
  loading: boolean
  onClose: () => void
  onSave: () => void
}

export function OnlineArticleEditDrawer({
  open,
  article,
  width,
  form,
  loading,
  onClose,
  onSave,
}: OnlineArticleEditDrawerProps) {
  return (
    <Drawer
      title="Edit Online Article"
      open={open}
      onClose={onClose}
      size={width}
      destroyOnClose
      maskClosable={!loading}
      className="digivla-media-drawer digivla-media-drawer-edit digivla-article-drawer"
      styles={ARTICLE_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer">
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={onSave}>
            Save Changes
          </Button>
        </div>
      }
    >
      {article && (
        <div className="digivla-drawer-stack">
          <Alert
            type="info"
            showIcon
            title={`Editing article ${formatArticleIdDisplay(article.article_id)}`}
            description={`${article.media_name || `Media #${article.media_id}`} · ${formatArticleDateLong(article.datee) || article.datee}`}
            className="digivla-article-drawer-alert"
          />

          <Card size="small" title="Reference" className="digivla-drawer-card">
            <OnlineArticleMetaDescriptions article={article} />
          </Card>

          <Form form={form} layout="vertical" requiredMark="optional" className="digivla-drawer-form">
            <Card size="small" title="Article Information" className="digivla-drawer-card">
              <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
                <Input placeholder="Enter article title" />
              </Form.Item>
              <Form.Item name="content" label="Content">
                <Input.TextArea rows={5} placeholder="Enter article content" showCount maxLength={5000} />
              </Form.Item>
              <Form.Item name="journalist" label="Journalist">
                <Input placeholder="Enter journalist name" />
              </Form.Item>
              <Form.Item name="url" label="File / URL" extra="Stored in file_pdf when saved">
                <Input placeholder="https://..." />
              </Form.Item>
              <div className="digivla-form-grid-2">
                <Form.Item name="pages" label="Pages">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
                <Form.Item name="mm_col" label="MM Column">
                  <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
                </Form.Item>
              </div>
            </Card>
          </Form>
        </div>
      )}
    </Drawer>
  )
}

interface OnlineArticleDeleteDrawerProps {
  open: boolean
  article: OnlineArticleRow | null
  width: DrawerWidth
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function OnlineArticleDeleteDrawer({
  open,
  article,
  width,
  loading,
  onClose,
  onConfirm,
}: OnlineArticleDeleteDrawerProps) {
  const fileLabel = article ? getOnlineArticleFileLabel(article) : ''

  return (
    <Drawer
      title="Delete Online Article"
      open={open}
      onClose={() => !loading && onClose()}
      size={width}
      destroyOnClose
      maskClosable={!loading}
      className="digivla-media-drawer digivla-media-drawer-delete digivla-article-drawer"
      styles={ARTICLE_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer">
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" danger icon={<DeleteOutlined />} loading={loading} onClick={onConfirm}>
            Delete Article
          </Button>
        </div>
      }
    >
      {article && (
        <div className="digivla-drawer-stack">
          <Alert
            type="error"
            showIcon
            title="Permanent deletion"
            description="This action cannot be undone. Only admin users can delete articles."
            className="digivla-article-drawer-alert"
          />

          <Card size="small" title="Article to delete" className="digivla-drawer-card digivla-drawer-card-danger">
            <div className="digivla-article-delete-title">
              <Text strong>{article.title}</Text>
            </div>
            <Descriptions column={1} size="small" className="digivla-drawer-desc digivla-article-drawer-meta">
              <Descriptions.Item label="Article ID">
                <Text code>{formatArticleIdDisplay(article.article_id)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Media">
                {article.media_name || '—'} ({article.media_id})
              </Descriptions.Item>
              <Descriptions.Item label="Date">{formatArticleDateLong(article.datee) || '—'}</Descriptions.Item>
              <Descriptions.Item label="Journalist">{article.journalist?.trim() || '—'}</Descriptions.Item>
              {fileLabel ? (
                <Descriptions.Item label="File">
                  <Text className="digivla-table-file-link">{fileLabel}</Text>
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="Created At">
                {article.created_at ? formatCreatedAtDisplay(article.created_at) : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )}
    </Drawer>
  )
}
