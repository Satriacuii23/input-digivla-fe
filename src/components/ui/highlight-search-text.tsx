import type { ReactNode } from 'react'
import {
  buildHighlightedParts,
  buildSubstringHighlightedParts,
  parseSearchTokens,
} from '@/lib/articles/search-keywords'

interface HighlightSearchTextProps {
  text: string
  keyword?: string
  emptyFallback?: ReactNode
  /** `word` = whole-word tokens (articles). `substring` = LIKE-style phrase (media names). */
  matchMode?: 'word' | 'substring'
}

export function HighlightSearchText({
  text,
  keyword,
  emptyFallback = '—',
  matchMode = 'word',
}: HighlightSearchTextProps) {
  if (!text) return <>{emptyFallback}</>

  const kw = keyword?.trim()
  if (!kw) return <>{text}</>

  const parts =
    matchMode === 'substring'
      ? buildSubstringHighlightedParts(text, kw)
      : parseSearchTokens(kw).length
        ? buildHighlightedParts(text, kw)
        : [{ text, match: false }]

  if (parts.length === 1 && !parts[0].match) {
    return <>{parts[0].text || emptyFallback}</>
  }

  return (
    <>
      {parts.map((part, i) =>
        part.match ? (
          <mark key={i} className="digivla-search-highlight">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}
