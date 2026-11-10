'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Image from 'next/image'

export interface BrowserFrameHandle {
  scrollDown: () => void
  scrollBack: () => void
}

interface BrowserFrameProps {
  domain: string
  src: string
  alt: string
  priority?: boolean
}

/** Figma Interaction 04: the full page scrolls inside the frame over 6s, ease in-out. */
const SCROLL_DOWN = 'transform 6s cubic-bezier(.45,0,.55,1)'
const SCROLL_BACK = 'transform 1.1s cubic-bezier(.16,1,.3,1)'

/**
 * Mac-style browser window (traffic-light dots + address pill) around a
 * screenshot. `scrollDown()` glides a full-page capture to its bottom;
 * shorter images simply fill the frame.
 */
const BrowserFrame = forwardRef<BrowserFrameHandle, BrowserFrameProps>(function BrowserFrame(
  { domain, src, alt, priority },
  ref,
) {
  const viewport = useRef<HTMLDivElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const [failed, setFailed] = useState(false)

  useImperativeHandle(ref, () => ({
    scrollDown() {
      const img = image.current
      const view = viewport.current
      if (!img || !view || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const distance = Math.max(0, img.offsetHeight - view.clientHeight)
      if (distance < 20) return
      img.style.transition = SCROLL_DOWN
      img.style.transform = `translateY(-${distance}px)`
    },
    scrollBack() {
      const img = image.current
      if (!img) return
      img.style.transition = SCROLL_BACK
      img.style.transform = 'none'
    },
  }))

  return (
    <div className="v8-browser">
      <div className="v8-browser__bar">
        <span className="v8-browser__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="v8-browser__address">{domain}</span>
      </div>
      <div ref={viewport} className="v8-browser__viewport" data-name={domain}>
        {!failed && (
          <Image
            ref={image}
            src={src}
            alt={alt}
            width={1400}
            height={4200}
            sizes="(max-width: 960px) 100vw, 650px"
            priority={priority}
            className="v8-browser__shot"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  )
})

export default BrowserFrame
