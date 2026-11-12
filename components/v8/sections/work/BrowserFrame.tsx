'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Image from 'next/image'
import { cx } from '@/lib/v8/cx'

export interface BrowserFrameHandle {
  scrollDown: () => void
  scrollBack: () => void
}

interface BrowserFrameProps {
  domain: string
  /** Feature image (what the frame shows at rest). */
  src: string
  alt: string
  /** Optional full-page screenshot: fades in over the feature image on hover and scrolls. */
  screenshot?: string
  priority?: boolean
}

/**
 * Figma Interaction 04: the full page scrolls inside the frame over 6s, ease in-out.
 * Opacity is listed too: an inline `transition` replaces the stylesheet one,
 * and the crossfade between feature image and screenshot needs it.
 */
const FADE = 'opacity .35s ease'
const SCROLL_DOWN = `transform 6s cubic-bezier(.45,0,.55,1), ${FADE}`
const SCROLL_BACK = `transform 1.1s cubic-bezier(.16,1,.3,1), ${FADE}`
/** Matches the opacity transition in SelectedWork.scss, so the scroll starts once the screenshot is in. */
const FADE_MS = 350

/**
 * Mac-style browser window (traffic-light dots + address pill) around a
 * screenshot.
 *
 * With a `screenshot`: the feature image fills the frame at rest; on hover
 * it fades out, the full-page screenshot fades in and glides to its bottom.
 * Without one (older projects): the feature image itself scrolls if it's a
 * tall full-page capture, as before.
 */
const BrowserFrame = forwardRef<BrowserFrameHandle, BrowserFrameProps>(function BrowserFrame(
  { domain, src, alt, screenshot, priority },
  ref,
) {
  const viewport = useRef<HTMLDivElement>(null)
  const feature = useRef<HTMLImageElement>(null)
  const full = useRef<HTMLImageElement>(null)
  const active = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const [fullFailed, setFullFailed] = useState(false)
  const hasFull = Boolean(screenshot) && !fullFailed

  const glide = (img: HTMLImageElement | null) => {
    const view = viewport.current
    if (!img || !view || !active.current) return
    const distance = Math.max(0, img.offsetHeight - view.clientHeight)
    if (distance < 20) return
    img.style.transition = SCROLL_DOWN
    img.style.transform = `translateY(-${distance}px)`
  }

  useImperativeHandle(ref, () => ({
    scrollDown() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      active.current = true
      if (!hasFull) return glide(feature.current)
      viewport.current?.classList.add('is-full')
      window.clearTimeout(timer.current)
      const img = full.current
      // Not loaded yet: start as soon as it is (if the pointer is still there).
      if (img && !img.complete) img.addEventListener('load', () => glide(img), { once: true })
      else timer.current = window.setTimeout(() => glide(img), FADE_MS)
    },
    scrollBack() {
      active.current = false
      window.clearTimeout(timer.current)
      viewport.current?.classList.remove('is-full')
      for (const img of [feature.current, full.current]) {
        if (!img) continue
        img.style.transition = SCROLL_BACK
        img.style.transform = 'none'
      }
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
      <div ref={viewport} className={cx('v8-browser__viewport', hasFull && 'has-full')} data-name={domain}>
        {!failed && src && (
          <Image
            ref={feature}
            src={src}
            alt={alt}
            width={1400}
            height={hasFull ? 900 : 4200}
            sizes="(max-width: 960px) 100vw, 650px"
            preload={priority}
            className={cx('v8-browser__shot', hasFull && 'v8-browser__shot--feature')}
            onError={() => setFailed(true)}
          />
        )}
        {hasFull && (
          <Image
            ref={full}
            src={screenshot!}
            alt=""
            aria-hidden="true"
            width={1400}
            height={4200}
            sizes="(max-width: 960px) 100vw, 650px"
            className="v8-browser__shot v8-browser__shot--full"
            onError={() => setFullFailed(true)}
          />
        )}
      </div>
    </div>
  )
})

export default BrowserFrame
