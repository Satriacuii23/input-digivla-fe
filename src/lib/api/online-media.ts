export const ONLINE_MEDIA_TYPE_ID = 4

export async function fetchOnlineMediaOptions(): Promise<{ value: string; label: string }[]> {
  for (const typeId of [ONLINE_MEDIA_TYPE_ID, 14]) {
    const res = await fetch(`/api/media/type/by-id/${typeId}`, { credentials: 'include' })
    if (!res.ok) continue
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      return data.map((m: { media_id: number; media_name: string }) => ({
        value: String(m.media_id),
        label: m.media_name,
      }))
    }
  }
  return []
}
