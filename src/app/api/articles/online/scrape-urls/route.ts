import { NextResponse } from 'next/server'
import { BACKEND_API_URL as API_URL } from '@/lib/api/backend-url'

async function getAuthToken(request: Request): Promise<string | null> {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(/auth-token=([^;]+)/)
  return match ? match[1] : null
}

export async function POST(request: Request) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const res = await fetch(`${API_URL}/api/articles/online/scrape-urls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Online scrape URLs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
