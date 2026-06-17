import type { ReactNode } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { Button, Space, Typography } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons'
import {
  formatArticleDateLong,
  formatArticleIdDisplay,
  formatCreatedAtDisplay,
  getOnlineArticleFileHref,
  getOnlineArticleFileLabel,
  type OnlineArticleRow,
} from '@/lib/articles/article-list-helpers'
import { HighlightSearchText } from '@/components/ui/highlight-search-text'
import { parseSearchTokens } from '@/lib/articles/search-keywords'

const { Text, Link } = Typography

export type { OnlineArticleRow }

export interface OnlineArticleColumnHandlers {
  onPreview?: (record: OnlineArticleRow) => void
  onEdit: (record: OnlineArticleRow) => void
  onDelete?: (record: OnlineArticleRow) => void
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

export function buildOnlineArticleListColumns(
  handlers: OnlineArticleColumnHandlers,
): ColumnsType<OnlineArticleRow> {
  const searchKeyword = handlers.searchKeyword?.trim() || ''
  const hasSearchTokens = parseSearchTokens(searchKeyword).length > 0

  const columns: ColumnsType<OnlineArticleRow> = [
    {
      title: 'Article ID',
      dataIndex: 'article_id',
      width: 96,
      className: 'digivla-table-col-article-id',
      render: (articleId: number, record) =>
        handlers.onPreview ? (
          <Link className="digivla-article-id-link" onClick={() => handlers.onPreview!(record)}>
            {formatArticleIdDisplay(articleId)}
          </Link>
        ) : (
          <span className="digivla-article-id" title={formatArticleIdDisplay(articleId)}>
            {formatArticleIdDisplay(articleId)}
          </span>
        ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 220,
      render: (title: string) => (
        <WrapCell title={title}>
          <Text className="digivla-table-title-text">
            <HighlightSearchText text={title || ''} keyword={searchKeyword} />
          </Text>
        </WrapCell>
      ),
    },
    {
      title: 'Media',
      dataIndex: 'media_name',
      width: 148,
      render: (name: string, record) => {
        const label = name?.trim() || `Media #${record.media_id}`
        return (
          <WrapCell title={label}>
            <Text className="digivla-table-cell-muted">{label}</Text>
          </WrapCell>
        )
      },
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
          } as ColumnsType<OnlineArticleRow>[number],
        ]
      : []),
    {
      title: 'Journalist',
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
      title: 'File',
      key: 'file',
      width: 220,
      render: (_, record) => {
        const label = getOnlineArticleFileLabel(record)
        if (!label) return <EmptyCell />
        const href = getOnlineArticleFileHref(record)
        return (
          <WrapCell title={label}>
            {href ? (
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="digivla-table-file-link"
              >
                <LinkOutlined /> {label}
              </Link>
            ) : (
              <Text className="digivla-table-file-link">{label}</Text>
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

export const ONLINE_ARTICLE_TABLE_SCROLL_X = 1180
export const ONLINE_ARTICLE_TABLE_SCROLL_X_WITH_CONTENT = 1400

export function getOnlineArticleTableScrollX(searchKeyword?: string): number {
  return parseSearchTokens(searchKeyword || '').length > 0
    ? ONLINE_ARTICLE_TABLE_SCROLL_X_WITH_CONTENT
    : ONLINE_ARTICLE_TABLE_SCROLL_X
}
