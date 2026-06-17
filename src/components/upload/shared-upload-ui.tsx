'use client'

import { useCallback, type ReactNode } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Video, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UploadFormSkeleton } from '@/components/ui/page-loading'
import { MAX_MEDIA_UPLOAD_BYTES, MAX_MEDIA_UPLOAD_LABEL } from '@/lib/storage/media-upload-limits'

export function dateToInputValue(date: Date | null | undefined): string {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateInput(value: string): Date | null {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

interface SimpleModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function SimpleModal({ open, onClose, title, children, className }: SimpleModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={cn('flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow-lg', className ?? 'max-w-2xl')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-navy-600">{title}</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-auto p-6">{children}</div>
      </div>
    </div>
  )
}

interface VideoDropzoneProps {
  onDrop: (files: File[]) => void
  compact?: boolean
  accentClass?: string
}

export function VideoDropzone({ onDrop, compact, accentClass = 'hover:border-navy-600 hover:bg-secondary/50' }: VideoDropzoneProps) {
  const handleDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onDrop(accepted)
    },
    [onDrop]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: handleDrop,
    accept: { 'video/mp4': ['.mp4'], 'video/*': [] },
    maxSize: MAX_MEDIA_UPLOAD_BYTES,
    multiple: false,
  })

  const height = compact ? 'min-h-[80px]' : 'min-h-[120px]'
  const iconSize = compact ? 'h-8 w-8' : 'h-12 w-12'

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-input bg-white p-4 transition-colors',
        height,
        isDragReject && 'border-destructive bg-red-50',
        isDragActive && !isDragReject && 'border-navy-600 bg-secondary/50',
        !isDragActive && !isDragReject && accentClass
      )}
    >
      <input {...getInputProps()} />
      {isDragReject ? (
        <X className={cn(iconSize, 'text-destructive')} />
      ) : isDragActive ? (
        <Upload className={cn(iconSize, 'text-navy-600')} />
      ) : (
        <Video className={cn(iconSize, 'text-muted-foreground')} />
      )}
      <p className={cn('mt-2 text-center text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
        {isDragReject ? 'Invalid file type or too large' : 'Drag MP4 file here or click to select'}
      </p>
      {!compact && <p className="mt-1 text-xs text-muted-foreground">Support MP4 format, max {MAX_MEDIA_UPLOAD_LABEL}</p>}
    </div>
  )
}

interface FileSelectedCardProps {
  file: File
  onRemove: () => void
  infoText?: string
}

export function FileSelectedCard({ file, onRemove, infoText }: FileSelectedCardProps) {
  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500">
            <Check className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-800">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
          <X className="mr-1 h-4 w-4" />
          Remove
        </Button>
      </div>
      {infoText && (
        <div className="mt-3 rounded-md border border-emerald-200 bg-white p-3">
          <p className="text-xs font-medium text-emerald-700">Video File Info:</p>
          <p className="mt-1 text-xs text-muted-foreground">{infoText}</p>
        </div>
      )}
    </div>
  )
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return <UploadFormSkeleton fields={fields} />
}
