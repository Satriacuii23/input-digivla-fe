'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface OptionsMenuItem {
  label: string
  icon?: ReactNode
  onClick?: () => void
  href?: string
}

interface OptionsMenuProps {
  items: OptionsMenuItem[]
}

export function OptionsMenu({ items }: OptionsMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)}>
        Options
        <MoreVertical className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-md border bg-card py-1 shadow-md">
          {items.map((item, i) =>
            item.href ? (
              <Link
                key={i}
                href={item.href}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <button
                key={i}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
