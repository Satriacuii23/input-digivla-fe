/**
 * Role-Based Access Control — mirrors Backend/V2/app/core/rbac.py
 */

export type Role =
  | 'superadmin'
  | 'admin'
  | 'staff_online'
  | 'staff_tv_radio'
  | 'analis'

export type Permission =
  | 'dashboard'
  | 'media:read'
  | 'media:write'
  | 'tv:read'
  | 'tv:write'
  | 'radio:read'
  | 'radio:write'
  | 'online:read'
  | 'online:write'
  | 'qc:tv'
  | 'qc:radio'
  | 'qc:online'
  | 'tools'
  | 'article:delete'
  | 'users:manage'

const LEGACY_ROLE_MAP: Record<string, Role> = {
  user: 'staff_online',
  staff: 'staff_online',
  staff_tv: 'staff_tv_radio',
  staff_radio: 'staff_tv_radio',
  tv: 'staff_tv_radio',
  radio: 'staff_tv_radio',
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  superadmin: [
    'dashboard',
    'media:read',
    'media:write',
    'tv:read',
    'tv:write',
    'radio:read',
    'radio:write',
    'online:read',
    'online:write',
    'qc:tv',
    'qc:radio',
    'qc:online',
    'tools',
    'article:delete',
    'users:manage',
  ],
  admin: [
    'dashboard',
    'media:read',
    'media:write',
    'tv:read',
    'tv:write',
    'radio:read',
    'radio:write',
    'online:read',
    'online:write',
    'qc:tv',
    'qc:radio',
    'qc:online',
    'tools',
    'article:delete',
    'users:manage',
  ],
  staff_online: [
    'dashboard',
    'media:read',
    'online:read',
    'online:write',
    'qc:online',
  ],
  staff_tv_radio: [
    'dashboard',
    'media:read',
    'tv:read',
    'tv:write',
    'radio:read',
    'radio:write',
    'qc:tv',
    'qc:radio',
  ],
  analis: ['dashboard', 'tools'],
}

const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrator',
  staff_online: 'Staff Online',
  staff_tv_radio: 'Staff TV & Radio',
  analis: 'Analis',
}

export function normalizeRole(raw?: string | null): Role | null {
  if (!raw) return null
  const value = raw.trim().toLowerCase()
  if (value in LEGACY_ROLE_MAP) return LEGACY_ROLE_MAP[value]
  if (value in ROLE_PERMISSIONS) return value as Role
  return null
}

export function roleLabel(raw?: string | null): string {
  const role = normalizeRole(raw)
  if (!role) return raw || 'Unknown'
  return ROLE_LABELS[role]
}

export function hasPermission(rawRole: string | null | undefined, permission: Permission): boolean {
  const role = normalizeRole(rawRole)
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

/** Route → required permission (most specific match wins in middleware) */
const ROUTE_PERMISSIONS: Array<{ prefix: string; permission: Permission }> = [
  { prefix: '/media/add', permission: 'media:write' },
  { prefix: '/media', permission: 'media:read' },
  { prefix: '/tv/upload', permission: 'tv:write' },
  { prefix: '/tv', permission: 'tv:read' },
  { prefix: '/radio/upload', permission: 'radio:write' },
  { prefix: '/radio', permission: 'radio:read' },
  { prefix: '/online/upload', permission: 'online:write' },
  { prefix: '/online', permission: 'online:read' },
  { prefix: '/qc/tv', permission: 'qc:tv' },
  { prefix: '/qc/radio', permission: 'qc:radio' },
  { prefix: '/qc/online', permission: 'qc:online' },
  { prefix: '/tools', permission: 'tools' },
  { prefix: '/users', permission: 'users:manage' },
  { prefix: '/dashboard', permission: 'dashboard' },
]

export function permissionForPath(pathname: string): Permission | null {
  const sorted = [...ROUTE_PERMISSIONS].sort((a, b) => b.prefix.length - a.prefix.length)
  for (const entry of sorted) {
    if (pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)) {
      return entry.permission
    }
  }
  return null
}

export function canAccessPath(rawRole: string | null | undefined, pathname: string): boolean {
  const permission = permissionForPath(pathname)
  if (!permission) return true
  return hasPermission(rawRole, permission)
}

