import { NextResponse } from 'next/server'
import { BACKEND_API_URL as API_URL } from '@/lib/api/backend-url'

async function getAuthToken(request: Request): Promise<string | null> {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(/auth-token=([^;]+)/)
  return match ? match[1] : null
}

function formatApiError(payload: { error?: string; detail?: unknown }) {
  if (payload.error) return payload.error
  if (typeof payload.detail === 'string') return payload.detail
  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => (typeof item === 'string' ? item : (item as { msg?: string })?.msg))
      .filter(Boolean)
      .join(', ')
  }
  return 'Failed to import media'
}

export async function POST(request: Request) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Forward to backend as FormData
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    const res = await fetch(`${API_URL}/api/media/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: backendFormData,
      credentials: 'include',
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: formatApiError(data) },
        { status: res.status },
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
