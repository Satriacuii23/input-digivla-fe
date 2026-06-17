import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export const ARTICLE_DRAWER_STYLES = {
  header: { borderBottom: '1px solid #e2e8f0' },
  body: { padding: '16px 20px' },
  footer: { borderTop: '1px solid #e2e8f0', padding: '12px 20px' },
} as const

export interface ArticleRow {
  id: number
  article_id: number
  media_id: number
  media_name: string
  title: string
  content: string
  datee: string
  timee: string
  journalist: string
  duration: string
  filee: string
  created_at: string
}

export interface OnlineArticleRow {
  id: number
  article_id: number
  media_id: number
  media_name: string
  title: string
  content: string
  datee: string
  journalist: string
  url: string | null
  file_pdf?: string | null
  pages: number
  mm_col: number
  created_at: string
}

export type ArticleListApiPath = '/api/articles/tv' | '/api/articles/radio' | '/api/articles/online'

export function getTodayDateString() {
  return new Date().toISOString().split('T')[0]
}

export function getYesterdayDateString() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

export type QcUploadPeriod = 'today_yesterday' | 'today_only'

export function getQcUploadDateRange(period: QcUploadPeriod): [string, string] {
  const today = getTodayDateString()
  if (period === 'today_only') return [today, today]
  return [getYesterdayDateString(), today]
}

