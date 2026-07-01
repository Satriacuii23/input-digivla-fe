'use client'

import {
  Alert,
  Button,
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
            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>{title}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
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
        <div className="digivla-drawer-stack" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 6 }}>
              Title
            </Text>
            <Paragraph style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.45 }}>
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

          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Article Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px' }}>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Media</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.media_name || '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Media ID</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.media_id || '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Broadcast Date</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{formatArticleDateLong(article.datee) || '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Broadcast Time (WIB)</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.timee ? formatWibTimeDisplay(article.timee) : '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Duration</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.duration ? `${article.duration.trim()} seconds` : '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Created At</Text>
                <Text style={{ fontSize: 13, color: '#64748b' }}>{article.created_at ? formatCreatedAtDisplay(article.created_at) : '—'}</Text>
              </div>
            </div>
          </div>

          {article.content?.trim() && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Content / Summary
              </h3>
              <Paragraph style={{ fontSize: 14, lineHeight: '1.7', color: '#1e293b', whiteSpace: 'pre-wrap', margin: 0 }}>
                <HighlightSearchText text={article.content} keyword={searchKeyword} />
              </Paragraph>
            </div>
          )}

          {article.filee && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {fileLabel}
              </h3>
              <video
                controls
                style={{ width: '100%', borderRadius: 8, border: '1px solid #e2e8f0', background: '#000', maxHeight: 380, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                src={fileUrl ?? undefined}
              >
                Your browser does not support the media tag.
              </video>
              {fileUrl && (
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
              )}
            </div>
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
            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>{title}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
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
        <div className="digivla-drawer-stack" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
              Reference Info
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 12px', fontSize: 13 }}>
              <div><span style={{ color: '#64748b' }}>Media:</span> <span style={{ color: '#334155', fontWeight: 500 }}>{article.media_name || '—'}</span></div>
              <div><span style={{ color: '#64748b' }}>Date:</span> <span style={{ color: '#334155', fontWeight: 500 }}>{formatArticleDateLong(article.datee) || '—'}</span></div>
            </div>
          </div>

          <Form form={form} layout="vertical" requiredMark="optional" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                Article Details
              </h3>
              <Form.Item name="title" label={<span style={{ fontWeight: 500, color: '#334155' }}>Title</span>} rules={[{ required: true, message: 'Title is required' }]}>
                <Input placeholder="Enter article title" style={{ borderRadius: 6 }} />
              </Form.Item>
              <Form.Item name="content" label={<span style={{ fontWeight: 500, color: '#334155' }}>Content / Summary</span>} style={{ marginBottom: 0 }}>
                <Input.TextArea rows={6} placeholder="Enter article content" showCount maxLength={5000} style={{ borderRadius: 6 }} />
              </Form.Item>
            </div>

            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                Broadcast Details
              </h3>
              <Form.Item name="journalist" label={<span style={{ fontWeight: 500, color: '#334155' }}>Anchor / Journalist</span>}>
                <Input placeholder="Enter anchor or journalist name" style={{ borderRadius: 6 }} />
              </Form.Item>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item
                  name="timee"
                  label={<span style={{ fontWeight: 500, color: '#334155' }}>Time (WIB)</span>}
                  extra={<span style={{ fontSize: 11, color: '#94a3b8' }}>24-hour format</span>}
                >
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
                <Form.Item name="duration" label={<span style={{ fontWeight: 500, color: '#334155' }}>Duration (seconds)</span>}>
                  <Input placeholder="e.g. 163" inputMode="numeric" style={{ borderRadius: 6 }} />
                </Form.Item>
              </div>
            </div>
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
      title={<span style={{ fontWeight: 600, color: '#dc2626', fontSize: 16 }}>{title}</span>}
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
        <div className="digivla-drawer-stack" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Alert
            type="error"
            showIcon
            message={<span style={{ fontWeight: 600, color: '#991b1b' }}>Warning: Permanent Deletion</span>}
            description="This action cannot be undone. All references, metadata, and associated video file bindings will be permanently deleted."
            style={{ borderRadius: 8, background: '#fef2f2', border: '1px solid #fee2e2' }}
          />

          <div style={{ padding: 20, background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 8 }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>
              Article to Delete
            </h4>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#991b1b', lineHeight: 1.4, marginBottom: 16, paddingBottom: 12, borderBottom: '1px dashed #fecaca' }}>
              {article.title}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 20px', fontSize: 13 }}>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Article ID:</span> <span style={{ color: '#b91c1c' }}>{formatArticleIdDisplay(article.article_id)}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Media:</span> <span style={{ color: '#b91c1c' }}>{article.media_name || '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Broadcast Date:</span> <span style={{ color: '#b91c1c' }}>{formatArticleDateLong(article.datee) || '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Broadcast Time:</span> <span style={{ color: '#b91c1c' }}>{article.timee ? formatWibTimeDisplay(article.timee) : '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Anchor / Writer:</span> <span style={{ color: '#b91c1c' }}>{article.journalist?.trim() || '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Duration:</span> <span style={{ color: '#b91c1c' }}>{article.duration ? `${article.duration.trim()} seconds` : '—'}</span></div>
            </div>
            {article.filee && (
              <div style={{ marginTop: 16, borderTop: '1px dashed #fecaca', paddingTop: 12 }}>
                <span style={{ color: '#7f1d1d', fontWeight: 500, fontSize: 13 }}>Attached File:</span>
                <div style={{ fontSize: 12, wordBreak: 'break-all', color: '#b91c1c', marginTop: 4, fontFamily: 'monospace', background: '#fff', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: 4 }}>
                  {article.filee}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  )
}
