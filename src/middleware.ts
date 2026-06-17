import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { canAccessPath, defaultHomeForRole } from '@/lib/auth/rbac'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/images/') ||
    /\.(?:png|jpe?g|gif|svg|webp|ico)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  const publicPaths = ['/login', '/forbidden', '/api/auth/login', '/api/media', '/api/media-types']
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value
  const role = request.cookies.get('auth-role')?.value

  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL(defaultHomeForRole(role), request.url))
  }

  if (token && role && !canAccessPath(role, pathname)) {
    const url = new URL('/forbidden', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|api/upload/).*)'],
}
