'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cx } from '@/lib/v8/cx'
import '@/styles/v8/providers/Toast.scss'

interface ToastApi {
  /** Shows the toast; `durationMs` defaults to 3.6s. */
  notify: (message: string, durationMs?: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const VISIBLE_MS = 3600

/** Single, polite status toast ("Email copied", "Code copied", …). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const hideLater = useCallback((ms: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setVisible(false), ms)
  }, [])

  const notify = useCallback(
    (next: string, durationMs = VISIBLE_MS) => {
      setMessage(next)
      setVisible(true)
      hideLater(durationMs)
    },
    [hideLater],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const api = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className={cx('v8-toast', visible && 'is-visible')}
        role="status"
        aria-live="polite"
        onMouseEnter={() => window.clearTimeout(timer.current)}
        onMouseLeave={() => hideLater(1500)}
      >
        <Check className="v8-toast__icon" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

/**
 * Legacy copy path. `navigator.clipboard` only exists in secure contexts
 * (https or localhost) — e.g. opening the dev server via a LAN IP
 * (http://192.168.x.x) leaves it undefined — so fall back to a hidden
 * textarea + execCommand, which works everywhere.
 */
function legacyCopy(value: string): boolean {
  const ta = document.createElement('textarea')
  ta.value = value
  ta.setAttribute('readonly', '')
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
  document.body.appendChild(ta)
  ta.select()
  ta.setSelectionRange(0, value.length)
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  ta.remove()
  return ok
}

/** Copies text and confirms with a toast. Resolves `true` when the copy succeeded. */
export function useCopy() {
  const { notify } = useToast()
  return useCallback(
    async (value: string, message = 'Copied to clipboard', durationMs?: number): Promise<boolean> => {
      let ok = false
      if (navigator.clipboard && window.isSecureContext) {
        ok = await navigator.clipboard.writeText(value).then(
          () => true,
          () => false,
        )
      }
      if (!ok) ok = legacyCopy(value)
      notify(ok ? message : `Couldn’t copy. Here it is: ${value}`, durationMs)
      return ok
    },
    [notify],
  )
}
