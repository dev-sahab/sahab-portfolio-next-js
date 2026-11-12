'use client'

import { useEffect, useRef, type CSSProperties, type TouchEvent } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { headerNav, site } from '@/content/v8/site'
import { routes } from '@/lib/v8/routes'
import { cx } from '@/lib/v8/cx'
import { lockScroll } from '@/lib/v8/smoothScroll'
import { ButtonLink } from '../ui/Button'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import '@/styles/v8/layout/MobileMenu.scss'

/** Swipe-up distance (px) that dismisses the sheet. */
const SWIPE_CLOSE_PX = 80
const FOCUSABLE = 'a[href], button:not([disabled])'

interface MobileMenuProps {
  open: boolean
  /** href of the nav link for the current page. */
  active: string | null
  /** Where "Get a free quote" goes (the form section on home, the contact page elsewhere). */
  quoteHref: string
  isHome: boolean
  onClose: () => void
  /** Opens the full-screen search. */
  onSearch: () => void
}

/**
 * Full-screen mobile menu (Figma: "Home v8 — Mobile menu (open)").
 *  - Fades/slides down in 250ms; page scroll is locked behind it.
 *  - Links close the sheet and open their page; "Get a free quote" closes it
 *    and goes to the quote form; the search row opens the full-screen search.
 *  - Closes with the X button, Esc, or by swiping the sheet up.
 *  - Focus stays inside the sheet while open (and returns to the menu button
 *    on close); the theme toggle lives in the sheet's header.
 */
export default function MobileMenu({ open, active, quoteHref, isHome, onClose, onSearch }: MobileMenuProps) {
  const sheet = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const swipe = useRef<{ x: number; y: number; dragging: boolean } | null>(null)

  // Always call the latest onClose without re-running the open/close effect.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    const returnFocusTo = document.activeElement as HTMLElement | null
    const unlockScroll = lockScroll()
    const focusTimer = window.setTimeout(() => closeButton.current?.focus(), 30)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !sheet.current) return
      // Focus trap: Tab / Shift+Tab cycle inside the sheet.
      const items = [...sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement
      const outside = !sheet.current.contains(current)
      if (e.shiftKey && (current === first || outside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (current === last || outside)) {
        e.preventDefault()
        first.focus()
      }
    }

    // The menu only exists below the desktop breakpoint.
    const desktop = window.matchMedia('(min-width: 960px)')
    const onBreakpoint = () => desktop.matches && onCloseRef.current()

    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onBreakpoint)
    return () => {
      window.clearTimeout(focusTimer)
      unlockScroll()
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onBreakpoint)
      returnFocusTo?.focus?.()
    }
  }, [open])

  // ── Swipe up to close ────────────────────────────────────────────────────
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    swipe.current = { x: t.clientX, y: t.clientY, dragging: false }
  }

  const onTouchMove = (e: TouchEvent) => {
    const s = swipe.current
    const el = sheet.current
    if (!s || !el) return
    const t = e.touches[0]
    const up = s.y - t.clientY
    const sideways = Math.abs(s.x - t.clientX)
    // Only an upward, mostly-vertical drag, and only once the sheet's own
    // content (if it scrolls on a short phone) is already at the bottom.
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    if (up > 8 && sideways < up && atBottom) {
      s.dragging = true
      el.classList.add('is-dragging')
      el.style.setProperty('--drag', `${-Math.min(up, 260)}px`)
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    const s = swipe.current
    const el = sheet.current
    swipe.current = null
    if (!s || !el) return
    el.classList.remove('is-dragging')
    const up = s.y - (e.changedTouches[0]?.clientY ?? s.y)
    if (s.dragging && up > SWIPE_CLOSE_PX) {
      onClose()
      // Keep the dragged offset while it fades out, then reset.
      window.setTimeout(() => el.style.removeProperty('--drag'), 350)
    } else {
      el.style.removeProperty('--drag')
    }
  }

  return (
    <div
      ref={sheet}
      id="v8-mobile-sheet"
      className={cx('v8-sheet', open && 'is-open')}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div className="v8-sheet__bar">
        <Logo href={isHome ? "#top" : routes.home} onClick={onClose} />
        <div className="v8-sheet__actions">
          <ThemeToggle />
          <button ref={closeButton} type="button" className="v8-sheet__close" aria-label="Close menu" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="v8-sheet__body">
        <p className="v8-sheet__label">Menu</p>

        <nav aria-label="Mobile">
          <ul className="v8-sheet__links">
            {headerNav.map((link, i) => {
              const isActive = active === link.href
              return (
                <li key={link.href} style={{ '--i': i } as CSSProperties}>
                  <Link
                    href={link.href}
                    className={cx(isActive && 'is-active')}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={onClose}
                  >
                    <span className="v8-sheet__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="v8-sheet__name">{link.label}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="v8-sheet__search"
          style={{ '--i': headerNav.length } as CSSProperties}
          onClick={() => {
            onClose()
            onSearch()
          }}
        >
          <Search aria-hidden="true" />
          <span>Search projects, services and pages</span>
        </button>

        <ButtonLink
          href={quoteHref}
          arrow
          glow
          className="v8-sheet__cta"
          style={{ '--i': headerNav.length + 1 } as CSSProperties}
          onClick={onClose}
        >
          Get a free quote
        </ButtonLink>

        <div className="v8-sheet__email" style={{ '--i': headerNav.length + 2 } as CSSProperties}>
          <span>Prefer email?</span>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </div>
  )
}
