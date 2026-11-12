'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useCopy } from '../../providers/ToastProvider'
import LocalTime from './LocalTime'

interface ContactTerminalProps {
  email: string
  timeZone: string
  location: string
  /** e.g. "UTC+6" */
  utcOffset: string
  links: { label: string; href: string }[]
}

/**
 * Contact details as a little terminal window: `$ email`, `$ reply-time`,
 * `$ elsewhere`. The address is a mailto: link; the small button copies it.
 */
export default function ContactTerminal({ email, timeZone, location, utcOffset, links }: ContactTerminalProps) {
  const copy = useCopy()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="v8-terminal">
      <div className="v8-terminal__bar" aria-hidden="true">
        <span className="v8-terminal__dots">
          <i />
          <i />
          <i />
        </span>
        <span>contact</span>
      </div>

      <dl className="v8-terminal__body">
        <div>
          <dt>email</dt>
          <dd className="v8-terminal__row">
            <a href={`mailto:${email}`}>{email}</a>
            <button
              type="button"
              className="v8-terminal__copy"
              onClick={async () => {
                if (!(await copy(email, 'Copied', 2000))) return
                setCopied(true)
                window.clearTimeout(timer.current)
                timer.current = window.setTimeout(() => setCopied(false), 2000)
              }}
              aria-label={copied ? 'Email address copied' : `Copy email address ${email}`}
            >
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? 'copied' : 'copy'}
            </button>
          </dd>
        </div>

        <div>
          <dt>reply-time</dt>
          <dd>
            Within 24 hours, {location.split(',')[0]} time ({utcOffset})
            <span className="v8-terminal__muted">
              {' '}
              · now <LocalTime timeZone={timeZone} />
            </span>
          </dd>
        </div>

        <div>
          <dt>elsewhere</dt>
          <dd className="v8-terminal__links">
            {links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
                <span className="v8-sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  )
}
