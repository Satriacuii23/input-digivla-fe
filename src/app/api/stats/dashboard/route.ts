import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { BACKEND_API_URL as API_URL } from '@/lib/api/backend-url'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const fetchOpts = { cache: 'no-store' as const, next: { revalidate: 0 } }

const noStoreHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

async function getAuthToken(request: Request): Promise<string | null> {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(/auth-token=([^;]+)/)
  return match ? match[1] : null
}

export async function GET(request: Request) {
  noStore()

  try {
    const token = await getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...noStoreHeaders,
    }

    const ts = Date.now()

    // Articles: db_msk_api (tb_articles_tv + tb_articles), filtered by media type via db_digivla
    const [statsAllRes, statsTodayRes, mediaStatsRes] = await Promise.all([
      fetch(`${API_URL}/api/articles/stats/all?_=${ts}`, {
        headers,
        credentials: 'include',
        ...fetchOpts,
      }),
      fetch(`${API_URL}/api/articles/stats/today?_=${ts}`, {
        headers,
        credentials: 'include',
        ...fetchOpts,
      }),
      fetch(`${API_URL}/api/media/stats?_=${ts}`, {
        headers,
        credentials: 'include',
        ...fetchOpts,
      }),
    ])

    const statsAll = statsAllRes.ok
      ? await statsAllRes.json()
      : { total_tv: 0, total_radio: 0, total_online: 0 }
    const statsToday = statsTodayRes.ok
      ? await statsTodayRes.json()
      : { tv: 0, radio: 0, online: 0 }
    const mediaStats = mediaStatsRes.ok
      ? await mediaStatsRes.json()
      : { total_media: 0 }

    return NextResponse.json(
      {
        total_tv: Number(statsAll.total_tv) || 0,
        total_radio: Number(statsAll.total_radio) || 0,
        total_online: Number(statsAll.total_online) || 0,
        today_tv: Number(statsToday.tv) || 0,
        today_radio: Number(statsToday.radio) || 0,
        today_online: Number(statsToday.online) || 0,
        total_media: Number(mediaStats.total_media) || 0,
      },
      { headers: noStoreHeaders },
    )
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
