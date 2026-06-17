import { NextResponse } from 'next/server'
import { BACKEND_API_URL as API_URL } from '@/lib/api/backend-url'

async function getAuthToken(request: Request): Promise<string | null> {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(/auth-token=([^;]+)/)
  return match ? match[1] : null
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      const msg = typeof data.detail === 'string' ? data.detail : 'Gagal memperbarui user'
      return NextResponse.json({ error: msg }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
