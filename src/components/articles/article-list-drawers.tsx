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

const { Text, Paragraph } = Typography

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
      title={
        article ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{title}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: 12 }}>
              ID: {formatArticleIdDisplay(article.article_id)}
            </span>
          </div>
        ) : (
          title
        )
      }
      open={open}
      onClose={onClose}
      styles={{
        ...ARTICLE_DRAWER_STYLES,
        wrapper: { width: width },
      }}
      destroyOnClose
      className="digivla-media-drawer digivla-media-drawer-view digivla-article-drawer"
      footer={
        <div className="digivla-drawer-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #f1f5f9', padding: '16px 24px' }}>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Close
          </Button>
          {article && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              style={{ minWidth: 120 }}
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
        <div className="digivla-drawer-stack" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="digivla-article-drawer-hero" style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: 8, borderLeft: '4px solid #3b82f6' }}>
            <Text type="secondary" style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 6 }}>
              Title
            </Text>
            <Paragraph style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.5 }}>
              <HighlightSearchText text={article.title} keyword={searchKeyword} />
            </Paragraph>
            {article.journalist?.trim() && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                  Anchor / Journalist
                </span>
                <Text style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{article.journalist.trim()}</Text>
              </div>
            )}
          </div>

          <Card
            size="small"
            title={<span style={{ fontWeight: 600, color: '#1e293b' }}>Article Metadata</span>}
            className="digivla-drawer-card"
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 12px' }}>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Media</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.media_name || '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Media ID</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.media_id || '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Broadcast Date</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{formatArticleDateLong(article.datee) || '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Broadcast Time (WIB)</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.timee ? formatWibTimeDisplay(article.timee) : '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Duration</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.duration ? `${article.duration.trim()} seconds` : '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Created At</Text>
                <Text style={{ fontSize: 13, color: '#64748b' }}>{article.created_at ? formatCreatedAtDisplay(article.created_at) : '—'}</Text>
              </div>
            </div>
          </Card>

          {article.content?.trim() && (
            <Card
              size="small"
              title={<span style={{ fontWeight: 600, color: '#1e293b' }}>Content / Summary</span>}
              className="digivla-drawer-card"
              style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <Paragraph style={{ fontSize: 14, lineHeight: '1.7', color: '#334155', whiteSpace: 'pre-wrap', margin: 0 }}>
                <HighlightSearchText text={article.content} keyword={searchKeyword} />
              </Paragraph>
            </Card>
          )}

          {article.filee && (
            <Card
              size="small"
              title={<span style={{ fontWeight: 600, color: '#1e293b' }}>{fileLabel}</span>}
              className="digivla-drawer-card digivla-drawer-card-media"
              style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <video
                controls
                style={{ width: '100%', borderRadius: 6, border: '1px solid #e2e8f0', background: '#000', maxHeight: 360 }}
                src={fileUrl ?? undefined}
              >
                Your browser does not support the media tag.
              </video>
              {fileUrl && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: 0 }}
                  >
                    Open file in new tab
                  </Button>
                </div>
              )}
            </Card>
          )}
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
      title={
        article ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{title}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: 12 }}>
              ID: {formatArticleIdDisplay(article.article_id)}
            </span>
          </div>
        ) : (
          title
        )
      }
      open={open}
      onClose={onClose}
      styles={{
        ...ARTICLE_DRAWER_STYLES,
        wrapper: { width: width },
      }}
      destroyOnClose
      maskClosable={!loading}
      className="digivla-media-drawer digivla-media-drawer-edit digivla-article-drawer"
      footer={
        <div className="digivla-drawer-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #f1f5f9', padding: '16px 24px' }}>
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={onSave} style={{ minWidth: 140 }}>
            Save Changes
          </Button>
        </div>
      }
    >
      {article && (
        <div className="digivla-drawer-stack" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: 8, borderLeft: '4px solid #2563eb' }}>
            <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#1e40af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
              Active Reference
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 12px', fontSize: 12 }}>
              <div><span style={{ color: '#1e40af', fontWeight: 500 }}>Media:</span> <span style={{ color: '#1e3a8a' }}>{article.media_name || '—'}</span></div>
              <div><span style={{ color: '#1e40af', fontWeight: 500 }}>Date:</span> <span style={{ color: '#1e3a8a' }}>{formatArticleDateLong(article.datee) || '—'}</span></div>
            </div>
          </div>

          <Form form={form} layout="vertical" requiredMark="optional" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card size="small" title={<span style={{ fontWeight: 600, color: '#1e293b' }}>Article Content</span>} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <Form.Item name="title" label={<span style={{ fontWeight: 500 }}>Title</span>} rules={[{ required: true, message: 'Title is required' }]}>
                <Input placeholder="Enter article title" />
              </Form.Item>
              <Form.Item name="content" label={<span style={{ fontWeight: 500 }}>Content / Summary</span>}>
                <Input.TextArea rows={6} placeholder="Enter article content" showCount maxLength={5000} />
              </Form.Item>
            </Card>

            <Card size="small" title={<span style={{ fontWeight: 600, color: '#1e293b' }}>Broadcast Details</span>} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <Form.Item name="journalist" label={<span style={{ fontWeight: 500 }}>Anchor / Journalist</span>}>
                <Input placeholder="Enter anchor or journalist name" />
              </Form.Item>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item
                  name="timee"
                  label={<span style={{ fontWeight: 500 }}>Time (WIB)</span>}
                  extra={<span style={{ fontSize: 11, color: '#94a3b8' }}>24-hour format</span>}
                >
                  <TimePicker
                    format="HH:mm"
                    use12Hours={false}
                    inputReadOnly
                    placeholder="HH:mm"
                    style={{ width: '100%' }}
                    needConfirm={false}
                    showNow={false}
                  />
                </Form.Item>
                <Form.Item name="duration" label={<span style={{ fontWeight: 500 }}>Duration (seconds)</span>}>
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
      title={<span style={{ fontWeight: 600, color: '#dc2626' }}>{title}</span>}
      open={open}
      onClose={() => !loading && onClose()}
      styles={{
        ...ARTICLE_DRAWER_STYLES,
        wrapper: { width: width },
      }}
      destroyOnClose
      maskClosable={!loading}
      className="digivla-media-drawer digivla-media-drawer-delete digivla-article-drawer"
      footer={
        <div className="digivla-drawer-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #fee2e2', padding: '16px 24px', background: '#fff5f5' }}>
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" danger icon={<DeleteOutlined />} loading={loading} onClick={onConfirm} style={{ minWidth: 150 }}>
            Confirm Delete
          </Button>
        </div>
      }
    >
      {article && (
        <div className="digivla-drawer-stack" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Alert
            type="error"
            showIcon
            message={<span style={{ fontWeight: 600 }}>Permanent Deletion Warning</span>}
            description="This action cannot be undone. Once deleted, this article and its associated video file references will be permanently removed."
            style={{ borderRadius: 8 }}
          />

          <Card
            size="small"
            title={<span style={{ fontWeight: 600, color: '#991b1b' }}>Article to delete</span>}
            style={{ borderRadius: 8, border: '1px solid #fee2e2', background: '#fff5f5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: '#991b1b', marginBottom: 12, borderBottom: '1px dashed #fecaca', paddingBottom: 8 }}>
              {article.title}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 10px', fontSize: 13 }}>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Article ID:</span> <span style={{ color: '#b91c1c' }}>{formatArticleIdDisplay(article.article_id)}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Media Name:</span> <span style={{ color: '#b91c1c' }}>{article.media_name || '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Broadcast Date:</span> <span style={{ color: '#b91c1c' }}>{formatArticleDateLong(article.datee) || '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Broadcast Time:</span> <span style={{ color: '#b91c1c' }}>{article.timee ? formatWibTimeDisplay(article.timee) : '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Anchor / Writer:</span> <span style={{ color: '#b91c1c' }}>{article.journalist?.trim() || '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Duration:</span> <span style={{ color: '#b91c1c' }}>{article.duration ? `${article.duration.trim()} seconds` : '—'}</span></div>
            </div>
            {article.filee && (
              <div style={{ marginTop: 12, borderTop: '1px dashed #fecaca', paddingTop: 8 }}>
                <span style={{ color: '#7f1d1d', fontWeight: 500, fontSize: 13 }}>Attached File:</span>
                <div style={{ fontSize: 12, wordBreak: 'break-all', color: '#b91c1c', marginTop: 2, fontFamily: 'monospace', background: '#fef2f2', padding: '4px 8px', borderRadius: 4 }}>
                  {article.filee}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </Drawer>
  )
}
