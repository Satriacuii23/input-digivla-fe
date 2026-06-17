import Link from 'next/link'
import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number
  sub?: string
  icon: ReactNode
  accent?: 'navy' | 'tv' | 'radio' | 'online'
}

const accentStyles = {
  navy: 'bg-secondary text-navy-600',
  tv: 'bg-navy-50 text-navy-600',
  radio: 'bg-emerald-50 text-emerald-700',
  online: 'bg-amber-50 text-amber-700',
}

export function StatCard({ label, value, sub, icon, accent = 'navy' }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-navy-600">{value.toLocaleString('id-ID')}</p>
          {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', accentStyles[accent])}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickActionCardProps {
  href: string
  title: string
  description: string
  icon: ReactNode
}

export function QuickActionCard({ href, title, description, icon }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-navy-200 hover:bg-secondary/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-600 text-white transition-colors group-hover:bg-navy-700">
        {icon}
      </div>
      <div>
        <p className="font-medium text-navy-600">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
