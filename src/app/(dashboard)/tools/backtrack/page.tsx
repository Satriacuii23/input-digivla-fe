'use client'

import { Card, Typography } from 'antd'
import { History } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'

const { Paragraph, Text } = Typography

export default function BacktrackPage() {
  return (
    <>
      <PageHeader
        title="Backtrack"
        description="Search and review historical article records across TV, Radio, and Online."
        breadcrumb={[
          { title: 'Home', href: '/dashboard' },
          { title: 'Tools & Helpers' },
          { title: 'Backtrack' },
        ]}
      />

      <Card variant="borderless" className="digivla-page-card">
        <div className="digivla-tools-placeholder">
          <div className="digivla-tools-placeholder-icon" aria-hidden>
            <History size={28} strokeWidth={1.75} />
          </div>
          <Text strong style={{ fontSize: 16, color: '#1e3a5f' }}>
            Article backtrack search
          </Text>
          <Paragraph type="secondary" style={{ maxWidth: 560, margin: '8px 0 0', textAlign: 'center' }}>
            This helper will let you look up past articles by date range, media, and keywords.
            Search filters and export options will be added in the next iteration.
          </Paragraph>
        </div>
      </Card>
    </>
  )
}
