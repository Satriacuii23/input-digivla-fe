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

    const res = await fetch(`${API_URL}/api/users/roles`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: 'Gagal memuat daftar role' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('List roles error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
