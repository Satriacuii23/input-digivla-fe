import Image from 'next/image'
import { cn } from '@/lib/utils'

const LOGO_SRC = '/images/digivla-logo.png'

/** Official logo asset: 1024 × 190 px */
const LOGO_ASPECT = 1024 / 190

function logoWidth(height: number) {
  return Math.round(height * LOGO_ASPECT)
}

interface LogoProps {
  height?: number
  variant?: 'light' | 'dark'
  className?: string
}

export function DigivlaLogo({ height = 40, variant = 'dark', className }: LogoProps) {
  return (
    <div className={cn('digivla-logo', className)}>
      <LogoImage height={height} variant={variant} priority />
    </div>
  )
}

export function LogoImage({
  height = 40,
  className,
  priority = false,
  variant = 'dark',
}: {
  height?: number
  className?: string
  priority?: boolean
  variant?: 'light' | 'dark'
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
      style={{ height, width, maxWidth: '100%' }}
    />
  )
}

/** Circular mark only — for collapsed sidebar */
export function LogoMark({
  size = 36,
  className,
}: {
  size?: number
  className?: string
}) {
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
        style={{ height: size, width: logoWidth(size) }}
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
