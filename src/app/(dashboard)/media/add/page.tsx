'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  App,
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tabs,
  Upload,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { InboxOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined, DownloadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { MediaType } from '@/lib/types/media'
import { PageHeader } from '@/components/layout/page-header'
import { UploadFormSkeleton } from '@/components/ui/page-loading'
import {
  DuplicateMediaAlert,
  type DuplicateMediaInfo,
} from '@/components/media/duplicate-media-alert'

const { Dragger } = Upload
const { Text, Paragraph } = Typography

const TEMPLATE_COLUMNS = [
  {
    key: 'media_name',
    required: true,
    description: 'Unique media name or domain. Must not be empty.',
    example: 'cnnindonesia.com',
  },
  {
    key: 'media_type',
    required: true,
    description: 'Numeric media type ID only — use the reference table below, not the type name.',
    example: '12',
  },
  {
    key: 'tier',
    required: false,
    description: 'Media tier classification.',
    example: 'Tier 1',
  },
  {
    key: 'language',
    required: false,
    description: 'Publication language code.',
    example: 'IDN',
  },
  {
    key: 'circulation',
    required: false,
    description: 'Circulation count. Leave blank if unknown.',
    example: '1000000',
  },
  {
    key: 'rate_bw',
    required: false,
    description: 'Black & white advertising rate.',
    example: '5000000',
  },
  {
    key: 'rate_fc',
    required: false,
    description: 'Full color advertising rate.',
    example: '10000000',
  },
  {
    key: 'status',
    required: false,
    description: 'Publication status. Defaults to Active when empty.',
    example: 'Active',
  },
] as const

const templateColumnTableColumns: ColumnsType<(typeof TEMPLATE_COLUMNS)[number]> = [
  {
    title: 'Column',
    dataIndex: 'key',
    width: 130,
    render: (key: string) => <Text code className="digivla-bulk-col-code">{key}</Text>,
  },
  {
    title: 'Required',
    dataIndex: 'required',
    width: 96,
    align: 'center',
    render: (required: boolean) =>
      required ? <Tag color="red">Yes</Tag> : <Tag color="default">No</Tag>,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    render: (text: string) => <Text className="digivla-bulk-col-desc">{text}</Text>,
  },
  {
    title: 'Example',
    dataIndex: 'example',
    width: 140,
    render: (text: string) => <Text code>{text}</Text>,
  },
]

const mediaTypeTableColumns: ColumnsType<MediaType> = [
  {
    title: 'ID',
    dataIndex: 'media_type_id',
    width: 72,
    align: 'center',
    render: (id: number | undefined) => <Tag color="blue">#{id}</Tag>,
  },
  {
    title: 'Type Name',
    dataIndex: 'media_type_name',
    render: (_: unknown, record) => (
      <Text strong>{record.media_type_name || record.media_type_en || '—'}</Text>
    ),
  },
  {
    title: 'English',
    dataIndex: 'media_type_en',
    render: (name?: string) => <Text type="secondary">{name || '—'}</Text>,
  },
  {
    title: 'Use in Excel',
    width: 120,
    align: 'center',
    render: (_: unknown, record) => <Text code>{record.media_type_id}</Text>,
  },
]

export default function MediaAddPage() {
  const router = useRouter()
  const { message } = App.useApp()
  const [singleForm] = Form.useForm()
  const [multiForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [typesLoading, setTypesLoading] = useState(true)
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([])
  const [dupInfo, setDupInfo] = useState<DuplicateMediaInfo | null>(null)
  const [dupChecking, setDupChecking] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [templateLoading, setTemplateLoading] = useState(false)

  useEffect(() => {
    setTypesLoading(true)
    fetch('/api/media/types', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setMediaTypes)
      .catch(console.error)
      .finally(() => setTypesLoading(false))
  }, [])

  const typeOptions = mediaTypes.map((t) => ({
    value: t.media_type_id,
    label: t.media_type_name || t.media_type_en || '',
  }))

  const tierOptions = [{ value: 'Tier 1' }, { value: 'Tier 2' }, { value: 'Tier 3' }]
  const langOptions = [
    { value: 'IDN', label: 'Indonesia' },
    { value: 'ENG', label: 'English' },
  ]

  const checkDuplicateName = async (name: string) => {
    if (!name || name.trim().length < 2) {
      setDupInfo(null)
      return
    }
    setDupChecking(true)
    try {
      const res = await fetch(`/api/media/check-duplicate?media_name=${encodeURIComponent(name.trim())}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.exists && data.is_exact_match && data.media) {
          setDupInfo({
            media_id: data.media.media_id,
            media_name: data.media.media_name,
            status: data.media.status ?? data.media.statuse,
          })
        } else {
          setDupInfo(null)
        }
      }
    } catch {
      setDupInfo(null)
    } finally {
      setDupChecking(false)
    }
  }

  const submitSingle = async (values: Record<string, unknown>) => {
    if (dupInfo) {
      message.error('Cannot save — duplicate media name detected')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          media_name: values.media_name,
          media_type: values.media_type,
          tier: values.tier || null,
          circulation: values.circulation ?? null,
          rate_bw: values.rate_bw ?? null,
          rate_fc: values.rate_fc ?? null,
          language: values.language || 'IDN',
          status: values.status ? 'Active' : 'Inactive',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        message.success(`Media "${values.media_name}" added successfully`)
        router.push('/media/list')
      } else message.error(data.error || 'Failed to save')
    } catch {
      message.error('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const submitMulti = async (values: { items: Record<string, unknown>[] }) => {
    setLoading(true)
    try {
      const res = await fetch('/api/media/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          media_list: values.items.map((v) => ({
            media_name: v.media_name,
            media_type: Number(v.media_type),
            tier: v.tier || null,
            circulation: v.circulation ?? null,
            rate_bw: v.rate_bw ?? null,
            rate_fc: v.rate_fc ?? null,
            language: v.language || 'IDN',
            status: v.status ? 'Active' : 'Inactive',
          })),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        message.success(`${data.created_count} media added`)
        router.push('/media/list')
      } else message.error(data.error || 'Failed to save')
    } catch {
      message.error('Please complete all required fields')
    } finally {
      setLoading(false)
    }
  }

  const formatApiError = (payload: { error?: string; detail?: unknown }) => {
    if (payload.error) return payload.error
    if (typeof payload.detail === 'string') return payload.detail
    if (Array.isArray(payload.detail)) {
      return payload.detail.map((item) => (typeof item === 'string' ? item : item?.msg)).filter(Boolean).join(', ')
    }
    return 'Request failed'
  }

  const downloadTemplate = async () => {
    setTemplateLoading(true)
    try {
      const res = await fetch('/api/media/template', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        message.error(formatApiError(data))
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'media-import-template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      message.error('Failed to download template')
    } finally {
      setTemplateLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    try {
      const fd = new FormData()
      fd.append('file', importFile)
      const res = await fetch('/api/media/bulk', { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        const failedCount = data.failed?.length ?? 0
        if (failedCount > 0) {
          message.warning(`${data.created_count} imported, ${failedCount} row(s) failed`)
        } else {
          message.success(`${data.created_count} media imported successfully`)
        }
        router.push('/media/list')
      } else {
        message.error(formatApiError(data))
      }
    } catch {
      message.error('Import failed')
    } finally {
      setImporting(false)
    }
  }

  const uploadProps: UploadProps = {
    accept: '.xlsx,.xls,.csv',
    maxCount: 1,
    beforeUpload: (file) => {
      setImportFile(file)
      return false
    },
    onRemove: () => setImportFile(null),
  }

  const fieldName = (listIndex: number | undefined, key: string) =>
    listIndex !== undefined ? [listIndex, key] : key

  const basicFields = (listIndex?: number) => (
    <>
      <div className="digivla-form-grid-2">
        <Form.Item
          name={fieldName(listIndex, 'media_name')}
          label="Media Name"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input
            placeholder="e.g. cnnindonesia.com"
            onBlur={
              listIndex === undefined ? (e) => checkDuplicateName(e.target.value) : undefined
            }
          />
        </Form.Item>
        <Form.Item
          name={fieldName(listIndex, 'media_type')}
          label="Media Type"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select placeholder="Select type" options={typeOptions} showSearch optionFilterProp="label" />
        </Form.Item>
      </div>
      <div className="digivla-form-grid-2">
        <Form.Item name={fieldName(listIndex, 'tier')} label="Tier">
          <Select allowClear placeholder="Select tier" options={tierOptions} />
        </Form.Item>
        <Form.Item name={fieldName(listIndex, 'language')} label="Language">
          <Select options={langOptions} />
        </Form.Item>
      </div>
    </>
  )

  const ratesFields = (listIndex?: number) => (
    <>
      <Form.Item name={fieldName(listIndex, 'circulation')} label="Circulation">
        <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
      </Form.Item>
      <div className="digivla-form-grid-2">
        <Form.Item name={fieldName(listIndex, 'rate_bw')} label="Rate B&W">
          <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
        </Form.Item>
        <Form.Item name={fieldName(listIndex, 'rate_fc')} label="Rate Full Color">
          <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
        </Form.Item>
      </div>
    </>
  )

  const statusField = (listIndex?: number) => (
    <Form.Item
      name={fieldName(listIndex, 'status')}
      label="Active Status"
      valuePropName="checked"
      className="digivla-form-item-status"
    >
      <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
    </Form.Item>
  )

  const multiMediaFields = (listIndex: number) => (
    <div className="digivla-multi-fields">
      <div className="digivla-multi-section">
        <Text className="digivla-multi-section-title">Basic Information</Text>
        {basicFields(listIndex)}
      </div>
      <Divider className="digivla-multi-divider" />
      <div className="digivla-multi-section">
        <Text className="digivla-multi-section-title">Rates & Circulation</Text>
        {ratesFields(listIndex)}
      </div>
      <Divider className="digivla-multi-divider" />
      <div className="digivla-multi-section">
        <Text className="digivla-multi-section-title">Publication Status</Text>
        {statusField(listIndex)}
      </div>
    </div>
  )

  return (
    <>
      <PageHeader
        title="Add Media"
        description="Add new media — single entry, multiple rows, or bulk import from Excel."
        breadcrumb={[
          { title: 'Home', href: '/dashboard' },
          { title: 'Media', href: '/media/list' },
          { title: 'Add' },
        ]}
        extra={
          <Link href="/media/list">
            <Button>Back to List</Button>
          </Link>
        }
      />

      <Card variant="borderless" className="digivla-page-card">
        {typesLoading ? (
          <UploadFormSkeleton fields={7} />
        ) : (
          <Tabs
            defaultActiveKey="single"
            className="digivla-media-add-tabs"
            items={[
              {
                key: 'single',
                label: 'Single',
                children: (
                  <Form
                    form={singleForm}
                    layout="vertical"
                    onFinish={submitSingle}
                    initialValues={{ language: 'IDN', status: true }}
                    className="digivla-form-section"
                    requiredMark="optional"
                  >
                    <Card size="small" className="digivla-form-block" title="Basic Information">
                      {basicFields()}
                    </Card>

                    {dupChecking && (
                      <Text type="secondary" className="digivla-dup-checking">
                        Checking duplicate name...
                      </Text>
                    )}
                    {dupInfo && !dupChecking && <DuplicateMediaAlert duplicate={dupInfo} />}

                    <Card size="small" className="digivla-form-block" title="Rates & Circulation">
                      {ratesFields()}
                    </Card>

                    <Card size="small" className="digivla-form-block" title="Publication Status">
                      {statusField()}
                    </Card>

                    <Divider />
                    <Space wrap className="digivla-form-actions">
                      <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} disabled={!!dupInfo}>
                        Save Media
                      </Button>
                      <Link href="/media/list">
                        <Button>Cancel</Button>
                      </Link>
                    </Space>
                  </Form>
                ),
              },
              {
                key: 'multi',
                label: 'Multi',
                children: (
                  <Form
                    form={multiForm}
                    layout="vertical"
                    onFinish={submitMulti}
                    initialValues={{ items: [{ language: 'IDN', status: true }] }}
                    className="digivla-form-section"
                    requiredMark="optional"
                  >
                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                      Add up to 50 media records in one submission. Each row is saved as a separate media entry.
                    </Text>
                    <Form.List name="items">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <Card
                              key={key}
                              size="small"
                              className="digivla-form-block digivla-multi-card"
                              title={`Media #${name + 1}`}
                              extra={
                                fields.length > 1 && (
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => remove(name)}
                                  >
                                    Remove
                                  </Button>
                                )
                              }
                            >
                              {multiMediaFields(name)}
                            </Card>
                          ))}
                          <Space wrap className="digivla-form-actions">
                            {fields.length < 50 && (
                              <Button
                                icon={<PlusOutlined />}
                                onClick={() => add({ language: 'IDN', status: true })}
                              >
                                Add Row
                              </Button>
                            )}
                            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                              Save All ({fields.length})
                            </Button>
                          </Space>
                        </>
                      )}
                    </Form.List>
                  </Form>
                ),
              },
              {
                key: 'bulk',
                label: 'Bulk Import',
                children: (
                  <div className="digivla-bulk-import">
                    <Alert
                      type="info"
                      showIcon
                      title="How to bulk import"
                      description="Download the Excel template, fill the Media sheet, then upload the completed file below."
                      className="digivla-bulk-intro-alert"
                    />

                    <Card size="small" className="digivla-form-block digivla-bulk-guide-card" title="Template columns">
                      <Paragraph type="secondary" className="digivla-bulk-guide-intro">
                        Row 1 in the <Text strong>Media</Text> sheet must use the exact column headers below. Do not
                        rename or translate them.
                      </Paragraph>

                      <Table
                        size="small"
                        pagination={false}
                        className="digivla-bulk-columns-table"
                        columns={templateColumnTableColumns}
                        dataSource={[...TEMPLATE_COLUMNS]}
                        rowKey="key"
                      />

                      <Divider className="digivla-bulk-section-divider" />

                      <div className="digivla-bulk-media-type-guide">
                        <div className="digivla-bulk-section-head">
                          <Text className="digivla-bulk-section-title">Filling in media_type</Text>
                          <Text type="secondary" className="digivla-bulk-section-subtitle">
                            The <Text code>media_type</Text> column accepts a <Text strong>number (ID)</Text> only —
                            not the type name such as &quot;TV&quot; or &quot;Online&quot;.
                          </Text>
                        </div>

                        <div className="digivla-bulk-type-steps">
                          <div className="digivla-bulk-type-step">
                            <span className="digivla-bulk-type-step-num">1</span>
                            <Text>Find the correct media category in the table below.</Text>
                          </div>
                          <div className="digivla-bulk-type-step">
                            <span className="digivla-bulk-type-step-num">2</span>
                            <Text>
                              Copy the <Text strong>ID</Text> value (e.g. <Text code>12</Text> for TV).
                            </Text>
                          </div>
                          <div className="digivla-bulk-type-step">
                            <span className="digivla-bulk-type-step-num">3</span>
                            <Text>
                              Paste that number into the <Text code>media_type</Text> column for each row in Excel.
                            </Text>
                          </div>
                        </div>

                        <Table
                          size="small"
                          loading={typesLoading}
                          pagination={{ pageSize: 8, hideOnSinglePage: true, size: 'small' }}
                          className="digivla-bulk-type-table"
                          columns={mediaTypeTableColumns}
                          dataSource={mediaTypes}
                          rowKey={(record) => String(record.media_type_id ?? record.media_type_name)}
                          locale={{ emptyText: 'Media types unavailable' }}
                        />

                        <Alert
                          type="warning"
                          showIcon
                          className="digivla-bulk-type-note"
                          title="Common mistake"
                          description='Do not enter text like "TV" or "Online" in media_type. Always use the numeric ID from the table or the Media Types sheet in the downloaded template.'
                        />
                      </div>
                    </Card>

                    <Space wrap style={{ margin: '16px 0' }}>
                      <Button
                        icon={<DownloadOutlined />}
                        loading={templateLoading}
                        onClick={downloadTemplate}
                      >
                        Download Template (.xlsx)
                      </Button>
                    </Space>

                    <Dragger {...uploadProps} className="digivla-upload-dragger">
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: '#1e3a5f', fontSize: 48 }} />
                      </p>
                      <p className="ant-upload-text">Drag Excel/CSV file here or click to browse</p>
                      <p className="ant-upload-hint">Supported formats: .xlsx, .xls, .csv</p>
                    </Dragger>

                    {importFile && (
                      <div className="digivla-form-actions digivla-bulk-actions">
                        <Text type="secondary">Selected: {importFile.name}</Text>
                        <Button type="primary" loading={importing} onClick={handleImport} icon={<SaveOutlined />}>
                          Import File
                        </Button>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>
    </>
  )
}
