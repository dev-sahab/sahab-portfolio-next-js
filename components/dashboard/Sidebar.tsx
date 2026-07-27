'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, FolderKanban, FileText, Star,
  Settings, MessageSquare, FileQuestion, LogOut, ExternalLink
} from 'lucide-react'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/dashboard/blog', icon: FileText, label: 'Blog Posts' },
  { href: '/dashboard/testimonials', icon: Star, label: 'Testimonials' },
  { href: '/dashboard/contacts', icon: MessageSquare, label: 'Contacts' },
  { href: '/dashboard/quotes', icon: FileQuestion, label: 'Quote Requests' },
  { href: '/dashboard/settings', icon: Settings, label: 'Site Settings' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 240, background: '#111', borderRight: '1px solid #1f1f1f',
      display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 20, letterSpacing: '-.02em' }}>
          Sahab<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#555', marginTop: 4 }}>
          Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, fontSize: 14, fontWeight: 500, transition: 'background .2s, color .2s',
                background: active ? 'rgba(184,255,79,.12)' : 'transparent',
                color: active ? '#b8ff4f' : '#9a9a9a',
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <a
          href="/"
          target="_blank"
          rel="noopener"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, fontSize: 14, color: '#9a9a9a', transition: 'color .2s' }}
        >
          <ExternalLink size={16} />
          View Site
        </a>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, fontSize: 14, color: '#9a9a9a', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'color .2s' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
