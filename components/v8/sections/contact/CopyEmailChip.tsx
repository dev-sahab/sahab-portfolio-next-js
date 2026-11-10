'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useCopy } from '../../providers/ToastProvider'

/** Terminal-style email chip — click anywhere on it to copy the address. */
export default function CopyEmailChip({ email }: { email: string }) {
  const copy = useCopy()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <button
      type="button"
      className="v8-email-chip"
      onClick={async () => {
        const ok = await copy(email, 'Copied', 2000) // Figma: "Copied" toast for 2s
        if (!ok) return
        setCopied(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), 2000)
      }}
      aria-label={`Copy email address ${email}`}
    >
      <span className="v8-email-chip__prompt" aria-hidden="true">
        $
      </span>
      <span className="v8-email-chip__value">{email}</span>
      <span className="v8-email-chip__action" aria-hidden="true">
        {copied ? <Check /> : <Copy />}
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  )
}
