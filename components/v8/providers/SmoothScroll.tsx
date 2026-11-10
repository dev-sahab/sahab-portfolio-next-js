'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { scrollToTarget, setSmoothScroll } from '@/lib/v8/smoothScroll'

/**
 * Eased, inertia-style page scrolling with Lenis (wheel / trackpad only —
 * touch keeps the phone's native momentum scroll). It drives the real browser
 * scroll position, so the sticky header, scroll-spy, IntersectionObserver
 * reveals and the marquee all keep working unchanged.
 *
 * Also routes in-page `#anchor` links through Lenis with the header offset.
 * Lenis honours `prefers-reduced-motion` by itself (no smoothing, instant jumps).
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      // Exponential ease-out: quick start, long soft landing.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Scrollable areas inside the page (code editor, lists) keep their own wheel scrolling.
      allowNestedScroll: true,
    })
    setSmoothScroll(lenis)

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]')
      if (!link || link.classList.contains('v8-skip')) return // skip-link must move focus natively
      const hash = link.getAttribute('href') ?? ''
      if (hash.length < 2) return
      const id = decodeURIComponent(hash.slice(1))
      const target = id === 'top' ? 0 : document.getElementById(id)
      if (target === null) return
      e.preventDefault()
      history.pushState(null, '', hash)
      // Next frame: a menu that locked scrolling has released it by then.
      requestAnimationFrame(() => scrollToTarget(target))
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      setSmoothScroll(null)
      lenis.destroy()
    }
  }, [])

  return null
}
