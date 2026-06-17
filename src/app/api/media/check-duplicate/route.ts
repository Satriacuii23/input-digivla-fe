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
    const media_name = searchParams.get('media_name')
    const media_id = searchParams.get('media_id') // Optional, for update scenarios

    if (!media_name) {
      return NextResponse.json({ error: 'media_name is required' }, { status: 400 })
    }

    let url = `${API_URL}/api/media/check-duplicate?media_name=${encodeURIComponent(media_name)}`
    if (media_id) {
      url += `&media_id=${media_id}`
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'Failed to check duplicate' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Check duplicate error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}