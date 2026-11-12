'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useCopy } from '../../providers/ToastProvider'

/**
 * Terminal-style email chip. The address itself is a `mailto:` link (opens
 * the visitor's mail app); the Copy button on the right only copies it.
 */
export default function CopyEmailChip({ email }: { email: string }) {
  const copy = useCopy()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="v8-email-chip">
      <a href={`mailto:${email}`} className="v8-email-chip__link" aria-label={`Email ${email}`}>
        <span className="v8-email-chip__prompt" aria-hidden="true">
          $
        </span>
        <span className="v8-email-chip__value">{email}</span>
      </a>
      <button
        type="button"
        className="v8-email-chip__action"
        onClick={async () => {
          const ok = await copy(email, 'Copied', 2000) // Figma: "Copied" toast for 2s
          if (!ok) return
          setCopied(true)
          window.clearTimeout(timer.current)
          timer.current = window.setTimeout(() => setCopied(false), 2000)
        }}
        aria-label={copied ? 'Email address copied' : `Copy email address ${email}`}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
