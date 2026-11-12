// Server-only: PageSpeed Insights API (works without a key at low volume; a key raises the quota).
import { analyticsEnv, cached } from './google'

export type Strategy = 'mobile' | 'desktop'

export interface PageSpeedData {
  url: string
  strategy: Strategy
  fetchedAt: string
  scores: { key: string; label: string; value: number }[]
  vitals: { key: string; label: string; display: string; score: number | null }[]
}

const CATEGORIES = [
  ['performance', 'Performance'],
  ['accessibility', 'Accessibility'],
  ['best-practices', 'Best practices'],
  ['seo', 'SEO'],
] as const

const VITALS = [
  ['largest-contentful-paint', 'Largest Contentful Paint'],
  ['cumulative-layout-shift', 'Cumulative Layout Shift'],
  ['total-blocking-time', 'Total Blocking Time'],
  ['first-contentful-paint', 'First Contentful Paint'],
  ['speed-index', 'Speed Index'],
] as const

interface PsiResponse {
  lighthouseResult?: {
    finalDisplayedUrl?: string
    categories?: Record<string, { score: number | null }>
    audits?: Record<string, { displayValue?: string; score: number | null }>
  }
}

/** Only pages of this site can be tested (stops the endpoint being used as a free proxy). */
export function resolveUrl(path?: string) {
  const base = analyticsEnv.siteUrl
  if (!base) return null
  try {
    const origin = new URL(base).origin
    const url = new URL(path || '/', origin)
    return url.origin === origin ? url.toString() : null
  } catch {
    return null
  }
}

export async function getPageSpeed(url: string, strategy: Strategy): Promise<PageSpeedData> {
  return cached(`psi:${strategy}:${url}`, 6 * 60 * 60_000, async () => {
    const params = new URLSearchParams({ url, strategy })
    for (const [key] of CATEGORIES) params.append('category', key)
    if (analyticsEnv.pageSpeedKey) params.set('key', analyticsEnv.pageSpeedKey)
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`PageSpeed Insights returned ${res.status}`)
    const data = (await res.json()) as PsiResponse
    const lh = data.lighthouseResult
    return {
      url: lh?.finalDisplayedUrl ?? url,
      strategy,
      fetchedAt: new Date().toISOString(),
      scores: CATEGORIES.map(([key, label]) => ({ key, label, value: Math.round((lh?.categories?.[key]?.score ?? 0) * 100) })),
      vitals: VITALS.map(([key, label]) => ({
        key,
        label,
        display: lh?.audits?.[key]?.displayValue ?? '–',
        score: lh?.audits?.[key]?.score ?? null,
      })),
    }
  })
}
