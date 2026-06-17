import Image from 'next/image'
import { cn } from '@/lib/utils'

const LOGO_SRC = '/images/digivla-logo.png?v=transparent'

/** Official logo asset: 1024 × 214 px (transparent PNG, with tagline) */
const LOGO_ASPECT = 1024 / 214

/** Left emblem occupies roughly a square matching logo height */
const LOGO_ICON_WIDTH_RATIO = 214 / 1024

function logoWidth(height: number) {
  return Math.round(height * LOGO_ASPECT)
}

interface LogoProps {
  height?: number
  className?: string
}

export function DigivlaLogo({ height = 40, className }: LogoProps) {
  return (
    <div className={cn('digivla-logo', className)}>
      <LogoImage height={height} priority />
    </div>
  )
}

export function LogoImage({
  height = 40,
  className,
  priority = false,
}: {
  height?: number
  className?: string
  priority?: boolean
}) {
  const width = logoWidth(height)

  return (
    <Image
      src={LOGO_SRC}
      alt="Digivla"
      width={width}
      height={height}
      priority={priority}
      className={cn('digivla-logo-image', className)}
      style={{ height, width: 'auto', maxWidth: '100%' }}
    />
  )
}

/** Circular emblem — collapsed sidebar */
export function LogoMark({
  size = 36,
  className,
}: {
  size?: number
  className?: string
}) {
  const clipWidth = Math.round(size * LOGO_ICON_WIDTH_RATIO * 5.2)

  return (
    <div
      className={cn('digivla-logo-mark', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src={LOGO_SRC}
        alt="Digivla"
        width={logoWidth(size)}
        height={size}
        className="digivla-logo-mark-image"
        style={{ height: size, width: clipWidth, maxWidth: 'none' }}
      />
    </div>
  )
}

/** @deprecated Use LogoMark */
export function LogoIcon({
  size = 32,
  className,
}: {
  size?: number
  variant?: 'light' | 'dark'
  className?: string
}) {
  return <LogoMark size={size} className={className} />
}
