'use client'

import { useEffect, useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '@/lib/v8/cx'

interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: ReactNode
  as?: ElementType
  /** Seconds — staggers siblings. */
  delay?: number
}

/**
 * Fades + lifts its content in the first time it scrolls into view.
 * Styles live in styles/v8/base.scss (`.v8-reveal`); reduced-motion users
 * get the content immediately.
 */
export default function Reveal({ children, as: Tag = 'div', delay = 0, className, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible')
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          io.disconnect()
        }
      },
      // No bottom inset: content pinned to the page's end (the footer's
      // bottom bar) can never scroll above an inset line and would stay hidden.
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const mergedStyle = delay ? ({ ...style, '--reveal-delay': `${delay}s` } as CSSProperties) : style

  return (
    <Tag ref={ref} className={cx('v8-reveal', className)} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  )
}
