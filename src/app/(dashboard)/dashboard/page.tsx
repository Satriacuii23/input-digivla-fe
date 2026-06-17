'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Col, Row, Statistic, Typography, Button, Space, Alert } from 'antd'
import {
  DatabaseOutlined,
  PlaySquareOutlined,
  AudioOutlined,
  GlobalOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { PageHeader } from '@/components/layout/page-header'
import { DashboardActivitySkeleton, DashboardStatsSkeleton } from '@/components/ui/page-loading'

const { Text } = Typography

interface DashboardStats {
  total_tv: number
  total_radio: number
  total_online: number
  today_tv: number
  today_radio: number
  today_online: number
  total_media: number
}

const articleStatCards = [
  {
    key: 'tv',
    href: '/tv/list',
    title: 'TV Articles',
    totalKey: 'total_tv' as const,
    todayKey: 'today_tv' as const,
    icon: <PlaySquareOutlined style={{ color: '#1e3a5f' }} />,
    subtitle: 'TV media publications',
  },
  {
    key: 'radio',
    href: '/radio/list',
    title: 'Radio Articles',
    totalKey: 'total_radio' as const,
    todayKey: 'today_radio' as const,
    icon: <AudioOutlined style={{ color: '#1e3a5f' }} />,
    subtitle: 'Radio media publications',
  },
  {
    key: 'online',
    href: '/online/list',
    title: 'Online Articles',
    totalKey: 'total_online' as const,
    todayKey: 'today_online' as const,
    icon: <GlobalOutlined style={{ color: '#1e3a5f' }} />,
    subtitle: 'Online media publications',
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stats/dashboard?_=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      })

      if (!res.ok) {
        throw new Error(res.status === 401 ? 'Please sign in again' : 'Failed to load dashboard stats')
      }

      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    const onFocus = () => fetchStats()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchStats])

  const todayTotal = (stats?.today_tv ?? 0) + (stats?.today_radio ?? 0) + (stats?.today_online ?? 0)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Media and article summary — overall totals and today's input."
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchStats} loading={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Button size="small" onClick={fetchStats}>
              Retry
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {loading && !stats ? (
        <>
          <DashboardStatsSkeleton count={4} />
          <DashboardActivitySkeleton />
        </>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} xl={6}>
              <Link href="/media/list">
                <Card hoverable>
                  <Statistic
                    title="Total Media"
                    value={stats?.total_media ?? 0}
                    prefix={<DatabaseOutlined style={{ color: '#1e3a5f' }} />}
                    formatter={(value) => Number(value).toLocaleString('en-US')}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>Registered master data</Text>
                </Card>
              </Link>
            </Col>

            {articleStatCards.map((card) => (
              <Col xs={24} sm={12} xl={6} key={card.key}>
                <Link href={card.href}>
                  <Card hoverable>
                    <Statistic
                      title={card.title}
                      value={stats?.[card.totalKey] ?? 0}
                      prefix={card.icon}
                      formatter={(value) => Number(value).toLocaleString('en-US')}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Today: {(stats?.[card.todayKey] ?? 0).toLocaleString('en-US')} · {card.subtitle}
                    </Text>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          {stats && (
            <Card style={{ marginTop: 16 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                <div>
                  <Text strong style={{ color: '#1e3a5f' }}>Today&apos;s Activity</Text>
                  <br />
                  <Text type="secondary">
                    Total {todayTotal.toLocaleString('en-US')} articles — TV{' '}
                    {stats.today_tv.toLocaleString('en-US')}, Radio{' '}
                    {stats.today_radio.toLocaleString('en-US')}, Online{' '}
                    {stats.today_online.toLocaleString('en-US')}
                  </Text>
                </div>
                <Link href="/tv/upload">
                  <Button type="primary" icon={<PlusOutlined />}>Upload Article</Button>
                </Link>
              </Space>
            </Card>
          )}
        </>
      )}
    </>
  )
}
