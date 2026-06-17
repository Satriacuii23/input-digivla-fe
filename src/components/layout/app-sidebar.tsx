'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Database,
  Tv,
  Radio,
  Globe,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LogoIcon } from '@/components/ui/logo'
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Media',
    icon: Database,
    children: [
      { label: 'Daftar Media', href: '/media/list' },
      { label: 'Tambah Media', href: '/media/add' },
    ],
  },
  {
    label: 'TV',
    icon: Tv,
    children: [
      { label: 'Daftar Artikel', href: '/tv/list' },
      { label: 'Upload Artikel', href: '/tv/upload' },
    ],
  },
  {
    label: 'Radio',
    icon: Radio,
    children: [
      { label: 'Daftar Artikel', href: '/radio/list' },
      { label: 'Upload Artikel', href: '/radio/upload' },
    ],
  },
  {
    label: 'Online',
    icon: Globe,
    children: [
      { label: 'Daftar Artikel', href: '/online/list' },
      { label: 'Upload Artikel', href: '/online/upload' },
    ],
  },
]

interface AppSidebarProps {
  user?: { username: string; full_name: string; role: string }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>('Media')

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      router.push('/login')
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-navy-800 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <LogoIcon size={36} variant="light" />
        <div>
          <p className="text-sm font-semibold leading-tight">Digivla IDS</p>
          <p className="text-xs text-white/60">Daily Uploader</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            if (item.children) {
              const groupActive = item.children.some((c) => isActive(c.href))
              const open = expanded === item.label || groupActive
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : item.label)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      groupActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight className={cn('h-4 w-4 transition-transform', open && 'rotate-90')} />
                  </button>
                  {open && (
                    <ul className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'block rounded-md px-3 py-2 text-sm transition-colors',
                              isActive(child.href)
                                ? 'bg-white text-navy-700 font-medium'
                                : 'text-white/65 hover:bg-white/5 hover:text-white'
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href!}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(item.href!)
                      ? 'bg-white text-navy-700'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        {user && (
          <div className="mb-3 rounded-md bg-white/5 px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.full_name || user.username}</p>
            <p className="text-xs capitalize text-white/50">{user.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-64 lg:block">{sidebarContent}</div>

      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center border-b bg-card px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="ml-3 text-sm font-semibold text-navy-600">Digivla IDS</span>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl">{sidebarContent}</div>
        </div>
      )}
    </>
  )
}

export function AppMain({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <div className="pt-14 lg:pt-0">
        <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <PageBreadcrumb />
          {children}
        </main>
      </div>
    </div>
  )
}
