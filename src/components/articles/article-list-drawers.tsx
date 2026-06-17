'use client'

import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Tag,
  TimePicker,
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
import { fileeToPublicUrl } from '@/lib/storage/media-paths-client'
import { HighlightSearchText } from '@/components/ui/highlight-search-text'
import {
  ARTICLE_DRAWER_STYLES,
  formatArticleDateLong,
  formatCreatedAtDisplay,
  formatArticleIdDisplay,
  formatWibTimeDisplay,
  type ArticleRow,
} from '@/lib/articles/article-list-helpers'

const { Text, Paragraph, Link } = Typography

type DrawerWidth = number | string

export function ArticleMetaDescriptions({ article }: { article: ArticleRow }) {
  return (
    <Descriptions
      column={1}
      size="small"
      className="digivla-drawer-desc digivla-article-drawer-meta"
    >
      <Descriptions.Item label="Row ID">
        <Text code className="digivla-article-id-inline">
          {formatArticleIdDisplay(article.id)}
        </Text>
      </Descriptions.Item>
      <Descriptions.Item label="Article ID">
        <Tag color="blue" className="digivla-article-tag-id">
          {formatArticleIdDisplay(article.article_id)}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Media">{article.media_name || '—'}</Descriptions.Item>
      <Descriptions.Item label="Media ID">{article.media_id}</Descriptions.Item>
      <Descriptions.Item label="Date">{formatArticleDateLong(article.datee) || '—'}</Descriptions.Item>
      <Descriptions.Item label="Time (WIB)">
        {article.timee ? formatWibTimeDisplay(article.timee) : '—'}
      </Descriptions.Item>
      <Descriptions.Item label="Duration (sec)">{article.duration?.trim() || '—'}</Descriptions.Item>
      <Descriptions.Item label="Created At">
        {article.created_at ? formatCreatedAtDisplay(article.created_at) : '—'}
      </Descriptions.Item>
    </Descriptions>
  )
}

interface ArticlePreviewDrawerProps {
  open: boolean
  article: ArticleRow | null
  width: DrawerWidth
  fileLabel: string
  title: string
  searchKeyword?: string
  editButtonLabel?: string
  onClose: () => void
  onEdit: (article: ArticleRow) => void
}

export function ArticlePreviewDrawer({
  open,
  article,
  width,
  fileLabel,
  title,
  searchKeyword,
  editButtonLabel = 'Edit Article',
  onClose,
  onEdit,
}: ArticlePreviewDrawerProps) {
  const fileUrl = article?.filee ? fileeToPublicUrl(article.filee) : null

  return (
    <Drawer
      title={title}
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
                Anchor: {article.journalist.trim()}
              </Text>
            ) : null}
          </div>

          <Card size="small" title="Article Information" className="digivla-drawer-card">
            <ArticleMetaDescriptions article={article} />
          </Card>

          {article.content?.trim() ? (
            <Card size="small" title="Content" className="digivla-drawer-card">
              <Paragraph className="digivla-article-drawer-content">
                <HighlightSearchText text={article.content} keyword={searchKeyword} />
              </Paragraph>
            </Card>
          ) : null}

          {article.filee ? (
            <Card size="small" title={fileLabel} className="digivla-drawer-card digivla-drawer-card-media">
              <video
                controls
                className="digivla-article-media-player"
                src={fileUrl ?? undefined}
              >
                Your browser does not support the media tag.
              </video>
              <div className="digivla-article-file-actions">
                {fileUrl ? (
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
                ) : null}
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </Drawer>
  )
}

interface ArticleEditDrawerProps {
  open: boolean
  article: ArticleRow | null
  width: DrawerWidth
  title: string
  form: FormInstance
  loading: boolean
  onClose: () => void
  onSave: () => void
}

export function ArticleEditDrawer({
  open,
  article,
  width,
  title,
  form,
  loading,
  onClose,
  onSave,
}: ArticleEditDrawerProps) {
  return (
    <Drawer
      title={title}
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
            <ArticleMetaDescriptions article={article} />
          </Card>

          <Form form={form} layout="vertical" requiredMark="optional" className="digivla-drawer-form">
            <Card size="small" title="Article Information" className="digivla-drawer-card">
              <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
                <Input placeholder="Enter article title" />
              </Form.Item>
              <Form.Item name="content" label="Content">
                <Input.TextArea rows={5} placeholder="Enter article content" showCount maxLength={5000} />
              </Form.Item>
            </Card>

            <Card size="small" title="Broadcast Details" className="digivla-drawer-card">
              <Form.Item name="journalist" label="Anchor / Journalist">
                <Input placeholder="Enter anchor or journalist name" />
              </Form.Item>
              <div className="digivla-form-grid-2">
                <Form.Item
                  name="timee"
                  label="Time (WIB)"
                  extra="24 jam · UTC+7"
                >
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
                <Form.Item name="duration" label="Duration (seconds)">
                  <Input placeholder="e.g. 163" inputMode="numeric" />
                </Form.Item>
              </div>
            </Card>
          </Form>
        </div>
      )}
    </Drawer>
  )
}

interface ArticleDeleteDrawerProps {
  open: boolean
  article: ArticleRow | null
  width: DrawerWidth
  title: string
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ArticleDeleteDrawer({
  open,
  article,
  width,
  title,
  loading,
  onClose,
  onConfirm,
}: ArticleDeleteDrawerProps) {
  return (
    <Drawer
      title={title}
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
              <Descriptions.Item label="Row ID">
                <Text code>{formatArticleIdDisplay(article.id)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Article ID">
                <Text code>{formatArticleIdDisplay(article.article_id)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Media">
                {article.media_name || '—'} ({article.media_id})
              </Descriptions.Item>
              <Descriptions.Item label="Date">{formatArticleDateLong(article.datee) || '—'}</Descriptions.Item>
              <Descriptions.Item label="Time (WIB)">
                {article.timee ? formatWibTimeDisplay(article.timee) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Anchor">{article.journalist?.trim() || '—'}</Descriptions.Item>
              <Descriptions.Item label="Duration (sec)">{article.duration?.trim() || '—'}</Descriptions.Item>
              {article.filee ? (
                <Descriptions.Item label="File">
                  <Text className="digivla-table-file-link">{article.filee}</Text>
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
