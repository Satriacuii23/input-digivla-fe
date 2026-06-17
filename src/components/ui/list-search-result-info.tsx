'use client'

import { Typography } from 'antd'

const { Text } = Typography

interface ListSearchResultInfoProps {
  keyword: string
  total: number
  loading?: boolean
  entityLabel?: string
}

export function ListSearchResultInfo({
  keyword,
  total,
  loading = false,
  entityLabel = 'articles',
}: ListSearchResultInfoProps) {
  const trimmed = keyword.trim()
  if (!trimmed) return null

  const countLabel = total.toLocaleString('en-US')

  if (loading) {
    return (
      <Text type="secondary" className="digivla-search-result-info">
        Searching for &quot;{trimmed}&quot; in title and content…
      </Text>
    )
  }

  if (total === 0) {
    return (
      <Text type="secondary" className="digivla-search-result-info digivla-search-result-info--empty">
        No {entityLabel} found matching &quot;{trimmed}&quot; in title or content.
      </Text>
    )
  }

  return (
    <Text type="secondary" className="digivla-search-result-info">
      <strong className="digivla-search-result-count">{countLabel}</strong> {entityLabel} match &quot;
      {trimmed}&quot; in title or content.
    </Text>
  )
}
