import type { ReactNode } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { Button, Space, Typography } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { fileeToPublicUrl } from '@/lib/storage/media-paths-client'
import {
  formatArticleDateLong,
  formatArticleIdDisplay,
  formatCreatedAtDisplay,
  formatWibTimeDisplay,
  type ArticleRow,
} from '@/lib/articles/article-list-helpers'
import { HighlightSearchText } from '@/components/ui/highlight-search-text'
import { parseSearchTokens } from '@/lib/articles/search-keywords'

const { Text, Link } = Typography

export type { ArticleRow }

export interface ArticleColumnHandlers {
  onPreview?: (record: ArticleRow) => void
  onEdit: (record: ArticleRow) => void
  onDelete?: (record: ArticleRow) => void
  searchKeyword?: string
  editAriaLabel?: string
}

function EmptyCell() {
  return <span className="digivla-table-empty">—</span>
}

function WrapCell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="digivla-table-cell-wrap" title={title}>
      {children}
    </div>
  )
}

export function buildArticleListColumns(handlers: ArticleColumnHandlers): ColumnsType<ArticleRow> {
  const searchKeyword = handlers.searchKeyword?.trim() || ''
  const hasSearchTokens = parseSearchTokens(searchKeyword).length > 0

  const columns: ColumnsType<ArticleRow> = [
    {
      title: '#',
      dataIndex: 'id',
      width: 72,
      className: 'digivla-table-col-id',
      render: (id: number) => (
        <span className="digivla-article-id" title={formatArticleIdDisplay(id)}>
          {formatArticleIdDisplay(id)}
        </span>
      ),
    },
    {
      title: 'Article ID',
      dataIndex: 'article_id',
      width: 96,
      className: 'digivla-table-col-article-id',
      render: (articleId: number, record) =>
        handlers.onPreview ? (
          <Link
            className="digivla-article-id-link"
            onClick={() => handlers.onPreview!(record)}
          >
            {formatArticleIdDisplay(articleId)}
          </Link>
        ) : (
          <span className="digivla-article-id" title={formatArticleIdDisplay(articleId)}>
            {formatArticleIdDisplay(articleId)}
          </span>
        ),
    },
    {
      title: 'Media',
      dataIndex: 'media_id',
      width: 72,
      align: 'center',
      render: (_: number, record) => (
        <WrapCell title={record.media_name || undefined}>
          <Text className="digivla-table-cell-mono">
            {record.media_id}
          </Text>
        </WrapCell>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 200,
      render: (title: string) => (
        <WrapCell title={title}>
          <Text className="digivla-table-title-text">
            <HighlightSearchText text={title || ''} keyword={searchKeyword} />
          </Text>
        </WrapCell>
      ),
    },
    ...(hasSearchTokens
      ? [
          {
            title: 'Content',
            dataIndex: 'content',
            width: 220,
            render: (content: string) => (
              <WrapCell title={content}>
                <Text className="digivla-table-content-text">
                  <HighlightSearchText text={content || ''} keyword={searchKeyword} />
                </Text>
              </WrapCell>
            ),
          } as ColumnsType<ArticleRow>[number],
        ]
      : []),
    {
      title: 'Anchor',
      dataIndex: 'journalist',
      width: 140,
      render: (v: string) =>
        v?.trim() ? (
          <WrapCell title={v.trim()}>
            <Text className="digivla-table-cell-muted">{v.trim()}</Text>
          </WrapCell>
        ) : (
          <EmptyCell />
        ),
    },
    {
      title: 'Date',
      dataIndex: 'datee',
      width: 118,
      render: (v: string) =>
        v ? (
          <Text className="digivla-table-cell-muted">{formatArticleDateLong(v)}</Text>
        ) : (
          <EmptyCell />
        ),
    },
    {
      title: 'Time',
      dataIndex: 'timee',
      width: 64,
      align: 'center',
      render: (v: string) =>
        v ? (
          <Text className="digivla-table-cell-mono">{formatWibTimeDisplay(v)}</Text>
        ) : (
          <EmptyCell />
        ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      width: 72,
      align: 'center',
      render: (v: string) =>
        v?.trim() ? (
          <Text className="digivla-table-cell-mono">{v.trim()}</Text>
        ) : (
          <EmptyCell />
        ),
    },
    {
      title: 'File',
      dataIndex: 'filee',
      width: 220,
      render: (filee: string) => {
        if (!filee?.trim()) return <EmptyCell />
        const href = fileeToPublicUrl(filee)
        return (
          <WrapCell title={filee}>
            {href ? (
              <Link href={href} target="_blank" rel="noopener noreferrer" className="digivla-table-file-link">
                {filee}
              </Link>
            ) : (
              <Text className="digivla-table-file-link">{filee}</Text>
            )}
          </WrapCell>
        )
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      width: 168,
      render: (v: string) =>
        v ? (
          <Text className="digivla-table-cell-muted digivla-table-created-at">
            {formatCreatedAtDisplay(v)}
          </Text>
        ) : (
          <EmptyCell />
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: handlers.onPreview || handlers.onDelete ? 108 : 72,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={0} className="digivla-table-actions">
          {handlers.onPreview ? (
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              aria-label="Preview"
              onClick={() => handlers.onPreview!(record)}
            />
          ) : null}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label={handlers.editAriaLabel || 'Edit'}
            onClick={() => handlers.onEdit(record)}
          />
          {handlers.onDelete ? (
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label="Delete"
              onClick={() => handlers.onDelete!(record)}
            />
          ) : null}
        </Space>
      ),
    },
  ]

  return columns
}

export const ARTICLE_TABLE_SCROLL_X = 1320
export const ARTICLE_TABLE_SCROLL_X_WITH_CONTENT = 1540

export function getArticleTableScrollX(searchKeyword?: string): number {
  return parseSearchTokens(searchKeyword || '').length > 0
    ? ARTICLE_TABLE_SCROLL_X_WITH_CONTENT
    : ARTICLE_TABLE_SCROLL_X
}
