import type { CSSProperties } from 'react'
import { TECH } from '@/lib/v8/tech'
import { cx } from '@/lib/v8/cx'
import type { TechKey } from '@/content/v8/types'
import '@/styles/v8/ui/TechIcon.scss'

interface TechIconProps {
  tech: TechKey
  size?: number
  /** `brand` = official colour, `current` = inherit text colour (monochrome). */
  tone?: 'brand' | 'current'
  /**
   * `badge` = always a round disc of `size`: transparent glyphs (WordPress,
   * Elementor…) sit on a white disc; logos with their own colour
   * (WooCommerce, PHP…) fill the disc with that colour instead.
   */
  variant?: 'glyph' | 'badge'
  className?: string
}

/** A technology's real logo, resolved from the shared registry in lib/v8/tech. */
export default function TechIcon({ tech, size = 14, tone = 'brand', variant = 'glyph', className }: TechIconProps) {
  const { icon: Icon, color, hasBackground } = TECH[tech]
  const style: CSSProperties | undefined = tone === 'brand' && color ? { color } : undefined

  if (variant === 'badge') {
    if (hasBackground) {
      return (
        <Icon
          width={size}
          height={size}
          shape="circle"
          className={cx('v8-tech-badge', className)}
          aria-hidden="true"
          focusable="false"
        />
      )
    }
    return (
      <span className={cx('v8-tech-badge v8-tech-badge--disc', className)} style={{ width: size, height: size }} aria-hidden="true">
        <Icon width={size} height={size} style={style} focusable="false" />
      </span>
    )
  }

  return <Icon width={size} height={size} className={className} style={style} aria-hidden="true" focusable="false" />
}
