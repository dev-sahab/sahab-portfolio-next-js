'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import './Lightbox.scss'

// 'fit' = scaled to fit the viewport (the opening view). The rest are exact
// percentages of the image's real/native pixel dimensions — 200% genuinely
// renders the image at twice its actual resolution, not twice the fitted size.
const ZOOM_STEPS: ('fit' | number)[] = ['fit', 1.25, 1.5, 1.75, 2]

interface Props {
  images: string[]
}

export default function Lightbox({ images }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [zoomIdx, setZoomIdx] = useState(0)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [container, setContainer] = useState<{ w: number; h: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const zoom = ZOOM_STEPS[zoomIdx]

  useEffect(() => { setMounted(true) }, [])

  const close = () => setOpenIndex(null)
  const prev = () => setOpenIndex(i => (i === null ? i : (i - 1 + images.length) % images.length))
  const next = () => setOpenIndex(i => (i === null ? i : (i + 1) % images.length))

  const zoomIn = () => setZoomIdx(i => Math.min(ZOOM_STEPS.length - 1, i + 1))
  const zoomOut = () => setZoomIdx(i => Math.max(0, i - 1))
  const toggleZoom = () => setZoomIdx(i => (i === 0 ? 1 : 0))

  useEffect(() => {
    setZoomIdx(0)
    setNatural(null)
  }, [openIndex])

  useEffect(() => {
    if (openIndex === null) return

    document.body.style.overflow = 'hidden'

    const measure = () => {
      const el = wrapRef.current
      if (el) setContainer({ w: el.clientWidth, h: el.clientHeight })
    }
    measure()
    window.addEventListener('resize', measure)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('resize', measure)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openIndex, images.length])

  useEffect(() => {
    if (openIndex === null) return
    const img = imgRef.current
    if (!img) return
    let cancelled = false
    import('gsap').then(({ gsap }) => {
      if (cancelled) return
      gsap.fromTo(img, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power3.out' })
    })
    return () => { cancelled = true }
  }, [openIndex])

  if (!images.length) return null

  const fitScale = natural && container ? Math.min(container.w / natural.w, container.h / natural.h, 1) : 1
  const displayPercent = Math.round((zoom === 'fit' ? fitScale : zoom) * 100)

  return (
    <>
      <div className="sp-gallery-grid">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            className="sp-gal-item"
            onClick={() => setOpenIndex(i)}
            aria-label={`Open image ${i + 1} of ${images.length}`}
          >
            <Image src={src} alt={`Gallery image ${i + 1}`} fill className="lb-thumb-img" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          </button>
        ))}
      </div>

      {mounted && openIndex !== null && createPortal(
        <div className="lb-overlay" onClick={close}>
          <button className="lb-close" onClick={close} aria-label="Close">×</button>
          {images.length > 1 && (
            <button
              className="lb-arrow lb-prev"
              onClick={e => { e.stopPropagation(); prev() }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}
          <div className="lb-img-wrap" ref={wrapRef}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              className={`lb-img ${zoom === 'fit' ? 'lb-img-fit' : 'lb-img-zoomed'}`}
              src={images[openIndex]}
              alt={`Gallery image ${openIndex + 1}`}
              onLoad={e => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              onClick={e => { e.stopPropagation(); toggleZoom() }}
              style={
                zoom === 'fit'
                  ? undefined
                  : {
                      width: natural ? natural.w * zoom : undefined,
                      height: natural ? natural.h * zoom : undefined,
                    }
              }
            />
          </div>
          {images.length > 1 && (
            <button
              className="lb-arrow lb-next"
              onClick={e => { e.stopPropagation(); next() }}
              aria-label="Next image"
            >
              ›
            </button>
          )}
          <div className="lb-counter">{openIndex + 1} / {images.length}</div>
          <div className="lb-zoom" onClick={e => e.stopPropagation()}>
            <button type="button" className="lb-zoom-btn" onClick={zoomOut} disabled={zoomIdx === 0} aria-label="Zoom out">
              −
            </button>
            <span className="lb-zoom-pct">{displayPercent}%</span>
            <button type="button" className="lb-zoom-btn" onClick={zoomIn} disabled={zoomIdx === ZOOM_STEPS.length - 1} aria-label="Zoom in">
              +
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
