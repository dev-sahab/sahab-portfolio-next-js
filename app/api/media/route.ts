import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { listMedia } from '@/lib/media'
import { apiError } from '@/lib/apiError'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'media.read')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    const { searchParams } = new URL(req.url)
    const result = await listMedia({
      search: searchParams.get('search'),
      type: searchParams.get('type') || '',
      year: searchParams.get('year'),
      month: searchParams.get('month'),
      page: parseInt(searchParams.get('page') || '1', 10) || 1,
      limit: parseInt(searchParams.get('limit') || '50', 10) || 50,
      userId: (session.user as any)?.id,
    })
    return NextResponse.json({ success: true, ...result })
  } catch (e: any) {
    return apiError(e, 'media')
  }
}
