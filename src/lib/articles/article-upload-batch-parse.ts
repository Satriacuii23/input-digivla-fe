/** One non-empty value per line (trimmed). */
export function parseBatchLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Multiple content blocks separated by a line containing only `---`.
 * Block 1 → form #1, block 2 → form #2, …
 */
export function parseBatchContentBlocks(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  return trimmed
    .split(/\r?\n---\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
}

/** Normalize HH:mm or HHmm to HH:mm; returns null if invalid. */
export function normalizeBatchTimeLine(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  const colonMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10)
    const minutes = parseInt(colonMatch[2], 10)
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
    return null
  }
  if (/^\d{4}$/.test(trimmed)) {
    const hours = parseInt(trimmed.slice(0, 2), 10)
    const minutes = parseInt(trimmed.slice(2, 4), 10)
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
  }
  return null
}

export function parseBatchTimeLines(text: string): string[] {
  return parseBatchLines(text)
    .map(normalizeBatchTimeLine)
    .filter((value): value is string => value != null)
}
