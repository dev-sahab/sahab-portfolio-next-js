import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'
import PageHeader from '@/components/dashboard/PageHeader'
import { formatDate } from '@/lib/utils'
import type { ContactSubmission } from '@/types'
import '@/styles/pages/(dashboard)/dashboard/contacts/page.scss'

export default async function ContactsPage() {
  await connectDB()
  const contacts = await Contact.find().sort({ createdAt: -1 }).lean() as unknown as ContactSubmission[]

  return (
    <div className="contacts-page">
      <PageHeader title="Contact Submissions" subtitle={`${contacts.length} total`} />
      <div className="contacts-list">
        {contacts.length === 0 && <p className="contacts-empty">No contacts yet.</p>}
        {contacts.map((c) => (
          <details key={c._id} className="contact-item">
            <summary className="contact-summary">
              <div className="contact-avatar">{c.name[0]}</div>
              <div className="contact-info">
                <div className="contact-name">
                  {c.name}
                  {!c.read && <span className="contact-unread-dot" />}
                </div>
                <div className="contact-meta">{c.email} · {c.subject || 'General'}</div>
              </div>
              <div className="contact-meta">{c.createdAt ? formatDate(c.createdAt) : ''}</div>
              {c.budget && <span className="contact-budget">{c.budget}</span>}
            </summary>
            <div className="contact-body">
              <p className="contact-message">{c.message}</p>
              <a href={`mailto:${c.email}`} className="contact-reply">
                Reply via Email →
              </a>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
