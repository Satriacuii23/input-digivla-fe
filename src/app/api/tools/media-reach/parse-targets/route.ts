import { NextResponse } from 'next/server'
import { BACKEND_API_URL as API_URL } from '@/lib/api/backend-url'

async function getAuthToken(request: Request): Promise<string | null> {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(/auth-token=([^;]+)/)
  return match ? match[1] : null
}

export async function POST(request: Request) {
  const token = await getAuthToken(request)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  const upstream = new FormData()
  upstream.append('file', file, (file as File).name || 'targets.xlsx')

  const res = await fetch(`${API_URL}/api/tools/media-reach/parse-targets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: upstream,
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
