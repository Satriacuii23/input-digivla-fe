import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageShellProps {
  title: string
  description?: string
  icon?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function PageShell({ title, description, icon, badge, actions, children, className }: PageShellProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="rounded-lg border bg-card px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-600 text-white shadow-sm sm:h-12 sm:w-12">
                {icon}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-navy-600 sm:text-2xl">{title}</h1>
                {badge}
              </div>
              {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  )
}

interface PanelProps {
  toolbar?: ReactNode
  footer?: ReactNode
  children: ReactNode
  contentClassName?: string
}

export function Panel({ toolbar, footer, children, contentClassName }: PanelProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {toolbar && <div className="border-b border-border bg-muted/50 p-3 sm:p-4">{toolbar}</div>}
      <div className={cn('min-h-[240px] bg-card', contentClassName)}>{children}</div>
      {footer && <div className="border-t border-border bg-muted/50 p-3 sm:p-4">{footer}</div>}
    </div>
  )
}
