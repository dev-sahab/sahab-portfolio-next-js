'use client'

import { useRef } from 'react'
import BrowserFrame, { type BrowserFrameHandle } from '../../sections/work/BrowserFrame'

/** Large browser-framed screenshot that scrolls the full page on hover/focus (same as the cards). */
export default function ProjectShowcase({ domain, src, alt }: { domain: string; src: string; alt: string }) {
  const frame = useRef<BrowserFrameHandle>(null)
  return (
    <div
      className="v8-showcase"
      tabIndex={0}
      aria-label={`${alt}. Hover or focus to scroll the full page.`}
      onMouseEnter={() => frame.current?.scrollDown()}
      onMouseLeave={() => frame.current?.scrollBack()}
      onFocus={() => frame.current?.scrollDown()}
      onBlur={() => frame.current?.scrollBack()}
    >
      <BrowserFrame ref={frame} domain={domain} src={src} alt={alt} priority />
    </div>
  )
}
