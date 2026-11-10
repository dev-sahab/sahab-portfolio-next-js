'use client'

import { useEffect, useRef, useState } from 'react'
import { Code, PanelsTopLeft, Rocket } from 'lucide-react'
import { processSection, processSteps, processViews } from '@/content/v8/process'
import type { ProcessView } from '@/content/v8/types'
import { cx } from '@/lib/v8/cx'
import { ButtonLink } from '../../ui/Button'
import CodeLines from '../../ui/CodeLines'
import Reveal from '../../ui/Reveal'

const VIEW_ICONS: Record<ProcessView, typeof Code> = { design: PanelsTopLeft, build: Code, grow: Rocket }

/** Figma: auto-advances every 6s until the visitor interacts or scrolls away. */
const CYCLE_MS = 6000
/** Figma places the caret at the end of line 13 in every state. */
const CARET_LINE = 12

/**
 * "How a project runs": four steps on the left drive the editor window on
 * the right (file tabs, contents, status). The Design → Build → Grow switch
 * follows the active step and can be clicked too. Cycles automatically
 * until the visitor picks a step, pauses on hover, and never auto-plays for
 * reduced-motion users or while off-screen.
 */
export default function ProcessShowcase() {
  const [active, setActive] = useState(1) // Figma's default frame shows step 02
  const [autoplay, setAutoplay] = useState(true)
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setAutoplay(false)
    const el = rootRef.current
    if (!el) return
    let seen = false
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) seen = true
        // Scrolling away after it was seen ends the auto-advance for good.
        else if (seen) setAutoplay(false)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!autoplay || paused || !inView) return
    const t = window.setTimeout(() => setActive((i) => (i + 1) % processSteps.length), CYCLE_MS)
    return () => window.clearTimeout(t)
  }, [active, autoplay, paused, inView])

  const select = (index: number) => {
    setAutoplay(false)
    setActive(index)
  }

  const selectView = (view: ProcessView) => {
    const index = processSteps.findIndex((s) => s.view === view)
    if (index >= 0) select(index)
  }

  const step = processSteps[active]

  return (
    <div
      ref={rootRef}
      className="v8-process"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Reveal as="h3" className="v8-process__title">
        {processSection.title}
      </Reveal>

      <div className="v8-process__row">
        <Reveal className="v8-process__steps">
          <div role="tablist" aria-label="Project stages" aria-orientation="vertical">
            {processSteps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`v8-step-${s.id}`}
                aria-selected={i === active}
                aria-controls="v8-process-panel"
                tabIndex={i === active ? 0 : -1}
                className={cx('v8-step', i === active && 'is-active')}
                onClick={() => select(i)}
                onKeyDown={(e) => {
                  const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
                  if (!dir) return
                  e.preventDefault()
                  const next = (i + dir + processSteps.length) % processSteps.length
                  select(next)
                  document.getElementById(`v8-step-${processSteps[next].id}`)?.focus()
                }}
              >
                <span className="v8-step__num">{s.number}</span>
                <span className="v8-step__body">
                  <span className="v8-step__title">{s.title}</span>
                  <span className="v8-step__desc">{s.description}</span>
                </span>
                {i === active && autoplay && !paused && inView && (
                  <span className="v8-step__progress" style={{ animationDuration: `${CYCLE_MS}ms` }} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          <div className="v8-process__cta">
            <ButtonLink href={processSection.cta.href} arrow>
              {processSection.cta.label}
            </ButtonLink>
            <span>{processSection.ctaNote}</span>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="v8-editor-wrap">
          <div className="v8-editor" id="v8-process-panel" role="tabpanel" aria-labelledby={`v8-step-${step.id}`}>
            <div className="v8-editor__top">
              <span className="v8-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div className="v8-editor__views" role="group" aria-label="View">
                {processViews.map(({ id, label }) => {
                  const Icon = VIEW_ICONS[id]
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={step.view === id}
                      className={cx('v8-editor__view', step.view === id && 'is-active')}
                      onClick={() => selectView(id)}
                    >
                      <Icon aria-hidden="true" />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="v8-editor__tabs" aria-hidden="true">
              <span className="v8-editor__tab is-active">{step.files[0]}</span>
              <span className="v8-editor__tab">{step.files[1]}</span>
            </div>

            {/* `key` remounts the body so each step's content fades in */}
            <div className="v8-editor__body" key={step.id}>
              <ol className="v8-editor__gutter" aria-hidden="true">
                {step.lines.map((_, i) => (
                  <li key={i}>{i + 1}</li>
                ))}
              </ol>
              <pre className="v8-editor__code">
                <CodeLines lines={step.lines} caretLine={Math.min(CARET_LINE, step.lines.length - 1)} />
              </pre>
            </div>

            <div className="v8-editor__status">
              <span>{step.footerNote}</span>
              <span className="v8-editor__ok">
                <i aria-hidden="true" />
                {step.status}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
