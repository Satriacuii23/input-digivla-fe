'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  App,
  Button,
  Card,
  Form,
  Grid,
  Input,
  Segmented,
  Select,
  Table,
} from 'antd'
import type { TableProps } from 'antd/es/table'
import { ReloadOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/layout/page-header'
import { ListTableSkeleton, shouldShowTableSkeleton } from '@/components/ui/page-loading'
import { ToolbarIconButton } from '@/components/ui/toolbar-icon-button'
import { ListSearchResultInfo } from '@/components/ui/list-search-result-info'
import {
  parseDateForForm,
  parseWibTimeForForm,
  prepareArticleQcUpdatePayload,
  prepareOnlineArticleQcUpdatePayload,
  getQcUploadDateRange,
  type ArticleListApiPath,
  type ArticleRow,
  type OnlineArticleRow,
  type QcUploadPeriod,
} from '@/lib/articles/article-list-helpers'
import {
  buildArticleListColumns,
  getArticleTableScrollX,
} from '@/components/articles/article-list-columns'
import {
  buildOnlineArticleListColumns,
  getOnlineArticleTableScrollX,
} from '@/components/articles/online-article-list-columns'
import { ArticleQcEditDrawer, ArticleQcPreviewDrawer, OnlineArticleQcEditDrawer, OnlineArticleQcPreviewDrawer } from '@/components/articles/article-qc-drawers'
import { ArticleDeleteDrawer } from '@/components/articles/article-list-drawers'
import { fetchOnlineMediaOptions } from '@/lib/api/online-media'

interface MediaOption {
  value: string
  label: string
}

export type QcMediaKind = 'tv' | 'radio' | 'online'

export interface ArticleQcPageConfig {
  kind: QcMediaKind
  title: string
  description: string
  breadcrumbLabel: string
  apiPath: ArticleListApiPath
  mediaTypeId?: number
  fileLabel?: string
  uploadDateHint: string
}

function mapOnlineRow(raw: Record<string, unknown>): OnlineArticleRow {
  return {
    id: Number(raw.id),
    article_id: Number(raw.article_id),
    media_id: Number(raw.media_id),
    media_name: String(raw.media_name || ''),
    title: String(raw.title || ''),
    content: String(raw.content || ''),
    datee: String(raw.datee || ''),
    journalist: String(raw.journalist || ''),
    url: raw.url != null ? String(raw.url) : null,
    file_pdf: raw.file_pdf != null ? String(raw.file_pdf) : null,
    pages: Number(raw.pages ?? 0),
    mm_col: Number(raw.mm_col ?? 0),
    created_at: String(raw.created_at || ''),
  }
}

function mapBroadcastRow(raw: Record<string, unknown>): ArticleRow {
  return {
    id: Number(raw.id),
    article_id: Number(raw.article_id),
    media_id: Number(raw.media_id),
    media_name: String(raw.media_name || ''),
    title: String(raw.title || ''),
    content: String(raw.content || ''),
    datee: String(raw.datee || ''),
    timee: String(raw.timee || ''),
    journalist: String(raw.journalist || ''),
    duration: String(raw.duration || ''),
    filee: String(raw.filee || ''),
    created_at: String(raw.created_at || raw.createAt || ''),
  }
}

export function ArticleQcPage({ config }: { config: ArticleQcPageConfig }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  const [articles, setArticles] = useState<(ArticleRow | OnlineArticleRow)[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaOptions, setMediaOptions] = useState<MediaOption[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 })
  const [search, setSearch] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [uploadPeriod, setUploadPeriod] = useState<QcUploadPeriod>('today_yesterday')

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewArticle, setPreviewArticle] = useState<ArticleRow | OnlineArticleRow | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editArticle, setEditArticle] = useState<ArticleRow | OnlineArticleRow | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ArticleRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const uploadRange = useMemo(() => getQcUploadDateRange(uploadPeriod), [uploadPeriod])

  useEffect(() => {
    const loadMedia = async () => {
      try {
        if (config.kind === 'online') {
          const options = await fetchOnlineMediaOptions()
          setMediaOptions(options)
          return
        }
        const res = await fetch(`/api/media/type/by-id/${config.mediaTypeId}`, { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        setMediaOptions(
          data.map((m: { media_id: number; media_name: string }) => ({
            value: String(m.media_id),
            label: m.media_name,
          })),
        )
      } catch (error) {
        console.error('Failed to load media options:', error)
      }
    }
    loadMedia()
  }, [config.kind, config.mediaTypeId])

  const fetchArticles = useCallback(
    async (page = 1, limit = pagination.limit) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          _t: String(Date.now()),
        })
        if (search) params.set('search', search)
        if (selectedMedia) params.set('media_id', selectedMedia)
        params.set('created_start_date', uploadRange[0])
        params.set('created_end_date', uploadRange[1])

        const res = await fetch(`${config.apiPath}?${params.toString()}`, {
          credentials: 'include',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        })

        if (res.ok) {
          const data = await res.json()
          const rows = (data.data || []).map((row: Record<string, unknown>) =>
            config.kind === 'online' ? mapOnlineRow(row) : mapBroadcastRow(row),
          )
          setArticles(rows)
          if (data.pagination) {
            setPagination({
              page: data.pagination.page,
              limit: data.pagination.limit ?? limit,
              total: data.pagination.total,
            })
          }
        } else if (res.status === 401) {
          message.error('Session expired, please log in again')
        }
      } catch {
        message.error(`Failed to load ${config.breadcrumbLabel} articles for QC`)
      } finally {
        setLoading(false)
      }
    },
    [search, selectedMedia, uploadRange, config.apiPath, config.breadcrumbLabel, pagination.limit, message],
  )

  useEffect(() => {
    fetchArticles(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchArticles(1), 400)
    return () => clearTimeout(timer)
  }, [search, selectedMedia, uploadPeriod, fetchArticles])

  const handleTableChange: TableProps<ArticleRow | OnlineArticleRow>['onChange'] = (pag) => {
    const nextPage = pag.current ?? 1
    const nextLimit = pag.pageSize ?? pagination.limit
    if (nextLimit !== pagination.limit) {
      setPagination((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
      fetchArticles(1, nextLimit)
      return
    }
    fetchArticles(nextPage, nextLimit)
  }

  const openQcEdit = (article: ArticleRow | OnlineArticleRow) => {
    setEditArticle(article)
    if (config.kind === 'online') {
      const online = article as OnlineArticleRow
      form.setFieldsValue({
        title: online.title,
        content: online.content || '',
        journalist: online.journalist || '',
        url: online.url || '',
        pages: online.pages || undefined,
        mm_col: online.mm_col || undefined,
        datee: parseDateForForm(online.datee),
      })
    } else {
      const broadcast = article as ArticleRow
      form.setFieldsValue({
        title: broadcast.title,
        content: broadcast.content || '',
        journalist: broadcast.journalist || '',
        timee: parseWibTimeForForm(broadcast.timee),
        duration: broadcast.duration || '',
        datee: parseDateForForm(broadcast.datee),
      })
    }
    setEditOpen(true)
  }

  const openPreview = (article: ArticleRow | OnlineArticleRow) => {
    setPreviewArticle(article)
    setPreviewOpen(true)
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setPreviewArticle(null)
  }

  const handleQcUpdate = async () => {
    if (!editArticle) return
    try {
      const values = await form.validateFields()
      setEditLoading(true)
      const payload =
        config.kind === 'online'
          ? prepareOnlineArticleQcUpdatePayload(values)
          : prepareArticleQcUpdatePayload(values)

      const res = await fetch(`${config.apiPath}/${editArticle.article_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      if (res.ok) {
        message.success('Article updated successfully')
        setEditOpen(false)
        setEditArticle(null)
        fetchArticles(pagination.page)
      } else {
        const data = await res.json().catch(() => ({}))
        message.error(data.detail || 'Unable to update article')
      }
    } catch {
      /* validation */
    } finally {
      setEditLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`${config.apiPath}/${deleteTarget.article_id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        message.success('Article deleted successfully')
        setDeleteOpen(false)
        setDeleteTarget(null)
        fetchArticles(pagination.page)
      } else if (res.status === 404) {
        message.info('Article no longer exists')
        setDeleteOpen(false)
        setDeleteTarget(null)
        fetchArticles(pagination.page)
      } else if (res.status === 403) {
        message.error('Only admins can delete articles')
      } else {
        message.error('Unable to delete article')
      }
    } catch {
      message.error('An error occurred while deleting')
    } finally {
      setDeleteLoading(false)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedMedia(null)
    setUploadPeriod('today_yesterday')
  }

  const hasActiveFilters = Boolean(search || selectedMedia || uploadPeriod !== 'today_yesterday')

  const broadcastColumns = useMemo(
    () =>
      buildArticleListColumns({
        searchKeyword: search,
        editAriaLabel: 'Quality control edit',
        onPreview: openPreview,
        onEdit: openQcEdit,
        onDelete: (article) => {
          setDeleteTarget(article)
          setDeleteOpen(true)
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search],
  )

  const onlineColumns = useMemo(
    () =>
      buildOnlineArticleListColumns({
        searchKeyword: search,
        editAriaLabel: 'Quality control edit',
        onPreview: openPreview,
        onEdit: openQcEdit,
        onDelete: (article) => {
          setDeleteTarget(article as unknown as ArticleRow)
          setDeleteOpen(true)
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search],
  )

  const uploadPeriodLabel =
    uploadPeriod === 'today_only' ? 'Uploaded today' : 'Uploaded today & yesterday'

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumb={[
          { title: 'Home', href: '/dashboard' },
          { title: 'Quality Control', href: '/qc/tv' },
          { title: config.breadcrumbLabel },
        ]}
      />

      <Card variant="borderless" className="digivla-page-card digivla-list-table-card digivla-article-list-card digivla-qc-page-card">
        <div className="digivla-table-toolbar digivla-qc-toolbar">
          <Input
            placeholder="Search title or content..."
            prefix={<SearchOutlined />}
            allowClear
            className="digivla-toolbar-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            placeholder="All Media"
            allowClear
            showSearch
            optionFilterProp="label"
            className="digivla-toolbar-select"
            value={selectedMedia ?? undefined}
            onChange={(v) => setSelectedMedia(v ?? null)}
            options={mediaOptions}
          />
          <Segmented
            className="digivla-qc-period-segmented"
            value={uploadPeriod}
            onChange={(v) => setUploadPeriod(v as QcUploadPeriod)}
            options={[
              { label: 'Today + Yesterday', value: 'today_yesterday' },
              { label: 'Today Only', value: 'today_only' },
            ]}
          />
          {hasActiveFilters && (
            <Button icon={<CloseOutlined />} onClick={clearFilters} className="digivla-toolbar-reset">
              Reset Filter
            </Button>
          )}
          <div className="digivla-toolbar-actions">
            <ToolbarIconButton
              label="Refresh"
              icon={<ReloadOutlined />}
              onClick={() => fetchArticles(pagination.page)}
            />
          </div>
        </div>

        <div className="digivla-qc-period-info">
          <span className="digivla-qc-period-label">{uploadPeriodLabel}</span>
          <span className="digivla-qc-period-range">
            {uploadRange[0]} — {uploadRange[1]}
          </span>
          <span className="digivla-qc-period-hint">{config.uploadDateHint}</span>
        </div>

        <ListSearchResultInfo keyword={search} total={pagination.total} loading={loading} />

        {shouldShowTableSkeleton(loading, articles.length) ? (
          <ListTableSkeleton columns={config.kind === 'online' ? 8 : 10} rows={8} />
        ) : config.kind === 'online' ? (
          <Table<OnlineArticleRow>
            rowKey="article_id"
            size="middle"
            className="digivla-data-table digivla-article-table"
            columns={onlineColumns}
            dataSource={articles as OnlineArticleRow[]}
            loading={loading}
            scroll={{ x: getOnlineArticleTableScrollX(search) }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '15', '25', '50'],
              showTotal: (total) => `${total} article(s)`,
            }}
            onChange={handleTableChange as TableProps<OnlineArticleRow>['onChange']}
          />
        ) : (
          <Table<ArticleRow>
            rowKey="article_id"
            size="middle"
            className="digivla-data-table digivla-article-table"
            columns={broadcastColumns}
            dataSource={articles as ArticleRow[]}
            loading={loading}
            scroll={{ x: getArticleTableScrollX(search) }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '15', '25', '50'],
              showTotal: (total) => `${total} article(s)`,
            }}
            onChange={handleTableChange as TableProps<ArticleRow>['onChange']}
          />
        )}
      </Card>

      {config.kind === 'online' ? (
        <OnlineArticleQcPreviewDrawer
          open={previewOpen}
          article={previewArticle as OnlineArticleRow | null}
          searchKeyword={search}
          editButtonLabel="QC Edit"
          onClose={closePreview}
          onEdit={openQcEdit}
        />
      ) : (
        <ArticleQcPreviewDrawer
          open={previewOpen}
          article={previewArticle as ArticleRow | null}
          mediaLabel={config.breadcrumbLabel}
          fileLabel={config.fileLabel || 'Media File'}
          searchKeyword={search}
          editButtonLabel="QC Edit"
          onClose={closePreview}
          onEdit={openQcEdit}
        />
      )}

      {config.kind === 'online' ? (
        <OnlineArticleQcEditDrawer
          open={editOpen}
          article={editArticle as OnlineArticleRow | null}
          form={form}
          loading={editLoading}
          onClose={() => {
            if (!editLoading) {
              setEditOpen(false)
              setEditArticle(null)
            }
          }}
          onSave={handleQcUpdate}
        />
      ) : (
        <ArticleQcEditDrawer
          open={editOpen}
          article={editArticle as ArticleRow | null}
          mediaLabel={config.breadcrumbLabel}
          fileLabel={config.fileLabel || 'Media File'}
          form={form}
          loading={editLoading}
          onClose={() => {
            if (!editLoading) {
              setEditOpen(false)
              setEditArticle(null)
            }
          }}
          onSave={handleQcUpdate}
        />
      )}

      <ArticleDeleteDrawer
        open={deleteOpen}
        article={deleteTarget}
        width={isMobile ? '100%' : 440}
        title={`Delete ${config.breadcrumbLabel} Article`}
        loading={deleteLoading}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      />
    </>
  )
}
