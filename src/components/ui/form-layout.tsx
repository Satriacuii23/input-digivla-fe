import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-4 rounded-lg border border-border bg-muted/20 p-4 sm:p-5', className)}>
      <div className="border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-navy-600">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export function FormGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const gridClass =
    cols === 1
      ? 'grid-cols-1'
      : cols === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2'

  return <div className={cn('grid gap-4', gridClass)}>{children}</div>
}

export function FormField({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>
}

export function FormFooter({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2 border-t pt-4">{children}</div>
}

export function StatusToggle({
  checked,
  onChange,
  activeLabel = 'Media aktif',
  inactiveLabel = 'Media nonaktif',
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  activeLabel?: string
  inactiveLabel?: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-secondary/30 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-navy-600">Status</p>
        <p className="text-xs text-muted-foreground">{checked ? activeLabel : inactiveLabel}</p>
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-navy-600 peer-checked:after:translate-x-full" />
      </label>
    </div>
  )
}

export function ModeTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; icon?: ReactNode }[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            value === opt.value
              ? 'border-navy-600 bg-navy-600 text-white shadow-sm'
              : 'border bg-card text-muted-foreground hover:border-navy-200 hover:text-navy-600'
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
