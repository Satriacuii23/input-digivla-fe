'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Layout, Button, Grid, Drawer, Dropdown, Tooltip, Spin } from 'antd'
import type { MenuProps } from 'antd'
import {
  LayoutDashboard,
  Database,
  Tv,
  Radio,
  Globe,
  ClipboardCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelLeftOpen,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import {
  filterNavItems,
  roleLabel,
  type NavEntry as RbacNavEntry,
} from '@/lib/auth/rbac'
import { DigivlaLogo, LogoMark } from '@/components/ui/logo'

const { Content } = Layout
const { useBreakpoint } = Grid

export const SIDER_WIDTH = 280
export const SIDER_COLLAPSED_WIDTH = 72

type NavChild = { key: string; label: string; description?: string }

type NavEntry =
  | { type: 'section'; key: string; label: string }
  | { type: 'link'; key: string; label: string; description?: string; icon: LucideIcon }
  | { type: 'group'; key: string; label: string; description?: string; icon: LucideIcon; children: NavChild[] }

const GROUP_ICONS: Record<string, LucideIcon> = {
  media: Database,
  tv: Tv,
  radio: Radio,
  online: Globe,
  qc: ClipboardCheck,
  tools: Wrench,
  users: Users,
}

const LINK_ICONS: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
}

function attachIcons(items: RbacNavEntry[]): NavEntry[] {
  return items.map((entry) => {
    if (entry.type === 'section') return entry
    if (entry.type === 'link') {
      return {
        ...entry,
        icon: LINK_ICONS[entry.key] ?? LayoutDashboard,
      }
    }
    return {
      ...entry,
      icon: GROUP_ICONS[entry.key] ?? Database,
      children: entry.children.map(({ key, label, description }) => ({ key, label, description })),
    }
  })
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getOpenGroupKey(pathname: string): string | null {
  if (pathname.startsWith('/users')) return 'users'
  if (pathname.startsWith('/media')) return 'media'
  if (pathname.startsWith('/qc')) return 'qc'
  if (pathname.startsWith('/tools')) return 'tools'
  if (pathname.startsWith('/tv')) return 'tv'
  if (pathname.startsWith('/radio')) return 'radio'
  if (pathname.startsWith('/online')) return 'online'
  return null
}

function getActiveKey(pathname: string): string {
  if (pathname.startsWith('/users')) return '/users'
  if (pathname.startsWith('/media/add')) return '/media/add'
  if (pathname.startsWith('/media')) return '/media/list'
  if (pathname.startsWith('/qc/tv')) return '/qc/tv'
  if (pathname.startsWith('/qc/radio')) return '/qc/radio'
  if (pathname.startsWith('/qc/online')) return '/qc/online'
  if (pathname.startsWith('/qc')) return '/qc/tv'
  if (pathname.startsWith('/tools/backtrack')) return '/tools/backtrack'
  if (pathname.startsWith('/tools/media-reach')) return '/tools/media-reach'
  if (pathname.startsWith('/tools')) return '/tools/media-reach'
  if (pathname.startsWith('/tv/upload')) return '/tv/upload'
  if (pathname.startsWith('/tv')) return '/tv/list'
  if (pathname.startsWith('/radio/upload')) return '/radio/upload'
  if (pathname.startsWith('/radio')) return '/radio/list'
  if (pathname.startsWith('/online/upload')) return '/online/upload'
  if (pathname.startsWith('/online')) return '/online/list'
  return pathname
}

function isGroupActive(entry: NavEntry, activeKey: string, pathname: string): boolean {
  if (entry.type === 'section') return false
  if (entry.type === 'link') {
    return entry.key === activeKey || (entry.key !== '/dashboard' && pathname.startsWith(entry.key))
  }
  return entry.children.some((child) => child.key === activeKey)
}

interface SidebarNavProps {
  collapsed: boolean
  navItems: NavEntry[]
  onNavigate?: () => void
}

function SidebarNav({ collapsed, navItems, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const activeKey = useMemo(() => getActiveKey(pathname), [pathname])
  const [openGroup, setOpenGroup] = useState<string | null>(() => getOpenGroupKey(pathname))

  useEffect(() => {
    if (!collapsed) {
      setOpenGroup(getOpenGroupKey(pathname))
    }
  }, [pathname, collapsed])

  const navigate = (key: string) => {
    router.push(key)
    onNavigate?.()
  }

  const renderLink = (
    key: string,
    label: string,
    icon: LucideIcon,
    active: boolean,
    description?: string,
  ) => {
    const Icon = icon
    const tooltipTitle = description ? `${label} — ${description}` : label
    const button = (
      <button
        type="button"
        className={`digivla-nav-item${active ? ' is-active' : ''}${description ? ' has-description' : ''}`}
        onClick={() => navigate(key)}
      >
        <Icon size={18} strokeWidth={1.75} className="digivla-nav-icon" aria-hidden />
        {!collapsed && (
          <span className="digivla-nav-text">
            <span className="digivla-nav-label">{label}</span>
            {description && <span className="digivla-nav-desc">{description}</span>}
          </span>
        )}
      </button>
    )

    if (collapsed) {
      return (
        <Tooltip key={key} title={tooltipTitle} placement="right">
          {button}
        </Tooltip>
      )
    }

    return button
  }

  const renderGroup = (entry: Extract<NavEntry, { type: 'group' }>) => {
    const Icon = entry.icon
    const active = isGroupActive(entry, activeKey, pathname)
    const isOpen = openGroup === entry.key
    const tooltipTitle = entry.description ? `${entry.label} — ${entry.description}` : entry.label

    if (collapsed) {
      const menuItems: MenuProps['items'] = entry.children.map((child) => ({
        key: child.key,
        label: (
          <div className="digivla-nav-flyout-item">
            <span className="digivla-nav-flyout-label">{child.label}</span>
            {child.description && (
              <span className="digivla-nav-flyout-desc">{child.description}</span>
            )}
          </div>
        ),
        onClick: () => navigate(child.key),
      }))

      return (
        <Dropdown
          key={entry.key}
          menu={{ items: menuItems, selectedKeys: [activeKey] }}
          trigger={['click']}
          placement="topRight"
          classNames={{ root: 'digivla-nav-flyout' }}
        >
          <Tooltip title={tooltipTitle} placement="right">
            <button
              type="button"
              className={`digivla-nav-item${active ? ' is-active' : ''}`}
              aria-label={entry.label}
            >
              <Icon size={18} strokeWidth={1.75} className="digivla-nav-icon" aria-hidden />
            </button>
          </Tooltip>
        </Dropdown>
      )
    }

    return (
      <div key={entry.key} className={`digivla-nav-group${isOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className={`digivla-nav-item digivla-nav-group-trigger${active ? ' is-active' : ''}${entry.description ? ' has-description' : ''}`}
          onClick={() => setOpenGroup(isOpen ? null : entry.key)}
          aria-expanded={isOpen}
        >
          <Icon size={18} strokeWidth={1.75} className="digivla-nav-icon" aria-hidden />
          <span className="digivla-nav-text">
            <span className="digivla-nav-label">{entry.label}</span>
            {entry.description && <span className="digivla-nav-desc">{entry.description}</span>}
          </span>
          <ChevronRight size={16} strokeWidth={1.75} className="digivla-nav-chevron" aria-hidden />
        </button>
        {isOpen && (
          <div className="digivla-nav-sub">
            {entry.children.map((child) => (
              <button
                key={child.key}
                type="button"
                className={`digivla-nav-sub-item${child.key === activeKey ? ' is-active' : ''}${child.description ? ' has-description' : ''}`}
                onClick={() => navigate(child.key)}
              >
                <span className="digivla-nav-sub-label">{child.label}</span>
                {child.description && (
                  <span className="digivla-nav-sub-desc">{child.description}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className="digivla-nav" aria-label="Main navigation">
      {navItems.map((entry) => {
        if (entry.type === 'section') {
          if (collapsed) return null
          return (
            <div key={entry.key} className="digivla-nav-section">
              {entry.label}
            </div>
          )
        }
        if (entry.type === 'link') {
          const active = entry.key === activeKey
          return (
            <div key={entry.key} className="digivla-nav-entry">
              {renderLink(entry.key, entry.label, entry.icon, active, entry.description)}
            </div>
          )
        }
        return (
          <div key={entry.key} className="digivla-nav-entry">
            {renderGroup(entry)}
          </div>
        )
      })}
    </nav>
  )
}

function SidebarProfile({
  collapsed,
  user,
  onLogout,
}: {
  collapsed: boolean
  user?: { username: string; full_name: string; role: string }
  onLogout: () => void
}) {
  const displayName = user?.full_name || user?.username || 'User'
  const initials = getInitials(displayName)

  if (!user) return null

  const logoutPanel = (
    <div className="digivla-profile-menu-panel">
      <button type="button" className="digivla-logout-btn" onClick={onLogout}>
        <LogOut size={16} strokeWidth={1.75} aria-hidden />
        <span>Logout</span>
      </button>
    </div>
  )

  const trigger = (
    <button
      type="button"
      className={`digivla-profile-trigger${collapsed ? ' is-collapsed' : ''}`}
      aria-label="Account menu"
    >
      <div className="digivla-profile-avatar">{initials}</div>
      {!collapsed && (
        <div className="digivla-profile-text">
          <span className="digivla-profile-name">{displayName}</span>
          <span className="digivla-profile-role">{user.role}</span>
        </div>
      )}
    </button>
  )

  return (
    <div className="digivla-sidebar-footer">
      <Dropdown
        popupRender={() => logoutPanel}
        trigger={['click']}
        placement={collapsed ? 'topRight' : 'top'}
        classNames={{ root: 'digivla-profile-dropdown' }}
      >
        {collapsed ? <Tooltip title={displayName} placement="right">{trigger}</Tooltip> : trigger}
      </Dropdown>
    </div>
  )
}

function SidebarPanel({
  collapsed,
  user,
  navItems,
  onLogout,
  onNavigate,
}: {
  collapsed: boolean
  user?: { username: string; full_name: string; role: string }
  navItems: NavEntry[]
  onLogout: () => void
  onNavigate?: () => void
}) {
  return (
    <div className="digivla-sidebar-panel">
      <div className={`digivla-sidebar-header${collapsed ? ' is-collapsed' : ''}`}>
        {!collapsed ? (
          <div className="digivla-sidebar-brand-block">
            <DigivlaLogo height={36} />
            <span className="digivla-sidebar-tagline">Media Operations Platform</span>
          </div>
        ) : (
          <LogoMark size={36} />
        )}
      </div>

      <SidebarNav collapsed={collapsed} navItems={navItems} onNavigate={onNavigate} />

      <SidebarProfile collapsed={collapsed} user={user} onLogout={onLogout} />
    </div>
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const screens = useBreakpoint()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<{
    username: string
    full_name: string
    role: string
    roleCode: string
  } | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  // undefined = belum diukur → anggap desktop agar sidebar tidak hilang saat hydration
  const isMobile = screens.lg === false

  const navItems = useMemo(
    () => attachIcons(filterNavItems(user?.roleCode)),
    [user?.roleCode],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) {
          if (!cancelled) router.replace('/login')
          return
        }
        const data = await res.json()
        if (!cancelled && data.user) {
          setUser({
            username: data.user.username,
            full_name: data.user.full_name || data.user.username,
            roleCode: data.user.role,
            role: data.user.role_label || roleLabel(data.user.role),
          })
        }
      } catch {
        if (!cancelled) router.replace('/login')
      } finally {
        if (!cancelled) setLoadingUser(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'auth-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      router.push('/login')
    }
  }

  const sidebarWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH

  if (loadingUser) {
    return (
      <div className="digivla-auth-loading">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Layout className="digivla-admin-layout">
      {!isMobile && (
        <aside
          className={`digivla-sidebar-shell${collapsed ? ' is-collapsed' : ''}`}
          style={{ width: sidebarWidth }}
        >
          <SidebarPanel collapsed={collapsed} user={user ?? undefined} navItems={navItems} onLogout={handleLogout} />
          <button
            type="button"
            className="digivla-sidebar-collapse"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight size={14} strokeWidth={2} aria-hidden />
            ) : (
              <ChevronLeft size={14} strokeWidth={2} aria-hidden />
            )}
          </button>
        </aside>
      )}

      {isMobile && (
        <Drawer
          className="digivla-sidebar-drawer"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          placement="left"
          size={SIDER_WIDTH}
          closable={false}
          maskClosable
          styles={{
            body: { padding: 0, background: '#ffffff' },
            header: { display: 'none' },
          }}
        >
          <SidebarPanel
            collapsed={false}
            user={user ?? undefined}
            navItems={navItems}
            onLogout={handleLogout}
            onNavigate={() => setMobileOpen(false)}
          />
        </Drawer>
      )}

      <Layout className="digivla-main-layout" style={{ marginLeft: isMobile ? 0 : sidebarWidth }}>
        {isMobile && (
          <Button
            type="default"
            icon={<PanelLeftOpen size={18} strokeWidth={1.75} />}
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="digivla-mobile-menu-btn"
          />
        )}
        <Content className="digivla-main-content">{children}</Content>
      </Layout>
    </Layout>
  )
}
