import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/api/backend-url'

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

    const res = await backendFetch('/api/media/import/template', {
      headers: { Authorization: `Bearer ${token}` },
      timeoutMs: 30000,
    })

    if (!res.ok) {
      let detail = 'Failed to download template'
      try {
        const data = await res.json()
        detail = data.detail || data.error || detail
      } catch {
        /* non-json error */
      }
      return NextResponse.json({ error: detail }, { status: res.status })
    }

    const buffer = await res.arrayBuffer()
    const disposition =
      res.headers.get('Content-Disposition') ||
      'attachment; filename="media-import-template.xlsx"'

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          res.headers.get('Content-Type') ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': disposition,
      },
    })
  } catch (error) {
    console.error('Template download error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
