import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'
import Testimonial from '@/models/Testimonial'
import Contact from '@/models/Contact'
import QuoteRequest from '@/models/QuoteRequest'
import Link from 'next/link'
import { FolderKanban, FileText, Star, MessageSquare, FileQuestion, TrendingUp } from 'lucide-react'
import './dashboard-overview.scss'

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
    <div className="dash-page">
      <div className="dash-header">
        <h1 className="dash-heading dash-title">Dashboard Overview</h1>
        <p className="dash-subtitle">Welcome back! Here's what's happening on your site.</p>
      </div>

      {/* Stats Grid */}
      <div className="dash-stats-grid">
        {cards.map(({ label, value, icon: Icon, href, color, badge }) => (
          <Link key={label} href={href} className="dash-card dash-stat-card">
            {badge ? (
              <span className="dash-stat-badge">
                {badge} new
              </span>
            ) : null}
            <Icon size={22} className="dash-stat-icon" style={{ color }} />
            <div className="dash-value">{value}</div>
            <div className="dash-label">{label}</div>
          </Link>
        ))}

        <div className="dash-card">
          <TrendingUp size={22} className="dash-stat-icon dash-stat-icon--trend" />
          <div className="dash-value">
            {stats.unreadContacts + stats.unreadQuotes}
          </div>
          <div className="dash-label">Unread Messages</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dash-activity-grid">
        {/* Recent Contacts */}
        <div className="dash-card">
          <div className="dash-activity-header">
            <h2 className="dash-heading dash-activity-title">Recent Contacts</h2>
            <Link href="/dashboard/contacts" className="dash-activity-viewall">View all →</Link>
          </div>
          <div className="dash-activity-list">
            {stats.recentContacts.length === 0 && <p className="dash-empty-text">No contacts yet.</p>}
            {stats.recentContacts.map((c: any) => (
              <div key={c._id.toString()} className="dash-activity-item">
                <div className="dash-avatar dash-avatar--contact">
                  {c.name[0]}
                </div>
                <div className="dash-activity-body">
                  <div className="dash-activity-name">
                    {c.name}
                    {!c.read && <span className="dash-unread-dot dash-unread-dot--contact" />}
                  </div>
                  <div className="dash-activity-email">{c.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="dash-card">
          <div className="dash-activity-header">
            <h2 className="dash-heading dash-activity-title">Recent Quote Requests</h2>
            <Link href="/dashboard/quotes" className="dash-activity-viewall">View all →</Link>
          </div>
          <div className="dash-activity-list">
            {stats.recentQuotes.length === 0 && <p className="dash-empty-text">No quote requests yet.</p>}
            {stats.recentQuotes.map((q: any) => (
              <div key={q._id.toString()} className="dash-activity-item">
                <div className="dash-avatar dash-avatar--quote">
                  {q.name[0]}
                </div>
                <div className="dash-activity-body">
                  <div className="dash-activity-name">
                    {q.name}
                    {!q.read && <span className="dash-unread-dot dash-unread-dot--quote" />}
                  </div>
                  <div className="dash-activity-service">{q.service}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
