'use client'

import { AppSidebar, AppMain } from '@/components/layout/app-sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: { username: string; full_name: string; role: string }
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <>
      <AppSidebar user={user} />
      <AppMain>{children}</AppMain>
    </>
  )
}
