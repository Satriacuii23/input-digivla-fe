'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  App,
  Button,
  Card,
  Form,
  Grid,
  Input,
  Select,
  Table,
  Tooltip,
} from 'antd'
import type { TableProps } from 'antd/es/table'
import type { SortOrder } from 'antd/es/table/interface'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CopyOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { Media, MediaListResponse, MediaType } from '@/lib/types/media'
import { MEDIA_TABLE_SCROLL_X } from '@/lib/media/media-list-helpers'
import { PageHeader } from '@/components/layout/page-header'
import { ListTableSkeleton, shouldShowTableSkeleton } from '@/components/ui/page-loading'
import { ToolbarIconButton } from '@/components/ui/toolbar-icon-button'
import { buildMediaListColumns } from '@/components/media/media-list-columns'
import {
  MediaEditDrawer,
  MediaDeleteDrawer,
  MediaDuplicateCheckDrawer,
} from '@/components/media/media-list-drawers'

const { useBreakpoint } = Grid

export default function MediaListPage() {
  const { message } = App.useApp()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const drawerWidth = isMobile ? '100%' : 480
  const deleteDrawerWidth = isMobile ? '100%' : 440

  const [form] = Form.useForm()
  const [dupForm] = Form.useForm()

  const [data, setData] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [idSortOrder, setIdSortOrder] = useState<SortOrder>('descend')

  const [editOpen, setEditOpen] = useState(false)
  const [editMedia, setEditMedia] = useState<Media | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [dupOpen, setDupOpen] = useState(false)
  const [dupLoading, setDupLoading] = useState(false)
  const [dupResult, setDupResult] = useState<{
    exists: boolean
    media: { media_id: number; media_name: string; status: string } | null
  } | null>(null)

  useEffect(() => {
    fetch('/api/media/types', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setMediaTypes)
      .catch(console.error)
  }, [])

  const fetchData = useCallback(
    async (page = 1, order: 'asc' | 'desc' = sortOrder, limit = pagination.limit) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sort_order: order,
        })
        if (search) params.append('search', search)
        if (typeFilter) params.append('media_type_id', typeFilter.toString())
        if (statusFilter) params.append('status', statusFilter)

        const res = await fetch(`/api/media?${params.toString()}`, { credentials: 'include' })
        if (res.ok) {
          const result: MediaListResponse = await res.json()
          setData(result.data ?? [])
          if (result.pagination) {
            setPagination({
              page: result.pagination.page,
              limit: result.pagination.limit,
              total: result.pagination.total,
            })
          }
        } else {
          setData([])
          if (res.status === 401) message.error('Session expired, please log in again')
        }
      } catch {
        message.error('Failed to load media data')
      } finally {
        setLoading(false)
      }
    },
    [search, typeFilter, statusFilter, pagination.limit, sortOrder, message]
  )

  useEffect(() => {
    fetchData(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchData(1), 400)
    return () => clearTimeout(t)
  }, [search, typeFilter, statusFilter, fetchData])

  const handleTableChange: TableProps<Media>['onChange'] = (pag, _filters, sorter) => {
    const nextPage = pag.current ?? 1
    const nextLimit = pag.pageSize ?? pagination.limit

    let nextSort = sortOrder
    if (!Array.isArray(sorter) && sorter.field === 'media_id' && sorter.order) {
      nextSort = sorter.order === 'ascend' ? 'asc' : 'desc'
      setSortOrder(nextSort)
      setIdSortOrder(sorter.order)
    }

    if (nextLimit !== pagination.limit) {
      setPagination((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
      fetchData(1, nextSort, nextLimit)
      return
    }

    fetchData(nextPage, nextSort, nextLimit)
  }

  const openEdit = (media: Media) => {
    setEditMedia(media)
    form.setFieldsValue({
      media_name: media.media_name,
      media_type: media.media_type,
      tier: media.tier || undefined,
      circulation: media.circulation ?? undefined,
      rate_bw: media.rate_bw ?? undefined,
      rate_fc: media.rate_fc ?? undefined,
      language: media.language || 'IDN',
      status: media.status === 'Active',
    })
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editMedia) return
    try {
      const values = await form.validateFields()
      setEditLoading(true)
      const res = await fetch(`/api/media/${editMedia.media_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          tier: values.tier || null,
          circulation: values.circulation ?? null,
          rate_bw: values.rate_bw ?? null,
          rate_fc: values.rate_fc ?? null,
          status: values.status ? 'Active' : 'Inactive',
        }),
      })
      if (res.ok) {
        message.success('Media updated successfully')
        setEditOpen(false)
        fetchData(pagination.page)
      } else {
        const err = await res.json()
        message.error(err.error || 'Failed to update media')
      }
    } catch {
      /* validation */
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/media/${deleteTarget.media_id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok || res.status === 200) {
        message.success('Media deleted successfully')
        setDeleteOpen(false)
        setDeleteTarget(null)
        fetchData(pagination.page)
      } else {
        const err = await res.json()
        message.error(err.error || 'Failed to delete media')
      }
    } catch {
      message.error('An error occurred')
    } finally {
      setDeleteLoading(false)
    }
  }

  const checkDuplicate = async () => {
    try {
      const { name } = await dupForm.validateFields()
      setDupLoading(true)
      setDupResult(null)
      const res = await fetch(
        `/api/media/check-duplicate?media_name=${encodeURIComponent(name.trim())}`,
        { credentials: 'include' },
      )
      if (res.ok) {
        const data = await res.json()
        setDupResult({ exists: data.exists, media: data.media })
      }
    } catch {
      /* validation */
    } finally {
      setDupLoading(false)
    }
  }

  const handleDupDrawerChange = (open: boolean) => {
    if (open) {
      setDupResult(null)
      setDupLoading(false)
      dupForm.resetFields()
      return
    }
    setDupResult(null)
    setDupLoading(false)
    dupForm.resetFields()
  }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter(null)
    setStatusFilter(null)
    fetchData(1)
  }

  const hasActiveFilters = Boolean(search || typeFilter || statusFilter)

  const columns = useMemo(
    () =>
      buildMediaListColumns({
        searchKeyword: search,
        idSortOrder,
        onEdit: openEdit,
        onDelete: (media) => {
          setDeleteTarget(media)
          setDeleteOpen(true)
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, idSortOrder]
  )

  return (
    <>
      <PageHeader
        title="Media List"
        description="Manage TV, Radio, and Online media master data."
        breadcrumb={[{ title: 'Home', href: '/dashboard' }, { title: 'Media List' }]}
        extra={
          <Link href="/media/add">
            {isMobile ? (
              <Tooltip title="Add Media">
                <Button type="primary" icon={<PlusOutlined />} aria-label="Add Media" />
              </Tooltip>
            ) : (
              <Button type="primary" icon={<PlusOutlined />}>
                Add Media
              </Button>
            )}
          </Link>
        }
      />

      <Card variant="borderless" className="digivla-page-card digivla-list-table-card">
        <div className="digivla-table-toolbar">
          <Input
            placeholder="Search media name..."
            prefix={<SearchOutlined />}
            allowClear
            className="digivla-toolbar-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            placeholder="All Types"
            allowClear
            showSearch
            optionFilterProp="label"
            className="digivla-toolbar-select"
            value={typeFilter ?? undefined}
            onChange={(v) => setTypeFilter(v ?? null)}
            options={mediaTypes.map((t) => ({
              value: t.media_type_id,
              label: t.media_type_name || t.media_type_en || '',
            }))}
          />
          <Select
            placeholder="All Status"
            allowClear
            className="digivla-toolbar-select digivla-toolbar-select-sm"
            value={statusFilter ?? undefined}
            onChange={(v) => setStatusFilter(v ?? null)}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
          {hasActiveFilters && (
            <Button icon={<CloseOutlined />} onClick={clearFilters} className="digivla-toolbar-reset">
              Reset Filter
            </Button>
          )}
          <div className="digivla-toolbar-actions">
            <ToolbarIconButton
              label="Check Duplicate"
              icon={<CopyOutlined />}
              onClick={() => {
                setDupResult(null)
                setDupLoading(false)
                setDupOpen(true)
              }}
            />
            <ToolbarIconButton
              label="Refresh"
              icon={<ReloadOutlined />}
              onClick={() => fetchData(pagination.page)}
            />
          </div>
        </div>

        {shouldShowTableSkeleton(loading, data.length) ? (
          <ListTableSkeleton rows={10} columnWidths={[72, 220, 120, 88, 96, 80]} />
        ) : (
          <Table<Media>
            rowKey="media_id"
            className="digivla-data-table digivla-media-list-table"
            columns={columns}
            dataSource={data}
            loading={loading}
            size="middle"
            tableLayout="fixed"
            scroll={{ x: MEDIA_TABLE_SCROLL_X }}
            onChange={handleTableChange}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total.toLocaleString('en-US')} media`,
              className: 'digivla-table-pagination',
              showLessItems: isMobile,
              simple: isMobile,
            }}
            locale={{ emptyText: 'No media found' }}
          />
        )}
      </Card>

      <MediaEditDrawer
        open={editOpen}
        media={editMedia}
        width={drawerWidth}
        form={form}
        loading={editLoading}
        mediaTypes={mediaTypes}
        onClose={() => setEditOpen(false)}
        onSave={handleUpdate}
      />

      <MediaDeleteDrawer
        open={deleteOpen}
        media={deleteTarget}
        width={deleteDrawerWidth}
        loading={deleteLoading}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
      />

      <MediaDuplicateCheckDrawer
        open={dupOpen}
        width={drawerWidth}
        form={dupForm}
        loading={dupLoading}
        result={dupResult}
        onClose={() => setDupOpen(false)}
        onOpenChange={handleDupDrawerChange}
        onCheck={checkDuplicate}
      />
    </>
  )
}
