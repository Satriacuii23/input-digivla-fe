import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/api/backend-url'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 },
      )
    }

    const response = await backendFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      timeoutMs: 10000,
    })

    if (!response.ok) {
      let data: { error?: string; detail?: string | { msg?: string }[]; success?: boolean } = {}
      try {
        data = await response.json()
      } catch {
        /* non-JSON error body */
      }
      const detail =
        typeof data.detail === 'string'
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail.map((d) => d.msg).filter(Boolean).join(', ')
            : null
      const errorMessage = data.error || detail || 'Login failed'

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status >= 400 ? response.status : 401 },
      )
    }

    const data = await response.json()
    if (data.success !== false && (data.token || data.access_token)) {
      const token = data.token || data.access_token

      const res = new NextResponse(
        JSON.stringify({ success: true, user: data.user || data }),
        { status: 200 },
      )

      res.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })

      const role = data.user?.role ?? data.role
      if (role) {
        res.cookies.set('auth-role', String(role), {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
          path: '/',
        })
      }

      return res
    }

    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 401 },
    )
  } catch (error) {
    console.error('Login error:', error)
    const isTimeout =
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')

    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? 'Backend tidak merespons (timeout). Pastikan API berjalan di port 8005.'
          : 'Backend tidak dapat dihubungi. Pastikan server API berjalan di port 8005.',
      },
      { status: 503 },
    )
  }
}
