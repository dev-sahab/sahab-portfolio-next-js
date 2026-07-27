import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'
import PageHeader from '@/components/dashboard/PageHeader'
import { formatDate } from '@/lib/utils'
import type { ContactSubmission } from '@/types'

export default async function ContactsPage() {
  await connectDB()
  const contacts = await Contact.find().sort({ createdAt: -1 }).lean() as unknown as ContactSubmission[]

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Contact Submissions" subtitle={`${contacts.length} total`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {contacts.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: 60 }}>No contacts yet.</p>}
        {contacts.map((c) => (
          <details key={c._id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }}>
            <summary style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', listStyle: 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 14, color: '#f472b6', flexShrink: 0 }}>{c.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f0ede6', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {c.name}
                  {!c.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b8ff4f', display: 'inline-block' }} />}
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>{c.email} · {c.subject || 'General'}</div>
              </div>
              <div style={{ fontSize: 12, color: '#555' }}>{c.createdAt ? formatDate(c.createdAt) : ''}</div>
              {c.budget && <span style={{ padding: '3px 10px', background: 'rgba(184,255,79,.08)', border: '1px solid rgba(184,255,79,.15)', borderRadius: 100, fontSize: 11, color: '#b8ff4f', fontFamily: 'var(--f-m)' }}>{c.budget}</span>}
            </summary>
            <div style={{ padding: '0 18px 18px', borderTop: '1px solid #2a2a2a', marginTop: 8 }}>
              <p style={{ fontSize: 14, color: '#9a9a9a', lineHeight: 1.7, whiteSpace: 'pre-wrap', paddingTop: 16 }}>{c.message}</p>
              <a href={`mailto:${c.email}`} style={{ display: 'inline-flex', marginTop: 12, padding: '8px 16px', background: '#b8ff4f', color: '#0a0a0a', borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: 'var(--f-m)', textDecoration: 'none' }}>
                Reply via Email →
              </a>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