export function defaultHomeForRole(rawRole: string | null | undefined): string {
  const role = normalizeRole(rawRole)
  switch (role) {
    case 'staff_tv_radio':
      return '/tv/list'
    case 'staff_online':
      return '/online/list'
    case 'analis':
      return '/tools/media-reach'
    default:
      return '/dashboard'
  }
}

export type NavChild = {
  key: string
  label: string
  description?: string
  permission: Permission
}

export type NavEntry =
  | { type: 'section'; key: string; label: string }
  | { type: 'link'; key: string; label: string; description?: string; permission: Permission }
  | { type: 'group'; key: string; label: string; description?: string; children: NavChild[] }

export const ALL_NAV_ITEMS: NavEntry[] = [
  { type: 'section', key: 'overview', label: 'Overview' },
  {
    type: 'link',
    key: '/dashboard',
    label: 'Dashboard',
    description: 'Stats, trends & quick actions',
    permission: 'dashboard',
  },
  { type: 'section', key: 'content', label: 'Content Management' },
  {
    type: 'group',
    key: 'media',
    label: 'Media',
    description: 'Master media database',
    children: [
      { key: '/media/list', label: 'Media List', description: 'Browse & search outlets', permission: 'media:read' },
      { key: '/media/add', label: 'Add Media', description: 'Register a new outlet', permission: 'media:write' },
    ],
  },
  {
    type: 'group',
    key: 'tv',
    label: 'TV',
    description: 'Television articles',
    children: [
      { key: '/tv/list', label: 'Article List', description: 'View TV clippings', permission: 'tv:read' },
      { key: '/tv/upload', label: 'Upload Article', description: 'Submit new TV entry', permission: 'tv:write' },
    ],
  },
  {
    type: 'group',
    key: 'radio',
    label: 'Radio',
    description: 'Radio broadcast articles',
    children: [
      { key: '/radio/list', label: 'Article List', description: 'View radio clippings', permission: 'radio:read' },
      { key: '/radio/upload', label: 'Upload Article', description: 'Submit new radio entry', permission: 'radio:write' },
    ],
  },
  {
    type: 'group',
    key: 'online',
    label: 'Online',
    description: 'Digital & web articles',
    children: [
      { key: '/online/list', label: 'Article List', description: 'View online articles', permission: 'online:read' },
      { key: '/online/upload', label: 'Upload Article', description: 'Submit new online entry', permission: 'online:write' },
    ],
  },
  { type: 'section', key: 'qc-section', label: 'Quality Control' },
  {
    type: 'group',
    key: 'qc',
    label: 'QC Review',
    description: "Review today's uploads",
    children: [
      { key: '/qc/tv', label: 'TV QC', description: 'TV uploads today', permission: 'qc:tv' },
      { key: '/qc/radio', label: 'Radio QC', description: 'Radio uploads today', permission: 'qc:radio' },
      { key: '/qc/online', label: 'Online QC', description: 'Online uploads today', permission: 'qc:online' },
    ],
  },
  { type: 'section', key: 'admin', label: 'Administration' },
  {
    type: 'group',
    key: 'users',
    label: 'Users',
    description: 'Accounts & access roles',
    children: [
      { key: '/users', label: 'User Management', description: 'Create & edit accounts', permission: 'users:manage' },
    ],
  },
  {
    type: 'group',
    key: 'tools',
    label: 'Tools & Helpers',
    description: 'Analyst utilities',
    children: [
      { key: '/tools/media-reach', label: 'Media Reach', description: 'SimilarWeb crawler', permission: 'tools' },
      { key: '/tools/backtrack', label: 'Backtrack', description: 'Article backtrack lookup', permission: 'tools' },
    ],
  },
]

export function filterNavItems(rawRole: string | null | undefined): NavEntry[] {
  const filtered: NavEntry[] = []
  let pendingSection: Extract<NavEntry, { type: 'section' }> | null = null

  const flushSection = () => {
    if (pendingSection) {
      filtered.push(pendingSection)
      pendingSection = null
    }
  }

  for (const entry of ALL_NAV_ITEMS) {
    if (entry.type === 'section') {
      pendingSection = entry
      continue
    }

    if (entry.type === 'link') {
      if (!hasPermission(rawRole, entry.permission)) continue
      flushSection()
      filtered.push(entry)
      continue
    }

    const children = entry.children.filter((child) => hasPermission(rawRole, child.permission))
    if (children.length === 0) continue
    flushSection()
    filtered.push({ ...entry, children })
  }

  return filtered
}
