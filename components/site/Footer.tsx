import Link from 'next/link'

const pages = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/get-quote', label: 'Get a Quote' },
]

const services = [
  'WordPress Development',
  'Webflow Builds',
  'WooCommerce',
  'MERN Stack',
  'Figma → Code',
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer id="site-footer" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div className="footer-top">
          <div>
            <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 21, letterSpacing: '-.02em', marginBottom: 11 }}>
              Sahab<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.62, marginBottom: 20, maxWidth: 245 }}>
              Building digital products that move businesses forward — one pixel at a time.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { href: 'https://github.com/dev-sahab', label: 'GH' },
                { href: 'https://linkedin.com/in/sahab-mi', label: 'LI' },
                { href: 'https://upwork.com', label: 'UP' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 36, height: 36, border: '1px solid var(--border2)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontFamily: 'var(--f-m)', color: 'var(--text2)',
                    transition: 'border-color .3s, color .3s',
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 17 }}>Pages</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {pages.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} style={{ fontSize: 14, color: 'var(--text2)', transition: 'color .3s' }}>{p.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 17 }}>Services</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {services.map((s) => (
                <li key={s}>
                  <Link href="/contact" style={{ fontSize: 14, color: 'var(--text2)', transition: 'color .3s' }}>{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 17 }}>Legal</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <li><Link href="/privacy-policy" style={{ fontSize: 14, color: 'var(--text2)' }}>Privacy Policy</Link></li>
              <li><Link href="/terms" style={{ fontSize: 14, color: 'var(--text2)' }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 13 }}>
          <p style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--muted)' }}>
            © {year} Sahab Uddin Mintu. All rights reserved.
          </p>
          <p style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Built with <span style={{ color: 'var(--accent)' }}>♥</span> & strong coffee
          </p>
        </div>
      </div>
    </footer>
  )
}