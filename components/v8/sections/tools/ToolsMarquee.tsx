'use client'

import { useEffect, useRef, type Ref } from 'react'
import { toolRows, toolsHeading } from '@/content/v8/tools'
import { TECH } from '@/lib/v8/tech'
import type { TechKey } from '@/content/v8/types'
import Eyebrow from '../../ui/Eyebrow'
import TechIcon from '../../ui/TechIcon'
import '@/styles/v8/sections/ToolsMarquee.scss'

/** Figma Interaction 03: when idle, each row loops once every 40s. */
const IDLE_LOOP_S = 40
/** Extra px of travel per px scrolled. */
const SCROLL_FACTOR = 0.6
/** How quickly the scroll boost fades back to the idle drift (per second). */
const BOOST_DECAY = 4
/**
 * The pill list is rendered this many times so a row never runs dry: each
 * row's translate stays within one-to-two periods, so 4 copies cover
 * viewports up to twice the list width (~2800px).
 */
const COPIES = 4
/** How quickly a released drag's momentum fades (per second). */
const INERTIA_DECAY = 3.2
/** Cap on release momentum, px/s, so a hard flick stays readable. */
const MAX_FLING = 2400

function Row({ tools, rowRef, label }: { tools: TechKey[]; rowRef: Ref<HTMLUListElement>; label: string }) {
  const items = Array.from({ length: COPIES }, () => tools).flat()
  return (
    <ul ref={rowRef} className="v8-tools__row" aria-label={label}>
      {items.map((tech, i) => (
        <li key={`${tech}-${i}`} className="v8-tool" aria-hidden={i >= tools.length ? true : undefined}>
          <span className="v8-tool__icon">
            <TechIcon tech={tech} size={14} />
          </span>
          {TECH[tech].label}
        </li>
      ))}
    </ul>
  )
}

/**
 * Two rows of tool pills moving in opposite directions, endlessly.
 *  - Idle (or just sitting on the section): both rows drift slowly.
 *  - Scrolling down: row 1 slides left, row 2 right, faster the harder you scroll.
 *  - Scrolling up: the directions flip, and the idle drift keeps that direction.
 *  - Drag with the mouse/finger: only the row you grab follows the pointer
 *    (the other keeps drifting) and keeps a bit of momentum when released.
 *    Hovering does not pause anything.
 * Positions wrap at one copy's width, so the loop is seamless. Runs only while
 * the section is on screen; static for reduced-motion users.
 */
