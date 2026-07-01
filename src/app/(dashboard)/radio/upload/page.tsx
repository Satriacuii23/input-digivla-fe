'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  App,
  Alert,
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
  AppstoreOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '@/components/layout/page-header'
import { UploadFormSkeleton } from '@/components/ui/page-loading'
import { ToolbarIconButton } from '@/components/ui/toolbar-icon-button'
import { uploadFormFocusableSelector } from '@/components/articles/article-upload-fields'
import { BroadcastSingleUploadForm } from '@/components/articles/broadcast-single-upload-form'
import { formatWibTimeDisplay } from '@/lib/articles/article-list-helpers'
import {
  getMultiUploadSubmitValidationMessage,
  getMultiUploadValidationMessage,
  getSingleUploadValidationMessage,
  isArticleUploadFormReady,
} from '@/lib/articles/article-upload-validation'
import { ArticleUploadPreviewDrawer } from '@/components/articles/article-upload-preview-drawer'
import {
  ArticleUploadBatchDrawer,
  collectBatchAppliedLabels,
  getBatchTargetIndices,
  hasAnyBatchValue,
  type ArticleUploadBatchValues,
} from '@/components/articles/article-upload-batch-drawer'
import { applyBatchToBroadcastForms } from '@/lib/articles/article-upload-batch-apply'
import {
  BroadcastMultiUploadPanel,
  type BroadcastMultiFormValues,
} from '@/components/articles/broadcast-multi-upload-form'
import {
  createIdleMultiUploadProgress,
  type MultiUploadProgressState,
} from '@/components/articles/article-multi-upload-progress'
import {
  canAddMoreMultiUploadArticles,
  multiUploadCountLabel,
} from '@/lib/articles/article-multi-upload-limits'
import { uploadMediaVideoFile } from '@/lib/storage/upload-media-client'
import { getVideoUploadMetadata } from '@/lib/storage/video-upload-metadata'

interface MediaOption {
  value: string
  label: string
}

type RadioFormData = BroadcastMultiFormValues

interface DuplicateArticle {
  article_id: number
  title: string
  content_preview: string
  datee: string
  media_name: string
  created_at: string
}

const LAST_VALUES_KEY = 'radio_last_values'

const generateFilePath = (uploadDate: Date | null, mediaId: number | null): string => {
  const d = uploadDate || new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const mediaTypeId = '013'
  const mediaIdStr = String(mediaId || 0).padStart(4, '0')
  const uniqueCode = Date.now() + Math.random() * 1000
  const fileName = `${year}-${month}-${day}-${mediaTypeId}-${mediaIdStr}-${Math.floor(uniqueCode)}.mp4`
  return `radio_files/${year}/${month}/${day}/${fileName}`
}

const getDefaultFormData = (): RadioFormData => ({
  media_id: null,
  title: '',
  content: '',
  date: new Date(),
  time: '',
  journalist: '',
  duration: '',
  file: null,
  filePath: '',
})

