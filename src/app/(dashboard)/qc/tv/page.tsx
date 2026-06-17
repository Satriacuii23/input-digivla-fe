'use client'

import { ArticleQcPage } from '@/components/articles/article-qc-page'

export default function TvQcPage() {
  return (
    <ArticleQcPage
      config={{
        kind: 'tv',
        title: 'TV Quality Control',
        description: 'Review and correct TV articles uploaded today and yesterday.',
        breadcrumbLabel: 'TV',
        apiPath: '/api/articles/tv',
        mediaTypeId: 12,
        fileLabel: 'TV Media File',
        uploadDateHint: 'Filtered by upload timestamp (createAt).',
      }}
    />
  )
}
