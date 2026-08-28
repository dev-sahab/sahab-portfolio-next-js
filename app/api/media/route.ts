import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { getAllReferencedUrls } from '@/lib/mediaUsage'
import { mimeTypeMongoFilter, type MediaTypeFilter } from '@/lib/mediaTypes'
import { apiError } from '@/lib/apiError'

const TYPE_FILTERS: MediaTypeFilter[] = ['image', 'audio', 'video', 'document', 'spreadsheet', 'archive']

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'media.read')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const type   = searchParams.get('type') || '' // '', image, audio, video, document, spreadsheet, archive, unattached, mine
    const year   = searchParams.get('year')
    const month  = searchParams.get('month') // 1-12
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1', 10) || 1)
    const limit  = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))

    const query: Record<string, any> = {}
    if (search) query.filename = { $regex: search, $options: 'i' }
    if ((TYPE_FILTERS as string[]).includes(type)) Object.assign(query, mimeTypeMongoFilter(type as MediaTypeFilter))
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

    let filtered = (allMatching as any[]).map(item => ({ ...item, inUse: usageMap.has(item.url) }))
    if (type === 'unattached') filtered = filtered.filter(item => !item.inUse)
    if (type === 'mine') {
      const userId = (session.user as any)?.id
      filtered = filtered.filter(item => item.uploadedBy && String(item.uploadedBy) === String(userId))
    }

    const total = filtered.length
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)

    const months = monthsAgg.map((m: any) => ({ year: m._id.y, month: m._id.m, count: m.count }))

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      months,
    })
  } catch (e: any) {
    return apiError(e, 'media')
  }
}
