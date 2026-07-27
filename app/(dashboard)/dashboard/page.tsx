import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'
import Testimonial from '@/models/Testimonial'
import Contact from '@/models/Contact'
import QuoteRequest from '@/models/QuoteRequest'
import Link from 'next/link'
import { FolderKanban, FileText, Star, MessageSquare, FileQuestion, TrendingUp } from 'lucide-react'

async function getStats() {
  try {
    await connectDB()
    const [projects, posts, testimonials, contacts, quotes] = await Promise.all([
      Project.countDocuments(),
      BlogPost.countDocuments(),
      Testimonial.countDocuments(),
      Contact.countDocuments(),
      QuoteRequest.countDocuments(),
    ])
    const unreadContacts = await Contact.countDocuments({ read: false })
    const unreadQuotes = await QuoteRequest.countDocuments({ read: false })
    const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5).lean()
    const recentQuotes = await QuoteRequest.find().sort({ createdAt: -1 }).limit(5).lean()
    return { projects, posts, testimonials, contacts, quotes, unreadContacts, unreadQuotes, recentContacts, recentQuotes }
  } catch {
    return { projects: 0, posts: 0, testimonials: 0, contacts: 0, quotes: 0, unreadContacts: 0, unreadQuotes: 0, recentContacts: [], recentQuotes: [] }
  }
}

const D = {
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '24px' } as React.CSSProperties,
  label: { fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 6 },
  h: { color: '#f0ede6', fontFamily: 'var(--f-d)', fontWeight: 700 },
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Projects', value: stats.projects, icon: FolderKanban, href: '/dashboard/projects', color: '#b8ff4f' },
    { label: 'Blog Posts', value: stats.posts, icon: FileText, href: '/dashboard/blog', color: '#60a5fa' },
    { label: 'Testimonials', value: stats.testimonials, icon: Star, href: '/dashboard/testimonials', color: '#fbbf24' },
    { label: 'Contacts', value: stats.contacts, icon: MessageSquare, href: '/dashboard/contacts', color: '#f472b6', badge: stats.unreadContacts },
    { label: 'Quote Requests', value: stats.quotes, icon: FileQuestion, href: '/dashboard/quotes', color: '#a78bfa', badge: stats.unreadQuotes },
  ]

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ ...D.h, fontSize: 28, letterSpacing: '-.02em', marginBottom: 6 }}>Dashboard Overview</h1>
        <p style={{ color: '#9a9a9a', fontSize: 14 }}>Welcome back! Here's what's happening on your site.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(({ label, value, icon: Icon, href, color, badge }) => (
          <Link key={label} href={href} style={{ ...D.card, textDecoration: 'none', display: 'block', transition: 'border-color .2s', position: 'relative' }}>
            {badge ? (
              <span style={{ position: 'absolute', top: 16, right: 16, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 100, padding: '2px 7px', fontFamily: 'var(--f-m)' }}>
                {badge} new
              </span>
            ) : null}
            <Icon size={22} style={{ color, marginBottom: 12 }} />
            <div style={{ fontSize: 32, fontFamily: 'var(--f-d)', fontWeight: 800, color: '#f0ede6', marginBottom: 4 }}>{value}</div>
            <div style={D.label}>{label}</div>
          </Link>
        ))}

        <div style={{ ...D.card }}>
          <TrendingUp size={22} style={{ color: '#22c55e', marginBottom: 12 }} />
          <div style={{ fontSize: 32, fontFamily: 'var(--f-d)', fontWeight: 800, color: '#f0ede6', marginBottom: 4 }}>
            {stats.unreadContacts + stats.unreadQuotes}
          </div>
          <div style={D.label}>Unread Messages</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Contacts */}
        <div style={D.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ ...D.h, fontSize: 16 }}>Recent Contacts</h2>
            <Link href="/dashboard/contacts" style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--accent)', letterSpacing: '.08em' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.recentContacts.length === 0 && <p style={{ color: '#555', fontSize: 14 }}>No contacts yet.</p>}
            {stats.recentContacts.map((c: any) => (
              <div key={c._id.toString()} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#111', borderRadius: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 700, color: '#b8ff4f', flexShrink: 0 }}>
                  {c.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#f0ede6', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {c.name}
                    {!c.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b8ff4f', display: 'inline-block' }} />}
                  </div>
                  <div style={{ fontSize: 12, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quotes */}
        <div style={D.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ ...D.h, fontSize: 16 }}>Recent Quote Requests</h2>
            <Link href="/dashboard/quotes" style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--accent)', letterSpacing: '.08em' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.recentQuotes.length === 0 && <p style={{ color: '#555', fontSize: 14 }}>No quote requests yet.</p>}
            {stats.recentQuotes.map((q: any) => (
              <div key={q._id.toString()} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#111', borderRadius: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>
                  {q.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#f0ede6', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {q.name}
                    {!q.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />}
                  </div>
                  <div style={{ fontSize: 12, color: '#555' }}>{q.service}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
