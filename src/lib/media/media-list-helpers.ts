export const MEDIA_DRAWER_STYLES = {
  header: { borderBottom: '1px solid #e2e8f0' },
  body: { padding: '16px 20px' },
  footer: { borderTop: '1px solid #e2e8f0', padding: '12px 20px' },
} as const

export const MEDIA_TABLE_SCROLL_X = 880

export function formatMediaIdDisplay(id: number | string | null | undefined): string {
  if (id === null || id === undefined || id === '') return ''
  return String(id)
}

export function tierColor(tier: string | null | undefined): string {
  if (tier === 'Tier 1') return 'red'
  if (tier === 'Tier 2') return 'orange'
  return 'default'
}

export function isMediaActive(status: string | undefined): boolean {
  return status === 'Active' || status === 'A'
}
