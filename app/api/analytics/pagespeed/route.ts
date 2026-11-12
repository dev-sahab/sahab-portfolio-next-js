import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { apiError } from '@/lib/apiError'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { getPageSpeed, resolveUrl, type Strategy } from '@/lib/analytics/pagespeed'

// PageSpeed runs take 10–30s, so the dashboard asks for them separately.
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as { role?: string })?.role
  if (!can(role, 'analytics.read')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const { allowed, retryAfterSeconds } = rateLimit(`pagespeed:${getClientIp(req)}`, 20, 10 * 60_000)
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Too many tests. Try again in a few minutes.' }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } })
  }

  const strategy: Strategy = req.nextUrl.searchParams.get('strategy') === 'desktop' ? 'desktop' : 'mobile'
  const url = resolveUrl(req.nextUrl.searchParams.get('path') ?? '/')
  if (!url) return NextResponse.json({ success: false, error: 'Set NEXT_PUBLIC_SITE_URL (or PAGESPEED_URL) to the live site address.' }, { status: 400 })

  try {
    return NextResponse.json({ success: true, data: await getPageSpeed(url, strategy) })
  } catch (e) {
    return apiError(e, 'pagespeed')
  }
}
