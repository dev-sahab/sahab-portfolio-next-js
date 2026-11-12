'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { ACTIVE_TOOLS, activeCategories, type ConsentState } from '@/lib/v8/consent'
import { lockScroll } from '@/lib/v8/smoothScroll'
import { routes } from '@/lib/v8/routes'
import { cx } from '@/lib/v8/cx'
import { useConsent } from './ConsentProvider'
import { gpcEnabled } from './gpc'
import '@/styles/v8/consent/Consent.scss'

/** Per-category choices, each listing the exact tools and cookies behind it. */
export default function CookiePreferences({ onClose }: { onClose: () => void }) {
  const { consent, save } = useConsent()
  const gpc = gpcEnabled()
  const [draft, setDraft] = useState<ConsentState>(consent ?? { analytics: false, marketing: false })
  const dialog = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unlock = lockScroll()
    const prev = document.activeElement as HTMLElement | null
    dialog.current?.querySelector<HTMLElement>('button')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [onClose])

  return (
    <div className="v8-prefs" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialog} className="v8-prefs__panel" role="dialog" aria-modal="true" aria-labelledby="v8-prefs-title">
        <div className="v8-prefs__head">
          <h2 id="v8-prefs-title">Cookie settings</h2>
          <button type="button" className="v8-prefs__close" onClick={onClose} aria-label="Close cookie settings">
            <X />
          </button>
        </div>

        <div className="v8-prefs__body">
          <p className="v8-prefs__intro">
            Choose what this site may use. You can change this any time from “Cookie settings” in the footer.{' '}
            <Link href={routes.cookies} onClick={onClose}>
              Full details
            </Link>
          </p>

          <div className="v8-prefs__cat">
            <div className="v8-prefs__row">
              <div>
                <h3>Strictly necessary</h3>
                <p>Your theme choice, and the login for site admins. Always on.</p>
              </div>
              <span className="v8-prefs__always">Always on</span>
            </div>
          </div>

          {activeCategories().map((cat) => {
            const on = draft[cat.id]
            const tools = ACTIVE_TOOLS.filter((t) => t.category === cat.id)
            return (
              <div key={cat.id} className="v8-prefs__cat">
                <div className="v8-prefs__row">
                  <div>
                    <h3 id={`v8-cat-${cat.id}`}>{cat.label}</h3>
                    <p>{cat.description}</p>
                    {cat.id === 'marketing' && gpc && (
                      <p className="v8-prefs__gpc">Your browser sends a Global Privacy Control signal, so this is off unless you switch it on.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-labelledby={`v8-cat-${cat.id}`}
                    className={cx('v8-switch', on && 'is-on')}
                    onClick={() => setDraft((d) => ({ ...d, [cat.id]: !d[cat.id] }))}
                  >
                    <span />
                  </button>
                </div>
                <ul className="v8-prefs__tools">
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <strong>{tool.name}</strong> · {tool.provider}
                      <span>
                        {tool.cookies} · {tool.duration}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="v8-prefs__foot">
          <button type="button" className="v8-consent__choice" onClick={() => save({ analytics: false, marketing: false })}>
            Reject all
          </button>
          <button type="button" className="v8-consent__choice" onClick={() => save(draft)}>
            Save choices
          </button>
          <button type="button" className="v8-consent__choice v8-consent__choice--primary" onClick={() => save({ analytics: true, marketing: true })}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
