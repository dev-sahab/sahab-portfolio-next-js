'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

const R = 23
const CIRCUMFERENCE = 2 * Math.PI * R
const DURATION_MS = 1800
/** Matches `animation-delay` of `.v8-float--perf` (the card's fade-in). */
const FALLBACK_CARD_DELAY_MS = 800

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/**
 * Ring gauge for the "Performance budget" card. The number counts up from 0,
 * the ring fills in step with it and its colour shifts from the accent to the
 * "ok" green as it fills. The count starts exactly when the card begins to
 * fade in (not after hydration), and every frame writes straight to the DOM
 * — no React re-render per frame — so it stays smooth.
 *
 * The server markup starts at 0 so the final score is never visible before
 * the count begins; reduced-motion users get the final state straight away.
 */
export default function ScoreRing({ score, label }: { score: number; label: string }) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  // "90+" → "+": anything after the number in the label stays as a suffix.
  const suffix = label.replace(/^[\d.]+/, '')

  useEffect(() => {
    const root = rootRef.current
    const arc = arcRef.current
    const num = numRef.current
    if (!root || !arc || !num) return
    const paint = (value: number) => {
      arc.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - value / 100))
      root.style.setProperty('--fill', String((value / score) * 100))
      num.textContent = String(Math.round(value))
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(score)
      return
    }

    // Time until the card's own entry animation starts, so the count begins
    // the moment the card becomes visible even if hydration was slow.
    const entry = root.closest('.v8-float')?.getAnimations().find((a) => (a as CSSAnimation).animationName === 'v8-float-in')
    const delay = entry
      ? Math.max(0, Number(entry.effect?.getComputedTiming().delay ?? FALLBACK_CARD_DELAY_MS) - Number(entry.currentTime ?? 0))
      : FALLBACK_CARD_DELAY_MS

    let frame = 0
    const timer = window.setTimeout(() => {
      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min((now - start) / DURATION_MS, 1)
        paint(score * easeOutCubic(t))
        if (t < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }, delay)

    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [score])

  return (
    <span ref={rootRef} className="v8-float__ring" style={{ '--fill': 0 } as CSSProperties}>
      <svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true">
        <circle cx="26" cy="26" r={R} className="v8-float__ring-track" />
        <circle
          ref={arcRef}
          cx="26"
          cy="26"
          r={R}
          className="v8-float__ring-value"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <span className="v8-float__ring-label">
        <span ref={numRef}>0</span>
        {suffix}
      </span>
    </span>
  )
}
