'use client'

import { ArticleQcPage } from '@/components/articles/article-qc-page'

export default function RadioQcPage() {
  return (
    <ArticleQcPage
      config={{
        kind: 'radio',
        title: 'Radio Quality Control',
        description: 'Review and correct Radio articles uploaded today and yesterday.',
        breadcrumbLabel: 'Radio',
        apiPath: '/api/articles/radio',
        mediaTypeId: 13,
        fileLabel: 'Radio Media File',
        uploadDateHint: 'Filtered by upload timestamp (createAt).',
      }}
    />
  )
}
