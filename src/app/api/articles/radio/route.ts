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
    const media_id = searchParams.get('media_id')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const created_start_date = searchParams.get('created_start_date')
    const created_end_date = searchParams.get('created_end_date')
    const search = searchParams.get('search')

    let url = `${API_URL}/api/articles/radio?page=${page}&limit=${limit}`
    if (media_id) url += `&media_id=${media_id}`
    if (start_date) url += `&start_date=${start_date}`
    if (end_date) url += `&end_date=${end_date}`
    if (created_start_date) url += `&created_start_date=${created_start_date}`
    if (created_end_date) url += `&created_end_date=${created_end_date}`
    if (search) url += `&search=${encodeURIComponent(search)}`

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      credentials: 'include',
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch Radio articles' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Radio articles API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const res = await fetch(`${API_URL}/api/articles/radio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    const data = await res.json()
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Radio articles POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Duplicate check endpoint
export async function PUT(request: Request) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title')
    const content = searchParams.get('content')
    const media_id = searchParams.get('media_id')

    let url = `${API_URL}/api/articles/radio/check-duplicate`
    const params = new URLSearchParams()
    if (title) params.append('title', title)
    if (content) params.append('content', content)
    if (media_id) params.append('media_id', media_id)
    if (params.toString()) url += `?${params.toString()}`

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      credentials: 'include',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to check duplicates' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Radio duplicate check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}