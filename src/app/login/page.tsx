'use client'

import { useState } from 'react'
import { App, Form, Input, Button, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { defaultHomeForRole } from '@/lib/auth/rbac'
import { DigivlaLogo } from '@/components/ui/logo'

const { Title, Text } = Typography

export default function LoginPage() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        message.success('Login berhasil')
        const home = defaultHomeForRole(data.user?.role)
        window.location.replace(home)
        return
      }
      message.error(data.error || 'Username atau password salah')
    } catch {
      message.error('Gagal terhubung ke server. Pastikan backend berjalan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="digivla-login-page">
      <div className="digivla-login-panel">
        <header className="digivla-login-brand">
          <DigivlaLogo height={42} className="digivla-login-brand-logo" />
          <Text className="digivla-login-brand-tag">IDS 2.0 · Daily Uploader</Text>
        </header>

        <div className="digivla-login-card">
          <div className="digivla-login-card-header">
            <Title level={3} className="digivla-login-card-title">
              Masuk
            </Title>
            <Text type="secondary" className="digivla-login-card-subtitle">
              Gunakan akun yang diberikan administrator
            </Text>
          </div>

          <Form
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
            className="digivla-login-form"
            autoComplete="on"
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Masukkan username' }]}
            >
              <Input
                prefix={<UserOutlined className="digivla-login-input-icon" />}
                placeholder="username"
                autoComplete="username"
                autoFocus
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Masukkan password' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="digivla-login-input-icon" />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item className="digivla-login-submit">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="digivla-login-btn"
              >
                Masuk
              </Button>
            </Form.Item>
          </Form>
        </div>

        <footer className="digivla-login-footer">
          <Text type="secondary">© {new Date().getFullYear()} Digivla Indonesia</Text>
        </footer>
      </div>
    </div>
  )
}
