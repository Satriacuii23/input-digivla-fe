'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  App,
  Badge,
  Button,
  Card,
  Modal,
  Segmented,
  Space,
} from 'antd'
import {
  ArrowLeftOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '@/components/layout/page-header'
import { UploadFormSkeleton } from '@/components/ui/page-loading'
import { ToolbarIconButton } from '@/components/ui/toolbar-icon-button'
import { uploadFormFocusableSelector } from '@/components/articles/article-upload-fields'
import { OnlineSingleUploadForm } from '@/components/articles/online-single-upload-form'
import { OnlineMultiUploadPanel } from '@/components/articles/online-multi-upload-form'
import { OnlineScrapeUrlsDrawer } from '@/components/articles/online-scrape-urls-drawer'
import {
  getMultiUploadSubmitValidationMessage,
  getMultiUploadValidationMessage,
  getReadyArticleFormIndices,
  getSingleUploadValidationMessage,
  isArticleUploadFormReady,
} from '@/lib/articles/article-upload-validation'
import { ArticleUploadPreviewDrawer } from '@/components/articles/article-upload-preview-drawer'
import {
  createIdleMultiUploadProgress,
  type MultiUploadProgressState,
} from '@/components/articles/article-multi-upload-progress'
import {
  canAddMoreMultiUploadArticles,
  MAX_MULTI_UPLOAD_ARTICLES,
  multiUploadCountLabel,
} from '@/lib/articles/article-multi-upload-limits'
import {
  parseOnlineScrapeUrls,
  scrapeOnlineArticleUrlsSequential,
  createIdleOnlineScrapeProgress,
  type OnlineArticleScrapeResultItem,
  type OnlineScrapeProgressState,
} from '@/lib/articles/online-article-scrape'
import { fetchOnlineMediaOptions } from '@/lib/api/online-media'

interface MediaOption {
  value: string
  label: string
}

interface OnlineFormData {
  media_id: string | null
  title: string
  content: string
  journalist: string
  date: Date | null
  url: string
  pages: string
  mm_col: string
}

interface DuplicateArticle {
  article_id: number
  title: string
  content_preview: string
  datee: string
  media_name: string
  created_at: string
}

const LAST_VALUES_KEY = 'online_last_values'

const getDefaultFormData = (prevForm?: OnlineFormData): OnlineFormData => ({
  media_id: prevForm?.media_id || null,
  title: '',
  content: '',
  journalist: prevForm?.journalist || '',
  date: prevForm?.date || new Date(),
  url: '',
  pages: '',
  mm_col: '',
})

function buildOnlinePayload(form: OnlineFormData) {
  return {
    media_id: parseInt(form.media_id!),
    title: form.title.trim(),
    content: form.content.trim() || null,
    datee: (form.date || new Date()).toISOString().split('T')[0],
    journalist: form.journalist.trim() || null,
    url: form.url.trim() || null,
    pages: form.pages ? parseInt(form.pages, 10) : null,
    mm_col: form.mm_col ? parseFloat(form.mm_col) : null,
  }
}

export default function OnlineUploadPage() {
  const { message, modal } = App.useApp()

  const [mode, setMode] = useState<'single' | 'multi'>('single')
  const [mediaOptions, setMediaOptions] = useState<MediaOption[]>([])
  const [mediaLoading, setMediaLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [articleCount, setArticleCount] = useState(1)

  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [journalist, setJournalist] = useState('')
  const [date, setDate] = useState<Date | null>(new Date())
  const [url, setUrl] = useState('')
  const [pages, setPages] = useState('')
  const [mmCol, setMmCol] = useState('')

  const [multiFormData, setMultiFormData] = useState<OnlineFormData[]>([getDefaultFormData()])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSelected, setPreviewSelected] = useState<Set<number>>(new Set())
  const [uploadProgress, setUploadProgress] = useState<MultiUploadProgressState>(createIdleMultiUploadProgress())

  const [duplicateWarning, setDuplicateWarning] = useState<{
    show: boolean
    duplicates: DuplicateArticle[]
  }>({ show: false, duplicates: [] })
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [multiDuplicateInfo, setMultiDuplicateInfo] = useState<{
    show: boolean
    duplicatesByForm: Map<number, DuplicateArticle[]>
  }>({ show: false, duplicatesByForm: new Map() })
  const [multiDuplicateViewOpen, setMultiDuplicateViewOpen] = useState(false)
  const [selectedDuplicateFormIndex, setSelectedDuplicateFormIndex] = useState<number | null>(null)

  const [scrapeOpen, setScrapeOpen] = useState(false)
  const [scrapeUrlText, setScrapeUrlText] = useState('')
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeProgress, setScrapeProgress] = useState<OnlineScrapeProgressState>(createIdleOnlineScrapeProgress())
  const [scrapeResults, setScrapeResults] = useState<OnlineArticleScrapeResultItem[] | null>(null)

  const submitRef = useRef<() => void>(() => {})

  useEffect(() => {
    const lastValuesStr = localStorage.getItem(LAST_VALUES_KEY)
    if (!lastValuesStr) return
    try {
      const parsed = JSON.parse(lastValuesStr) as {
        media_id?: string
        date?: string
        journalist?: string
      }
      if (parsed.media_id) setSelectedMedia(parsed.media_id)
      if (parsed.date) setDate(new Date(parsed.date))
      if (parsed.journalist) setJournalist(parsed.journalist)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const fetchOnlineMedia = async () => {
      setMediaLoading(true)
      try {
        const options = await fetchOnlineMediaOptions()
        setMediaOptions(options)
      } catch (error) {
        console.error('Failed to fetch online media:', error)
        message.error('Failed to load online media list')
      } finally {
        setMediaLoading(false)
      }
    }
    fetchOnlineMedia()
  }, [message])

  const checkDuplicate = useCallback(async (checkTitle: string, checkContent: string, mediaId: string | null) => {
    if (!checkTitle.trim() && !checkContent.trim()) {
      setDuplicateWarning({ show: false, duplicates: [] })
      return
    }
    try {
      const params = new URLSearchParams()
      if (checkTitle.trim()) params.append('title', checkTitle.trim())
      if (checkContent.trim()) params.append('content', checkContent.trim())
      if (mediaId) params.append('media_id', mediaId)
      const res = await fetch(`/api/articles/online?${params.toString()}`, {
        method: 'PUT',
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setDuplicateWarning(
          data.exists && data.duplicates?.length > 0
            ? { show: true, duplicates: data.duplicates }
            : { show: false, duplicates: [] },
        )
      }
    } catch (error) {
      console.error('Duplicate check error:', error)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'single') checkDuplicate(title, content, selectedMedia)
    }, 800)
    return () => clearTimeout(timer)
  }, [title, content, selectedMedia, mode, checkDuplicate])

  const checkMultiFormDuplicatesAndReturn = useCallback(async () => {
    if (articleCount === 0) {
      return { hasDuplicates: false, count: 0, duplicatesByForm: new Map<number, DuplicateArticle[]>() }
    }
    try {
      const formTitles = multiFormData
        .map((form, idx) => ({ idx, title: form.title.trim(), media_id: form.media_id }))
        .filter((f) => f.title)
      if (formTitles.length === 0) {
        setMultiDuplicateInfo({ show: false, duplicatesByForm: new Map() })
        return { hasDuplicates: false, count: 0, duplicatesByForm: new Map() }
      }
      const duplicatesByForm = new Map<number, DuplicateArticle[]>()
      let hasDuplicates = false
      for (const item of formTitles) {
        const params = new URLSearchParams()
        params.append('title', item.title)
        if (item.media_id) params.append('media_id', item.media_id)
        const res = await fetch(`/api/articles/online?${params.toString()}`, {
          method: 'PUT',
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          if (data.exists && data.duplicates?.length > 0) {
            duplicatesByForm.set(item.idx, data.duplicates)
            hasDuplicates = true
          }
        }
      }
      setMultiDuplicateInfo({ show: hasDuplicates, duplicatesByForm })
      return { hasDuplicates, count: duplicatesByForm.size, duplicatesByForm }
    } catch (error) {
      console.error('Multi-form duplicate check error:', error)
      return { hasDuplicates: false, count: 0, duplicatesByForm: new Map() }
    }
  }, [multiFormData, articleCount])

  const saveLastValues = useCallback(() => {
    localStorage.setItem(
      LAST_VALUES_KEY,
      JSON.stringify({
        media_id: selectedMedia,
        date: date?.toISOString(),
        journalist,
      }),
    )
  }, [selectedMedia, date, journalist])

  const updateMultiFormField = useCallback((index: number, field: keyof OnlineFormData, value: unknown) => {
    setMultiFormData((prev) => {
      const newData = [...prev]
      newData[index] = { ...prev[index], [field]: value } as OnlineFormData
      return newData
    })
  }, [])

  const addMoreArticles = () => {
    if (canAddMoreMultiUploadArticles(articleCount)) {
      let lastValues = { date: new Date(), journalist: '', media_id: null as string | null }
      const lastValuesStr = localStorage.getItem(LAST_VALUES_KEY)
      if (lastValuesStr) {
        try {
          const parsed = JSON.parse(lastValuesStr)
          lastValues = {
            date: parsed.date ? new Date(parsed.date) : new Date(),
            journalist: parsed.journalist || '',
            media_id: parsed.media_id || null,
          }
        } catch {
          /* ignore */
        }
      }
      const prevForm = multiFormData[multiFormData.length - 1]
      setArticleCount((prev) => prev + 1)
      setMultiFormData((prev) => [
        ...prev,
        {
          ...getDefaultFormData(prevForm),
          media_id: prevForm?.media_id || lastValues.media_id,
          date: lastValues.date,
          journalist: lastValues.journalist || prevForm?.journalist || '',
        },
      ])
    }
  }

  const removeArticle = (index: number) => {
    if (articleCount > 1) {
      setArticleCount((prev) => prev - 1)
      setMultiFormData((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const openPreviewDrawer = async () => {
    const result = await checkMultiFormDuplicatesAndReturn()
    setPreviewSelected(new Set(multiFormData.map((_, i) => i)))
    if (result.hasDuplicates) {
      message.warning(`${result.count} article(s) may already exist. Review before uploading.`)
    }
    setPreviewOpen(true)
  }

  const openPreviewForUpload = async () => {
    const validationMessage = getMultiUploadValidationMessage(multiFormData)
    if (validationMessage) {
      message.warning(validationMessage)
      return
    }
    await openPreviewDrawer()
  }

  const readLastValues = useCallback(() => {
    let lastValues = { date: new Date(), journalist: '', media_id: null as string | null }
    const lastValuesStr = localStorage.getItem(LAST_VALUES_KEY)
    if (!lastValuesStr) return lastValues
    try {
      const parsed = JSON.parse(lastValuesStr) as {
        date?: string
        journalist?: string
        media_id?: string
      }
      lastValues = {
        date: parsed.date ? new Date(parsed.date) : new Date(),
        journalist: parsed.journalist || '',
        media_id: parsed.media_id || null,
      }
    } catch {
      /* ignore */
    }
    return lastValues
  }, [])

  const handleScrapeUrls = async () => {
    const urls = parseOnlineScrapeUrls(scrapeUrlText)
    if (urls.length === 0) {
      message.warning('Paste at least one valid URL (http:// or https://)')
      return
    }
    if (urls.length > MAX_MULTI_UPLOAD_ARTICLES) {
      message.warning(`Maximum ${MAX_MULTI_UPLOAD_ARTICLES} URLs per scrape`)
      return
    }

    setScrapeLoading(true)
    setScrapeResults([])
    setScrapeProgress({
      current: 0,
      total: urls.length,
      status: 'scraping',
      successCount: 0,
      failedCount: 0,
      elapsedMs: 0,
      estimatedRemainingMs: null,
      currentUrl: urls[0],
    })

    try {
      const data = await scrapeOnlineArticleUrlsSequential(urls, (progress) => {
        setScrapeProgress({
          current: progress.current,
          total: progress.total,
          status: progress.status,
          currentUrl: progress.currentUrl,
          successCount: progress.successCount,
          failedCount: progress.failedCount,
          elapsedMs: progress.elapsedMs,
          estimatedRemainingMs: progress.estimatedRemainingMs,
        })
        setScrapeResults(progress.partialResults)
      })

      setScrapeResults(data.results)
      setScrapeProgress((prev) => ({
        ...prev,
        current: data.total,
        total: data.total,
        status: 'complete',
        successCount: data.success_count,
        failedCount: data.failed_count,
      }))

      if (data.success_count === 0) {
        message.error('No articles scraped successfully — check URLs or try again')
      } else {
        message.success(`Scraped ${data.success_count} of ${data.total} URL(s)`)
      }
    } catch (error) {
      console.error('Scrape URLs error:', error)
      message.error(error instanceof Error ? error.message : 'Failed to scrape URLs')
      setScrapeProgress(createIdleOnlineScrapeProgress())
    } finally {
      setScrapeLoading(false)
    }
  }

  const applyScrapeResults = () => {
    if (!scrapeResults) return
    const successful = scrapeResults.filter((item) => item.success)
    if (successful.length === 0) {
      message.warning('No successful scrape results to apply')
      return
    }

    const lastValues = readLastValues()
    const forms: OnlineFormData[] = successful.map((item) => ({
      media_id: item.media_id != null ? String(item.media_id) : null,
      title: item.title?.trim() || '',
      content: item.content?.trim() || '',
      journalist: item.journalist?.trim() || lastValues.journalist || '',
      date: item.datee ? new Date(item.datee) : lastValues.date,
      url: item.url,
      pages: item.pages != null ? String(item.pages) : '1',
      mm_col: item.mm_col != null ? String(item.mm_col) : '0',
    }))

    const missingMedia = successful.filter((item) => item.media_id == null).length
    if (missingMedia > 0) {
      message.warning(`${missingMedia} scraped article(s) have no matching media — select media manually`)
    }

    setMultiFormData(forms)
    setArticleCount(forms.length)
    setMultiDuplicateInfo({ show: false, duplicatesByForm: new Map() })
    setScrapeOpen(false)
    setScrapeUrlText('')
    setScrapeResults(null)
    setScrapeProgress(createIdleOnlineScrapeProgress())
    message.success(`Filled ${forms.length} multi upload form(s) from scraped data`)
  }

  const submitSelectedArticles = async () => {
    const selectedArr = Array.from(previewSelected).sort((a, b) => a - b)
    if (selectedArr.length === 0) {
      message.warning('Select at least one article to upload')
      return
    }

    const submitValidationMessage = getMultiUploadSubmitValidationMessage(multiFormData, selectedArr)
    if (submitValidationMessage) {
      message.warning(submitValidationMessage)
      return
    }

    const hasDuplicates = selectedArr.some((idx) => multiDuplicateInfo.duplicatesByForm.has(idx))
    if (hasDuplicates) {
      const duplicateForms = selectedArr.filter((idx) => multiDuplicateInfo.duplicatesByForm.has(idx))
      const proceed = await new Promise<boolean>((resolve) => {
        modal.confirm({
          title: 'Duplicate Warning',
          icon: <WarningOutlined />,
          content: `${duplicateForms.length} article(s) (#${duplicateForms.map((i) => i + 1).join(', ')}) may already exist. Continue upload?`,
          okText: 'Continue',
          cancelText: 'Cancel',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        })
      })
      if (!proceed) {
        message.warning('Upload cancelled — review duplicate articles')
        return
      }
    }

    setPreviewOpen(false)
    setLoading(true)
    setUploadProgress({ current: 0, total: selectedArr.length, status: 'uploading' })

    try {
      let successCount = 0
      let errorCount = 0
      for (let i = 0; i < selectedArr.length; i++) {
        const formIndex = selectedArr[i]
        const form = multiFormData[formIndex]
        if (!isArticleUploadFormReady(form)) continue

        setUploadProgress({
          current: i,
          total: selectedArr.length,
          status: 'uploading',
          formNumber: formIndex + 1,
          formTitle: form.title.trim() || undefined,
          phase: 'article',
        })

        const res = await fetch('/api/articles/online', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
          body: JSON.stringify(buildOnlinePayload(form)),
          credentials: 'include',
        })
        setUploadProgress((prev) => ({ ...prev, current: i + 1 }))
        if (res.ok) successCount++
        else errorCount++
      }

      setUploadProgress({ current: selectedArr.length, total: selectedArr.length, status: 'complete' })

      if (successCount > 0) {
        saveLastValues()
        message.success(
          `${successCount} article(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        )
        setTimeout(() => {
          const remainingIndexes = multiFormData.map((_, i) => i).filter((i) => !previewSelected.has(i))
          setMultiFormData(multiFormData.filter((_, i) => remainingIndexes.includes(i)))
          setArticleCount(remainingIndexes.length)
          setUploadProgress(createIdleMultiUploadProgress())
          setLoading(false)
        }, 1500)
      } else {
        message.error('Failed to upload article(s)')
        setLoading(false)
      }
    } catch (error) {
      console.error('Multi-upload error:', error)
      message.error('Failed to upload article(s)')
      setLoading(false)
      setTimeout(() => setUploadProgress(createIdleMultiUploadProgress()), 2000)
    }
  }

  const handleSingleSubmit = async () => {
    const validationMessage = getSingleUploadValidationMessage({
      media_id: selectedMedia,
      title,
      date,
    })
    if (validationMessage) {
      message.warning(validationMessage)
      return
    }

    if (duplicateWarning.show && duplicateWarning.duplicates.length > 0) {
      const proceed = await new Promise<boolean>((resolve) => {
        modal.confirm({
          title: 'Duplicate Warning',
          icon: <WarningOutlined />,
          content: (
            <div>
              <p>Found {duplicateWarning.duplicates.length} similar article(s):</p>
              <ul>
                {duplicateWarning.duplicates.slice(0, 3).map((d, i) => (
                  <li key={i}>
                    &quot;{d.title}&quot; ({d.media_name}, {d.datee})
                  </li>
                ))}
              </ul>
            </div>
          ),
          okText: 'Continue',
          cancelText: 'Cancel',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        })
      })
      if (!proceed) {
        message.warning('Upload cancelled')
        return
      }
    }

    setLoading(true)
    try {
      const payload = buildOnlinePayload({
        media_id: selectedMedia,
        title,
        content,
        journalist,
        date,
        url,
        pages,
        mm_col: mmCol,
      })
      const res = await fetch('/api/articles/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok) {
        saveLastValues()
        message.success('Online article uploaded successfully')
        setTitle('')
        setContent('')
        setUrl('')
        setPages('')
        setMmCol('')
        setDate(new Date())
        setDuplicateWarning({ show: false, duplicates: [] })
      } else {
        message.error(data.detail || 'Failed to upload article')
      }
    } catch (error) {
      console.error('Upload error:', error)
      message.error('Failed to upload article')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    submitRef.current = mode === 'single' ? handleSingleSubmit : openPreviewForUpload
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        submitRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode])

  const handleReset = () => {
    setSelectedMedia(null)
    setTitle('')
    setContent('')
    setJournalist('')
    setDate(new Date())
    setUrl('')
    setPages('')
    setMmCol('')
    setDuplicateWarning({ show: false, duplicates: [] })
  }

  const pasteFromClipboard = async (
    apply: (text: string) => void,
    fieldLabel: 'URL' | 'Content',
  ) => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        apply(text)
        message.success(`${fieldLabel} pasted from clipboard`)
      }
    } catch {
      message.error('Unable to access clipboard')
    }
  }

  const previewColumns: ColumnsType<{ index: number; form: OnlineFormData }> = [
    { title: '#', dataIndex: 'index', width: 48, render: (v: number) => v + 1 },
    {
      title: 'Media',
      dataIndex: 'form',
      width: 120,
      render: (form: OnlineFormData) =>
        mediaOptions.find((m) => m.value === form.media_id)?.label || '-',
    },
    { title: 'Title', dataIndex: 'form', width: 180, render: (form: OnlineFormData) => form.title || '-' },
    {
      title: 'Content',
      dataIndex: 'form',
      width: 180,
      ellipsis: true,
      render: (form: OnlineFormData) => form.content || '-',
    },
    {
      title: 'Date',
      dataIndex: 'form',
      width: 100,
      render: (form: OnlineFormData) => form.date?.toLocaleDateString('en-US') || '-',
    },
    {
      title: 'URL',
      dataIndex: 'form',
      width: 140,
      ellipsis: true,
      render: (form: OnlineFormData) => form.url || '-',
    },
    {
      title: 'Journalist',
      dataIndex: 'form',
      width: 100,
      ellipsis: true,
      render: (form: OnlineFormData) => form.journalist || '-',
    },
    {
      title: 'Status',
      dataIndex: 'index',
      width: 120,
      render: (index: number, row) => (
        <Space wrap size={4}>
          {row.form.url ? (
            <Badge status="success" text="Has URL" />
          ) : (
            <Badge status="default" text="No URL" />
          )}
          {multiDuplicateInfo.duplicatesByForm.has(index) && (
            <>
              <Badge status="warning" text="Duplicate" />
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedDuplicateFormIndex(index)
                  setMultiDuplicateViewOpen(true)
                }}
              />
            </>
          )}
        </Space>
      ),
    },
  ]

  const previewData = multiFormData.map((form, index) => ({ key: index, index, form }))

  return (
    <>
      <PageHeader
        title="Upload Online Article"
        description="Add online articles with publication links and metadata."
        breadcrumb={[{ title: 'Home', href: '/dashboard' }, { title: 'Online', href: '/online/list' }, { title: 'Upload' }]}
        extra={
          <div className="digivla-upload-page-actions">
            <span className="digivla-upload-shortcut-hint">
              <kbd>Ctrl</kbd><span className="digivla-upload-shortcut-plus">+</span><kbd>Enter</kbd> Submit
            </span>
            <Link href="/online/list">
              <ToolbarIconButton label="Back to List" icon={<ArrowLeftOutlined />} />
            </Link>
          </div>
        }
      />

      <Card variant="borderless" className="digivla-page-card digivla-upload-page-card digivla-upload-toolbar-card">
        <Space wrap>
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as 'single' | 'multi')}
            options={[
              { label: 'Single', value: 'single' },
              { label: `Multi (${multiUploadCountLabel(articleCount)})`, value: 'multi' },
            ]}
          />
        </Space>
      </Card>

      {mode === 'single' &&
        (mediaLoading ? (
          <Card variant="borderless" className="digivla-page-card digivla-upload-page-card">
            <UploadFormSkeleton fields={9} />
          </Card>
        ) : (
          <OnlineSingleUploadForm
            mediaOptions={mediaOptions}
            selectedMedia={selectedMedia}
            onMediaChange={setSelectedMedia}
            title={title}
            onTitleChange={setTitle}
            content={content}
            onContentChange={setContent}
            journalist={journalist}
            onJournalistChange={setJournalist}
            date={date}
            onDateChange={setDate}
            url={url}
            onUrlChange={setUrl}
            pages={pages}
            onPagesChange={setPages}
            mmCol={mmCol}
            onMmColChange={setMmCol}
            duplicateWarning={duplicateWarning}
            onViewDuplicates={() => setDuplicateModalOpen(true)}
            loading={loading}
            onReset={handleReset}
            onSubmit={handleSingleSubmit}
            onPaste={(field) =>
              pasteFromClipboard(field === 'url' ? setUrl : setContent, field === 'url' ? 'URL' : 'Content')
            }
          />
        ))}

      {mode === 'multi' && (
        <OnlineMultiUploadPanel
          mediaLoading={mediaLoading}
          loading={loading}
          articleCount={articleCount}
          readyCount={getReadyArticleFormIndices(multiFormData).length}
          duplicateFormCount={multiDuplicateInfo.duplicatesByForm.size}
          mediaOptions={mediaOptions}
          multiFormData={multiFormData}
          uploadProgress={uploadProgress}
          duplicatesByForm={multiDuplicateInfo.duplicatesByForm}
          onAddArticle={addMoreArticles}
          onPreview={openPreviewDrawer}
          onUploadAll={openPreviewForUpload}
          onFieldChange={updateMultiFormField}
          onRemove={removeArticle}
          onPaste={(index, field) =>
            pasteFromClipboard(
              (text) => updateMultiFormField(index, field, text),
              field === 'url' ? 'URL' : 'Content',
            )
          }
          onEnterPress={(index, e) => {
            const inputsArray = Array.from(document.querySelectorAll(uploadFormFocusableSelector(index)))
            const target = e.target as HTMLElement
            const currentInput = inputsArray.find((el) => el.contains(target))
            if (currentInput) {
              const ci = inputsArray.indexOf(currentInput)
              if (ci < inputsArray.length - 1) (inputsArray[ci + 1] as HTMLElement).focus()
              else if (index < multiFormData.length - 1) {
                const next = document.querySelector(`#multi-form-${index + 1} input`) as HTMLElement
                next?.focus()
              }
            }
          }}
          onViewDuplicate={(index) => {
            setSelectedDuplicateFormIndex(index)
            setMultiDuplicateViewOpen(true)
          }}
          onOpenScrape={() => {
            setScrapeResults(null)
            setScrapeProgress(createIdleOnlineScrapeProgress())
            setScrapeOpen(true)
          }}
        />
      )}

      <OnlineScrapeUrlsDrawer
        open={scrapeOpen}
        loading={scrapeLoading}
        progress={scrapeProgress}
        urlText={scrapeUrlText}
        results={scrapeResults}
        onUrlTextChange={setScrapeUrlText}
        onClose={() => {
          if (scrapeLoading) return
          setScrapeOpen(false)
          setScrapeProgress(createIdleOnlineScrapeProgress())
        }}
        onScrape={handleScrapeUrls}
        onApply={applyScrapeResults}
      />

      <ArticleUploadPreviewDrawer
        open={previewOpen}
        loading={loading}
        selectedCount={previewSelected.size}
        columns={previewColumns}
        dataSource={previewData}
        selectedRowKeys={Array.from(previewSelected)}
        onSelectionChange={(keys) => setPreviewSelected(new Set(keys as number[]))}
        onClose={() => {
          setPreviewOpen(false)
          setMultiDuplicateInfo({ show: false, duplicatesByForm: new Map() })
        }}
        onToggleSelectAll={() =>
          setPreviewSelected(
            previewSelected.size === multiFormData.length
              ? new Set()
              : new Set(multiFormData.map((_, i) => i)),
          )
        }
        selectAllLabel={previewSelected.size === multiFormData.length ? 'Deselect All' : 'Select All'}
        onSubmit={submitSelectedArticles}
      />

      <Modal
        open={duplicateModalOpen}
        onCancel={() => setDuplicateModalOpen(false)}
        title="Similar Existing Articles"
        width={720}
        footer={<Button onClick={() => setDuplicateModalOpen(false)}>Close</Button>}
      >
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {duplicateWarning.duplicates.map((dup, idx) => (
            <Card key={idx} size="small" style={{ marginBottom: 12 }}>
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Badge count={`#${dup.article_id}`} style={{ backgroundColor: '#faad14' }} />
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                    {dup.created_at ? new Date(dup.created_at).toLocaleString('en-US') : '-'}
                  </span>
                </Space>
                <strong style={{ color: '#1e3a5f' }}>{dup.title}</strong>
                <Space>
                  <Badge status="default" text={dup.media_name} />
                  <Badge status="default" text={dup.datee} />
                </Space>
                {dup.content_preview && (
                  <div style={{ background: '#fafafa', padding: 8, fontSize: 12, maxHeight: 100, overflow: 'auto' }}>
                    {dup.content_preview}
                  </div>
                )}
                <Link href={`/online/list?search=${encodeURIComponent(dup.title)}`} target="_blank">
                  <Button size="small" icon={<EyeOutlined />}>
                    View in List
                  </Button>
                </Link>
              </Space>
            </Card>
          ))}
        </div>
      </Modal>

      <Modal
        open={multiDuplicateViewOpen}
        onCancel={() => {
          setMultiDuplicateViewOpen(false)
          setSelectedDuplicateFormIndex(null)
        }}
        title={`Duplicate Details — Article #${(selectedDuplicateFormIndex ?? 0) + 1}`}
        width={640}
        footer={
          <Button
            onClick={() => {
              setMultiDuplicateViewOpen(false)
              setSelectedDuplicateFormIndex(null)
            }}
          >
            Close
          </Button>
        }
      >
        {selectedDuplicateFormIndex !== null && multiDuplicateInfo.duplicatesByForm.has(selectedDuplicateFormIndex) && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Form Title:</div>
              <strong>{multiFormData[selectedDuplicateFormIndex]?.title || '-'}</strong>
            </Card>
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              {multiDuplicateInfo.duplicatesByForm.get(selectedDuplicateFormIndex)?.map((dup, idx) => (
                <Card key={idx} size="small" style={{ marginBottom: 12 }}>
                  <Space orientation="vertical" style={{ width: '100%' }}>
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <Badge count={`#${dup.article_id}`} style={{ backgroundColor: '#faad14' }} />
                      <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                        {dup.created_at ? new Date(dup.created_at).toLocaleString('en-US') : '-'}
                      </span>
                    </Space>
                    <strong style={{ color: '#1e3a5f' }}>{dup.title}</strong>
                    <Space>
                      <Badge status="default" text={dup.media_name} />
                      <Badge status="default" text={dup.datee} />
                    </Space>
                    {dup.content_preview && (
                      <div style={{ background: '#fafafa', padding: 8, fontSize: 12, maxHeight: 80, overflow: 'auto' }}>
                        {dup.content_preview}
                      </div>
                    )}
                    <Link href={`/online/list?search=${encodeURIComponent(dup.title)}`} target="_blank">
                      <Button size="small" icon={<EyeOutlined />}>
                        View in List
                      </Button>
                    </Link>
                  </Space>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
