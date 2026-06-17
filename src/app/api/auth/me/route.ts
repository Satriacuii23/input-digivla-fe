import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { backendFetch } from '@/lib/api/backend-url'
import { normalizeRole, roleLabel } from '@/lib/auth/rbac'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const response = await backendFetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      timeoutMs: 10000,
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: response.status === 401 ? 401 : 502 },
      )
    }

    const user = await response.json()
    const role = normalizeRole(user.role) ?? user.role

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        role,
        role_label: user.role_label ?? roleLabel(role),
      },
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ success: false, error: 'Backend unavailable' }, { status: 503 })
  }
}
