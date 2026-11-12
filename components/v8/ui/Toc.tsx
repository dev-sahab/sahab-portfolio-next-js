'use client'

import { useEffect, useState } from 'react'
import { cx } from '@/lib/v8/cx'

/**
 * "On this page" list that highlights the section being read: the active
 * item is the last heading that has scrolled above ~30% of the viewport.
 */
export default function Toc({ items, label = 'On this page' }: { items: { id: string; text: string }[]; label?: string }) {
  const [active, setActive] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const headings = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el))
    if (!headings.length) return

    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.3
      let current = headings[0].id
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id
        else break
      }
      // At the very bottom, the last section wins even if its heading is low on the screen.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = headings[headings.length - 1].id
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  return (
    <nav className="v8-toc" aria-label={label}>
      <p className="v8-toc__label">{label}</p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={cx(active === item.id && 'is-active')} aria-current={active === item.id ? 'location' : undefined}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
