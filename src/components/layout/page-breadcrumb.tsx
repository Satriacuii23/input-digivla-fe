'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const SEGMENTS: Record<string, string> = {
  dashboard: 'Dashboard',
  media: 'Media',
  list: 'Daftar',
  add: 'Tambah',
  tv: 'TV',
  radio: 'Radio',
  online: 'Online',
  upload: 'Upload',
}

export function PageBreadcrumb() {
  const pathname = usePathname()
  if (pathname === '/dashboard') return null

  const parts = pathname.split('/').filter(Boolean)
  const crumbs = parts.map((part, i) => ({
    label: SEGMENTS[part] ?? part,
    href: '/' + parts.slice(0, i + 1).join('/'),
    isLast: i === parts.length - 1,
  }))

  return (
    <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/dashboard" className="flex items-center gap-1 hover:text-navy-600">
        <Home className="h-3.5 w-3.5" />
        <span>Beranda</span>
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />
          {crumb.isLast ? (
            <span className="font-medium text-navy-600">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-navy-600">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
