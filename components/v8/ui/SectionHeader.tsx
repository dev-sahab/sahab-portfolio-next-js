import type { ReactNode } from 'react'
import { cx } from '@/lib/v8/cx'
import Eyebrow from './Eyebrow'
import Reveal from './Reveal'
import { renderRich } from './RichText'
import '@/styles/v8/ui/SectionHeader.scss'

interface SectionHeaderProps {
  id: string
  eyebrow: string
  title: string
  /** Intro copy; rendered beside the heading on desktop (`split`) or below it. */
  intro?: ReactNode
  /** Optional trailing link/button shown under the intro (e.g. "All services →"). */
  action?: ReactNode
  layout?: 'split' | 'stacked' | 'center'
  className?: string
}

/** Eyebrow + display heading (+ optional intro) used at the top of each section. */
export default function SectionHeader({ id, eyebrow, title, intro, action, layout = 'split', className }: SectionHeaderProps) {
  return (
    <Reveal className={cx('v8-section-header', `v8-section-header--${layout}`, className)}>
      <div className="v8-section-header__main">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id} className="v8-h2">
          {renderRich(title)}
        </h2>
      </div>
      {action ? (
        <div className="v8-section-header__aside">
          {intro && <p className="v8-section-header__intro">{intro}</p>}
          {action}
        </div>
      ) : (
        intro && <p className="v8-section-header__intro">{intro}</p>
      )}
    </Reveal>
  )
}
