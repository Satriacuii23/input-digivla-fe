import { NextResponse } from 'next/server'
import { BACKEND_API_URL as API_URL } from '@/lib/api/backend-url'

async function getAuthToken(request: Request): Promise<string | null> {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(/auth-token=([^;]+)/)
  return match ? match[1] : null
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const res = await fetch(`${API_URL}/api/articles/tv/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Article not found' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('TV article GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const res = await fetch(`${API_URL}/api/articles/tv/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('TV article PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const res = await fetch(`${API_URL}/api/articles/tv/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('TV article DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}