export default function ToolsMarquee() {
  const sectionRef = useRef<HTMLElement>(null)
  const rowsRef = useRef<HTMLDivElement>(null)
  const rowA = useRef<HTMLUListElement>(null)
  const rowB = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const a = rowA.current
    const b = rowB.current
    const rows = rowsRef.current
    if (!section || !a || !b || !rows) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Width of one copy of the list (the loop period), re-measured on resize.
    let periodA = a.scrollWidth / COPIES
    let periodB = b.scrollWidth / COPIES
    let offsetA = 0
    let offsetB = 0
    // Drag state: which row is held, plus each row's pointer velocity (px/s)
    // carried after release.
    let dragRow: 'a' | 'b' | null = null
    let inertiaA = 0
    let inertiaB = 0
    let direction = 1 // 1 = scrolling down (row A moves left), -1 = up
    let boost = 0 // px/s added by recent scrolling
    let lastScrollY = window.scrollY
    let lastTime = 0
    let frame = 0
    let visible = false

    const wrap = (value: number, period: number) => ((value % period) + period) % period

    const render = () => {
      // Row A travels left as offset grows; row B travels right.
      a.style.transform = `translate3d(${-wrap(offsetA, periodA) - periodA}px,0,0)`
      b.style.transform = `translate3d(${wrap(offsetB, periodB) - periodB * 2}px,0,0)`
    }

    const tick = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0
      lastTime = time
      boost *= Math.exp(-BOOST_DECAY * dt)
      const decay = Math.exp(-INERTIA_DECAY * dt)
      // The row being dragged is driven by the pointer alone; the other drifts on.
      if (dragRow !== 'a') {
        offsetA += direction * (periodA / IDLE_LOOP_S + boost) * dt
        inertiaA = Math.abs(inertiaA * decay) < 1 ? 0 : inertiaA * decay
        offsetA -= inertiaA * dt
      }
      if (dragRow !== 'b') {
        offsetB += direction * (periodB / IDLE_LOOP_S + boost) * dt
        inertiaB = Math.abs(inertiaB * decay) < 1 ? 0 : inertiaB * decay
        offsetB += inertiaB * dt
      }
      render()
      frame = visible ? requestAnimationFrame(tick) : 0
    }

    const start = () => {
      if (frame) return
      lastTime = 0
      frame = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastScrollY
      lastScrollY = y
      if (!delta) return
      direction = delta > 0 ? 1 : -1
      // Convert this scroll step into velocity; capped so a fling stays readable.
      boost = Math.min(boost + Math.abs(delta) * SCROLL_FACTOR * 10, 1400)
    }

    const onResize = () => {
      periodA = a.scrollWidth / COPIES
      periodB = b.scrollWidth / COPIES
      render()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })

    // ── Drag to pan (one row at a time) ──
    let lastX = 0
    let lastMoveTime = 0
    let velocity = 0
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      // The row under the pointer: split halfway through the gap between the rows.
      const split = (a.getBoundingClientRect().bottom + b.getBoundingClientRect().top) / 2
      dragRow = e.clientY < split ? 'a' : 'b'
      if (dragRow === 'a') inertiaA = 0
      else inertiaB = 0
      velocity = 0
      lastX = e.clientX
      lastMoveTime = performance.now()
      rows.setPointerCapture(e.pointerId)
      rows.classList.add('is-dragging')
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragRow) return
      const now = performance.now()
      const dx = e.clientX - lastX
      const dt = Math.max((now - lastMoveTime) / 1000, 0.001)
      // Row A's offset runs against its travel, row B's with it.
      if (dragRow === 'a') offsetA -= dx
      else offsetB += dx
      // Smoothed pointer velocity, becomes the momentum on release.
      velocity = Math.max(-MAX_FLING, Math.min(MAX_FLING, velocity * 0.6 + (dx / dt) * 0.4))
      lastX = e.clientX
      lastMoveTime = now
      render()
    }
    const endDrag = (e: PointerEvent) => {
      if (!dragRow) return
      // A pause before letting go means no fling.
      const fling = performance.now() - lastMoveTime > 80 ? 0 : velocity
      if (dragRow === 'a') inertiaA = fling
      else inertiaB = fling
      dragRow = null
      if (rows.hasPointerCapture(e.pointerId)) rows.releasePointerCapture(e.pointerId)
      rows.classList.remove('is-dragging')
      start()
    }
    rows.addEventListener('pointerdown', onPointerDown)
    rows.addEventListener('pointermove', onPointerMove)
    rows.addEventListener('pointerup', endDrag)
    rows.addEventListener('pointercancel', endDrag)

    render()
    io.observe(section)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      rows.removeEventListener('pointerdown', onPointerDown)
      rows.removeEventListener('pointermove', onPointerMove)
      rows.removeEventListener('pointerup', endDrag)
      rows.removeEventListener('pointercancel', endDrag)
      io.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <section ref={sectionRef} className="v8-tools" aria-label={toolsHeading}>
      <Eyebrow tone="muted">{toolsHeading}</Eyebrow>
      <div ref={rowsRef} className="v8-tools__rows">
        <Row tools={toolRows[0]} rowRef={rowA} label="CMS and front-end tools" />
        <Row tools={toolRows[1]} rowRef={rowB} label="App, design and automation tools" />
      </div>
    </section>
  )
}
