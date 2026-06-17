'use client'

import { Typography, Breadcrumb } from 'antd'
import type { ReactNode } from 'react'

const { Title, Text } = Typography

interface PageHeaderProps {
  title: string
  description?: string
  extra?: ReactNode
  breadcrumb?: { title: string; href?: string }[]
}

export function PageHeader({ title, description, extra, breadcrumb }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 12 }}
          items={breadcrumb.map((item) => ({
            title: item.href ? <a href={item.href}>{item.title}</a> : item.title,
          }))}
        />
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1e3a5f' }}>
            {title}
          </Title>
          {description && (
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              {description}
            </Text>
          )}
        </div>
        {extra && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{extra}</div>}
      </div>
    </div>
  )
}
