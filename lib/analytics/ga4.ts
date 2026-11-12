// Server-only: Google Analytics 4 Data API.
import { analyticsEnv, cached, eachDay, googlePost, hasServiceAccount, periods, type RangeDays, type SectionResult } from './google'

const SCOPE = ['https://www.googleapis.com/auth/analytics.readonly']

interface Ga4Row {
  dimensionValues?: { value: string }[]
  metricValues?: { value: string }[]
}
interface Ga4Report {
  rows?: Ga4Row[]
}

export interface Ga4Data {
  totals: { key: string; label: string; value: number; previous: number; format: 'number' | 'percent' | 'duration' }[]
  daily: { date: string; users: number; sessions: number }[]
  previousDaily: { date: string; users: number }[]
  topPages: { label: string; value: number }[]
  channels: { label: string; value: number }[]
  countries: { label: string; value: number }[]
  devices: { label: string; value: number }[]
}

const num = (v?: string) => (v ? Number(v) : 0)

async function report(body: object) {
  return googlePost<Ga4Report>(
    `https://analyticsdata.googleapis.com/v1beta/properties/${analyticsEnv.ga4PropertyId}:runReport`,
    SCOPE,
    body,
  )
}

const ga4Date = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`

async function load(days: RangeDays): Promise<Ga4Data> {
  const { current, previous } = periods(days, 1)
  const top = (dimension: string, metric: string, limit = 8) =>
    report({
      dateRanges: [current],
      dimensions: [{ name: dimension }],
      metrics: [{ name: metric }],
      orderBys: [{ metric: { metricName: metric }, desc: true }],
      limit,
    })

  const [totals, daily, prevDaily, pages, channels, countries, devices] = await Promise.all([
    report({
      dateRanges: [current, previous],
      metrics: ['activeUsers', 'sessions', 'screenPageViews', 'engagementRate', 'averageSessionDuration', 'keyEvents'].map((name) => ({ name })),
    }),
    report({
      dateRanges: [current],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 400,
    }),
    report({
      dateRanges: [previous],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 400,
    }),
    top('pagePath', 'screenPageViews'),
    top('sessionDefaultChannelGroup', 'sessions'),
    top('country', 'activeUsers'),
    top('deviceCategory', 'activeUsers', 4),
  ])

  // With two date ranges GA4 returns one row per range, tagged by a "dateRange" dimension.
  const rows = totals.rows ?? []
  const cur = rows.find((r) => r.dimensionValues?.[0]?.value === 'date_range_0') ?? rows[0]
  const prev = rows.find((r) => r.dimensionValues?.[0]?.value === 'date_range_1')
  const metric = (row: Ga4Row | undefined, i: number) => num(row?.metricValues?.[i]?.value)
  const defs = [
    { key: 'users', label: 'Visitors', format: 'number' },
    { key: 'sessions', label: 'Sessions', format: 'number' },
    { key: 'views', label: 'Page views', format: 'number' },
    { key: 'engagement', label: 'Engagement rate', format: 'percent' },
    { key: 'duration', label: 'Avg. session', format: 'duration' },
    { key: 'keyEvents', label: 'Key events', format: 'number' },
  ] as const

  const byDate = new Map((daily.rows ?? []).map((r) => [ga4Date(r.dimensionValues![0].value), r]))
  const prevByDate = new Map((prevDaily.rows ?? []).map((r) => [ga4Date(r.dimensionValues![0].value), r]))
  const list = (r: Ga4Report) => (r.rows ?? []).map((row) => ({ label: row.dimensionValues?.[0]?.value || '(not set)', value: metric(row, 0) }))

  return {
    totals: defs.map((d, i) => ({ ...d, value: metric(cur, i), previous: metric(prev, i) })),
    daily: eachDay(current.startDate, current.endDate).map((date) => {
      const row = byDate.get(date)
      return { date, users: metric(row, 0), sessions: metric(row, 1) }
    }),
    previousDaily: eachDay(previous.startDate, previous.endDate).map((date) => ({ date, users: metric(prevByDate.get(date), 0) })),
    topPages: list(pages),
    channels: list(channels),
    countries: list(countries),
    devices: list(devices),
  }
}

export async function getGa4(days: RangeDays): Promise<SectionResult<Ga4Data>> {
  const missing = [
    !analyticsEnv.clientEmail && 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    !analyticsEnv.privateKey && 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
    !analyticsEnv.ga4PropertyId && 'GA4_PROPERTY_ID',
  ].filter(Boolean) as string[]
  if (missing.length || !hasServiceAccount()) return { status: 'not-configured', missing }
  try {
    return { status: 'ok', data: await cached(`ga4:${days}`, 30 * 60_000, () => load(days)) }
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : 'Google Analytics request failed' }
  }
}
