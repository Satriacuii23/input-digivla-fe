'use client'

import {
  Alert,
  Button,
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

const { Text, Paragraph } = Typography

type DrawerWidth = number | string

export function OnlineArticleMetaDescriptions({ article }: { article: OnlineArticleRow }) {
  const fileLabel = getOnlineArticleFileLabel(article)
  const fileHref = getOnlineArticleFileHref(article)

  return (
    <Descriptions column={1} size="small" className="digivla-drawer-desc digivla-article-drawer-meta">
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
      <Descriptions.Item label="Journalist">{article.journalist?.trim() || '—'}</Descriptions.Item>
      <Descriptions.Item label="Pages">{article.pages || '—'}</Descriptions.Item>
      <Descriptions.Item label="MM Column">{article.mm_col || '—'}</Descriptions.Item>
      <Descriptions.Item label="File">
        {fileLabel ? (
          fileHref ? (
            <Button
              type="link"
              icon={<LinkOutlined />}
              href={fileHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: 0, height: 'auto', fontSize: 13 }}
            >
              {fileLabel}
            </Button>
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
      title={
        article ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>Preview Online Article</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
              ID: {formatArticleIdDisplay(article.article_id)}
            </span>
          </div>
        ) : (
          'Preview Online Article'
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
                <span style={{ fontSize: 11, color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                  Journalist
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
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Publication Date</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{formatArticleDateLong(article.datee) || '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Pages</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.pages || '—'}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>MM Column</Text>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{article.mm_col || '—'}</Text>
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
                Content
              </h3>
              <Paragraph style={{ fontSize: 14, lineHeight: '1.7', color: '#1e293b', whiteSpace: 'pre-wrap', margin: 0 }}>
                <HighlightSearchText text={article.content} keyword={searchKeyword} />
              </Paragraph>
            </div>
          )}

          {fileLabel && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
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
          )}
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
      title={
        article ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>Edit Online Article</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
              ID: {formatArticleIdDisplay(article.article_id)}
            </span>
          </div>
        ) : (
          'Edit Online Article'
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
              <Form.Item name="content" label={<span style={{ fontWeight: 500, color: '#334155' }}>Content</span>}>
                <Input.TextArea rows={6} placeholder="Enter article content" showCount maxLength={5000} style={{ borderRadius: 6 }} />
              </Form.Item>
              <Form.Item name="journalist" label={<span style={{ fontWeight: 500, color: '#334155' }}>Journalist</span>}>
                <Input placeholder="Enter journalist name" style={{ borderRadius: 6 }} />
              </Form.Item>
              <Form.Item name="url" label={<span style={{ fontWeight: 500, color: '#334155' }}>File / URL</span>} extra={<span style={{ fontSize: 11, color: '#94a3b8' }}>Stored in file_pdf when saved</span>} style={{ marginBottom: 0 }}>
                <Input placeholder="https://..." style={{ borderRadius: 6 }} />
              </Form.Item>
            </div>

            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                Publication Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item name="pages" label={<span style={{ fontWeight: 500, color: '#334155' }}>Pages</span>} style={{ marginBottom: 0 }}>
                  <InputNumber style={{ width: '100%', borderRadius: 6 }} min={0} />
                </Form.Item>
                <Form.Item name="mm_col" label={<span style={{ fontWeight: 500, color: '#334155' }}>MM Column</span>} style={{ marginBottom: 0 }}>
                  <InputNumber style={{ width: '100%', borderRadius: 6 }} min={0} step={0.01} />
                </Form.Item>
              </div>
            </div>
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
      title={<span style={{ fontWeight: 600, color: '#dc2626', fontSize: 16 }}>Delete Online Article</span>}
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
            title={<span style={{ fontWeight: 600, color: '#991b1b' }}>Warning: Permanent Deletion</span>}
            description="This action cannot be undone. All references, metadata, and associated file bindings will be permanently deleted."
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
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Publication Date:</span> <span style={{ color: '#b91c1c' }}>{formatArticleDateLong(article.datee) || '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Journalist:</span> <span style={{ color: '#b91c1c' }}>{article.journalist?.trim() || '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>Pages:</span> <span style={{ color: '#b91c1c' }}>{article.pages || '—'}</span></div>
              <div><span style={{ color: '#7f1d1d', fontWeight: 500 }}>MM Column:</span> <span style={{ color: '#b91c1c' }}>{article.mm_col || '—'}</span></div>
            </div>
            {fileLabel && (
              <div style={{ marginTop: 16, borderTop: '1px dashed #fecaca', paddingTop: 12 }}>
                <span style={{ color: '#7f1d1d', fontWeight: 500, fontSize: 13 }}>Attached File / URL:</span>
                <div style={{ fontSize: 12, wordBreak: 'break-all', color: '#b91c1c', marginTop: 4, fontFamily: 'monospace', background: '#fff', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: 4 }}>
                  {fileLabel}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  )
}
