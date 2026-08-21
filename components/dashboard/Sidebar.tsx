'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, FolderKanban, FileText, Star, Image as ImageIcon,
  Settings, MessageSquare, FileQuestion, Users, LogOut, ExternalLink, ChevronDown, type LucideIcon
} from 'lucide-react'
import { can } from '@/lib/permissions'
import '@/styles/components/dashboard/Sidebar.scss'

const LEAF_SEGMENTS = ['new', 'categories', 'tags']

// Any role that can write a blog post at all (full, own, or own-draft-only) —
// used for the "Add New" link, which a contributor should still see even
// though they only ever save drafts.
const canWriteAnyBlog = (role?: string) =>
  can(role, 'blog.write') || can(role, 'blog.write.own') || can(role, 'blog.write.own.draft')

type NavLink = { href: string; icon: LucideIcon; label: string; perm?: string }
type NavGroup = {
  icon: LucideIcon; label: string; base: string; perm?: string
  children: { href: string; label: string; perm?: string }[]
}

const nav: (NavLink | NavGroup)[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  {
    icon: FolderKanban, label: 'Projects', base: '/dashboard/projects', perm: 'projects.read',
    children: [
      { href: '/dashboard/projects', label: 'All Projects' },
      { href: '/dashboard/projects/new', label: 'Add New', perm: 'projects.write' },
      { href: '/dashboard/projects/categories', label: 'Categories', perm: 'categories.read' },
      { href: '/dashboard/projects/tags', label: 'Tags', perm: 'tags.read' },
    ],
  },
  {
    icon: FileText, label: 'Blog Posts', base: '/dashboard/blog', perm: 'blog.read',
    children: [
      { href: '/dashboard/blog', label: 'All Posts' },
      { href: '/dashboard/blog/new', label: 'Add New' }, // gated separately below via canWriteAnyBlog
      { href: '/dashboard/blog/categories', label: 'Categories', perm: 'categories.read' },
      { href: '/dashboard/blog/tags', label: 'Tags', perm: 'tags.read' },
    ],
  },
  { href: '/dashboard/media', icon: ImageIcon, label: 'Media', perm: 'media.read' },
  { href: '/dashboard/testimonials', icon: Star, label: 'Testimonials', perm: 'testimonials.read' },
  { href: '/dashboard/contacts', icon: MessageSquare, label: 'Contacts', perm: 'contacts.read' },
  { href: '/dashboard/quotes', icon: FileQuestion, label: 'Quote Requests', perm: 'quotes.read' },
  { href: '/dashboard/settings', icon: Settings, label: 'Site Settings', perm: 'settings.write' },
  { href: '/dashboard/users', icon: Users, label: 'Users', perm: 'users.read' },
]

function isChildActive(pathname: string, base: string, href: string) {
  if (href !== base) return pathname === href || pathname.startsWith(href + '/')
  if (pathname === base) return true
  if (!pathname.startsWith(base + '/')) return false
  const nextSegment = pathname.slice(base.length + 1).split('/')[0]
  return !LEAF_SEGMENTS.includes(nextSegment)
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const { data: session } = useSession()
  const role = (session?.user as any)?.role as string | undefined

  const visibleNav = nav
    .filter((item) => !item.perm || can(role, item.perm))
    .map((item) => {
      if (!('children' in item)) return item
      const children = item.label === 'Blog Posts'
        ? item.children.filter((c) => c.href === '/dashboard/blog/new' ? canWriteAnyBlog(role) : !c.perm || can(role, c.perm))
        : item.children.filter((c) => !c.perm || can(role, c.perm))
      return { ...item, children }
    })

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          Sahab<span className="sidebar-logo-dot">.</span>
        </div>
        <div className="sidebar-logo-sub">
          Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {visibleNav.map((item) => {
          if (!('children' in item)) {
            const { href, icon: Icon, label } = item
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href} className={`sidebar-nav-link${active ? ' active' : ''}`}>
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
                className={`sidebar-nav-group-btn${groupActive ? ' active' : ''}`}
              >
                <Icon size={16} />
                <span className="sidebar-nav-group-label">{label}</span>
                <ChevronDown size={14} className={`sidebar-nav-chevron${isOpen ? ' open' : ''}`} />
              </button>
              {isOpen && (
                <div className="sidebar-nav-children">
                  {children.map((c) => {
                    const active = isChildActive(pathname, base, c.href)
                    return (
                      <Link key={c.href} href={c.href} className={`sidebar-nav-link sidebar-nav-link--sub${active ? ' active' : ''}`}>
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
      <div className="sidebar-bottom">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="sidebar-bottom-link"
        >
          <ExternalLink size={16} />
          View Site
        </a>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="sidebar-bottom-link sidebar-signout-btn"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
