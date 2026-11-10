'use client'

import { useCallback, useEffect, useState } from 'react'
import { Menu, Search } from 'lucide-react'
import { headerNav } from '@/content/v8/site'
import { hero } from '@/content/v8/hero'
import { cx } from '@/lib/v8/cx'
import { useCommandMenu } from '../command/CommandMenuProvider'
import { ButtonLink } from '../ui/Button'
import Kbd from '../ui/Kbd'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import ThemeToggle from './ThemeToggle'
import '@/styles/v8/layout/Header.scss'

/** Figma Interaction 01: blurred background + border after this much scroll. */
const SCROLLED_AT = 80

/** Tracks which nav section is currently in view (scroll-spy). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    if (!sections.length) return
    const visible = new Map<string, number>()

    // A thin band ~35% down the viewport decides the "current" section.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top)
          else visible.delete(entry.target.id)
        }
        const current = [...visible.entries()].sort((a, b) => b[1] - a[1])[0]
        setActive(current ? current[0] : null)
      },
      { rootMargin: '-35% 0px -60% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [ids])

  return active
}

const NAV_IDS = headerNav.map((l) => l.href.replace('#', ''))

export default function Header() {
  const { open: openSearch } = useCommandMenu()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection(NAV_IDS)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_AT)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={cx('v8-header', scrolled && 'is-scrolled')}>
        <div className="v8-container v8-header__bar">
          <div className="v8-header__left">
            <Logo />
            <nav aria-label="Primary" className="v8-header__nav">
              {headerNav.map((link) => {
                const isActive = active === link.href.slice(1)
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={cx(isActive && 'is-active')}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {link.label}
                  </a>
                )
              })}
            </nav>
          </div>

          <div className="v8-header__actions">
            <button type="button" className="v8-search-trigger" onClick={openSearch} aria-label="Search (Command K)">
              <Search className="v8-search-trigger__icon" aria-hidden="true" />
              <span className="v8-search-trigger__label">Search</span>
              <Kbd className="v8-search-trigger__kbd">⌘K</Kbd>
            </button>
            <ThemeToggle />
            <ButtonLink href={hero.primaryCta.href} size="sm" className="v8-header__cta">
              {hero.primaryCta.label}
            </ButtonLink>
            <button
              type="button"
              className="v8-header__burger"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="v8-mobile-sheet"
              onClick={() => setMenuOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen sheet; a sibling of <header> so the header's backdrop-filter can't affect its fixed positioning. */}
      <MobileMenu open={menuOpen} active={active} onClose={closeMenu} onSearch={openSearch} />
    </>
  )
}
