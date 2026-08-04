'use client'
import { useEffect } from 'react'

const SELECTOR = '.project-card, .service-card, .testi-card'

export default function TiltCards() {
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return

    let cleanup: (() => void) | undefined

    const init = async () => {
      const { gsap } = await import('gsap')

      const onMove = (e: MouseEvent) => {
        const card = (e.target as Element)?.closest(SELECTOR) as HTMLElement | null
        if (!card) return
        const r = card.getBoundingClientRect()
        gsap.to(card, {
          rotateX: ((e.clientY - r.top) / r.height - 0.5) * -10,
          rotateY: ((e.clientX - r.left) / r.width - 0.5) * 10,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800,
        })
      }

      const onOut = (e: MouseEvent) => {
        const card = (e.target as Element)?.closest(SELECTOR) as HTMLElement | null
        if (!card) return
        const related = e.relatedTarget as Node | null
        if (related && card.contains(related)) return
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power3.out' })
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseout', onOut)

      cleanup = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseout', onOut)
      }
    }

    init()
    return () => cleanup?.()
  }, [])

  return null
}
