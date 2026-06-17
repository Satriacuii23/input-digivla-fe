export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ')
}

/** Split query into unique keywords (whitespace-separated, case-insensitive dedupe). */
export function parseSearchTokens(query: string): string[] {
  const normalized = normalizeSearchQuery(query)
  if (!normalized) return []

  const seen = new Set<string>()
  const tokens: string[] = []

  for (const raw of normalized.split(' ')) {
    const token = raw.trim()
    if (!token || !/[\p{L}\p{N}]/u.test(token)) continue
    const key = token.toLocaleLowerCase('en-US')
    if (seen.has(key)) continue
    seen.add(key)
    tokens.push(token)
  }

  return tokens
}

function isWordChar(char: string): boolean {
  return /\p{L}|\p{N}/u.test(char)
}

function localeEquals(a: string, b: string): boolean {
  return a.toLocaleLowerCase('en-US') === b.toLocaleLowerCase('en-US')
}

/** True when token at `start` is a whole-word match (not part of a larger word). */
export function isWordBoundaryMatch(text: string, start: number, token: string): boolean {
  const end = start + token.length
  if (start < 0 || end > text.length) return false
  if (!localeEquals(text.slice(start, end), token)) return false

  const before = start > 0 ? text[start - 1] : ''
  const after = end < text.length ? text[end] : ''
  return !isWordChar(before) && !isWordChar(after)
}

export function findTokenRanges(
  text: string,
  token: string,
): Array<{ start: number; end: number }> {
  if (!text || !token) return []

  const tokenLower = token.toLocaleLowerCase('en-US')
  const textLower = text.toLocaleLowerCase('en-US')
  const ranges: Array<{ start: number; end: number }> = []
  let pos = 0

  while (pos <= text.length - token.length) {
    const idx = textLower.indexOf(tokenLower, pos)
    if (idx === -1) break

    if (isWordBoundaryMatch(text, idx, token)) {
      ranges.push({ start: idx, end: idx + token.length })
      pos = idx + token.length
    } else {
      pos = idx + 1
    }
  }

  return ranges
}

function mergeRanges(
  ranges: Array<{ start: number; end: number }>,
): Array<{ start: number; end: number }> {
  if (!ranges.length) return []

  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged: Array<{ start: number; end: number }> = [{ ...sorted[0] }]

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]
    const current = sorted[i]
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end)
    } else {
      merged.push({ ...current })
    }
  }

  return merged
}

export function findSearchHighlightRanges(
  text: string,
  query: string,
): Array<{ start: number; end: number }> {
  const tokens = parseSearchTokens(query)
  if (!tokens.length) return []

  const allRanges = tokens.flatMap((token) => findTokenRanges(text, token))
  return mergeRanges(allRanges)
}

export function buildHighlightedParts(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  if (!text) return []

  const tokens = parseSearchTokens(query)
  if (!tokens.length) return [{ text, match: false }]

  const ranges = findSearchHighlightRanges(text, query)
  if (!ranges.length) return [{ text, match: false }]

  const parts: Array<{ text: string; match: boolean }> = []
  let cursor = 0

  for (const { start, end } of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false })
    parts.push({ text: text.slice(start, end), match: true })
    cursor = end
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })
  return parts
}

export function textMatchesSearchQuery(text: string, query: string): boolean {
  const tokens = parseSearchTokens(query)
  if (!tokens.length) return true
  return tokens.some((token) => findTokenRanges(text, token).length > 0)
}

export function findSubstringRanges(
  text: string,
  query: string,
): Array<{ start: number; end: number }> {
  const needle = query.trim()
  if (!text || !needle) return []

  const textLower = text.toLocaleLowerCase('en-US')
  const needleLower = needle.toLocaleLowerCase('en-US')
  const ranges: Array<{ start: number; end: number }> = []
  let pos = 0

  while (pos <= text.length - needle.length) {
    const idx = textLower.indexOf(needleLower, pos)
    if (idx === -1) break
    ranges.push({ start: idx, end: idx + needle.length })
    pos = idx + needle.length
  }

  return ranges
}

export function buildSubstringHighlightedParts(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  if (!text) return []

  const needle = query.trim()
  if (!needle) return [{ text, match: false }]

  const ranges = mergeRanges(findSubstringRanges(text, needle))
  if (!ranges.length) return [{ text, match: false }]

  const parts: Array<{ text: string; match: boolean }> = []
  let cursor = 0

  for (const { start, end } of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false })
    parts.push({ text: text.slice(start, end), match: true })
    cursor = end
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })
  return parts
}
