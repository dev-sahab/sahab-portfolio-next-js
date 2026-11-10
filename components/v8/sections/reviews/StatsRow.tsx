'use client'

import { useEffect, useRef, useState } from 'react'
import type { Stat } from '@/content/v8/types'

/** Figma Interaction 07: numbers count up once (800ms) when 40% of the row is visible. */
const DURATION_MS = 800

function decimalsOf(value: string) {
  return value.includes('.') ? value.split('.')[1].length : 0
}

export default function StatsRow({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDListElement>(null)
  // Start at the final values so SSR / no-JS / reduced-motion show real numbers.
  const [display, setDisplay] = useState(() => stats.map((s) => s.value))

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = stats.map((s) => parseFloat(s.value))
    let frame = 0
    setDisplay(stats.map((s) => (0).toFixed(decimalsOf(s.value))))

    const run = () => {
      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min((now - start) / DURATION_MS, 1)
        const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
        setDisplay(stats.map((s, i) => (targets[i] * eased).toFixed(decimalsOf(s.value))))
        if (t < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect()
          run()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [stats])

  return (
    <dl ref={ref} className="v8-stats">
      {stats.map((stat, i) => (
        <div key={stat.label} className="v8-stats__item v8-spotlight">
          <dt className="v8-sr-only">{stat.label}</dt>
          <dd className="v8-stats__value" aria-label={`${stat.value}${stat.suffix ?? ''}`}>
            <span aria-hidden="true">{display[i]}</span>
            {stat.suffix && <span className="v8-stats__suffix" aria-hidden="true">{stat.suffix}</span>}
          </dd>
          <dd className="v8-stats__label" aria-hidden="true">
            {stat.label}
          </dd>
        </div>
      ))}
    </dl>
  )
}
