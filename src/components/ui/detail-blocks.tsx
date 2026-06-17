import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function DrawerTitleIcon({ icon }: { icon: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-600">{icon}</div>
    </span>
  )
}

interface MetaCardProps {
  icon?: ReactNode
  label: string
  value: ReactNode
  tone?: 'emerald' | 'amber' | 'navy' | 'muted'
}

const toneStyles = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  navy: 'border-navy-100 bg-secondary text-navy-600',
  muted: 'border bg-muted/40 text-foreground',
}

export function MetaCard({ icon, label, value, tone = 'muted' }: MetaCardProps) {
  return (
    <div className={cn('rounded-md border p-3', toneStyles[tone])}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}

export function DetailSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

export function ContentPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{children}</p>
    </div>
  )
}

export function EditNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-navy-100 bg-secondary/60 px-3 py-2">
      <p className="text-xs text-navy-600">{children}</p>
    </div>
  )
}

export function FormFooter({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2 border-t pt-4">{children}</div>
}
