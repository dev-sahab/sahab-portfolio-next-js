// Server-only: quote requests and contact messages from the site's own database.
import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import Contact from '@/models/Contact'
import { eachDay, periods, type RangeDays, type SectionResult } from './google'

export interface LeadsData {
  daily: { date: string; quotes: number; contacts: number }[]
  totals: { quotes: number; contacts: number }
  previous: { quotes: number; contacts: number }
}

type Model = typeof QuoteRequest

async function perDay(model: Model, start: string, end: string) {
  const rows = (await model.aggregate([
    { $match: { createdAt: { $gte: new Date(`${start}T00:00:00Z`), $lte: new Date(`${end}T23:59:59Z`) } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } },
  ])) as { _id: string; n: number }[]
  return new Map(rows.map((r) => [r._id, r.n]))
}

export async function getLeads(days: RangeDays): Promise<SectionResult<LeadsData>> {
  try {
    await connectDB()
    // Leads have no reporting lag: include today.
    const { current, previous } = periods(days, 0)
    const [q, c, qPrev, cPrev] = await Promise.all([
      perDay(QuoteRequest, current.startDate, current.endDate),
      perDay(Contact as Model, current.startDate, current.endDate),
      perDay(QuoteRequest, previous.startDate, previous.endDate),
      perDay(Contact as Model, previous.startDate, previous.endDate),
    ])
    const sum = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0)
    return {
      status: 'ok',
      data: {
        daily: eachDay(current.startDate, current.endDate).map((date) => ({ date, quotes: q.get(date) ?? 0, contacts: c.get(date) ?? 0 })),
        totals: { quotes: sum(q), contacts: sum(c) },
        previous: { quotes: sum(qPrev), contacts: sum(cPrev) },
      },
    }
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : 'Could not load leads' }
  }
}
