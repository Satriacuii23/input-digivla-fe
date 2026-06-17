import { MAX_MULTI_UPLOAD_ARTICLES } from '@/lib/articles/article-multi-upload-limits'

const URL_PATTERN = /^https?:\/\/.+/i

export interface OnlineArticleScrapeResultItem {
  url: string
  success: boolean
  error?: string | null
  title?: string | null
  content?: string | null
  journalist?: string | null
  datee?: string | null
  media_id?: number | null
  media_name?: string | null
  pages?: number | null
  mm_col?: number | null
}

export interface OnlineArticleScrapeResponse {
  results: OnlineArticleScrapeResultItem[]
  total: number
  success_count: number
  failed_count: number
}

export interface OnlineScrapeProgressState {
  current: number
  total: number
  status: 'idle' | 'scraping' | 'complete'
  currentUrl?: string
  successCount: number
  failedCount: number
  elapsedMs: number
  estimatedRemainingMs: number | null
}

export function createIdleOnlineScrapeProgress(): OnlineScrapeProgressState {
  return {
    current: 0,
    total: 0,
    status: 'idle',
    successCount: 0,
    failedCount: 0,
    elapsedMs: 0,
    estimatedRemainingMs: null,
  }
}

export function formatScrapeDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000))
  if (totalSec < 60) return `${totalSec}s`
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`
}

export function formatScrapeEta(ms: number | null): string {
  if (ms == null || ms <= 0) return 'Calculating…'
  return `~${formatScrapeDuration(ms)} remaining`
}

export function parseOnlineScrapeUrls(text: string): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  for (const line of text.replace(/,/g, '\n').split('\n')) {
    const candidate = line.trim()
    if (!candidate || !URL_PATTERN.test(candidate)) continue
    const key = candidate.toLowerCase().replace(/\/$/, '')
    if (seen.has(key)) continue
    seen.add(key)
    urls.push(candidate)
  }
  return urls
}

function estimateRemainingMs(durations: number[], remaining: number): number | null {
  if (durations.length === 0 || remaining <= 0) return null
  const avg = durations.reduce((sum, ms) => sum + ms, 0) / durations.length
  return Math.round(avg * remaining)
}

async function postScrapeUrls(urls: string[]): Promise<OnlineArticleScrapeResponse> {
  const res = await fetch('/api/articles/online/scrape-urls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ urls }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || data.error || 'Failed to scrape article URLs')
  }
  return data as OnlineArticleScrapeResponse
}

/** Scrape a single URL — one request per URL to avoid blocking the API. */
export async function scrapeSingleOnlineArticleUrl(url: string): Promise<OnlineArticleScrapeResultItem> {
  const data = await postScrapeUrls([url])
  const item = data.results?.[0]
  if (!item) {
    return { url, success: false, error: 'No scrape result returned' }
  }
  return item
}

/**
 * Scrape URLs one at a time with progress + ETA.
 * Prevents long batch scrapes from blocking the entire backend API.
 */
export async function scrapeOnlineArticleUrlsSequential(
  urls: string[],
  onProgress?: (progress: OnlineScrapeProgressState & { partialResults: OnlineArticleScrapeResultItem[] }) => void,
): Promise<OnlineArticleScrapeResponse> {
  const limited = urls.slice(0, MAX_MULTI_UPLOAD_ARTICLES)
  const results: OnlineArticleScrapeResultItem[] = []
  const durations: number[] = []
  const startedAt = Date.now()

  const emit = (current: number, currentUrl?: string) => {
    const successCount = results.filter((r) => r.success).length
    const failedCount = results.length - successCount
    onProgress?.({
      current,
      total: limited.length,
      status: current >= limited.length ? 'complete' : 'scraping',
      currentUrl,
      successCount,
      failedCount,
      elapsedMs: Date.now() - startedAt,
      estimatedRemainingMs: estimateRemainingMs(durations, limited.length - current),
      partialResults: [...results],
    })
  }

  emit(0, limited[0])

  for (let i = 0; i < limited.length; i++) {
    const url = limited[i]
    const itemStart = Date.now()

    emit(i, url)

    try {
      const item = await scrapeSingleOnlineArticleUrl(url)
      results.push(item)
    } catch (error) {
      results.push({
        url,
        success: false,
        error: error instanceof Error ? error.message : 'Scrape failed',
      })
    }

    durations.push(Date.now() - itemStart)
    emit(i + 1, limited[i + 1])
  }

  const success_count = results.filter((r) => r.success).length
  return {
    results,
    total: results.length,
    success_count,
    failed_count: results.length - success_count,
  }
}

/** @deprecated Prefer scrapeOnlineArticleUrlsSequential for multi-URL scrape. */
export async function scrapeOnlineArticleUrls(urls: string[]): Promise<OnlineArticleScrapeResponse> {
  return postScrapeUrls(urls.slice(0, MAX_MULTI_UPLOAD_ARTICLES))
}
