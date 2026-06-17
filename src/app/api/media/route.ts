import { NextResponse } from 'next/server'
import { BACKEND_API_URL as API_URL } from '@/lib/api/backend-url'

async function getAuthToken(request: Request): Promise<string | null> {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(/auth-token=([^;]+)/)
  return match ? match[1] : null
}

export async function GET(request: Request) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const media_type_id = searchParams.get('media_type_id')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const sort_order = searchParams.get('sort_order')

    // Add timestamp to bust cache
    const cacheBust = Date.now()

    let url = `${API_URL}/api/media?page=${page}&limit=${limit}&_cb=${cacheBust}`
    if (media_type_id) url += `&media_type_id=${media_type_id}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (status) url += `&status=${status}`
    if (sort_order === 'asc' || sort_order === 'desc') url += `&sort_order=${sort_order}`

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      credentials: 'include',
      cache: 'no-store',
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'Failed to fetch media' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get media error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const res = await fetch(`${API_URL}/api/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'Failed to create media' }, { status: res.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Create media error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
