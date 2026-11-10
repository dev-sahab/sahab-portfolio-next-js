import type Lenis from 'lenis'

/**
 * Bridge between the Lenis smooth-scroll instance (created in
 * components/v8/providers/SmoothScroll.tsx) and the rest of the v8 page, so
 * the menu sheet, command search and anchor links can lock / drive scrolling
 * without importing the library — and still work (natively) if Lenis isn't
 * running (reduced motion, SSR, tests).
 */
let instance: Lenis | null = null

export function setSmoothScroll(lenis: Lenis | null) {
  instance = lenis
}

/**
 * Smooth-scrolls to a section (element or id) or to a pixel position.
 * The gap under the sticky header comes from the page's CSS
 * `scroll-padding-top` (styles/v8/base.scss) — Lenis and native scrolling
 * both read it, so no manual offset is passed here (it would double up).
 * `force` lets it run even while Lenis is stopped (e.g. the instant a menu
 * that locked scrolling is closing).
 */
export function scrollToTarget(target: string | HTMLElement | number) {
  const el = typeof target === 'string' ? document.getElementById(target) : target
  if (typeof target !== 'number' && !el) return

  if (instance) {
    instance.scrollTo(typeof target === 'number' ? target : (el as HTMLElement), { force: true })
    return
  }
  // No Lenis: native smooth scroll.
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
  else (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let locks = 0
let previousOverflow = ''

/**
 * Locks page scroll (menu sheet, full-screen search). Stackable: scrolling
 * resumes only once every lock is released. Returns the release function.
 */
export function lockScroll(): () => void {
  if (locks++ === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    instance?.stop()
  }
  let released = false
  return () => {
    if (released) return
    released = true
    if (--locks === 0) {
      document.body.style.overflow = previousOverflow
      instance?.start()
    }
  }
}
