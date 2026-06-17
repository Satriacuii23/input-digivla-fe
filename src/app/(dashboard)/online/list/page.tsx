'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Grid,
  Input,
  Select,
  Table,
} from 'antd'
import type { TableProps } from 'antd/es/table'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CalendarOutlined,
  CloseOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { PageHeader } from '@/components/layout/page-header'
import { ListTableSkeleton, shouldShowTableSkeleton } from '@/components/ui/page-loading'
import { ToolbarIconButton } from '@/components/ui/toolbar-icon-button'
import { ListSearchResultInfo } from '@/components/ui/list-search-result-info'
import {
  getTodayDateString,
  prepareOnlineArticleUpdatePayload,
  fetchOnlineArticleById,
  type DuplicateArticleMatch,
} from '@/lib/articles/article-list-helpers'
import {
  buildOnlineArticleListColumns,
  getOnlineArticleTableScrollX,
  type OnlineArticleRow,
} from '@/components/articles/online-article-list-columns'
import {
  OnlineArticlePreviewDrawer,
  OnlineArticleEditDrawer,
  OnlineArticleDeleteDrawer,
} from '@/components/articles/online-article-list-drawers'
import { ArticleDuplicateCheckDrawer } from '@/components/articles/article-duplicate-check-drawer'
import { fetchOnlineMediaOptions } from '@/lib/api/online-media'

const { RangePicker } = DatePicker
const { useBreakpoint } = Grid

interface MediaOption {
  value: string
  label: string
}

