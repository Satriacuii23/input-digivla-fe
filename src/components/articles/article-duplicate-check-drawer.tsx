'use client'

import { useState } from 'react'
import { Alert, Button, Card, Drawer, Form, Input, Select } from 'antd'
import { CheckCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { ARTICLE_DRAWER_STYLES, checkArticleDuplicate, type ArticleListApiPath, type DuplicateArticleMatch } from '@/lib/articles/article-list-helpers'
import { DuplicateArticleAlert } from '@/components/articles/duplicate-article-alert'

interface MediaOption {
  value: string
  label: string
}

interface ArticleDuplicateCheckDrawerProps {
  open: boolean
  onClose: () => void
  width: number | string
  apiPath: ArticleListApiPath
  mediaOptions: MediaOption[]
  onPreview?: (duplicate: DuplicateArticleMatch) => void
}

export function ArticleDuplicateCheckDrawer({
  open,
  onClose,
  width,
  apiPath,
  mediaOptions,
  onPreview,
}: ArticleDuplicateCheckDrawerProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ exists: boolean; duplicates: DuplicateArticleMatch[] } | null>(
    null,
  )

  const handleClose = () => {
    if (loading) return
    onClose()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setResult(null)
      setLoading(false)
      form.resetFields()
      return
    }
    setResult(null)
    setLoading(false)
    form.resetFields()
  }

  const handleCheck = async () => {
    try {
      const values = await form.validateFields()
      const title = (values.title as string | undefined)?.trim() || ''
      const content = (values.content as string | undefined)?.trim() || ''

      if (!title && !content) {
        form.setFields([
          { name: 'title', errors: ['Enter title or content'] },
          { name: 'content', errors: ['Enter title or content'] },
        ])
        return
      }

      setLoading(true)
      setResult(null)

      const data = await checkArticleDuplicate(apiPath, {
        title,
        content,
        media_id: values.media_id ?? null,
      })

      if (data) {
        setResult({
          exists: Boolean(data.exists && data.duplicates?.length > 0),
          duplicates: data.duplicates || [],
        })
      }
    } catch {
      /* validation */
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      title="Check Duplicate"
      open={open}
      onClose={handleClose}
      afterOpenChange={handleOpenChange}
      size={width}
      maskClosable={!loading}
      className="digivla-media-drawer digivla-media-drawer-dup"
      styles={ARTICLE_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer">
          <Button onClick={handleClose} disabled={loading}>
            Close
          </Button>
          <Button type="primary" loading={loading} icon={<SearchOutlined />} onClick={() => form.submit()}>
            Check Duplicate
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCheck}
        requiredMark="optional"
        className="digivla-drawer-form"
        preserve={false}
      >
        <div className="digivla-drawer-stack">
          <Alert
            type="info"
            showIcon
            title="Verify article uniqueness"
            description="Enter a title and/or content to find similar articles already stored in the database."
          />

          <Card size="small" title="Search criteria" className="digivla-drawer-card">
            <Form.Item name="title" label="Title">
              <Input placeholder="Article title" allowClear autoFocus />
            </Form.Item>
            <Form.Item name="content" label="Content">
              <Input.TextArea placeholder="Article content keywords" rows={4} allowClear />
            </Form.Item>
            <Form.Item name="media_id" label="Media (optional)" style={{ marginBottom: 0 }}>
              <Select
                placeholder="All media"
                allowClear
                showSearch
                optionFilterProp="label"
                options={mediaOptions}
              />
            </Form.Item>
          </Card>

          {result && (
            <Card
              size="small"
              title={result.exists ? 'Duplicate found' : 'No duplicate found'}
              className={`digivla-drawer-card${result.exists ? ' digivla-drawer-card-warning' : ' digivla-drawer-card-success'}`}
            >
              {result.exists ? (
                <DuplicateArticleAlert duplicates={result.duplicates} onPreview={onPreview} />
              ) : (
                <Alert
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  title="No similar articles"
                  description="No existing articles match the title or content you entered."
                />
              )}
            </Card>
          )}
        </div>
      </Form>
    </Drawer>
  )
}
