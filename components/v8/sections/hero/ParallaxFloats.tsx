'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Figma Interaction 02: floating cards drift up to 12px with scroll. */
const SCROLL_DRIFT = 12
/** Max px a card follows the pointer (scaled per card by `--depth`). */
const POINTER_RANGE = 18
/** Easing factor per frame — lower = smoother / lazier follow. */
const EASE = 0.07
/** Let the cards' entry animation finish before they start following the mouse. */
const START_AFTER_MS = 1500

/**
 * Drives the hero's floating cards:
 *  - `--drift`: 0 → -12px over the first viewport of scroll.
 *  - `--mx` / `--my`: eased pointer offset, so the cards glide toward the
 *    mouse (each card scales it by its own `--depth` for a layered feel).
 * Pointer-follow only runs for fine pointers (mouse/trackpad) and is
 * disabled entirely for reduced-motion users.
 */
export default function ParallaxFloats({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let pointerEnabled = false

    const tick = () => {
      current.x += (target.x - current.x) * EASE
      current.y += (target.y - current.y) * EASE
      el.style.setProperty('--mx', `${current.x.toFixed(2)}px`)
      el.style.setProperty('--my', `${current.y.toFixed(2)}px`)
      const settled = Math.abs(target.x - current.x) < 0.05 && Math.abs(target.y - current.y) < 0.05
      frame = settled ? 0 : requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1)
      el.style.setProperty('--drift', `${(-SCROLL_DRIFT * progress).toFixed(2)}px`)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerEnabled || e.pointerType !== 'mouse') return
      // -1…1 from the viewport centre.
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      target = { x: nx * POINTER_RANGE, y: ny * POINTER_RANGE }
      kick()
    }

    // Ease back to rest when the mouse leaves the window.
    const onLeave = () => {
      target = { x: 0, y: 0 }
      kick()
    }

    const fine = window.matchMedia('(pointer: fine)').matches
    const startTimer = window.setTimeout(() => (pointerEnabled = fine), START_AFTER_MS)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.clearTimeout(startTimer)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={ref} className="v8-hero__floats" aria-hidden="true">
      {children}
    </div>
  )
}
