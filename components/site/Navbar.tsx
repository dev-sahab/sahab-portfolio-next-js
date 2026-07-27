'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 80)
      if (y > 120) {
        setHidden(y > lastY + 6)
        if (y < lastY - 2) setHidden(false)
      } else {
        setHidden(false)
      }
      setLastY(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastY])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
  }, [drawerOpen])

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <>
      {/* Drawer */}
      <div
        className={`nav-drawer ${drawerOpen ? 'open' : ''}`}
        role="dialog"
        aria-hidden={!drawerOpen}
      >
        <nav>
          {links.map((l, i) => (
            <Link key={l.href} href={l.href}>
              <span style={{ fontFamily: 'var(--f-m)', fontSize: '10px', color: 'var(--muted)', marginRight: 12 }}>0{i + 1}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: 'var(--px)', left: 'var(--px)', right: 'var(--px)', display: 'flex', gap: 22 }}>
          <a href="https://github.com/dev-sahab" target="_blank" rel="noopener" style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--text2)' }}>GitHub</a>
          <a href="https://linkedin.com/in/sahab-mi" target="_blank" rel="noopener" style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--text2)' }}>LinkedIn</a>
          <a href="mailto:frshahab.me@gmail.com" style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--text2)' }}>Email</a>
        </div>
      </div>

      <header
        id="site-nav"
        className={`${scrolled ? 'scrolled' : ''} ${hidden ? 'nav-hidden' : ''}`}
      >
        {/* Logo */}
        <Link href="/" style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 20, letterSpacing: '-.02em' }}>
          Sahab<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>

        {/* Desktop links */}
        <nav style={{ display: 'flex', gap: 34 }} className="nav-links-desktop">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${pathname === l.href ? 'active' : ''}`}
              style={{
                fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.1em',
                textTransform: 'uppercase', color: pathname === l.href ? 'var(--accent)' : 'var(--text2)',
                transition: 'color .3s',
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            className="nav-status"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text2)' }}
          >
            <span
              className="pulse"
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}
            />
            Available
          </span>
          <ThemeToggle />
          <Link href="/get-quote" className="btn btn-accent" style={{ padding: '10px 22px', fontSize: 10 }}>
            Get Quote
          </Link>
          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="hamburger"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 3 }}
          >
            <span style={{ display: 'block', width: 24, height: 1.5, background: 'var(--text)', transition: '.38s var(--ease)', transform: drawerOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: 24, height: 1.5, background: 'var(--text)', transition: '.38s var(--ease)', opacity: drawerOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 24, height: 1.5, background: 'var(--text)', transition: '.38s var(--ease)', transform: drawerOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </header>

      <style>{`
        .nav-links-desktop { display: flex; }
        @media (max-width: 768px) { .nav-links-desktop { display: none !important; } .nav-status { display: none !important; } }
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.5)} 50%{opacity:.7;box-shadow:0 0 0 6px rgba(34,197,94,0)} }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        .nav-drawer { position: fixed; inset: 0; background: var(--bg); z-index: 350; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: var(--px); transform: translateX(-100%); transition: transform .5s var(--ease); }
        .nav-drawer.open { transform: translateX(0); }
        .nav-drawer a { font-family: var(--f-d); font-weight: 700; font-size: clamp(34px,9vw,68px); line-height: 1.12; color: var(--text); transition: color .3s; display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
        .nav-drawer a:hover { color: var(--accent); }
      `}</style>
    </>
  )
}
