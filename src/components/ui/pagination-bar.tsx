'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationBarProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  showRange?: boolean
}

export function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  showRange = true,
}: PaginationBarProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {showRange ? (
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Total {total} article(s)</p>
      )}
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-3 text-sm text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
