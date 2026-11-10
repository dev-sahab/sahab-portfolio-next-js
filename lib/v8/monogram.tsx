import type { SVGProps } from 'react'

interface MonogramSpec {
  /** Tile fill (official brand colour where one exists). */
  bg: string
  /** Text colour on the tile. */
  fg: string
  /** Label used at small sizes (≤ 20px), 1–2 characters. */
  short: string
  /** Label used at larger sizes, up to 3 characters. */
  long: string
  shape?: Exclude<MonogramShape, 'circle'>
  /** Hairline outline so very dark tiles stay visible on dark surfaces. */
  outline?: boolean
}

type MonogramShape = 'tile' | 'bubble' | 'oval' | 'circle'

/** `shape` overrides the brand's default shape (e.g. `circle` inside round badges). */
type MonogramProps = SVGProps<SVGSVGElement> & { size?: number | string; shape?: MonogramShape }

/**
 * Compact brand marks for products whose official logo is a wide wordmark
 * (WooCommerce, Wix, GSAP, PHP, n8n) or has no published glyph (Crocoblock,
 * Memberstack). A wordmark squeezed into a 14–26px square collapses to an
 * unreadable sliver; a coloured tile with the brand's initials reads at any
 * size. Drop-in compatible with the react-icons components in `tech.tsx`.
 */
export function monogram({ bg, fg, short, long, shape: defaultShape = 'tile', outline }: MonogramSpec) {
  function MonogramIcon({ width, height, size, style, className, shape: shapeOverride, ...rest }: MonogramProps) {
    const shape = shapeOverride ?? defaultShape
    const px = Number(width ?? size ?? 24)
    const label = px <= 20 ? short : long
    const fontSize = label.length === 1 ? 14 : label.length === 2 ? 11.5 : 9.5

    return (
      <svg
        viewBox="0 0 24 24"
        width={width ?? size ?? 24}
        height={height ?? size ?? 24}
        className={className}
        style={style}
        {...rest}
      >
        {shape === 'circle' && <circle cx="12" cy="12" r="12" fill={bg} />}
        {shape === 'oval' && <ellipse cx="12" cy="12" rx="12" ry="8.5" fill={bg} />}
        {shape === 'tile' && <rect width="24" height="24" rx="6" fill={bg} />}
        {shape === 'bubble' && (
          // Rounded speech bubble with a small tail — the classic Woo mark.
          <path d="M5 3h14a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-4.5L10 22.5V19H5a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Z" fill={bg} />
        )}
        {outline && shape === 'tile' && (
          <rect x="0.5" y="0.5" width="23" height="23" rx="5.5" fill="none" stroke="rgba(255,255,255,.18)" />
        )}
        <text
          x="12"
          y={shape === 'bubble' ? 11.4 : 12.2}
          fontSize={shape === 'circle' && label.length > 1 ? fontSize - 1 : fontSize}
          fill={fg}
          fontWeight={800}
          fontFamily="var(--ff-sans, ui-sans-serif, system-ui, sans-serif)"
          textAnchor="middle"
          dominantBaseline="central"
          letterSpacing={label.length > 1 ? -0.4 : 0}
        >
          {label}
        </text>
      </svg>
    )
  }
  MonogramIcon.displayName = `Monogram(${long})`
  return MonogramIcon
}
