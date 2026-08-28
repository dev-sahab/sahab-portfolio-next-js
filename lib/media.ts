import connectDB from './mongodb'
import Media from '@/models/Media'
import { getAllReferencedUrls } from './mediaUsage'
import { mimeTypeMongoFilter, type MediaTypeFilter } from './mediaTypes'

const TYPE_FILTERS: MediaTypeFilter[] = ['image', 'audio', 'video', 'document', 'spreadsheet', 'archive']

export interface ListMediaParams {
  search?: string | null
  /** '', image, audio, video, document, spreadsheet, archive, unattached, mine */
  type?: string | null
  year?: string | null
  /** 1-12 */
  month?: string | null
  page?: number
  limit?: number
  /** Required for `type: 'mine'` — the current session user's id. */
  userId?: string
}

export interface ListMediaResult {
  data: any[]
  total: number
  page: number
  pages: number
  months: { year: number; month: number; count: number }[]
}

/** Shared by the `/api/media` GET route and the Media dashboard page's server-side
 *  initial load, so both stay in sync with one filter/pagination implementation. */
export async function listMedia({
  search, type = '', year, month, page = 1, limit = 50, userId,
}: ListMediaParams): Promise<ListMediaResult> {
  await connectDB()

  const p = Math.max(1, page)
  const lim = Math.min(200, Math.max(1, limit))

  const query: Record<string, any> = {}
  if (search) query.filename = { $regex: search, $options: 'i' }
  if (type && (TYPE_FILTERS as string[]).includes(type)) Object.assign(query, mimeTypeMongoFilter(type as MediaTypeFilter))
  if (year) {
    const y = parseInt(year, 10)
    const m = month ? parseInt(month, 10) - 1 : 0
    const start = month ? new Date(Date.UTC(y, m, 1)) : new Date(Date.UTC(y, 0, 1))
    const end = month ? new Date(Date.UTC(y, m + 1, 1)) : new Date(Date.UTC(y + 1, 0, 1))
    query.createdAt = { $gte: start, $lt: end }
  }

  const [allMatching, usageMap, monthsAgg] = await Promise.all([
    Media.find(query).sort({ createdAt: -1 }).lean(),
    getAllReferencedUrls(),
    Media.aggregate([
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.y': -1, '_id.m': -1 } },
    ]),
  ])

  let filtered = (allMatching as any[]).map((item) => ({ ...item, inUse: usageMap.has(item.url) }))
  if (type === 'unattached') filtered = filtered.filter((item) => !item.inUse)
  if (type === 'mine') filtered = filtered.filter((item) => item.uploadedBy && String(item.uploadedBy) === String(userId))

  const total = filtered.length
  const start = (p - 1) * lim
  const data = filtered.slice(start, start + lim)

  const months = monthsAgg.map((m: any) => ({ year: m._id.y, month: m._id.m, count: m.count }))

  return { data, total, page: p, pages: Math.max(1, Math.ceil(total / lim)), months }
}