export function parseDateForForm(value: string | null | undefined): dayjs.Dayjs | null {
  if (!value?.trim()) return null
  const parsed = dayjs(value.trim(), ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD'], true)
  return parsed.isValid() ? parsed : null
}

export function formatArticleDuration(seconds: string | null | undefined) {
  if (!seconds?.trim()) return ''
  const s = parseInt(seconds, 10)
  if (Number.isNaN(s)) return seconds.trim()
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/** Compact article ID for table cells (no thousand separators). */
export function formatArticleIdDisplay(id: number | string | null | undefined): string {
  if (id === null || id === undefined || id === '') return ''
  return String(id)
}

/** Display date as "June 10, 2026" (legacy list format). */
export function formatArticleDateLong(value: string | null | undefined): string {
  if (!value?.trim()) return ''
  const parsed = dayjs(value.trim(), ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD'], true)
  if (parsed.isValid()) return parsed.format('MMMM D, YYYY')
  return value.trim()
}

/** Display created_at with date + 24-hour time. */
export function formatCreatedAtDisplay(value: string | null | undefined): string {
  if (!value?.trim()) return ''
  const parsed = dayjs(value.trim())
  if (!parsed.isValid()) return value.trim()
  return parsed.format('MMMM D, YYYY, HH:mm')
}

/** Display date as DD/MM/YYYY (WIB context). */
export function formatArticleDateDisplay(value: string | null | undefined): string {
  if (!value?.trim()) return ''
  const parsed = dayjs(value.trim(), ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD'], true)
  if (parsed.isValid()) return parsed.format('DD/MM/YYYY')
  return value.trim()
}

/** Combined broadcast date + time for table cell. */
export function formatBroadcastDisplay(
  datee: string | null | undefined,
  timee: string | null | undefined,
): string {
  const date = formatArticleDateDisplay(datee)
  const time = formatWibTimeDisplay(timee)
  if (date && time) return `${date} · ${time}`
  return date || time || ''
}

export function fileNameFromFilee(filee: string | null | undefined) {
  if (!filee) return null
  return filee.split('/').pop() ?? null
}

/** Parse DB/API time string to dayjs for TimePicker (24-hour WIB). */
export function parseWibTimeForForm(value: string | null | undefined): dayjs.Dayjs | null {
  if (!value?.trim()) return null
  const normalized = value.trim()
  for (const format of ['HH:mm:ss', 'HH:mm', 'H:mm']) {
    const parsed = dayjs(normalized, format, true)
    if (parsed.isValid()) return parsed
  }
  return null
}

/** Display time always as 24-hour HH:mm (WIB). */
export function formatWibTimeDisplay(value: string | null | undefined): string {
  if (!value?.trim()) return ''
  const parsed = parseWibTimeForForm(value)
  return parsed ? parsed.format('HH:mm') : value.trim()
}

export function prepareArticleUpdatePayload(values: Record<string, unknown>) {
  const rawTime = values.timee
  let timee = ''
  if (rawTime && dayjs.isDayjs(rawTime)) {
    timee = rawTime.format('HH:mm')
  } else if (typeof rawTime === 'string') {
    timee = formatWibTimeDisplay(rawTime)
  }
  return {
    title: values.title,
    content: values.content,
    journalist: values.journalist,
    timee,
    duration: values.duration,
  }
}

function formatDateeForPayload(values: Record<string, unknown>): string | undefined {
  const rawDate = values.datee
  if (rawDate && dayjs.isDayjs(rawDate)) {
    return rawDate.format('YYYY-MM-DD')
  }
  if (typeof rawDate === 'string' && rawDate.trim()) {
    const parsed = parseDateForForm(rawDate)
    return parsed ? parsed.format('YYYY-MM-DD') : rawDate.trim()
  }
  return undefined
}

export function prepareArticleQcUpdatePayload(values: Record<string, unknown>) {
  const datee = formatDateeForPayload(values)
  return {
    ...prepareArticleUpdatePayload(values),
    ...(datee ? { datee } : {}),
  }
}

export interface DuplicateArticleMatch {
  article_id: number
  title: string
  content_preview: string
  datee: string
  media_name: string
  created_at: string
}

export interface ArticleDuplicateCheckResult {
  exists: boolean
  duplicates: DuplicateArticleMatch[]
  count?: number
  message?: string
}

export function prepareOnlineArticleUpdatePayload(values: Record<string, unknown>) {
  return {
    title: values.title,
    content: values.content,
    journalist: values.journalist,
    url: values.url,
    pages: values.pages ?? null,
    mm_col: values.mm_col ?? null,
  }
}

export function prepareOnlineArticleQcUpdatePayload(values: Record<string, unknown>) {
  const datee = formatDateeForPayload(values)
  return {
    ...prepareOnlineArticleUpdatePayload(values),
    ...(datee ? { datee } : {}),
  }
}

export function getOnlineArticleFileLabel(article: Pick<OnlineArticleRow, 'url' | 'file_pdf'>): string {
  const url = article.url?.trim()
  if (url) return url
  return article.file_pdf?.trim() || ''
}

export function getOnlineArticleFileHref(article: Pick<OnlineArticleRow, 'url' | 'file_pdf'>): string | null {
  const url = article.url?.trim()
  if (url?.startsWith('http://') || url?.startsWith('https://')) return url
  const pdf = article.file_pdf?.trim()
  if (pdf?.startsWith('http://') || pdf?.startsWith('https://')) return pdf
  return null
}

export async function checkArticleDuplicate(
  apiPath: ArticleListApiPath,
  criteria: { title?: string; content?: string; media_id?: string | null },
): Promise<ArticleDuplicateCheckResult | null> {
  const params = new URLSearchParams()
  if (criteria.title?.trim()) params.append('title', criteria.title.trim())
  if (criteria.content?.trim()) params.append('content', criteria.content.trim())
  if (criteria.media_id) params.append('media_id', criteria.media_id)

  if (!params.has('title') && !params.has('content')) {
    return null
  }

  const res = await fetch(`${apiPath}?${params.toString()}`, {
    method: 'PUT',
    credentials: 'include',
  })

  if (!res.ok) return null
  return res.json()
}

export async function fetchArticleById(
  apiPath: '/api/articles/tv' | '/api/articles/radio',
  articleId: number,
): Promise<ArticleRow | null> {
  const res = await fetch(`${apiPath}/${articleId}`, { credentials: 'include' })
  if (!res.ok) return null
  const data = await res.json()
  return {
    id: data.id,
    article_id: data.article_id,
    media_id: data.media_id,
    media_name: data.media_name || '',
    title: data.title || '',
    content: data.content || '',
    datee: data.datee || '',
    timee: data.timee || '',
    journalist: data.journalist || '',
    duration: data.duration || '',
    filee: data.filee || '',
    created_at: data.created_at || data.createAt || '',
  }
}

export async function fetchOnlineArticleById(articleId: number): Promise<OnlineArticleRow | null> {
  const res = await fetch(`/api/articles/online/${articleId}`, { credentials: 'include' })
  if (!res.ok) return null
  const data = await res.json()
  return {
    id: data.id,
    article_id: data.article_id,
    media_id: data.media_id,
    media_name: data.media_name || '',
    title: data.title || '',
    content: data.content || '',
    datee: data.datee || '',
    journalist: data.journalist || '',
    url: data.url ?? null,
    file_pdf: data.file_pdf ?? null,
    pages: data.pages ?? 0,
    mm_col: data.mm_col ?? 0,
    created_at: data.created_at || '',
  }
}
