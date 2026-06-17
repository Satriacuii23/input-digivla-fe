export const MEDIA_REACH_MAX_TARGETS = 500

export interface MediaReachResultRow {
  media_name: string
  reach: string
  organic_keywords: string
  status: 'ok' | 'skipped' | 'error'
  message?: string | null
}

export interface MediaReachSelector {
  selector_key: string
  selector_type: 'element' | 'label_metric'
  tag_name?: string | null
  class_names?: string | null
  attr_name?: string | null
  attr_value?: string | null
  label_text?: string | null
  value_class_names?: string | null
  description?: string | null
  is_active: boolean
  updated_at?: string | null
}

export interface MediaReachCrawlJob {
  job_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  total: number
  completed: number
  current_media?: string | null
  results: MediaReachResultRow[]
  error?: string | null
  started_at?: number | null
  avg_seconds_per_item?: number | null
  estimated_seconds_remaining?: number | null
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadMediaReachCsv(rows: MediaReachResultRow[], filenamePrefix = 'MediaReachResult') {
  const header = ['Media Name', 'Monthly Visits', 'Period', 'Status', 'Note']
  const lines = [
    header.join(','),
    ...rows.map((row) =>
      [
        escapeCsvCell(row.media_name),
        escapeCsvCell(row.reach),
        escapeCsvCell(row.organic_keywords),
        escapeCsvCell(row.status),
        escapeCsvCell(row.message || ''),
      ].join(','),
    ),
  ]
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  link.href = url
  link.download = `${filenamePrefix}_${stamp}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildMediaReachPdfHtml(rows: MediaReachResultRow[], title: string): string {
  const rowsHtml = rows
    .map(
      (row, index) => `
      <tr>
        <td class="col-no">${index + 1}</td>
        <td>${escapeHtml(row.media_name)}</td>
        <td>${escapeHtml(row.reach)}</td>
        <td>${escapeHtml(row.organic_keywords)}</td>
        <td>${escapeHtml(row.status)}</td>
        <td>${escapeHtml(row.message || '')}</td>
      </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 14mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; padding: 0; margin: 0; color: #1e293b; }
    .report { padding: 8px 0; }
    h1 { font-size: 18px; color: #1e3a5f; margin: 0 0 6px; }
    p.meta { color: #64748b; font-size: 11px; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) td { background: #f8fafc; }
    .col-no { width: 36px; text-align: center; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
  </style>
</head>
<body>
  <div class="report">
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">Generated ${escapeHtml(new Date().toLocaleString())} · SimilarWeb Pro Traffic Engagement · ${rows.length} media</p>
    <table>
      <thead>
        <tr>
          <th class="col-no">#</th>
          <th>Media Name</th>
          <th>Monthly Visits</th>
          <th>Period</th>
          <th>Status</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>
</body>
</html>`
}

/** Opens the browser print dialog (Save as PDF) for Media Reach results. */
export function printMediaReachPdf(rows: MediaReachResultRow[], title = 'Media Reach Report'): boolean {
  if (!rows.length) return false

  const html = buildMediaReachPdfHtml(rows, title)
  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', title)
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)

  const frameWindow = iframe.contentWindow
  const frameDoc = frameWindow?.document
  if (!frameWindow || !frameDoc) {
    iframe.remove()
    return false
  }

  frameDoc.open()
  frameDoc.write(html)
  frameDoc.close()

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1500)
  }

  const triggerPrint = () => {
    try {
      frameWindow.focus()
      frameWindow.print()
    } finally {
      cleanup()
    }
  }

  if (frameDoc.readyState === 'complete') {
    window.setTimeout(triggerPrint, 150)
  } else {
    iframe.addEventListener('load', () => window.setTimeout(triggerPrint, 150), { once: true })
  }

  return true
}

export function orderMediaReachResults(
  targets: string[],
  results: MediaReachResultRow[],
): MediaReachResultRow[] {
  if (!targets.length) return results
  const resultMap = new Map(results.map((row) => [row.media_name.toLowerCase(), row]))
  const ordered: MediaReachResultRow[] = []
  const seen = new Set<string>()
  for (const name of targets) {
    const key = name.toLowerCase()
    const row = resultMap.get(key)
    if (row) {
      ordered.push(row)
      seen.add(key)
    }
  }
  for (const row of results) {
    const key = row.media_name.toLowerCase()
    if (!seen.has(key)) ordered.push(row)
  }
  return ordered
}

export function formatMediaReachDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '—'
  const s = Math.round(totalSeconds)
  if (s < 60) return `~${s} detik`
  const mins = Math.floor(s / 60)
  const secs = s % 60
  if (mins < 60) return secs > 0 ? `~${mins} menit ${secs} detik` : `~${mins} menit`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  return remMins > 0 ? `~${hours} jam ${remMins} menit` : `~${hours} jam`
}

export function parseManualMediaList(text: string, maxTargets: number | null = MEDIA_REACH_MAX_TARGETS): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const line of text.split(/\r?\n/)) {
    if (maxTargets != null && names.length >= maxTargets) break
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    names.push(trimmed)
  }
  return names
}
