'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cx } from '@/lib/v8/cx'

/** Per-letter stagger, seconds. */
const STAGGER = 0.13

/**
 * The giant clipped "sahab" wordmark in the footer. As soon as it enters the
 * viewport, each letter rises up from below the clip edge, one after another.
 * Decorative (aria-hidden); reduced-motion users see it static.
 */
export default function Wordmark({ text = 'sahab' }: { text?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return setVisible(true)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={cx('v8-footer__wordmark', visible && 'is-in')} aria-hidden="true">
      <span className="v8-footer__word">
        {[...text].map((char, i) => (
          <span key={i} className="v8-footer__letter" style={{ '--i': i, '--stagger': `${STAGGER}s` } as CSSProperties}>
            {char}
          </span>
        ))}
      </span>
    </div>
  )
}