export default function RadioUploadPage() {
  const { message, modal } = App.useApp()
  const [mediaOptions, setMediaOptions] = useState<MediaOption[]>([])
  const [loading, setLoading] = useState(false)
  const [mediaLoading, setMediaLoading] = useState(true)
  const [mode, setMode] = useState<'single' | 'multi'>('single')
  const [articleCount, setArticleCount] = useState(1)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSelected, setPreviewSelected] = useState<Set<number>>(new Set())
  const [batchOpen, setBatchOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<MultiUploadProgressState>(createIdleMultiUploadProgress())
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState<Date | null>(new Date())
  const [time, setTime] = useState('')
  const [anchor, setAnchor] = useState('')
  const [duration, setDuration] = useState<number | string>('')
  const [file, setFile] = useState<File | null>(null)
  const [filePath, setFilePath] = useState('')
  const [multiFormData, setMultiFormData] = useState<RadioFormData[]>([getDefaultFormData()])
  const [duplicateWarning, setDuplicateWarning] = useState<{ show: boolean; duplicates: DuplicateArticle[] }>({ show: false, duplicates: [] })
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [multiDuplicateInfo, setMultiDuplicateInfo] = useState<{ show: boolean; duplicatesByForm: Map<number, DuplicateArticle[]> }>({ show: false, duplicatesByForm: new Map() })
  const [multiDuplicateViewOpen, setMultiDuplicateViewOpen] = useState(false)
  const [selectedDuplicateFormIndex, setSelectedDuplicateFormIndex] = useState<number | null>(null)

  const checkDuplicate = useCallback(async (checkTitle: string, checkContent: string, mediaId: string | null) => {
    if (!checkTitle.trim() && !checkContent.trim()) { setDuplicateWarning({ show: false, duplicates: [] }); return }
    try {
      const params = new URLSearchParams()
      if (checkTitle.trim()) params.append('title', checkTitle.trim())
      if (checkContent.trim()) params.append('content', checkContent.trim())
      if (mediaId) params.append('media_id', mediaId)
      const res = await fetch(`/api/articles/radio?${params.toString()}`, { method: 'PUT', credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setDuplicateWarning(data.exists && data.duplicates?.length > 0 ? { show: true, duplicates: data.duplicates } : { show: false, duplicates: [] })
      }
    } catch (error) { console.error('Duplicate check error:', error) }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => { if (mode === 'single') checkDuplicate(title, content, selectedMedia) }, 800)
    return () => clearTimeout(timer)
  }, [title, content, selectedMedia, mode, checkDuplicate])

  const saveLastValues = useCallback(() => {
    localStorage.setItem(LAST_VALUES_KEY, JSON.stringify({ date: date?.toISOString(), time, anchor }))
  }, [date, time, anchor])

  const submitRef = useRef<() => void>(() => {})

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

  useEffect(() => {
    const fetchRadioMedia = async () => {
      setMediaLoading(true)
      try {
        const res = await fetch('/api/media/type/by-id/13', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setMediaOptions(data.map((m: { media_id: number; media_name: string }) => ({ value: String(m.media_id), label: m.media_name })))
        }
      } catch (error) {
        console.error('Failed to fetch Radio media:', error)
        message.error('Failed to load radio media list')
      } finally { setMediaLoading(false) }
    }
    fetchRadioMedia()
  }, [message])

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      const selectedFile = files[0]
      if (!selectedFile) return

      setFile(selectedFile)
      if (selectedMedia) {
        setFilePath(generateFilePath(date, parseInt(selectedMedia)))
      }

      const metadata = await getVideoUploadMetadata(selectedFile)
      if (metadata.title) {
        setTitle((prev) => (prev.trim() ? prev : metadata.title!))
      }
      if (metadata.time) {
        setTime((prev) => (prev.trim() ? prev : metadata.time!))
      }
      if (metadata.duration != null) {
        setDuration((prev) => {
          const str = String(prev).trim()
          return str && str !== '0' ? prev : metadata.duration!
        })
      }
    },
    [date, selectedMedia],
  )

  const handleMultiFileDrop = useCallback(async (index: number, files: File[]) => {
    const selectedFile = files[0]
    if (!selectedFile) return
    const metadata = await getVideoUploadMetadata(selectedFile)
    setMultiFormData((prev) =>
      prev.map((form, i) => {
        if (i !== index) return form
        return {
          ...form,
          file: selectedFile,
          filePath: generateFilePath(form.date, form.media_id ? parseInt(form.media_id) : null),
          title: form.title.trim() ? form.title : (metadata.title || form.title),
          time: form.time.trim() ? form.time : (metadata.time || form.time),
          duration: (form.duration !== '' && form.duration !== 0 && form.duration !== '0')
            ? form.duration
            : (metadata.duration != null ? metadata.duration : form.duration),
        }
      }),
    )
  }, [])

  const updateMultiFormField = useCallback((index: number, field: keyof RadioFormData, value: unknown) => {
    setMultiFormData(prev => {
      const currentForm = prev[index]
      if (!currentForm) return prev
      const updatedForm = { ...currentForm, [field]: value } as RadioFormData
      if ((field === 'date' || field === 'media_id') && currentForm.file) {
        updatedForm.filePath = generateFilePath(field === 'date' ? (value as Date | null) : currentForm.date, field === 'media_id' ? (value ? parseInt(value as string) : null) : (currentForm.media_id ? parseInt(currentForm.media_id) : null))
      }
      const newData = [...prev]; newData[index] = updatedForm; return newData
    })
  }, [])

  const addMoreArticles = () => {
    if (canAddMoreMultiUploadArticles(articleCount)) {
      setArticleCount((prev) => prev + 1)
      setMultiFormData((prev) => [...prev, getDefaultFormData()])
    }
  }

  const removeArticle = (index: number) => {
    if (articleCount > 1) { setArticleCount(prev => prev - 1); setMultiFormData(prev => prev.filter((_, i) => i !== index)) }
  }

  const checkMultiFormDuplicatesAndReturn = useCallback(async () => {
    if (articleCount === 0) return { hasDuplicates: false, count: 0, duplicatesByForm: new Map<number, DuplicateArticle[]>() }
    try {
      const formTitles = multiFormData.map((form, idx) => ({ idx, title: form.title.trim(), media_id: form.media_id })).filter(f => f.title)
      if (formTitles.length === 0) { setMultiDuplicateInfo({ show: false, duplicatesByForm: new Map() }); return { hasDuplicates: false, count: 0, duplicatesByForm: new Map() } }
      const duplicatesByForm = new Map<number, DuplicateArticle[]>()
      let hasDuplicates = false
      for (const form of formTitles) {
        const params = new URLSearchParams(); params.append('title', form.title); if (form.media_id) params.append('media_id', form.media_id)
        const res = await fetch(`/api/articles/radio?${params.toString()}`, { method: 'PUT', credentials: 'include' })
        if (res.ok) { const data = await res.json(); if (data.exists && data.duplicates?.length > 0) { duplicatesByForm.set(form.idx, data.duplicates); hasDuplicates = true } }
      }
      setMultiDuplicateInfo({ show: hasDuplicates, duplicatesByForm })
      return { hasDuplicates, count: duplicatesByForm.size, duplicatesByForm }
    } catch (error) { console.error('Multi-form duplicate check error:', error); return { hasDuplicates: false, count: 0, duplicatesByForm: new Map() } }
  }, [multiFormData, articleCount])

  useEffect(() => {
    if (file && selectedMedia) setFilePath(generateFilePath(date, parseInt(selectedMedia!)))
  }, [date, selectedMedia, file])

  const openPreviewDrawer = async () => {
    const result = await checkMultiFormDuplicatesAndReturn()
    setPreviewSelected(new Set(multiFormData.map((_, i) => i)))
    if (result.hasDuplicates) message.warning(`${result.count} article(s) may already exist. Review before uploading.`)
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

  const applyBatch = useCallback(
    (batch: ArticleUploadBatchValues) => {
      if (!hasAnyBatchValue(batch, 'broadcast')) {
        message.warning('Fill at least one batch field to apply')
        return
      }

      const targets = getBatchTargetIndices(previewOpen, previewSelected, multiFormData.length)
      if (targets.length === 0) {
        message.warning('No articles to update')
        return
      }

      setMultiFormData((prev) =>
        applyBatchToBroadcastForms(prev, targets, batch, (next) => {
          if (next.file && next.media_id) {
            next.filePath = generateFilePath(next.date, parseInt(next.media_id))
          }
        }),
      )

      setBatchOpen(false)
      message.success(
        `Applied ${collectBatchAppliedLabels(batch, 'broadcast').join(' & ')} to ${targets.length} article(s)`,
      )
    },
    [previewOpen, previewSelected, multiFormData.length, message],
  )

  const batchTargetCount = getBatchTargetIndices(previewOpen, previewSelected, multiFormData.length).length

  const submitSelectedArticles = async () => {
    const selectedArr = Array.from(previewSelected).sort((a, b) => a - b)
    if (selectedArr.length === 0) { message.warning('Select at least one article'); return }

    const submitValidationMessage = getMultiUploadSubmitValidationMessage(multiFormData, selectedArr)
    if (submitValidationMessage) {
      message.warning(submitValidationMessage)
      return
    }

    const hasDuplicates = selectedArr.some(idx => multiDuplicateInfo.duplicatesByForm.has(idx))
    if (hasDuplicates) {
      const duplicateForms = selectedArr.filter(idx => multiDuplicateInfo.duplicatesByForm.has(idx))
      const proceed = await new Promise<boolean>((resolve) => {
        modal.confirm({ title: 'Duplicate Warning', icon: <WarningOutlined />, content: `${duplicateForms.length} article(s) (#${duplicateForms.map(i => i + 1).join(', ')}) may already exist. Continue?`, okText: 'Continue', cancelText: 'Cancel', onOk: () => resolve(true), onCancel: () => resolve(false) })
      })
      if (!proceed) { message.warning('Upload cancelled'); return }
    }
    setPreviewOpen(false); setLoading(true)
    setUploadProgress({ current: 0, total: selectedArr.length, status: 'uploading' })
    try {
      let successCount = 0, errorCount = 0
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
          phase: form.file ? 'file' : 'article',
        })

        let finalFilePath = form.filePath || generateFilePath(form.date, form.media_id ? parseInt(form.media_id) : null)
        if (form.file) {
          const uploadResult = await uploadMediaVideoFile('radio', form.file, form.date, form.media_id!)
          if (uploadResult.success) {
            finalFilePath = uploadResult.dbPath
            setUploadProgress((prev) => ({ ...prev, phase: 'article' }))
          } else {
            errorCount++
            setUploadProgress((prev) => ({ ...prev, current: i + 1 }))
            continue
          }
        }
        const payload = { media_id: parseInt(form.media_id!), title: form.title.trim(), content: form.content.trim(), datee: (form.date || new Date()).toISOString().split('T')[0], timee: formatWibTimeDisplay(form.time), journalist: form.journalist || '', duration: form.duration ? String(form.duration) : '', filee: finalFilePath }
        const res = await fetch('/api/articles/radio', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store, must-revalidate' }, body: JSON.stringify(payload), credentials: 'include' })
        setUploadProgress((prev) => ({ ...prev, current: i + 1 }))
        if (res.ok) successCount++; else errorCount++
      }
      setUploadProgress({ current: selectedArr.length, total: selectedArr.length, status: 'complete' })
      if (successCount > 0) {
        saveLastValues()
        message.success(`${successCount} article(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`)
        setTimeout(() => {
          const remaining = multiFormData.map((_, i) => i).filter(i => !previewSelected.has(i))
          setMultiFormData(multiFormData.filter((_, i) => remaining.includes(i))); setArticleCount(remaining.length)
          setUploadProgress(createIdleMultiUploadProgress()); setLoading(false)
        }, 1500)
      } else { message.error('Failed to upload article(s)'); setLoading(false) }
    } catch (error) { console.error('Multi-upload error:', error); message.error('Failed to upload article(s)'); setLoading(false); setTimeout(() => setUploadProgress(createIdleMultiUploadProgress()), 2000) }
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
        modal.confirm({ title: 'Duplicate Warning', icon: <WarningOutlined />, content: (<div><p>Found {duplicateWarning.duplicates.length} similar article(s):</p><ul>{duplicateWarning.duplicates.slice(0, 3).map((d, i) => <li key={i}>&quot;{d.title}&quot; ({d.media_name}, {d.datee})</li>)}</ul></div>), okText: 'Continue', cancelText: 'Cancel', onOk: () => resolve(true), onCancel: () => resolve(false) })
      })
      if (!proceed) { message.warning('Upload cancelled'); return }
    }
    setLoading(true)
    try {
      let finalFilePath = filePath || generateFilePath(date, parseInt(selectedMedia!))
      if (file) {
        const uploadResult = await uploadMediaVideoFile('radio', file, date, selectedMedia!)
        if (uploadResult.success) finalFilePath = uploadResult.dbPath
        else {
          message.error(uploadResult.error)
          setLoading(false)
          return
        }
      }
      const payload = { media_id: parseInt(selectedMedia!), title: title.trim(), content: content.trim(), datee: (date || new Date()).toISOString().split('T')[0], timee: formatWibTimeDisplay(time), journalist: anchor || '', duration: duration ? String(duration) : '', filee: finalFilePath }
      const res = await fetch('/api/articles/radio', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store, must-revalidate' }, body: JSON.stringify(payload), credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        saveLastValues(); message.success('Radio article uploaded successfully')
        setSelectedMedia(null); setTitle(''); setContent(''); setDate(new Date()); setTime(''); setAnchor(''); setDuration(''); setFile(null); setFilePath('')
      } else message.error(data.detail || 'Failed to upload article')
    } catch (error) { console.error('Upload error:', error); message.error('Failed to upload article') }
    finally { setLoading(false) }
  }

  useEffect(() => { submitRef.current = mode === 'single' ? handleSingleSubmit : openPreviewForUpload })

  const handleReset = () => {
    setSelectedMedia(null); setTitle(''); setContent(''); setDate(new Date()); setTime(''); setAnchor(''); setDuration(''); setFile(null); setFilePath('')
  }

  const previewColumns: ColumnsType<{ index: number; form: RadioFormData }> = [
    { title: '#', dataIndex: 'index', width: 48, render: (v: number) => v + 1 },
    { title: 'Media', dataIndex: 'form', width: 120, render: (form: RadioFormData) => mediaOptions.find(m => m.value === form.media_id)?.label || '-' },
    { title: 'Title', dataIndex: 'form', width: 180, render: (form: RadioFormData) => form.title || '-' },
    { title: 'Content', dataIndex: 'form', width: 200, ellipsis: true, render: (form: RadioFormData) => form.content || '-' },
    { title: 'Date', dataIndex: 'form', width: 100, render: (form: RadioFormData) => form.date?.toLocaleDateString('en-US') || '-' },
    { title: 'Time', dataIndex: 'form', width: 80, render: (form: RadioFormData) => formatWibTimeDisplay(form.time) || '—' },
    { title: 'Duration', dataIndex: 'form', width: 80, render: (form: RadioFormData) => form.duration ? `${form.duration}s` : '-' },
    { title: 'Journalist', dataIndex: 'form', width: 100, ellipsis: true, render: (form: RadioFormData) => form.journalist || '-' },
    { title: 'Status', dataIndex: 'index', width: 140, render: (index: number, row) => (
      <Space wrap size={4}>
        {row.form.file ? <Badge status="success" text={row.form.file.name.slice(0, 10) + '...'} /> : <Badge status="default" text="No File" />}
        {multiDuplicateInfo.duplicatesByForm.has(index) && <><Badge status="warning" text="Duplicate" /><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedDuplicateFormIndex(index); setMultiDuplicateViewOpen(true) }} /></>}
      </Space>
    )},
  ]

  return (
    <>
      <PageHeader
        title="Upload Radio Article"
        description="Add radio articles with video file references."
        breadcrumb={[{ title: 'Home', href: '/dashboard' }, { title: 'Radio', href: '/radio/list' }, { title: 'Upload' }]}
        extra={
          <div className="digivla-upload-page-actions">
            <span className="digivla-upload-shortcut-hint">
              <kbd>Ctrl</kbd><span className="digivla-upload-shortcut-plus">+</span><kbd>Enter</kbd> Submit
            </span>
            <Link href="/radio/list">
              <ToolbarIconButton label="Back to List" icon={<ArrowLeftOutlined />} />
            </Link>
          </div>
        }
      />

      <Card variant="borderless" className="digivla-page-card digivla-upload-page-card digivla-upload-toolbar-card">
        <Space wrap>
          <Segmented value={mode} onChange={(v) => setMode(v as 'single' | 'multi')} options={[{ label: 'Single', value: 'single' }, { label: `Multi (${multiUploadCountLabel(articleCount)})`, value: 'multi' }]}           />
          {mode === 'multi' && (
            <Button icon={<AppstoreOutlined />} onClick={() => setBatchOpen(true)}>
              Batch
            </Button>
          )}
        </Space>
      </Card>

      {mode === 'single' &&
        (mediaLoading ? (
          <Card variant="borderless" className="digivla-page-card digivla-upload-page-card">
            <UploadFormSkeleton fields={9} />
          </Card>
        ) : (
          <BroadcastSingleUploadForm
            variant="radio"
            listHref="/radio/list"
            mediaOptions={mediaOptions}
            selectedMedia={selectedMedia}
            onMediaChange={setSelectedMedia}
            title={title}
            onTitleChange={setTitle}
            content={content}
            onContentChange={setContent}
            date={date}
            onDateChange={setDate}
            time={time}
            onTimeChange={setTime}
            journalist={anchor}
            onJournalistChange={setAnchor}
            duration={duration}
            onDurationChange={setDuration}
            file={file}
            onFileDrop={handleFileDrop}
            onRemoveFile={() => {
              setFile(null)
              setFilePath('')
              setTitle('')
              setTime('')
              setDuration('')
            }}
            duplicateWarning={duplicateWarning}
            onViewDuplicates={() => setDuplicateModalOpen(true)}
            loading={loading}
            onReset={handleReset}
            onSubmit={handleSingleSubmit}
          />
        ))}

      {mode === 'multi' && (
        <BroadcastMultiUploadPanel
          variant="radio"
          listHref="/radio/list"
          mediaLoading={mediaLoading}
          loading={loading}
          articleCount={articleCount}
          readyCount={multiFormData.filter((f) => isArticleUploadFormReady(f) && f.file).length}
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
          onFileDrop={handleMultiFileDrop}
          onRemoveFile={(index) =>
            setMultiFormData((prev) => {
              const next = [...prev]
              next[index] = { ...prev[index], file: null, filePath: '', title: '', time: '', duration: '' }
              return next
            })
          }
          onEnterPress={(index, e) => {
            const inputs = Array.from(document.querySelectorAll(uploadFormFocusableSelector(index)))
            const target = e.target as HTMLElement
            const current = inputs.find((el) => el.contains(target))
            if (current) {
              const ci = inputs.indexOf(current)
              if (ci < inputs.length - 1) (inputs[ci + 1] as HTMLElement).focus()
              else if (index < multiFormData.length - 1) {
                ;(document.querySelector(`#multi-form-${index + 1} input`) as HTMLElement)?.focus()
              }
            }
          }}
          onViewDuplicate={(index) => {
            setSelectedDuplicateFormIndex(index)
            setMultiDuplicateViewOpen(true)
          }}
        />
      )}

      <ArticleUploadPreviewDrawer
        open={previewOpen}
        loading={loading}
        selectedCount={previewSelected.size}
        columns={previewColumns}
        dataSource={multiFormData.map((form, index) => ({ key: index, index, form }))}
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

      <ArticleUploadBatchDrawer
        open={batchOpen}
        variant="broadcast"
        mediaOptions={mediaOptions}
        mediaTypeLabel="Radio"
        targetCount={batchTargetCount}
        onClose={() => setBatchOpen(false)}
        onApply={applyBatch}
      />

      <Modal open={duplicateModalOpen} onCancel={() => setDuplicateModalOpen(false)} title="Similar Existing Articles" width={720} footer={<Button onClick={() => setDuplicateModalOpen(false)}>Close</Button>}>
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {duplicateWarning.duplicates.map((dup, idx) => (
            <Card key={idx} size="small" style={{ marginBottom: 12 }}>
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}><Badge count={`#${dup.article_id}`} style={{ backgroundColor: '#faad14' }} /><span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{dup.created_at ? new Date(dup.created_at).toLocaleString('en-US') : '-'}</span></Space>
                <strong style={{ color: '#1e3a5f' }}>{dup.title}</strong>
                <Space><Badge status="default" text={dup.media_name} /><Badge status="default" text={dup.datee} /></Space>
                {dup.content_preview && <div style={{ background: '#fafafa', padding: 8, fontSize: 12, maxHeight: 100, overflow: 'auto' }}>{dup.content_preview}</div>}
                <Link href={`/radio/list?search=${encodeURIComponent(dup.title)}`} target="_blank"><Button size="small" icon={<EyeOutlined />}>View in List</Button></Link>
              </Space>
            </Card>
          ))}
        </div>
      </Modal>

      <Modal open={multiDuplicateViewOpen} onCancel={() => { setMultiDuplicateViewOpen(false); setSelectedDuplicateFormIndex(null) }} title={`Duplicate Details — Article #${(selectedDuplicateFormIndex ?? 0) + 1}`} width={640} footer={<Button onClick={() => { setMultiDuplicateViewOpen(false); setSelectedDuplicateFormIndex(null) }}>Close</Button>}>
        {selectedDuplicateFormIndex !== null && multiDuplicateInfo.duplicatesByForm.has(selectedDuplicateFormIndex) && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}><div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Form Title:</div><strong>{multiFormData[selectedDuplicateFormIndex]?.title || '-'}</strong></Card>
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              {multiDuplicateInfo.duplicatesByForm.get(selectedDuplicateFormIndex)?.map((dup, idx) => (
                <Card key={idx} size="small" style={{ marginBottom: 12 }}>
                  <Space orientation="vertical" style={{ width: '100%' }}>
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}><Badge count={`#${dup.article_id}`} style={{ backgroundColor: '#faad14' }} /><span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{dup.created_at ? new Date(dup.created_at).toLocaleString('en-US') : '-'}</span></Space>
                    <strong style={{ color: '#1e3a5f' }}>{dup.title}</strong>
                    <Space><Badge status="default" text={dup.media_name} /><Badge status="default" text={dup.datee} /></Space>
                    {dup.content_preview && <div style={{ background: '#fafafa', padding: 8, fontSize: 12, maxHeight: 80, overflow: 'auto' }}>{dup.content_preview}</div>}
                    <Link href={`/radio/list?search=${encodeURIComponent(dup.title)}`} target="_blank"><Button size="small" icon={<EyeOutlined />}>View in List</Button></Link>
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
