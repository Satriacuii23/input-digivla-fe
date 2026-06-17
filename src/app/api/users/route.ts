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
    const qs = searchParams.toString()
    const url = `${API_URL}/api/users${qs ? `?${qs}` : ''}`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: typeof data.detail === 'string' ? data.detail : 'Gagal memuat user' },
        { status: res.status },
      )
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('List users error:', error)
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
    const res = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      const msg = typeof data.detail === 'string' ? data.detail : 'Gagal membuat user'
      return NextResponse.json({ error: msg }, { status: res.status })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
