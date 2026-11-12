// Server-only: Google Search Console Search Analytics API.
import { analyticsEnv, cached, eachDay, googlePost, periods, type RangeDays, type SectionResult } from './google'

const SCOPE = ['https://www.googleapis.com/auth/webmasters.readonly']

interface GscRow {
  keys?: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GscData {
  totals: { clicks: number; impressions: number; ctr: number; position: number }
  previous: { clicks: number; impressions: number; ctr: number; position: number }
  daily: { date: string; clicks: number; impressions: number }[]
  queries: { label: string; clicks: number; impressions: number; position: number }[]
  pages: { label: string; value: number }[]
}

const empty = { clicks: 0, impressions: 0, ctr: 0, position: 0 }

async function query(body: object) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(analyticsEnv.searchConsoleSite)}/searchAnalytics/query`
  const res = await googlePost<{ rows?: GscRow[] }>(url, SCOPE, body)
  return res.rows ?? []
}

async function load(days: RangeDays): Promise<GscData> {
  // Search Console data is usually complete ~3 days back.
  const { current, previous } = periods(days, 3)
  const [cur, prev, daily, queries, pages] = await Promise.all([
    query({ ...current }),
    query({ ...previous }),
    query({ ...current, dimensions: ['date'], rowLimit: 400 }),
    query({ ...current, dimensions: ['query'], rowLimit: 10 }),
    query({ ...current, dimensions: ['page'], rowLimit: 8 }),
  ])
  const total = (rows: GscRow[]) => (rows[0] ? { clicks: rows[0].clicks, impressions: rows[0].impressions, ctr: rows[0].ctr, position: rows[0].position } : empty)
  const byDate = new Map(daily.map((r) => [r.keys![0], r]))
  let origin = ''
  try {
    origin = new URL(analyticsEnv.siteUrl).origin
  } catch {}

  return {
    totals: total(cur),
    previous: total(prev),
    daily: eachDay(current.startDate, current.endDate).map((date) => ({
      date,
      clicks: byDate.get(date)?.clicks ?? 0,
      impressions: byDate.get(date)?.impressions ?? 0,
    })),
    queries: queries.map((r) => ({ label: r.keys![0], clicks: r.clicks, impressions: r.impressions, position: r.position })),
    pages: pages.map((r) => ({ label: origin ? r.keys![0].replace(origin, '') || '/' : r.keys![0], value: r.clicks })),
  }
}

export async function getSearchConsole(days: RangeDays): Promise<SectionResult<GscData>> {
  const missing = [
    !analyticsEnv.clientEmail && 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    !analyticsEnv.privateKey && 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
    !analyticsEnv.searchConsoleSite && 'SEARCH_CONSOLE_SITE_URL',
  ].filter(Boolean) as string[]
  if (missing.length) return { status: 'not-configured', missing }
  try {
    return { status: 'ok', data: await cached(`gsc:${days}`, 60 * 60_000, () => load(days)) }
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : 'Search Console request failed' }
  }
}
