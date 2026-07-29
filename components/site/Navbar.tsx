'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/',          label: 'Home' },
  { href: '/about',     label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog',      label: 'Blog' },
  { href: '/contact',   label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
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
      <div style={{
        position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 350,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'flex-start', padding: 'var(--px)',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .5s var(--ease)',
      }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map((l, i) => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'var(--f-d)', fontWeight: 700,
              fontSize: 'clamp(34px, 9vw, 68px)', lineHeight: 1.12,
              color: pathname === l.href ? 'var(--accent)' : 'var(--text)',
              display: 'flex', alignItems: 'center', gap: 14, transition: 'color .3s',
            }}>
              <span style={{ fontFamily: 'var(--f-m)', fontSize: '0.28em', color: 'var(--muted)' }}>0{i + 1}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: 'var(--px)', left: 'var(--px)', right: 'var(--px)', display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {[['GitHub','https://github.com/dev-sahab'],['LinkedIn','https://linkedin.com/in/sahab-mi'],['Email','mailto:frshahab.me@gmail.com']].map(([l,h]) => (
            <a key={l} href={h} target="_blank" rel="noopener" style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--text2)', transition: 'color .3s' }}>{l}</a>
          ))}
        </div>
      </div>

      <header id="site-nav" className={`${scrolled ? 'scrolled' : ''} ${hidden ? 'nav-hidden' : ''}`}>
        <Link href="/" className="nav-logo" style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 20, letterSpacing: '-.02em' }}>
          Sahab<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>

        {/* Desktop links */}
        <nav className="nav-links-desktop" style={{ display: 'flex', gap: 34 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'active' : ''}`}
              style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: pathname === l.href ? 'var(--accent)' : 'var(--text2)', transition: 'color .3s' }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="nav-status-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'pulse 2s ease-in-out infinite' }} />
            Available
          </span>
          <ThemeToggle />
          <Link href="/get-quote" className="btn btn-accent nav-cta-desktop" style={{ padding: '10px 20px', fontSize: 10 }}>Get Quote</Link>
          <button
            onClick={() => setDrawerOpen(v => !v)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)' }}
          >
            {drawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <style>{`
        @media (min-width: 769px) { header #site-nav button[aria-label] { display: none; } }
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.5)} 50%{opacity:.7;box-shadow:0 0 0 6px rgba(34,197,94,0)} }
      `}</style>
    </>
  )
}
