'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import type { TableProps } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/layout/page-header'
import { ListTableSkeleton, shouldShowTableSkeleton } from '@/components/ui/page-loading'
import type { ManagedUser, RoleOption } from '@/lib/types/user'
import { roleLabel } from '@/lib/auth/rbac'

type DrawerMode = 'create' | 'edit' | null

export default function UserManagementPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const [users, setUsers] = useState<ManagedUser[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)

  const loadRoles = useCallback(async () => {
    const res = await fetch('/api/users/roles', { credentials: 'include' })
    if (res.ok) {
      setRoles(await res.json())
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter) params.set('status', statusFilter)
      if (roleFilter) params.set('role', roleFilter)

      const res = await fetch(`/api/users?${params.toString()}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        message.error(data.error || 'Gagal memuat data user')
        return
      }
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      message.error('Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }, [message, roleFilter, search, statusFilter])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const openCreate = () => {
    setDrawerMode('create')
    setEditingUser(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active', production: 'production', role: 'staff_online' })
    setDrawerOpen(true)
  }

  const openEdit = (user: ManagedUser) => {
    setDrawerMode('edit')
    setEditingUser(user)
    form.setFieldsValue({
      username: user.username,
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role,
      production: user.production || 'production',
      status: user.status,
    })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setDrawerMode(null)
    setEditingUser(null)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      if (drawerMode === 'create') {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(values),
        })
        const data = await res.json()
        if (!res.ok) {
          message.error(data.error || 'Gagal membuat user')
          return
        }
        message.success(`User "${data.username}" berhasil dibuat`)
      } else if (drawerMode === 'edit' && editingUser) {
        const payload: Record<string, string> = {
          full_name: values.full_name,
          email: values.email,
          role: values.role,
          production: values.production,
          status: values.status,
        }
        if (values.password?.trim()) {
          payload.password = values.password.trim()
        }

        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) {
          message.error(data.error || 'Gagal memperbarui user')
          return
        }
        message.success(`User "${data.username}" berhasil diperbarui`)
      }

      closeDrawer()
      loadUsers()
    } catch {
      /* validation */
    } finally {
      setSaving(false)
    }
  }

  const columns: TableProps<ManagedUser>['columns'] = useMemo(
    () => [
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: 'Nama Lengkap',
        dataIndex: 'full_name',
        key: 'full_name',
        render: (v: string | null) => v || '—',
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (_: string, record: ManagedUser) => (
          <Tag color="blue">{record.role_label || roleLabel(record.role)}</Tag>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'active' ? 'green' : 'default'}>
            {status === 'active' ? 'Aktif' : 'Nonaktif'}
          </Tag>
        ),
      },
      {
        title: 'Login Terakhir',
        dataIndex: 'last_login',
        key: 'last_login',
        render: (v: string | null) =>
          v ? new Date(v).toLocaleString('id-ID') : '—',
      },
      {
        title: 'Aksi',
        key: 'actions',
        width: 100,
        render: (_: unknown, record: ManagedUser) => (
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            Edit
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Kelola akun pengguna, role, dan status akses sistem."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Tambah User
          </Button>
        }
      />

      <Card className="digivla-page-card">
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Cari username, nama, email..."
            style={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={loadUsers}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'active', label: 'Aktif' },
              { value: 'inactive', label: 'Nonaktif' },
            ]}
          />
          <Select
            allowClear
            placeholder="Role"
            style={{ width: 180 }}
            value={roleFilter}
            onChange={setRoleFilter}
            options={roles.map((r) => ({ value: r.value, label: r.label }))}
          />
          <Button icon={<ReloadOutlined />} onClick={loadUsers}>
            Muat ulang
          </Button>
        </Space>

        {shouldShowTableSkeleton(loading, users.length) ? (
          <ListTableSkeleton rows={6} />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={users}
            loading={loading}
            pagination={{ pageSize: 15, showSizeChanger: false }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      <Drawer
        title={drawerMode === 'create' ? 'Tambah User Baru' : 'Edit User'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={420}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={closeDrawer}>Batal</Button>
            <Button type="primary" loading={saving} onClick={handleSubmit}>
              Simpan
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          {drawerMode === 'create' && (
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Username wajib diisi' },
                { min: 3, message: 'Minimal 3 karakter' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="contoh: johndoe" />
            </Form.Item>
          )}

          <Form.Item name="full_name" label="Nama Lengkap">
            <Input placeholder="Nama lengkap" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email tidak valid' }]}>
            <Input placeholder="email@digivla.id" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Pilih role' }]}
          >
            <Select
              options={roles.map((r) => ({ value: r.value, label: r.label }))}
              placeholder="Pilih role"
            />
          </Form.Item>

          <Form.Item name="production" label="Production">
            <Input placeholder="production" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Pilih status' }]}
          >
            <Select
              options={[
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Nonaktif' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={drawerMode === 'create' ? 'Password' : 'Password Baru'}
            rules={
              drawerMode === 'create'
                ? [
                    { required: true, message: 'Password wajib diisi' },
                    { min: 6, message: 'Minimal 6 karakter' },
                  ]
                : [{ min: 6, message: 'Minimal 6 karakter' }]
            }
            extra={drawerMode === 'edit' ? 'Kosongkan jika tidak ingin mengubah password' : undefined}
          >
            <Input.Password placeholder={drawerMode === 'create' ? 'Password' : 'Password baru (opsional)'} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
