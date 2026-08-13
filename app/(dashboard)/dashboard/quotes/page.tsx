import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import PageHeader from '@/components/dashboard/PageHeader'
import { formatDate } from '@/lib/utils'
import type { QuoteRequest as IQuote } from '@/types'
import './page.scss'

export default async function QuotesPage() {
  await connectDB()
  const quotes = await QuoteRequest.find().sort({ createdAt: -1 }).lean() as unknown as IQuote[]

  return (
    <div className="quotes-page">
      <PageHeader title="Quote Requests" subtitle={`${quotes.length} total`} />
      <div className="quotes-list">
        {quotes.length === 0 && <p className="quotes-empty">No quote requests yet.</p>}
        {quotes.map((q) => (
          <details key={q._id} className="quote-item">
            <summary className="quote-summary">
              <div className="quote-avatar">{q.name[0]}</div>
              <div className="quote-info">
                <div className="quote-name">
                  {q.name}
                  {!q.read && <span className="quote-unread-dot" />}
                </div>
                <div className="quote-meta">{q.email} · {q.service}</div>
              </div>
              <div className="quote-meta">{q.createdAt ? formatDate(q.createdAt) : ''}</div>
              {q.estimatedTimeline && <span className="quote-timeline-badge">{q.estimatedTimeline}</span>}
            </summary>
            <div className="quote-body">
              <div className="quote-details-grid">
                {[['Platform', q.platform],['Timeline', q.timeline],['Pages', q.pages],['Website Type', q.websiteType],['UI/UX', q.uiux]].map(([k,v]) => v ? (
                  <div key={k as string} className="quote-detail-card">
                    <div className="quote-detail-label">{k}</div>
                    <div className="quote-detail-value">{v}</div>
                  </div>
                ) : null)}
              </div>
              {q.features && q.features.length > 0 && (
                <div className="quote-features">
                  <div className="quote-features-label">Features</div>
                  <div className="quote-features-list">
                    {q.features.map((f) => <span key={f} className="quote-feature-tag">{f}</span>)}
                  </div>
                </div>
              )}
              {q.notes && <p className="quote-notes">{q.notes}</p>}
              <a href={`mailto:${q.email}`} className="quote-reply">
                Reply via Email →
              </a>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
