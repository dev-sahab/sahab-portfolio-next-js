import { Star } from 'lucide-react'

interface StarsProps {
  count?: number
  size?: number
  gap?: number
  label?: string
}

/** Row of filled ember stars. Decorative unless a `label` is given. */
export default function Stars({ count = 5, size = 13, gap = 3, label }: StarsProps) {
  return (
    <span
      className="v8-stars"
      style={{ display: 'inline-flex', gap, color: 'var(--accent-fill)' }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} width={size} height={size} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  )
}
