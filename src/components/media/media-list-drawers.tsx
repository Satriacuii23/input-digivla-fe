'use client'

import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tag,
  Typography,
} from 'antd'
import type { FormInstance } from 'antd/es/form'
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  SaveOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { Media, MediaType } from '@/lib/types/media'
import {
  MEDIA_DRAWER_STYLES,
  formatMediaIdDisplay,
} from '@/lib/media/media-list-helpers'
import { MediaStatusTag } from '@/components/media/media-status-tag'
import { DuplicateMediaAlert } from '@/components/media/duplicate-media-alert'

const { Text } = Typography

type DrawerWidth = number | string

interface MediaEditDrawerProps {
  open: boolean
  media: Media | null
  width: DrawerWidth
  form: FormInstance
  loading: boolean
  mediaTypes: MediaType[]
  onClose: () => void
  onSave: () => void
}

export function MediaEditDrawer({
  open,
  media,
  width,
  form,
  loading,
  mediaTypes,
  onClose,
  onSave,
}: MediaEditDrawerProps) {
  return (
    <Drawer
      title="Edit Media"
      open={open}
      onClose={onClose}
      size={width}
      destroyOnClose
      maskClosable={!loading}
      className="digivla-media-drawer digivla-media-drawer-edit"
      styles={MEDIA_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer">
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={onSave}>
            Save Changes
          </Button>
        </div>
      }
    >
      {media && (
        <div className="digivla-drawer-stack">
          <div className="digivla-drawer-summary">
            <div className="digivla-drawer-summary-row">
              <Text type="secondary">Media ID</Text>
              <Tag color="blue">#{formatMediaIdDisplay(media.media_id)}</Tag>
            </div>
            <div className="digivla-drawer-summary-row">
              <Text type="secondary">Type</Text>
              <Text>{media.type_name || '—'}</Text>
            </div>
            <div className="digivla-drawer-summary-row">
              <Text type="secondary">Status</Text>
              <MediaStatusTag status={media.status} />
            </div>
          </div>

          <Form form={form} layout="vertical" requiredMark="optional" className="digivla-drawer-form">
            <Card size="small" title="Basic Information" className="digivla-drawer-card">
              <Form.Item
                name="media_name"
                label="Media Name"
                rules={[{ required: true, message: 'Media name is required' }]}
              >
                <Input placeholder="Enter media name" />
              </Form.Item>
              <Form.Item
                name="media_type"
                label="Media Type"
                rules={[{ required: true, message: 'Media type is required' }]}
              >
                <Select
                  placeholder="Select type"
                  showSearch
                  optionFilterProp="label"
                  options={mediaTypes.map((t) => ({
                    value: t.media_type_id,
                    label: t.media_type_name || t.media_type_en || '',
                  }))}
                />
              </Form.Item>
              <div className="digivla-form-grid-2">
                <Form.Item name="tier" label="Tier">
                  <Select
                    allowClear
                    placeholder="Select tier"
                    options={[{ value: 'Tier 1' }, { value: 'Tier 2' }, { value: 'Tier 3' }]}
                  />
                </Form.Item>
                <Form.Item name="language" label="Language">
                  <Select
                    options={[
                      { value: 'IDN', label: 'Indonesia' },
                      { value: 'ENG', label: 'English' },
                    ]}
                  />
                </Form.Item>
              </div>
            </Card>

            <Card size="small" title="Rates & Circulation" className="digivla-drawer-card">
              <Form.Item name="circulation" label="Circulation">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
              <div className="digivla-form-grid-2">
                <Form.Item name="rate_bw" label="Rate B&W">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                </Form.Item>
                <Form.Item name="rate_fc" label="Rate Full Color">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                </Form.Item>
              </div>
            </Card>

            <Card size="small" title="Publication Status" className="digivla-drawer-card">
              <Form.Item
                name="status"
                label="Active Status"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Card>
          </Form>
        </div>
      )}
    </Drawer>
  )
}

interface MediaDeleteDrawerProps {
  open: boolean
  media: Media | null
  width: DrawerWidth
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function MediaDeleteDrawer({
  open,
  media,
  width,
  loading,
  onClose,
  onConfirm,
}: MediaDeleteDrawerProps) {
  return (
    <Drawer
      title="Delete Media"
      open={open}
      onClose={() => !loading && onClose()}
      size={width}
      destroyOnClose
      maskClosable={!loading}
      className="digivla-media-drawer digivla-media-drawer-delete"
      styles={MEDIA_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer">
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" danger icon={<DeleteOutlined />} loading={loading} onClick={onConfirm}>
            Delete Media
          </Button>
        </div>
      }
    >
      {media && (
        <div className="digivla-drawer-stack">
          <Alert
            type="error"
            showIcon
            title="Permanent deletion"
            description="This action cannot be undone. The media record and its association will be removed from the system."
          />

          <Card size="small" title="Media to delete" className="digivla-drawer-card digivla-drawer-card-danger">
            <div className="digivla-article-delete-title">
              <Text strong>{media.media_name}</Text>
            </div>
            <Descriptions column={1} size="small" className="digivla-drawer-desc">
              <Descriptions.Item label="Media ID">
                <Text code>#{formatMediaIdDisplay(media.media_id)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Type">{media.type_name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Tier">{media.tier || '—'}</Descriptions.Item>
              <Descriptions.Item label="Language">{media.language || 'IDN'}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <MediaStatusTag status={media.status} />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )}
    </Drawer>
  )
}

interface MediaDuplicateCheckDrawerProps {
  open: boolean
  width: DrawerWidth
  form: FormInstance
  loading: boolean
  result: {
    exists: boolean
    media: { media_id: number; media_name: string; status: string } | null
  } | null
  onClose: () => void
  onOpenChange: (open: boolean) => void
  onCheck: () => void
}

export function MediaDuplicateCheckDrawer({
  open,
  width,
  form,
  loading,
  result,
  onClose,
  onOpenChange,
  onCheck,
}: MediaDuplicateCheckDrawerProps) {
  return (
    <Drawer
      title="Check Duplicate"
      open={open}
      onClose={onClose}
      afterOpenChange={onOpenChange}
      size={width}
      maskClosable={!loading}
      className="digivla-media-drawer digivla-media-drawer-dup"
      styles={MEDIA_DRAWER_STYLES}
      footer={
        <div className="digivla-drawer-footer">
          <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
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
        onFinish={onCheck}
        requiredMark="optional"
        className="digivla-drawer-form"
        preserve={false}
      >
        <div className="digivla-drawer-stack">
          <Alert
            type="info"
            showIcon
            title="Verify media name"
            description="Enter a media name to check whether it already exists in the database before adding new records."
          />

          <Card size="small" title="Search" className="digivla-drawer-card">
            <Form.Item
              name="name"
              label="Media Name"
              rules={[{ required: true, message: 'Enter media name' }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="e.g. cnnindonesia.com" allowClear autoFocus />
            </Form.Item>
          </Card>

          {result && (
            <Card
              size="small"
              title={result.exists ? 'Duplicate found' : 'Name available'}
              className={`digivla-drawer-card${result.exists ? ' digivla-drawer-card-warning' : ' digivla-drawer-card-success'}`}
            >
              {result.exists && result.media ? (
                <DuplicateMediaAlert duplicate={result.media} showViewLink={false} />
              ) : (
                <Alert
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  title="Name is available"
                  description="This media name is not registered yet. You can proceed to add it as new media."
                />
              )}
            </Card>
          )}
        </div>
      </Form>
    </Drawer>
  )
}
