'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { Menu, X } from 'lucide-react'
import type { SiteSettings } from '@/types'
import { getSocialPlatform } from './socialIcons'
import './Navbar.scss'

const defaultLinks = [
  { href: '/',          label: 'Home' },
  { href: '/about',     label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog',      label: 'Blog' },
  { href: '/contact',   label: 'Contact' },
]

const defaultDrawerLinks = [
  { label: 'GitHub', href: 'https://github.com/dev-sahab' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/sahab-mi' },
  { label: 'Email', href: 'mailto:frshahab.me@gmail.com' },
]

export default function Navbar({ settings }: { settings?: SiteSettings | null }) {
  const pathname = usePathname()
  const links = settings?.headerMenu && settings.headerMenu.length > 0
    ? [...settings.headerMenu].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : defaultLinks
  const email = settings?.contactEmail || settings?.email
  const drawerLinks = settings?.social && settings.social.length > 0
    ? [
        ...settings.social.filter((s) => s.url).map((s) => ({ label: getSocialPlatform(s.platform).label, href: s.url })),
        ...(email ? [{ label: 'Email', href: `mailto:${email}` }] : []),
      ]
    : defaultDrawerLinks
  const [scrolled,    setScrolled]    = useState(false)
  const [hidden,      setHidden]      = useState(false)
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [lastY,       setLastY]       = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 80)
      if (y > 120) {
        if (y > lastY + 6) setHidden(true)
        else if (y < lastY - 2) setHidden(false)
      } else setHidden(false)
      setLastY(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastY])

  useEffect(() => { document.body.style.overflow = drawerOpen ? 'hidden' : '' }, [drawerOpen])
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  return (
    <>
      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <nav className="drawer-nav">
          {links.map((l, i) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>
              <span className="drawer-nav-num">0{i + 1}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="drawer-footer">
          {drawerLinks.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener">{l.label}</a>
          ))}
        </div>
      </div>

      <header id="site-nav" className={`${scrolled ? 'scrolled' : ''} ${hidden ? 'nav-hidden' : ''}`}>
        <Link href="/" className="nav-logo">
          {settings?.logo ? (
            <Image src={settings.logo} alt={settings.siteTitle || settings.name || 'Logo'} width={120} height={32} className="nav-logo-img" priority />
          ) : (
            <>Sahab<span className="nav-logo-dot">.</span></>
          )}
        </Link>

        {/* Desktop links */}
        <nav className="nav-links-desktop">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-right">
          <span className="nav-status-desktop">
            <span className="nav-status-dot" />
            Available
          </span>
          <ThemeToggle />
          <Link href="/get-quote" className="btn btn-accent nav-cta-desktop">Get Quote</Link>
          <button
            onClick={() => setDrawerOpen(v => !v)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            className="nav-menu-btn"
          >
            {drawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>
    </>
  )
}
