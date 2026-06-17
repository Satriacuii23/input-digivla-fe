'use client'

import { ArticleQcPage } from '@/components/articles/article-qc-page'

export default function OnlineQcPage() {
  return (
    <ArticleQcPage
      config={{
        kind: 'online',
        title: 'Online Quality Control',
        description: 'Review and correct Online articles uploaded today and yesterday.',
        breadcrumbLabel: 'Online',
        apiPath: '/api/articles/online',
        uploadDateHint: 'Filtered by publication date (datee) — upload timestamp is not stored for Online.',
      }}
    />
  )
}
