import { cx } from '@/lib/v8/cx'
import '@/styles/v8/ui/Eyebrow.scss'

interface EyebrowProps {
  children: string
  /** Element to render: `h1` on the homepage, where this label is the page heading. */
  as?: 'p' | 'h1' | 'h2'
  id?: string
  /** `muted` = grey text with no marker (e.g. the tools strip label). */
  tone?: 'accent' | 'muted'
  className?: string
}

/** Small mono label that sits above every section heading. */
export default function Eyebrow({ children, tone = 'accent', className, as: Tag = 'p', id }: EyebrowProps) {
  return (
    <Tag id={id} className={cx('v8-eyebrow', `v8-eyebrow--${tone}`, className)}>
      {tone === 'accent' && <span className="v8-eyebrow__marker" aria-hidden="true" />}
      {children}
    </Tag>
  )
}
