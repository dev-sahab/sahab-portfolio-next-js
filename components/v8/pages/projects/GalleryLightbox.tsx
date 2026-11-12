'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react'
import { lockScroll } from '@/lib/v8/smoothScroll'
import '@/styles/v8/pages/Lightbox.scss'

/**
 * Zoom steps, ported from the old site's lightbox. 'fit' shows the whole
 * image; every other step is a multiple of "fit width" (the scale where the
 * image is exactly as wide as the viewer), so the first zoom-in (one click
 * on the image) fills the width with no sideways scroll and you scroll down
 * a tall screenshot. Later steps zoom further for detail.
 */
const ZOOM_STEPS: ('fit' | number)[] = ['fit', 1, 1.25, 1.5, 1.75, 2]

interface GalleryLightboxProps {
  images: string[]
  /** Alt text per image (thumbnails and the open view). Strings, not a function: this is passed from a Server Component. */
  alts: string[]
}

/** Project gallery: a grid of thumbnails that open in a full-screen viewer with zoom, arrows and keys. */
export default function GalleryLightbox({ images, alts }: GalleryLightboxProps) {
  const altFor = (i: number) => alts[i] ?? ''
  const [open, setOpen] = useState<number | null>(null)
  const [zoomIdx, setZoomIdx] = useState(0)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)

  const count = images.length
  const zoom = ZOOM_STEPS[zoomIdx]
  const close = () => setOpen(null)
  const prev = () => setOpen((i) => (i === null ? i : (i - 1 + count) % count))
  const next = () => setOpen((i) => (i === null ? i : (i + 1) % count))
  const zoomIn = () => setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))
  const zoomOut = () => setZoomIdx((i) => Math.max(0, i - 1))

  // Rendered inside the .v8 root so the design tokens apply.
  useEffect(() => setHost(document.getElementById('top') ?? document.body), [])

  useEffect(() => {
    setZoomIdx(0)
    setNatural(null)
  }, [open])

  // Each zoom change starts at the image's top-left.
  useEffect(() => {
    const el = stage.current
    if (el) el.scrollTo(0, 0)
  }, [zoomIdx])

  useEffect(() => {
    if (open === null) return
    const unlock = lockScroll()
    closeBtn.current?.focus()
    const measure = () => {
      const el = stage.current
      if (el) setBox({ w: el.clientWidth, h: el.clientHeight })
    }
    measure()
    window.addEventListener('resize', measure)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === '+' || e.key === '=') zoomIn()
      else if (e.key === '-') zoomOut()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.removeEventListener('resize', measure)
      document.removeEventListener('keydown', onKey)
      opener.current?.focus()
    }
    // Only re-run when the viewer opens or closes, not on every image change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open === null])

  if (!count) return null

  const fitScale = natural && box ? Math.min(box.w / natural.w, box.h / natural.h, 1) : 1
  const fitWidth = natural && box ? box.w / natural.w : 1
  const scale = zoom === 'fit' ? fitScale : fitWidth * zoom
  const sized = zoom !== 'fit' && natural ? { width: natural.w * scale, height: natural.h * scale } : undefined

  return (
    <>
      <ul className="v8-gallery">
        {images.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              className="v8-gallery__thumb"
              aria-label={`Open screen ${i + 1} of ${count}`}
              onClick={(e) => {
                opener.current = e.currentTarget
                setOpen(i)
              }}
            >
              <Image src={src} alt={altFor(i)} width={1200} height={900} sizes="(max-width: 960px) 100vw, 560px" />
            </button>
          </li>
        ))}
      </ul>

      {host &&
        open !== null &&
        createPortal(
          <div className="v8-lightbox" role="dialog" aria-modal="true" aria-label={`Screen ${open + 1} of ${count}`} onClick={close}>
            <button ref={closeBtn} type="button" className="v8-lightbox__btn v8-lightbox__close" onClick={close} aria-label="Close">
              <X />
            </button>

            {count > 1 && (
              <button
                type="button"
                className="v8-lightbox__btn v8-lightbox__arrow v8-lightbox__arrow--prev"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                aria-label="Previous screen"
              >
                <ChevronLeft />
              </button>
            )}

            <div ref={stage} className="v8-lightbox__stage">
              {/* eslint-disable-next-line @next/next/no-img-element -- needs natural size for zoom maths */}
              <img
                key={images[open]}
                src={images[open]}
                alt={altFor(open)}
                className={`v8-lightbox__img ${zoom === 'fit' ? 'is-fit' : 'is-zoomed'}`}
                style={sized}
                onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                onClick={(e) => {
                  e.stopPropagation()
                  setZoomIdx((i) => (i === 0 ? 1 : 0))
                }}
              />
            </div>

            {count > 1 && (
              <button
                type="button"
                className="v8-lightbox__btn v8-lightbox__arrow v8-lightbox__arrow--next"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                aria-label="Next screen"
              >
                <ChevronRight />
              </button>
            )}

            <p className="v8-lightbox__counter" aria-live="polite">
              {open + 1} / {count}
            </p>

            <div className="v8-lightbox__zoom" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={zoomOut} disabled={zoomIdx === 0} aria-label="Zoom out">
                <Minus />
              </button>
              <span>{Math.round(scale * 100)}%</span>
              <button type="button" onClick={zoomIn} disabled={zoomIdx === ZOOM_STEPS.length - 1} aria-label="Zoom in">
                <Plus />
              </button>
            </div>
          </div>,
          host,
        )}
    </>
  )
}