export default function OnlineListPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const drawerWidth = isMobile ? '100%' : 480
  const viewDrawerWidth = isMobile ? '100%' : 560
  const deleteDrawerWidth = isMobile ? '100%' : 440

  const [articles, setArticles] = useState<OnlineArticleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaOptions, setMediaOptions] = useState<MediaOption[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [search, setSearch] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    getTodayDateString(),
    getTodayDateString(),
  ])
  const [showAllDates, setShowAllDates] = useState(false)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewArticle, setPreviewArticle] = useState<OnlineArticleRow | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editArticle, setEditArticle] = useState<OnlineArticleRow | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OnlineArticleRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [dupOpen, setDupOpen] = useState(false)

  useEffect(() => {
    fetchOnlineMediaOptions()
      .then(setMediaOptions)
      .catch(console.error)
  }, [])

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
        if (!showAllDates) {
          const start = dateRange[0] || getTodayDateString()
          const end = dateRange[1] || getTodayDateString()
          params.set('start_date', start)
          params.set('end_date', end)
        }

        const res = await fetch(`/api/articles/online?${params.toString()}`, {
          credentials: 'include',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        })

        if (res.ok) {
          const data = await res.json()
          setArticles(data.data || [])
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
        message.error('Failed to load online articles')
      } finally {
        setLoading(false)
      }
    },
    [search, selectedMedia, dateRange, showAllDates, pagination.limit, message],
  )

  useEffect(() => {
    fetchArticles(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchArticles(1), 400)
    return () => clearTimeout(t)
  }, [search, selectedMedia, dateRange, showAllDates, fetchArticles])

  const handleTableChange: TableProps<OnlineArticleRow>['onChange'] = (pag) => {
    const nextPage = pag.current ?? 1
    const nextLimit = pag.pageSize ?? pagination.limit
    if (nextLimit !== pagination.limit) {
      setPagination((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
      fetchArticles(1, nextLimit)
      return
    }
    fetchArticles(nextPage, nextLimit)
  }

  const openPreview = (article: OnlineArticleRow) => {
    setPreviewArticle(article)
    setPreviewOpen(true)
  }

  const openDuplicatePreview = async (duplicate: DuplicateArticleMatch) => {
    const article = await fetchOnlineArticleById(duplicate.article_id)
    if (article) {
      setDupOpen(false)
      openPreview(article)
    } else {
      message.error('Unable to load article preview')
    }
  }

  const openEdit = (article: OnlineArticleRow) => {
    setEditArticle(article)
    form.setFieldsValue({
      title: article.title,
      content: article.content || '',
      journalist: article.journalist || '',
      url: article.url || article.file_pdf || '',
      pages: article.pages ?? undefined,
      mm_col: article.mm_col ?? undefined,
    })
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editArticle) return
    try {
      const values = await form.validateFields()
      setEditLoading(true)
      const res = await fetch(`/api/articles/online/${editArticle.article_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prepareOnlineArticleUpdatePayload(values)),
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
      const res = await fetch(`/api/articles/online/${deleteTarget.article_id}`, {
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
    setDateRange([getTodayDateString(), getTodayDateString()])
    setShowAllDates(false)
    fetchArticles(1)
  }

  const hasActiveFilters = Boolean(search || selectedMedia || showAllDates)

  const rangeValue: [Dayjs, Dayjs] | null =
    dateRange[0] && dateRange[1] ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null

  const columns = useMemo(
    () =>
      buildOnlineArticleListColumns({
        searchKeyword: search,
        onPreview: openPreview,
        onEdit: openEdit,
        onDelete: (article) => {
          setDeleteTarget(article)
          setDeleteOpen(true)
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search],
  )

  return (
    <>
      <PageHeader
        title="Online Article List"
        description="Browse, preview, and manage online media articles."
        breadcrumb={[{ title: 'Home', href: '/dashboard' }, { title: 'Online Articles' }]}
        extra={
          <Link href="/online/upload">
            <Button type="primary" icon={<PlusOutlined />}>
              Upload Online
            </Button>
          </Link>
        }
      />

      <Card variant="borderless" className="digivla-page-card digivla-list-table-card digivla-article-list-card">
        <div className="digivla-table-toolbar">
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
          <RangePicker
            className="digivla-toolbar-datepicker"
            value={rangeValue}
            disabled={showAllDates}
            onChange={(dates) => {
              if (dates?.[0] && dates?.[1]) {
                setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')])
              } else {
                setDateRange([null, null])
              }
            }}
            format="DD/MM/YYYY"
          />
          <Button
            type={showAllDates ? 'primary' : 'default'}
            icon={<CalendarOutlined />}
            onClick={() => setShowAllDates((v) => !v)}
          >
            {showAllDates ? 'Today' : 'All Dates'}
          </Button>
          {hasActiveFilters && (
            <Button icon={<CloseOutlined />} onClick={clearFilters} className="digivla-toolbar-reset">
              Reset Filter
            </Button>
          )}
          <div className="digivla-toolbar-actions">
            <ToolbarIconButton
              label="Check Duplicate"
              icon={<CopyOutlined />}
              onClick={() => setDupOpen(true)}
            />
            <ToolbarIconButton
              label="Refresh"
              icon={<ReloadOutlined />}
              onClick={() => fetchArticles(pagination.page)}
            />
          </div>
        </div>

        <ListSearchResultInfo
          keyword={search}
          total={pagination.total}
          loading={loading && Boolean(search.trim())}
        />

        {shouldShowTableSkeleton(loading, articles.length) ? (
          <ListTableSkeleton rows={10} columnWidths={[96, 220, 148, 140, 118, 220, 168, 108]} />
        ) : (
          <Table<OnlineArticleRow>
            rowKey="article_id"
            className="digivla-data-table digivla-article-list-table"
            columns={columns}
            dataSource={articles}
            loading={loading}
            size="middle"
            tableLayout="fixed"
            scroll={{ x: getOnlineArticleTableScrollX(search) }}
            onChange={handleTableChange}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total.toLocaleString('en-US')} articles`,
              className: 'digivla-table-pagination',
              showLessItems: isMobile,
              simple: isMobile,
            }}
            locale={{ emptyText: 'No online articles found' }}
          />
        )}
      </Card>

      <OnlineArticlePreviewDrawer
        open={previewOpen}
        article={previewArticle}
        width={viewDrawerWidth}
        searchKeyword={search}
        onClose={() => {
          setPreviewOpen(false)
          setPreviewArticle(null)
        }}
        onEdit={openEdit}
      />

      <OnlineArticleEditDrawer
        open={editOpen}
        article={editArticle}
        width={drawerWidth}
        form={form}
        loading={editLoading}
        onClose={() => {
          setEditOpen(false)
          setEditArticle(null)
        }}
        onSave={handleUpdate}
      />

      <OnlineArticleDeleteDrawer
        open={deleteOpen}
        article={deleteTarget}
        width={deleteDrawerWidth}
        loading={deleteLoading}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      />

      <ArticleDuplicateCheckDrawer
        open={dupOpen}
        onClose={() => setDupOpen(false)}
        width={drawerWidth}
        apiPath="/api/articles/online"
        mediaOptions={mediaOptions}
        onPreview={openDuplicatePreview}
      />
    </>
  )
}
