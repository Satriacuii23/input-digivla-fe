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
    <div className="mb-6">
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb
          className="mb-3"
          items={breadcrumb.map((item) => ({
            title: item.href ? <a href={item.href}>{item.title}</a> : item.title,
          }))}
        />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Title level={3} style={{ margin: 0, color: '#1e3a5f' }}>
            {title}
          </Title>
          {description && (
            <Text type="secondary" className="mt-1 block">
              {description}
            </Text>
          )}
        </div>
        {extra && <div className="digivla-page-header-extra flex flex-wrap gap-2 w-full sm:w-auto">{extra}</div>}
      </div>
    </div>
  )
}
