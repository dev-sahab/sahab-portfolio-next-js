import { cx } from '@/lib/v8/cx'
import '@/styles/v8/ui/Eyebrow.scss'

interface EyebrowProps {
  children: string
  /** `muted` = grey text with no marker (e.g. the tools strip label). */
  tone?: 'accent' | 'muted'
  className?: string
}

/** Small mono label that sits above every section heading. */
export default function Eyebrow({ children, tone = 'accent', className }: EyebrowProps) {
  return (
    <p className={cx('v8-eyebrow', `v8-eyebrow--${tone}`, className)}>
      {tone === 'accent' && <span className="v8-eyebrow__marker" aria-hidden="true" />}
      {children}
    </p>
  )
}
