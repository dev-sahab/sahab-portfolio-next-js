import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import PageHeader from '@/components/dashboard/PageHeader'
import { formatDate } from '@/lib/utils'
import type { QuoteRequest as IQuote } from '@/types'

export default async function QuotesPage() {
  await connectDB()
  const quotes = await QuoteRequest.find().sort({ createdAt: -1 }).lean() as unknown as IQuote[]

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Quote Requests" subtitle={`${quotes.length} total`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quotes.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: 60 }}>No quote requests yet.</p>}
        {quotes.map((q) => (
          <details key={q._id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }}>
            <summary style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', listStyle: 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 14, color: '#a78bfa', flexShrink: 0 }}>{q.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f0ede6', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {q.name}
                  {!q.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b8ff4f', display: 'inline-block' }} />}
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>{q.email} · {q.service}</div>
              </div>
              <div style={{ fontSize: 12, color: '#555' }}>{q.createdAt ? formatDate(q.createdAt) : ''}</div>
              {q.estimatedTimeline && <span style={{ padding: '3px 10px', background: 'rgba(167,139,250,.08)', border: '1px solid rgba(167,139,250,.2)', borderRadius: 100, fontSize: 11, color: '#a78bfa', fontFamily: 'var(--f-m)' }}>{q.estimatedTimeline}</span>}
            </summary>
            <div style={{ padding: '0 18px 18px', borderTop: '1px solid #2a2a2a', marginTop: 8, paddingTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                {[['Platform', q.platform],['Timeline', q.timeline],['Pages', q.pages],['Website Type', q.websiteType],['UI/UX', q.uiux]].map(([k,v]) => v ? (
                  <div key={k as string} style={{ background: '#111', borderRadius: 6, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--f-m)', letterSpacing: '.14em', textTransform: 'uppercase', color: '#555', marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13, color: '#f0ede6' }}>{v}</div>
                  </div>
                ) : null)}
              </div>
              {q.features && q.features.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--f-m)', letterSpacing: '.14em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Features</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {q.features.map((f) => <span key={f} style={{ padding: '3px 10px', background: '#222', borderRadius: 100, fontSize: 11, color: '#9a9a9a', fontFamily: 'var(--f-m)' }}>{f}</span>)}
                  </div>
                </div>
              )}
              {q.notes && <p style={{ fontSize: 13, color: '#9a9a9a', lineHeight: 1.7 }}>{q.notes}</p>}
              <a href={`mailto:${q.email}`} style={{ display: 'inline-flex', marginTop: 14, padding: '8px 16px', background: '#b8ff4f', color: '#0a0a0a', borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: 'var(--f-m)', textDecoration: 'none' }}>
                Reply via Email →
              </a>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
