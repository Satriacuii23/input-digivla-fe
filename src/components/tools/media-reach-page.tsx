'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Collapse,
  Drawer,
  Form,
  Grid,
  Input,
  Progress,
  Row,
  Space,
  Steps,
  Switch,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd/es/upload'
import {
  CloudUploadOutlined,
  DownloadOutlined,
  FileTextOutlined,
  LoadingOutlined,
  StopOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import { PageHeader } from '@/components/layout/page-header'
import { ToolbarIconButton } from '@/components/ui/toolbar-icon-button'
import {
  downloadMediaReachCsv,
  formatMediaReachDuration,
  MEDIA_REACH_MAX_TARGETS,
  orderMediaReachResults,
  parseManualMediaList,
  printMediaReachPdf,
  type MediaReachCrawlJob,
  type MediaReachResultRow,
  type MediaReachSelector,
} from '@/lib/tools/media-reach-export'

const { Text, Paragraph } = Typography
const { Dragger } = Upload
const { TextArea } = Input
const { useBreakpoint } = Grid

const ACCEPT_UPLOAD = '.xlsx,.xls,.csv,.txt'

type TargetItemStatus = 'waiting' | 'running' | 'ok' | 'skipped' | 'error'

interface TargetStatusRow {
  key: string
  index: number
  name: string
  status: TargetItemStatus
  reach: string | null
  period: string | null
  message: string | null
}

function renderTargetStatus(status: TargetItemStatus) {
  switch (status) {
    case 'running':
      return (
        <Tag icon={<LoadingOutlined spin />} color="processing">
          Running
        </Tag>
      )
    case 'ok':
      return <Tag color="success">Selesai</Tag>
    case 'error':
      return <Tag color="error">Gagal</Tag>
    case 'skipped':
      return <Tag color="default">Dilewati</Tag>
    default:
      return <Tag color="default">Menunggu</Tag>
  }
}

export function MediaReachPageContent() {
  const { message, modal } = App.useApp()
  const screens = useBreakpoint()
  const isMobile = screens.md === false
  const isCompact = screens.lg === false
  const [selectorForm] = Form.useForm()

  const [step, setStep] = useState(0)
  const [targets, setTargets] = useState<string[]>([])
  const [manualText, setManualText] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [crawlLoading, setCrawlLoading] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [job, setJob] = useState<MediaReachCrawlJob | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [selectorsOpen, setSelectorsOpen] = useState(false)
  const [selectors, setSelectors] = useState<MediaReachSelector[]>([])
  const [selectorsLoading, setSelectorsLoading] = useState(false)
  const [selectorSaving, setSelectorSaving] = useState(false)
  const [activeSelectorKey, setActiveSelectorKey] = useState<string | null>(null)

  const results: MediaReachResultRow[] = job?.results ?? []

  const exportRows = useMemo(
    () => orderMediaReachResults(targets, results),
    [targets, results],
  )

  const progressPercent = useMemo(() => {
    if (!job || job.total === 0) return 0
    return Math.round((job.completed / job.total) * 100)
  }, [job])

  const etaLabel = useMemo(() => {
    if (!job || job.status !== 'running') return null
    if (job.estimated_seconds_remaining != null && job.estimated_seconds_remaining > 0) {
      return formatMediaReachDuration(job.estimated_seconds_remaining)
    }
    if (job.avg_seconds_per_item && job.total > job.completed) {
      return formatMediaReachDuration(job.avg_seconds_per_item * (job.total - job.completed))
    }
    return null
  }, [job])

  const crawlRows = useMemo((): TargetStatusRow[] => {
    const resultMap = new Map(
      (job?.results ?? []).map((r) => [r.media_name.toLowerCase(), r]),
    )
    const crawlActive = job?.status === 'running' || job?.status === 'pending'
    return targets.map((name, index) => {
      const lookup = name.toLowerCase()
      const result = resultMap.get(lookup)
      let status: TargetItemStatus = 'waiting'
      if (result) {
        status = result.status
      } else if (crawlActive && job?.current_media?.toLowerCase() === lookup) {
        status = 'running'
      }
      return {
        key: `${lookup}-${index}`,
        index: index + 1,
        name,
        status,
        reach: result?.reach ?? null,
        period: result?.organic_keywords ?? null,
        message: result?.message ?? null,
      }
    })
  }, [targets, job])

  const targetStatusColumns: ColumnsType<TargetStatusRow> = useMemo(
    () => [
      { title: '#', dataIndex: 'index', width: isMobile ? 44 : 52, fixed: isMobile ? 'left' : undefined },
      {
        title: 'Media Name',
        dataIndex: 'name',
        ellipsis: true,
        width: isMobile ? 140 : undefined,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: isMobile ? 100 : 120,
        align: 'center',
        render: (status: TargetItemStatus) => renderTargetStatus(status),
      },
    ],
    [isMobile],
  )

  const alignedResultColumns: ColumnsType<TargetStatusRow> = useMemo(() => {
    const cols: ColumnsType<TargetStatusRow> = [
      { title: '#', dataIndex: 'index', width: isMobile ? 44 : 52, fixed: isMobile ? 'left' : undefined },
      {
        title: 'Media Name',
        dataIndex: 'name',
        ellipsis: true,
        width: isMobile ? 120 : undefined,
      },
      {
        title: isMobile ? 'Visits' : 'Monthly Visits',
        dataIndex: 'reach',
        width: isMobile ? 88 : 130,
        render: (reach: string | null, row) => {
          if (row.status === 'running') {
            return (
              <Text type="secondary" className="digivla-media-reach-cell-processing">
                <LoadingOutlined spin /> {isMobile ? '' : 'Memproses…'}
              </Text>
            )
          }
          if (row.status === 'waiting') {
            return <Text type="secondary">—</Text>
          }
          return reach || '—'
        },
      },
      {
        title: 'Period',
        dataIndex: 'period',
        width: isMobile ? 92 : 110,
        render: (period: string | null, row) =>
          row.status === 'waiting' || row.status === 'running' ? (
            <Text type="secondary">—</Text>
          ) : (
            period || '—'
          ),
      },
    ]
    if (!isMobile) {
      cols.push({
        title: 'Note',
        dataIndex: 'message',
        ellipsis: true,
        render: (note: string | null, row) => {
          if (row.status === 'waiting' || row.status === 'running') {
            return <Text type="secondary">—</Text>
          }
          if (row.status === 'error' && note) {
            return <Text type="danger">{note}</Text>
          }
          return note || '—'
        },
      })
    }
    return cols
  }, [isMobile])

  const stepItems = useMemo(
    () => [
      { title: isMobile ? 'Upload' : 'Upload Target' },
      { title: 'Crawl' },
      { title: 'Hasil' },
    ],
    [isMobile],
  )

  const tableScrollY = isMobile ? 260 : isCompact ? 340 : 420
  const targetsTableScroll = useMemo(
    () => ({ x: isMobile ? 300 : undefined, y: tableScrollY }),
    [isMobile, tableScrollY],
  )
  const resultsTableScroll = useMemo(
    () => ({ x: isMobile ? 360 : 560, y: tableScrollY }),
    [isMobile, tableScrollY],
  )

  const crawlRowClassName = (row: TargetStatusRow) =>
    row.status === 'running' ? 'digivla-media-reach-target-row-running' : ''

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const pollJob = useCallback(
    (jobId: string) => {
      stopPolling()
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/tools/media-reach/crawl/${jobId}`, { credentials: 'include' })
          if (!res.ok) return
          const data: MediaReachCrawlJob = await res.json()
          setJob(data)
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            stopPolling()
            setCrawlLoading(false)
            setStopping(false)
            setActiveJobId(null)
            if (data.results.length > 0) setStep(2)
            if (data.status === 'completed') {
              message.success(`Crawl selesai — ${data.results.length} media diproses`)
            } else if (data.status === 'cancelled') {
              message.info(`Crawl dihentikan — ${data.results.length} media selesai diproses`)
            } else {
              message.error(data.error || 'Crawl gagal')
            }
          }
        } catch {
          /* keep polling */
        }
      }, 1000)
    },
    [message, stopPolling],
  )

  useEffect(() => () => stopPolling(), [stopPolling])

  const loadSelectors = useCallback(async () => {
    setSelectorsLoading(true)
    try {
      const res = await fetch('/api/tools/media-reach/selectors', { credentials: 'include' })
      if (res.ok) {
        setSelectors(await res.json())
      }
    } finally {
      setSelectorsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectorsOpen) loadSelectors()
  }, [selectorsOpen, loadSelectors])

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File
    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/tools/media-reach/parse-targets', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        message.error(data.detail || data.error || 'Gagal membaca file')
        options.onError?.(new Error('parse failed'))
        return
      }
      const loaded = (data.media_names || []).slice(0, MEDIA_REACH_MAX_TARGETS)
      setTargets(loaded)
      setStep(1)
      const skippedNote = data.skipped ? ` (${data.skipped} baris dilewati)` : ''
      message.success(`${loaded.length} media target dimuat${skippedNote}`)
      if (loaded.length >= MEDIA_REACH_MAX_TARGETS && (data.total > MEDIA_REACH_MAX_TARGETS || data.skipped)) {
        message.info(`Batas maksimum ${MEDIA_REACH_MAX_TARGETS} media per sesi crawl`)
      }
      options.onSuccess?.(data)
    } catch {
      message.error('Gagal upload file')
      options.onError?.(new Error('upload failed'))
    } finally {
      setUploadLoading(false)
    }
  }

  const applyManualList = () => {
    const allNames = parseManualMediaList(manualText, null)
    const names = allNames.slice(0, MEDIA_REACH_MAX_TARGETS)
    if (!names.length) {
      message.warning('Tidak ada domain valid')
      return
    }
    setTargets(names)
    setStep(1)
    message.success(`${names.length} media target dimuat dari daftar manual`)
    if (allNames.length > MEDIA_REACH_MAX_TARGETS) {
      message.info(
        `Hanya ${MEDIA_REACH_MAX_TARGETS} media pertama yang dimuat (${allNames.length - MEDIA_REACH_MAX_TARGETS} domain dilewati)`,
      )
    }
  }

  const startCrawl = async () => {
    if (!targets.length) {
      message.warning('Upload atau masukkan daftar media terlebih dahulu')
      return
    }
    if (targets.length > MEDIA_REACH_MAX_TARGETS) {
      message.warning(`Maksimum ${MEDIA_REACH_MAX_TARGETS} media per sesi crawl`)
      return
    }
    setCrawlLoading(true)
    setJob(null)
    setStep(1)
    try {
      const res = await fetch('/api/tools/media-reach/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ media_names: targets }),
      })
      const data = await res.json()
      if (!res.ok) {
        message.error(data.detail || data.error || 'Gagal memulai crawl')
        setCrawlLoading(false)
        return
      }
      setJob(data)
      setActiveJobId(data.job_id)
      pollJob(data.job_id)
    } catch {
      message.error('Gagal memulai crawl')
      setCrawlLoading(false)
    }
  }

  const stopCrawl = async () => {
    if (!activeJobId) return
    setStopping(true)
    try {
      const res = await fetch(`/api/tools/media-reach/crawl/${activeJobId}/stop`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        message.error(data.detail || data.error || 'Gagal menghentikan crawl')
        setStopping(false)
        return
      }
      message.info('Permintaan stop dikirim — menunggu media saat ini selesai…')
    } catch {
      message.error('Gagal menghentikan crawl')
      setStopping(false)
    }
  }

  const resetFlow = useCallback(async () => {
    stopPolling()

    const shouldStopJob =
      activeJobId &&
      (crawlLoading || stopping || job?.status === 'running' || job?.status === 'pending')
    if (shouldStopJob) {
      try {
        await fetch(`/api/tools/media-reach/crawl/${activeJobId}/stop`, {
          method: 'POST',
          credentials: 'include',
        })
      } catch {
        /* lanjut reset state lokal */
      }
    }

    setStep(0)
    setTargets([])
    setManualText('')
    setJob(null)
    setActiveJobId(null)
    setCrawlLoading(false)
    setStopping(false)
    message.success('Data direset — silakan upload file atau input manual kembali')
  }, [activeJobId, crawlLoading, job?.status, message, stopPolling, stopping])

  const confirmReset = useCallback(() => {
    const hasData = targets.length > 0 || !!job || manualText.trim().length > 0
    if (!hasData) {
      void resetFlow()
      return
    }

    const crawlActive = crawlLoading || stopping || job?.status === 'running' || job?.status === 'pending'
    modal.confirm({
      title: 'Reset Media Reach?',
      content: crawlActive
        ? 'Crawl yang sedang berjalan akan dihentikan. Semua media target dan hasil crawl akan dihapus sehingga Anda dapat upload file atau input manual kembali.'
        : 'Semua media target dan hasil crawl akan dihapus. Anda dapat upload file atau input manual kembali.',
      okText: 'Reset',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: resetFlow,
    })
  }, [crawlLoading, job, manualText, modal, resetFlow, stopping, targets.length])

  const openSelectorEdit = (selector: MediaReachSelector) => {
    setActiveSelectorKey(selector.selector_key)
    selectorForm.setFieldsValue({
      selector_type: selector.selector_type,
      tag_name: selector.tag_name || '',
      class_names: selector.class_names || '',
      attr_name: selector.attr_name || '',
      attr_value: selector.attr_value || '',
      label_text: selector.label_text || '',
      value_class_names: selector.value_class_names || '',
      description: selector.description || '',
      is_active: selector.is_active,
    })
  }

  const saveSelector = async () => {
    if (!activeSelectorKey) return
    try {
      const values = await selectorForm.validateFields()
      setSelectorSaving(true)
      const res = await fetch(`/api/tools/media-reach/selectors/${encodeURIComponent(activeSelectorKey)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        message.error(data.detail || 'Gagal menyimpan selector')
        return
      }
      message.success('Selector diperbarui')
      setActiveSelectorKey(null)
      loadSelectors()
    } catch {
      /* validation */
    } finally {
      setSelectorSaving(false)
    }
  }

  return (
    <div className="digivla-media-reach-page">
      <PageHeader
        title="Media Reach"
        description={
          isMobile
            ? 'Crawl Monthly Visits SimilarWeb Pro, export CSV/PDF.'
            : 'Upload daftar media online, crawl Monthly Visits dari SimilarWeb Pro (data bulan lalu, label periode = bulan crawl), dan export hasil ke CSV/PDF.'
        }
        breadcrumb={[
          { title: 'Home', href: '/dashboard' },
          { title: 'Tools & Helpers' },
          { title: 'Media Reach' },
        ]}
        extra={
          <Button
            icon={<SettingOutlined />}
            onClick={() => setSelectorsOpen(true)}
            block={isMobile}
            className={isMobile ? 'digivla-media-reach-header-btn' : undefined}
          >
            {isMobile ? 'Selectors (IT)' : 'Parser Selectors (IT)'}
          </Button>
        }
      />

      <Card variant="borderless" className="digivla-page-card digivla-media-reach-card">
        <Steps
          current={step}
          size={isMobile ? 'small' : 'default'}
          className="digivla-media-reach-steps"
          items={stepItems}
        />

        {step === 0 && (
          <div className="digivla-media-reach-section">
            <Row gutter={[16, 16]} className="digivla-media-reach-upload-grid">
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  variant="borderless"
                  className="digivla-media-reach-upload-panel"
                  title="Upload file"
                >
                  <Dragger
                    accept={ACCEPT_UPLOAD}
                    multiple={false}
                    showUploadList={false}
                    customRequest={handleUpload}
                    disabled={uploadLoading}
                    className="digivla-media-reach-dragger"
                  >
                    <p className="ant-upload-drag-icon">
                      <CloudUploadOutlined />
                    </p>
                    <p className="ant-upload-text">Klik atau seret file media target ke sini</p>
                    <p className="ant-upload-hint">.xlsx, .csv, .txt — maks. {MEDIA_REACH_MAX_TARGETS} domain per sesi crawl</p>
                  </Dragger>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  variant="borderless"
                  className="digivla-media-reach-upload-panel"
                  title="Daftar manual"
                >
                  <div className="digivla-media-reach-manual">
                    <Text type="secondary" className="digivla-media-reach-manual-hint">
                      Satu domain per baris
                    </Text>
                    <TextArea
                      rows={isMobile ? 6 : 8}
                      placeholder={'detik.com\nkompas.com\n...'}
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      className="digivla-media-reach-manual-input"
                    />
                    <Button type="primary" block className="digivla-media-reach-manual-btn" onClick={applyManualList}>
                      Gunakan daftar manual
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {step >= 1 && (
          <div className="digivla-media-reach-section">
            <div className="digivla-media-reach-toolbar">
              <Text strong className="digivla-media-reach-toolbar-summary">
                {targets.length} media target
              </Text>
              <div className="digivla-media-reach-toolbar-actions">
                <Space wrap size={[8, 8]} align="center">
                  <ToolbarIconButton
                    label="Reset"
                    icon={<ClearOutlined />}
                    danger
                    onClick={confirmReset}
                  />
                  <ToolbarIconButton
                    label="Mulai crawl"
                    icon={<PlayCircleOutlined />}
                    type="primary"
                    loading={crawlLoading && !stopping}
                    disabled={crawlLoading || !targets.length}
                    onClick={startCrawl}
                  />
                  {crawlLoading && activeJobId ? (
                    <ToolbarIconButton
                      label="Stop crawl"
                      icon={<StopOutlined />}
                      danger
                      loading={stopping}
                      disabled={stopping}
                      onClick={stopCrawl}
                    />
                  ) : null}
                  {exportRows.length > 0 ? (
                    <>
                      <Button
                        size={isMobile ? 'small' : 'middle'}
                        icon={<DownloadOutlined />}
                        onClick={() => downloadMediaReachCsv(exportRows)}
                      >
                        {isMobile ? 'CSV' : 'Download CSV'}
                      </Button>
                      <Button
                        size={isMobile ? 'small' : 'middle'}
                        icon={<FileTextOutlined />}
                        onClick={() => {
                          const ok = printMediaReachPdf(exportRows)
                          if (!ok) {
                            message.warning('Tidak ada hasil crawl untuk diekspor ke PDF')
                            return
                          }
                          message.info('Pilih "Save as PDF" di dialog print browser')
                        }}
                      >
                        {isMobile ? 'PDF' : 'Download PDF'}
                      </Button>
                    </>
                  ) : null}
                </Space>
              </div>
            </div>

            <Row gutter={[16, 16]} className="digivla-media-reach-split-grid">
              <Col xs={24} md={12}>
                <Card size="small" title="Media Targets" className="digivla-media-reach-panel-card">
                  <div className="digivla-media-reach-table-wrap">
                    <Table
                      size="small"
                      rowKey="key"
                      pagination={false}
                      dataSource={crawlRows}
                      columns={targetStatusColumns}
                      scroll={targetsTableScroll}
                      rowClassName={crawlRowClassName}
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  title="Hasil Crawl"
                  className="digivla-media-reach-panel-card"
                  extra={
                    job ? (
                      <Text type="secondary" className="digivla-media-reach-panel-extra">
                        {job.completed} / {job.total} selesai
                      </Text>
                    ) : null
                  }
                >
                  <div className="digivla-media-reach-table-wrap">
                    <Table
                      size="small"
                      rowKey="key"
                      pagination={false}
                      dataSource={crawlRows}
                      columns={alignedResultColumns}
                      scroll={resultsTableScroll}
                      rowClassName={crawlRowClassName}
                    />
                  </div>
                </Card>
              </Col>
            </Row>

            {(crawlLoading || job) && (
              <Card size="small" className="digivla-media-reach-progress-card">
                <Space orientation="vertical" style={{ width: '100%' }} size={isMobile ? 8 : 12}>
                  <div className="digivla-media-reach-progress-status">
                    <Text>
                      Status: <Tag>{job?.status || 'pending'}</Tag>
                    </Text>
                    {job?.current_media ? (
                      <Text type="secondary" className="digivla-media-reach-progress-media">
                        Memproses {job.current_media}
                      </Text>
                    ) : null}
                  </div>
                  <Progress
                    percent={progressPercent}
                    status={
                      job?.status === 'failed'
                        ? 'exception'
                        : job?.status === 'cancelled'
                          ? 'normal'
                          : job?.status === 'completed'
                            ? 'success'
                            : 'active'
                    }
                  />
                  <Text type="secondary" className="digivla-media-reach-progress-meta">
                    {job?.completed ?? 0} / {job?.total ?? targets.length} selesai
                    {etaLabel ? ` · estimasi sisa ${etaLabel}` : ''}
                    {job?.avg_seconds_per_item
                      ? ` · ~${Math.round(job.avg_seconds_per_item)}s/media`
                      : ''}
                  </Text>
                </Space>
              </Card>
            )}

            {step === 2 && results.length > 0 && (
              <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
                Hasil crawl tidak disimpan ke database. Export CSV/PDF sebelum meninggalkan halaman (job expires ~6 jam).
              </Paragraph>
            )}
          </div>
        )}
      </Card>

      <Drawer
        title="Neil Patel Parser Selectors"
        open={selectorsOpen}
        onClose={() => {
          setSelectorsOpen(false)
          setActiveSelectorKey(null)
        }}
        width={isMobile ? '100%' : 480}
        className="digivla-media-reach-selector-drawer"
      >
        <Paragraph type="secondary">
          Konfigurasi CSS selector untuk parse HTML Neil Patel. Tim IT dapat memperbarui jika struktur halaman berubah.
        </Paragraph>
        <Collapse
          accordion
          activeKey={activeSelectorKey || undefined}
          onChange={(key) => {
            const k = Array.isArray(key) ? key[0] : key
            if (!k) {
              setActiveSelectorKey(null)
              return
            }
            const sel = selectors.find((s) => s.selector_key === k)
            if (sel) openSelectorEdit(sel)
          }}
          items={selectors.map((sel) => ({
            key: sel.selector_key,
            label: (
              <span>
                <Text strong>{sel.selector_key}</Text>
                <Text type="secondary"> — {sel.description || sel.selector_type}</Text>
              </span>
            ),
            children: activeSelectorKey === sel.selector_key ? (
              <Form form={selectorForm} layout="vertical" size="small">
                <Form.Item name="selector_type" label="Type" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
                {sel.selector_type === 'element' ? (
                  <>
                    <Form.Item name="tag_name" label="Tag">
                      <Input placeholder="div" />
                    </Form.Item>
                    <Form.Item name="class_names" label="Class names (spasi)">
                      <Input placeholder="sc-eZuMGc dMErkY" />
                    </Form.Item>
                    <Form.Item name="attr_name" label="Attribute name">
                      <Input placeholder="data-testid" />
                    </Form.Item>
                    <Form.Item name="attr_value" label="Attribute value">
                      <Input placeholder="chartDataSubTitle" />
                    </Form.Item>
                  </>
                ) : (
                  <>
                    <Form.Item name="label_text" label="Label text">
                      <Input placeholder="Organic Keywords" />
                    </Form.Item>
                    <Form.Item name="value_class_names" label="Value class names">
                      <Input placeholder="sc-jkTpcO iZTJSD" />
                    </Form.Item>
                  </>
                )}
                <Form.Item name="description" label="Description">
                  <TextArea rows={2} />
                </Form.Item>
                <Form.Item name="is_active" label="Active" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Button type="primary" loading={selectorSaving} onClick={saveSelector}>
                  Simpan
                </Button>
              </Form>
            ) : null,
          }))}
        />
      </Drawer>
    </div>
  )
}
