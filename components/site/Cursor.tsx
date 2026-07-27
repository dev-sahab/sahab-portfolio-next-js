'use client'
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const curRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Dynamic import GSAP client-side only
    let gsapInstance: any = null
    let rafId: number
    let mx = 0, my = 0, tx = 0, ty = 0

    const init = async () => {
      const { gsap } = await import('gsap')
      gsapInstance = gsap
      const cur = curRef.current
      const trail = trailRef.current
      if (!cur || !trail) return

      // Check touch device
      if (!window.matchMedia('(pointer:fine)').matches) {
        cur.style.display = 'none'
        trail.style.display = 'none'
        return
      }

      const onMove = (e: MouseEvent) => {
        mx = e.clientX
        my = e.clientY
        // Cursor follows instantly
        gsap.set(cur, { x: mx, y: my })
      }

      // Trail lerp loop
      const loop = () => {
        tx += (mx - tx) * 0.12
        ty += (my - ty) * 0.12
        gsap.set(trail, { x: tx, y: ty })
        rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)

      // Hover targets — GSAP animates size (smooth, no CSS transition conflict)
      const HOVER = 'a, button, .project-card, .service-card, .testi-card, .pf-item, .filter-btn, .blog-card, .gq-option, .gq-check, .tape-card'

      const onOver = (e: MouseEvent) => {
        const target = e.target as Element
        if (!target.closest(HOVER)) return
        gsap.to(cur,   { width: 44, height: 44, duration: 0.3, ease: 'power2.out', overwrite: true })
        gsap.to(trail, { width: 68, height: 68, duration: 0.35, ease: 'power2.out', overwrite: true })
        // Light mode: also update border color
        const theme = document.documentElement.getAttribute('data-theme')
        if (theme === 'light') {
          gsap.to(trail, { borderColor: 'rgba(92,159,0,0.8)', duration: 0.2, overwrite: 'auto' })
        } else {
          gsap.to(trail, { borderColor: 'rgba(184,255,79,0.8)', duration: 0.2, overwrite: 'auto' })
        }
      }

      const onOut = (e: MouseEvent) => {
        const target = e.target as Element
        if (!target.closest(HOVER)) return
        gsap.to(cur,   { width: 10, height: 10, duration: 0.3, ease: 'power2.out', overwrite: true })
        const theme = document.documentElement.getAttribute('data-theme')
        gsap.to(trail, {
          width: 38, height: 38,
          borderColor: theme === 'light' ? 'rgba(92,159,0,0.5)' : 'rgba(184,255,79,0.5)',
          duration: 0.35, ease: 'power2.out', overwrite: true
        })
      }

      const onLeave = () => gsap.to([cur, trail], { opacity: 0, duration: 0.3 })
      const onEnter = () => gsap.to([cur, trail], { opacity: 1, duration: 0.3 })

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseover', onOver)
      document.addEventListener('mouseout', onOut)
      document.addEventListener('mouseleave', onLeave)
      document.addEventListener('mouseenter', onEnter)

      return () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseover', onOver)
        document.removeEventListener('mouseout', onOut)
        document.removeEventListener('mouseleave', onLeave)
        document.removeEventListener('mouseenter', onEnter)
      }
    }

    init()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div ref={curRef} className="cursor" aria-hidden="true" />
      <div ref={trailRef} className="cursor-trail" aria-hidden="true" />
    </>
  )
}
