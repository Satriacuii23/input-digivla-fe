'use client'

import { useState } from 'react'
import { App, Form, Input, Button, Typography } from 'antd'
import { LockOutlined, UserOutlined, SafetyCertificateOutlined, CheckCircleFilled } from '@ant-design/icons'
import { defaultHomeForRole } from '@/lib/auth/rbac'
import { DigivlaLogo } from '@/components/ui/logo'

const { Title, Text, Paragraph } = Typography

const FEATURES = [
  'Kelola artikel TV, Radio & Online',
  'Quality Control upload harian',
  'Master data media terpusat',
  'Akses per role & tim produksi',
]

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
      message.error('Gagal terhubung ke server. Pastikan backend berjalan di port 8005.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="digivla-login-page">
      <aside className="digivla-login-hero" aria-hidden={false}>
        <div className="digivla-login-hero-inner">
          <div className="digivla-login-hero-logo-wrap">
            <DigivlaLogo height={44} className="digivla-login-hero-logo" />
          </div>
          <div className="digivla-login-hero-copy">
            <Title level={2} className="digivla-login-hero-title">
              IDS 2.0
            </Title>
            <Paragraph className="digivla-login-hero-desc">
              Daily Uploader — platform operasi media untuk input artikel, quality control, dan manajemen data media.
            </Paragraph>
          </div>
          <ul className="digivla-login-features">
            {FEATURES.map((item) => (
              <li key={item}>
                <CheckCircleFilled />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <Text className="digivla-login-hero-footer">© {new Date().getFullYear()} Digivla Indonesia</Text>
      </aside>

      <main className="digivla-login-main">
        <div className="digivla-login-main-inner">
          <div className="digivla-login-mobile-brand">
            <DigivlaLogo height={40} />
            <Text className="digivla-login-mobile-sub">IDS 2.0 · Daily Uploader</Text>
          </div>

          <div className="digivla-login-card">
            <div className="digivla-login-card-header">
              <Title level={4} className="digivla-login-card-title">
                Masuk ke akun Anda
              </Title>
              <Text type="secondary" className="digivla-login-card-subtitle">
                Gunakan username dan password yang diberikan administrator
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
                  placeholder="contoh: online"
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
                  placeholder="Masukkan password"
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

            <div className="digivla-login-secure">
              <SafetyCertificateOutlined />
              <Text type="secondary">Akses terbatas untuk pengguna terotorisasi</Text>
            </div>
          </div>

          <Text type="secondary" className="digivla-login-footer">
            © {new Date().getFullYear()} Digivla Indonesia
          </Text>
        </div>
      </main>
    </div>
  )
}
