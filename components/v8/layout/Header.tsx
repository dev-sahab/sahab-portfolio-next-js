'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Search } from 'lucide-react'
import { headerNav } from '@/content/v8/site'
import { hero } from '@/content/v8/hero'
import { routes } from '@/lib/v8/routes'
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

/** The nav link for the current page (`/v8/projects/foo` → Work). */
export function useActiveHref() {
  const pathname = usePathname() ?? ''
  return headerNav.find((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))?.href ?? null
}

export default function Header() {
  const { open: openSearch } = useCommandMenu()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveHref()
  const isHome = usePathname() === routes.home
  // On the homepage the quote form is a section below; elsewhere it's the contact page.
  const quoteHref = isHome ? hero.primaryCta.href : routes.contact
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
            <Logo href={isHome ? '#top' : routes.home} />
            <nav aria-label="Primary" className="v8-header__nav">
              {headerNav.map((link) => {
                const isActive = active === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cx(isActive && 'is-active')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="v8-header__actions">
            <button type="button" className="v8-search-trigger" onClick={openSearch} aria-label="Search (Command K)">
              <Search className="v8-search-trigger__icon" aria-hidden="true" />
              <span className="v8-search-trigger__label">Search</span>
              <Kbd className="v8-search-trigger__kbd"><span className="v8-kbd__cmd">⌘</span>K</Kbd>
            </button>
            <ThemeToggle />
            <ButtonLink href={quoteHref} size="sm" className="v8-header__cta">
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
      <MobileMenu open={menuOpen} active={active} quoteHref={quoteHref} isHome={isHome} onClose={closeMenu} onSearch={openSearch} />
    </>
  )
}
