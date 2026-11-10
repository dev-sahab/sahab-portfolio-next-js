'use client'

import { useEffect } from 'react'

/** Glow radius in px — must match the 400px circle in `.v8-spotlight::after`. */
const RADIUS = 400

/**
 * One shared pointer light for every `.v8-spotlight` card (hover effect from
 * html-template/new/homepage-preview-v6.html, extended): the glow is
 * centred on the pointer and every card within its radius — not just the
 * hovered one — renders its own slice of it, clipped to its rounded box. So
 * the light spills naturally across neighbouring cards but never outside a
 * card. Writes `--spot-x` / `--spot-y` (pointer position relative to each
 * card) and toggles `.is-lit` on cards inside the radius.
 */
export default function SpotlightTracker() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let frame = 0
    let x = -1e4
    let y = -1e4
    let lit = new Set<HTMLElement>()

    const apply = () => {
      frame = 0
      const next = new Set<HTMLElement>()
      document.querySelectorAll<HTMLElement>('.v8-spotlight').forEach((el) => {
        const box = el.getBoundingClientRect()
        // Distance from the pointer to the card's nearest edge (0 when inside).
        const dx = Math.max(box.left - x, 0, x - box.right)
        const dy = Math.max(box.top - y, 0, y - box.bottom)
        if (dx * dx + dy * dy > RADIUS * RADIUS) return
        el.style.setProperty('--spot-x', `${x - box.left}px`)
        el.style.setProperty('--spot-y', `${y - box.top}px`)
        next.add(el)
      })
      lit.forEach((el) => !next.has(el) && el.classList.remove('is-lit'))
      next.forEach((el) => el.classList.add('is-lit'))
      lit = next
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      schedule()
    }
    const onLeave = () => {
      x = y = -1e4
      schedule()
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    // Cards move under a still pointer while scrolling — keep the light in place.
    window.addEventListener('scroll', schedule, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', schedule)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return null
}
