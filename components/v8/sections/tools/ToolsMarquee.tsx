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
 * Positions wrap at one copy's width, so the loop is seamless. Runs only while
 * the section is on screen; static for reduced-motion users.
 */
export default function ToolsMarquee() {
  const sectionRef = useRef<HTMLElement>(null)
  const rowA = useRef<HTMLUListElement>(null)
  const rowB = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const a = rowA.current
    const b = rowB.current
    if (!section || !a || !b) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Width of one copy of the list (the loop period), re-measured on resize.
    let periodA = a.scrollWidth / COPIES
    let periodB = b.scrollWidth / COPIES
    // Separate offsets so a hovered row can pause on its own.
    let offsetA = 0
    let offsetB = 0
    let pausedA = false
    let pausedB = false
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
      // Hover pauses that row (Figma Interaction 03).
      if (!pausedA) offsetA += direction * (periodA / IDLE_LOOP_S + boost) * dt
      if (!pausedB) offsetB += direction * (periodB / IDLE_LOOP_S + boost) * dt
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

    const pause = (row: 'a' | 'b', value: boolean) => () => {
      if (row === 'a') pausedA = value
      else pausedB = value
    }
    const hoverHandlers: [HTMLElement, string, () => void][] = [
      [a, 'mouseenter', pause('a', true)],
      [a, 'mouseleave', pause('a', false)],
      [b, 'mouseenter', pause('b', true)],
      [b, 'mouseleave', pause('b', false)],
    ]
    hoverHandlers.forEach(([el, type, fn]) => el.addEventListener(type, fn))

    render()
    io.observe(section)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      hoverHandlers.forEach(([el, type, fn]) => el.removeEventListener(type, fn))
      io.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <section ref={sectionRef} className="v8-tools" aria-label={toolsHeading}>
      <Eyebrow tone="muted">{toolsHeading}</Eyebrow>
      <div className="v8-tools__rows">
        <Row tools={toolRows[0]} rowRef={rowA} label="CMS and front-end tools" />
        <Row tools={toolRows[1]} rowRef={rowB} label="App, design and automation tools" />
      </div>
    </section>
  )
}
