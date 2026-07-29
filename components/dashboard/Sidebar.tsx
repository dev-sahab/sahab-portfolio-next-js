'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, FolderKanban, FileText, Star,
  Settings, MessageSquare, FileQuestion, LogOut, ExternalLink, ChevronDown, type LucideIcon
} from 'lucide-react'

const LEAF_SEGMENTS = ['new', 'categories', 'tags']

type NavLink = { href: string; icon: LucideIcon; label: string }
type NavGroup = { icon: LucideIcon; label: string; base: string; children: { href: string; label: string }[] }

const nav: (NavLink | NavGroup)[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  {
    icon: FolderKanban, label: 'Projects', base: '/dashboard/projects',
    children: [
      { href: '/dashboard/projects', label: 'All Projects' },
      { href: '/dashboard/projects/new', label: 'Add New' },
      { href: '/dashboard/projects/categories', label: 'Categories' },
      { href: '/dashboard/projects/tags', label: 'Tags' },
    ],
  },
  {
    icon: FileText, label: 'Blog Posts', base: '/dashboard/blog',
    children: [
      { href: '/dashboard/blog', label: 'All Posts' },
      { href: '/dashboard/blog/new', label: 'Add New' },
      { href: '/dashboard/blog/categories', label: 'Categories' },
      { href: '/dashboard/blog/tags', label: 'Tags' },
    ],
  },
  { href: '/dashboard/testimonials', icon: Star, label: 'Testimonials' },
  { href: '/dashboard/contacts', icon: MessageSquare, label: 'Contacts' },
  { href: '/dashboard/quotes', icon: FileQuestion, label: 'Quote Requests' },
  { href: '/dashboard/settings', icon: Settings, label: 'Site Settings' },
]

function isChildActive(pathname: string, base: string, href: string) {
  if (href !== base) return pathname === href || pathname.startsWith(href + '/')
  if (pathname === base) return true
  if (!pathname.startsWith(base + '/')) return false
  const nextSegment = pathname.slice(base.length + 1).split('/')[0]
  return !LEAF_SEGMENTS.includes(nextSegment)
}

const linkStyle = (active: boolean) => ({
  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
  borderRadius: 8, fontSize: 14, fontWeight: 500, transition: 'background .2s, color .2s',
  background: active ? 'rgba(184,255,79,.12)' : 'transparent',
  color: active ? '#b8ff4f' : '#9a9a9a',
})

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

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
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {nav.map((item) => {
          if (!('children' in item)) {
            const { href, icon: Icon, label } = item
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={linkStyle(active)}>
                <Icon size={16} />
                {label}
              </Link>
            )
          }

          const { icon: Icon, label, base, children } = item
          const groupActive = pathname.startsWith(base)
          const isOpen = openGroups[base] ?? groupActive

          return (
            <div key={base}>
              <button
                onClick={() => setOpenGroups((s) => ({ ...s, [base]: !isOpen }))}
                style={{
                  ...linkStyle(groupActive && !isOpen),
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  color: groupActive ? '#b8ff4f' : '#9a9a9a',
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                <ChevronDown size={14} style={{ transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2, marginLeft: 14, paddingLeft: 12, borderLeft: '1px solid #1f1f1f' }}>
                  {children.map((c) => {
                    const active = isChildActive(pathname, base, c.href)
                    return (
                      <Link key={c.href} href={c.href} style={{ ...linkStyle(active), padding: '7px 12px', fontSize: 13 }}>
                        {c.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
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
